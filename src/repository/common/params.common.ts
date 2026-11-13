import path from 'path';
import sql from 'mssql';
import type { Request } from 'mssql';
import { logCaughtError } from '../../infra/app.logger';

import {
  Params,
  Param,
  ComparisonOperator,
  normalizeComparisonOperator,
  isNullComparisonOperator,
} from '../../contracts/local.base.params';
import {
  expandSepararConsultaParam,
  isSepararSetorFilterKey,
  separarSetorExistsSql,
} from './separar.consulta.where';

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

type SqlBinding = {
  name: string;
  type: sql.ISqlType | sql.ISqlTypeFactory;
  value: unknown;
};

type WhereBuild = {
  fragments: string[];
  bindings: SqlBinding[];
  nextName: () => string;
};

function applyBindings(bindings: SqlBinding[]): (request: Request) => void {
  return (request: Request) => {
    for (const binding of bindings) {
      request.input(binding.name, binding.type as Parameters<Request['input']>[1], binding.value);
    }
  };
}

function appendComparison(
  param: Param,
  state: WhereBuild,
  context?: ExpedicaoSepararConsultaContext,
): void {
  if (context === 'expedicao-separar-consulta') {
    const expanded = expandSepararConsultaParam(param);
    if (expanded.length !== 1 || expanded[0] !== param) {
      for (const item of expanded) {
        appendComparisonExpanded(item, state, context);
      }
      return;
    }
  }

  appendComparisonExpanded(param, state, context);
}

function appendComparisonExpanded(
  param: Param,
  state: WhereBuild,
  context?: ExpedicaoSepararConsultaContext,
): void {
  if (!Params.isValid(param)) return;

  const op = normalizeComparisonOperator(param.operator);
  if (op === ComparisonOperator.CUSTOM) {
    throw new Error('operator CUSTOM requer ParamsCommonRepository.build (legacy)');
  }

  if (context === 'expedicao-separar-consulta' && isSepararSetorFilterKey(param.key)) {
    appendSepararSetorFilter(param, op, state);
    return;
  }

  assertSqlIdentifier(param.key, 'WHERE');

  if (isNullComparisonOperator(op)) {
    state.fragments.push(`${param.key} ${op}`);
    return;
  }

  if (op === ComparisonOperator.IN || op === ComparisonOperator.NOT_IN) {
    const vals = Array.isArray(param.value) ? param.value : [];
    if (vals.length === 0) {
      state.fragments.push(op === ComparisonOperator.IN ? '1=0' : '1=1');
      return;
    }
    const placeholders = vals.map((value) => {
      const name = state.nextName();
      state.bindings.push({ name, type: inferSqlType(value), value });
      return `@${name}`;
    });
    const comb = op === ComparisonOperator.IN ? 'IN' : 'NOT IN';
    state.fragments.push(`${param.key} ${comb} (${placeholders.join(', ')})`);
    return;
  }

  if (op === ComparisonOperator.BETWEEN) {
    const pair = param.value as [unknown, unknown];
    if (!Array.isArray(pair) || pair.length !== 2) {
      throw new Error('BETWEEN requer array [min, max]');
    }
    const minName = state.nextName();
    const maxName = state.nextName();
    state.bindings.push({ name: minName, type: inferSqlType(pair[0]), value: pair[0] });
    state.bindings.push({ name: maxName, type: inferSqlType(pair[1]), value: pair[1] });
    state.fragments.push(`${param.key} BETWEEN @${minName} AND @${maxName}`);
    return;
  }

  const name = state.nextName();
  state.bindings.push({ name, type: inferSqlType(param.value), value: param.value });
  state.fragments.push(`${param.key} ${op} @${name}`);
}

function appendSepararSetorFilter(param: Param, op: string, state: WhereBuild): void {
  assertSqlIdentifier('CodSetorEstoque', 'WHERE');
  const name = state.nextName();
  state.bindings.push({ name, type: inferSqlType(param.value), value: param.value });

  if (op === ComparisonOperator.LIKE || op === ComparisonOperator.NOT_LIKE) {
    state.fragments.push(
      separarSetorExistsSql(`CONVERT(varchar(20), ise.CodSetorEstoque) LIKE @${name}`, op === ComparisonOperator.NOT_LIKE),
    );
    return;
  }

  const negated = op === ComparisonOperator.NOT_EQUALS;
  state.fragments.push(separarSetorExistsSql(`ise.CodSetorEstoque = @${name}`, negated));
}

function newWhereBuild(): WhereBuild {
  let index = 0;
  return {
    fragments: [],
    bindings: [],
    nextName: () => `wp_${index++}`,
  };
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
        logCaughtError('ParamsCommonRepository.build - Error processing array of arrays', error);
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
      logCaughtError('ParamsCommonRepository.build - Error processing object array', error);
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

    const state = newWhereBuild();
    for (const param of params) {
      appendComparison(param, state, context);
    }

    return {
      whereFragment: state.fragments.join(' AND '),
      apply: applyBindings(state.bindings),
    };
  }

  /**
   * Cada grupo vira um AND. Os grupos se juntam com OR.
   * Serve para "qualquer um destes pares", sem transformar pares diferentes num AND só.
   * Bind count is unlimited here; executeSelectWhereAny chunks against SQL_PARAM_BUDGET.
   */
  static buildWhereAnyOf(groups: Param[][]): ParameterizedWhere {
    const state = newWhereBuild();
    const clauses: string[] = [];

    for (const group of groups) {
      const start = state.fragments.length;
      for (const param of group) {
        appendComparison(param, state);
      }
      const added = state.fragments.slice(start);
      if (added.length === 1) {
        clauses.push(added[0]);
      } else if (added.length > 1) {
        clauses.push(`(${added.join(' AND ')})`);
      }
      state.fragments.length = start;
    }

    if (clauses.length === 0) {
      return { whereFragment: '1=0', apply: () => {} };
    }

    return {
      whereFragment: clauses.join(' OR '),
      apply: applyBindings(state.bindings),
    };
  }

  static basePatchSQL(Schema: string) {
    return path.resolve(__dirname, '..', '..', 'sql', Schema);
  }
}
