import path from 'path';
import sql from 'mssql';
import type { Request } from 'mssql';

import { Params, Param, ComparisonOperator } from '../../contracts/local.base.params';

export type ParameterizedWhere = {
  whereFragment: string;
  apply: (request: Request) => void;
};

export type ExpedicaoSepararConsultaContext = 'expedicao-separar-consulta';

/** Segmento de identificador T-SQL (coluna, alias ou bracket). */
const IDENT_SEGMENT = /^(\[[^\]]+\]|#[a-zA-Z_][\w$#@]*|[a-zA-Z_@#][\w.$#@]*)$/;

function assertSqlIdentifier(key: string, ctx: string): void {
  const trimmed = key.trim();
  if (!trimmed || trimmed.length > 256) {
    throw new Error(`${ctx}: identificador inválido`);
  }
  const parts = trimmed.split('.');
  for (const p of parts) {
    if (!IDENT_SEGMENT.test(p.trim())) {
      throw new Error(`${ctx}: segmento de identificador não permitido: ${p}`);
    }
  }
}

/** Tipos aceitos por `request.input` do driver mssql (ISqlType ou factory). */
function inferSqlType(value: unknown): sql.ISqlType | sql.ISqlTypeFactory {
  if (value === null || value === undefined) return sql.NVarChar(sql.MAX);
  if (typeof value === 'boolean') return sql.Bit;
  if (typeof value === 'number') {
    return Number.isInteger(value) && Math.abs(value) <= 2147483647 ? sql.Int : sql.Float;
  }
  if (value instanceof Date) return sql.DateTime2(7);
  if (typeof value === 'string') return sql.NVarChar(sql.MAX);
  if (Buffer.isBuffer(value)) return sql.VarBinary(sql.MAX);
  return sql.NVarChar(sql.MAX);
}

export default class ParamsCommonRepository {
  static build(params: Params[] | string[] | string[][]) {
    if (typeof params === 'string') return params;
    if (!Array.isArray(params)) return '';
    if (params.length === 0) return '';

    if (Array.isArray(params[0])) {
      try {
        const result = (params as string[][])
          .map((arrayItem: string[]) => {
            if (!Array.isArray(arrayItem) || arrayItem.length < 2) {
              throw new Error(
                `Parâmetro de array inválido: esperado array com pelo menos [key, operator, value] ou [key, value], recebido: ${JSON.stringify(arrayItem)}`,
              );
            }

            const [, operatorOrValue, value] = arrayItem;

            if (arrayItem.length === 3) {
              const _value = typeof value === 'string' && !value.startsWith("'") ? `'${value}'` : value;
              return `${arrayItem[0]} ${operatorOrValue} ${_value}`;
            }

            if (arrayItem.length === 2) {
              const _value =
                typeof operatorOrValue === 'string' && !operatorOrValue.startsWith("'")
                  ? `'${operatorOrValue}'`
                  : operatorOrValue;
              return `${arrayItem[0]} = ${_value}`;
            }

            throw new Error(`Array deve ter 2 ou 3 elementos, recebido: ${arrayItem.length}`);
          })
          .join(' AND ');

        return result;
      } catch (error: any) {
        console.error('ParamsCommonRepository.build - Error processing array of arrays:', error.message);
        throw error;
      }
    }

    if (typeof params[0] === 'string') {
      const result = (params as string[]).join(' AND ');
      return result;
    }

    try {
      const result = (params as Params[])
        .map((item: any) => {
          if (!item || typeof item !== 'object' || !item.key) {
            throw new Error(
              `Parâmetro inválido: esperado objeto com propriedades {key, value, operator}, recebido: ${JSON.stringify(item)}`,
            );
          }

          const _value = typeof item.value === 'string' ? `'${item.value}'` : item.value;
          const _operator = item.operator ? item.operator : '=';
          return `${item.key} ${_operator} ${_value}`;
        })
        .join(' AND ');

      return result;
    } catch (error: any) {
      console.error('ParamsCommonRepository.build - Error processing object array:', error.message);
      throw error;
    }
  }

  /** Primeiro elemento é objeto `{ key }` (Param), não string nem array de arrays. */
  static isParamObjectArray(params: Params[]): boolean {
    if (!params.length) return true;
    const first = params[0] as unknown;
    return typeof first === 'object' && first !== null && 'key' in (first as object);
  }

  static needsLegacyWhere(params: Param[]): boolean {
    if (!params?.length) return false;
    return params.some((p) => p.operator === ComparisonOperator.CUSTOM);
  }

  /**
   * WHERE com bind seguro para valores (plan cache amigável).
   * Operador CUSTOM continua em {@link ParamsCommonRepository.build}.
   */
  static buildWhereParameterized(
    params: Param[],
    context?: ExpedicaoSepararConsultaContext,
  ): ParameterizedWhere {
    if (!params?.length) {
      return { whereFragment: '', apply: () => {} };
    }

    let idx = 0;
    const nextName = () => `wp_${idx++}`;
    const bindings: Array<{ name: string; type: sql.ISqlType | sql.ISqlTypeFactory; value: unknown }> = [];
    const fragments: string[] = [];

    for (const p of params) {
      if (!Params.isValid(p)) continue;

      const op = p.operator || ComparisonOperator.EQUALS;

      if (op === ComparisonOperator.CUSTOM) {
        throw new Error('operator CUSTOM requer ParamsCommonRepository.build (legacy)');
      }

      if (context === 'expedicao-separar-consulta' && p.key === 'CodSetorEstoque') {
        assertSqlIdentifier(p.key, 'WHERE');
        const name = nextName();
        bindings.push({ name, type: inferSqlType(p.value), value: p.value });
        fragments.push(`EXISTS (
          SELECT *
          FROM Expedicao.ItemSepararEstoque ise
          WHERE ise.CodEmpresa = SepararConsulta.CodEmpresa
            AND ise.CodSepararEstoque = SepararConsulta.CodSepararEstoque
            AND ise.CodSetorEstoque = @${name}
        )`);
        continue;
      }

      assertSqlIdentifier(p.key, 'WHERE');

      if (op === ComparisonOperator.IS_NULL) {
        fragments.push(`${p.key} IS NULL`);
        continue;
      }
      if (op === ComparisonOperator.IS_NOT_NULL) {
        fragments.push(`${p.key} IS NOT NULL`);
        continue;
      }

      if (op === ComparisonOperator.IN || op === ComparisonOperator.NOT_IN) {
        const vals = Array.isArray(p.value) ? p.value : [];
        if (vals.length === 0) {
          fragments.push(op === ComparisonOperator.IN ? '1=0' : '1=1');
          continue;
        }
        const placeholders = vals.map((v) => {
          const name = nextName();
          bindings.push({ name, type: inferSqlType(v), value: v });
          return `@${name}`;
        });
        const comb = op === ComparisonOperator.IN ? 'IN' : 'NOT IN';
        fragments.push(`${p.key} ${comb} (${placeholders.join(', ')})`);
        continue;
      }

      if (op === ComparisonOperator.BETWEEN) {
        const pair = p.value as [unknown, unknown];
        if (!Array.isArray(pair) || pair.length !== 2) {
          throw new Error('BETWEEN requer array [min, max]');
        }
        const a = nextName();
        const b = nextName();
        bindings.push({ name: a, type: inferSqlType(pair[0]), value: pair[0] });
        bindings.push({ name: b, type: inferSqlType(pair[1]), value: pair[1] });
        fragments.push(`${p.key} BETWEEN @${a} AND @${b}`);
        continue;
      }

      const name = nextName();
      bindings.push({ name, type: inferSqlType(p.value), value: p.value });
      fragments.push(`${p.key} ${op} @${name}`);
    }

    const whereFragment = fragments.join(' AND ');
    return {
      whereFragment,
      apply: (request: Request) => {
        for (const b of bindings) {
          request.input(b.name, b.type as Parameters<Request['input']>[1], b.value);
        }
      },
    };
  }

  static basePatchSQL(Schema: string) {
    return path.resolve(__dirname, '..', '..', 'sql', Schema);
  }
}
