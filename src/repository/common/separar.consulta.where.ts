import {
  ComparisonOperator,
  normalizeComparisonOperator,
  type Param,
} from '../../contracts/local.base.params';

const SETOR_KEYS = new Set(['CodSetorEstoque', 'CodSetoresEstoque']);

export function isSepararSetorFilterKey(key: string): boolean {
  return SETOR_KEYS.has(key);
}

/**
 * Collector `exp` still sends LIKE on the aggregated STRING_AGG column and on DATE.
 * Rewrite to the indexable predicates the desktop already uses. Do not reject the payload.
 */
export function expandSepararConsultaParam(param: Param): Param[] {
  const op = normalizeComparisonOperator(param.operator);

  if (isSepararSetorFilterKey(param.key) && isLikeOperator(op)) {
    const id = unwrapLikeInteger(param.value);
    if (id !== undefined) {
      return [
        {
          key: 'CodSetorEstoque',
          value: id,
          operator: op === ComparisonOperator.NOT_LIKE ? ComparisonOperator.NOT_EQUALS : ComparisonOperator.EQUALS,
        },
      ];
    }
    return [{ ...param, key: 'CodSetorEstoque' }];
  }

  if (param.key === 'DataEmissao' && op === ComparisonOperator.LIKE) {
    const date = unwrapLikeDate(param.value);
    if (date?.kind === 'day') {
      return [{ key: 'DataEmissao', value: date.day, operator: ComparisonOperator.EQUALS }];
    }
    if (date?.kind === 'month') {
      return [
        { key: 'DataEmissao', value: date.monthStart, operator: ComparisonOperator.GREATER_THAN_OR_EQUAL },
        { key: 'DataEmissao', value: date.nextMonth, operator: ComparisonOperator.LESS_THAN },
      ];
    }
  }

  return [param];
}

export function rewriteSepararConsultaLegacySql(sql: string): string {
  if (!sql.trim()) return sql;

  return sql
    .replace(
      /\bCodSetoresEstoque\s+(NOT\s+)?LIKE\s+N?'([^']*)'/gi,
      (_match, not: string | undefined, pattern: string) => setorLikeLegacySql(Boolean(not), pattern),
    )
    .replace(
      /\bCodSetorEstoque\s+(NOT\s+)?LIKE\s+N?'([^']*)'/gi,
      (_match, not: string | undefined, pattern: string) => setorLikeLegacySql(Boolean(not), pattern),
    )
    .replace(
      /\bDataEmissao\s+LIKE\s+N?'([^']*)'/gi,
      (_match, pattern: string) => dataEmissaoLikeLegacySql(pattern),
    )
    .replace(
      /(?<![\w.])CodSetorEstoque\s*=\s*'?(\d+)'?/g,
      (_match, value: string) => separarSetorExistsSql(`ise.CodSetorEstoque = ${Number(value)}`),
    );
}

export function separarSetorExistsSql(predicate: string, negated = false): string {
  const exists = `EXISTS (
          SELECT *
          FROM Expedicao.ItemSepararEstoque ise
          WHERE ise.CodEmpresa = SepararConsulta.CodEmpresa
            AND ise.CodSepararEstoque = SepararConsulta.CodSepararEstoque
            AND ${predicate}
        )`;
  return negated ? `NOT ${exists}` : exists;
}

function setorLikeLegacySql(negated: boolean, pattern: string): string {
  const id = unwrapLikeInteger(pattern);
  if (id !== undefined) {
    return separarSetorExistsSql(`ise.CodSetorEstoque = ${id}`, negated);
  }
  return separarSetorExistsSql(`CONVERT(varchar(20), ise.CodSetorEstoque) LIKE ${sqlStringLiteral(pattern)}`, negated);
}

function dataEmissaoLikeLegacySql(pattern: string): string {
  const date = unwrapLikeDate(pattern);
  if (date?.kind === 'day') {
    return `DataEmissao = ${sqlStringLiteral(date.day)}`;
  }
  if (date?.kind === 'month') {
    return `(DataEmissao >= ${sqlStringLiteral(date.monthStart)} AND DataEmissao < ${sqlStringLiteral(date.nextMonth)})`;
  }
  return `CONVERT(varchar(10), DataEmissao, 23) LIKE ${sqlStringLiteral(pattern)}`;
}

function isLikeOperator(op: string): boolean {
  return op === ComparisonOperator.LIKE || op === ComparisonOperator.NOT_LIKE;
}

function unwrapLikeInteger(value: unknown): number | undefined {
  const text = unwrapLikeCore(value);
  if (text === undefined || !/^\d+$/.test(text)) return undefined;
  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 2_147_483_647) return undefined;
  return parsed;
}

function unwrapLikeDate(value: unknown): { kind: 'day'; day: string } | { kind: 'month'; monthStart: string; nextMonth: string } | undefined {
  const text = unwrapLikeCore(value);
  if (text === undefined) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return { kind: 'day', day: text };
  }
  const month = text.match(/^(\d{4})-(\d{2})$/);
  if (!month) return undefined;
  const year = Number(month[1]);
  const monthNumber = Number(month[2]);
  if (monthNumber < 1 || monthNumber > 12) return undefined;
  const nextMonth = monthNumber === 12 ? `${year + 1}-01-01` : `${year}-${String(monthNumber + 1).padStart(2, '0')}-01`;
  return { kind: 'month', monthStart: `${text}-01`, nextMonth };
}

function unwrapLikeCore(value: unknown): string | undefined {
  if (typeof value === 'number' && Number.isInteger(value)) return String(value);
  if (typeof value !== 'string') return undefined;
  const inner = value.trim().replace(/^%+/, '').replace(/%+$/, '');
  if (!inner || inner.includes('%') || inner.includes('_')) return undefined;
  return inner;
}

function sqlStringLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}
