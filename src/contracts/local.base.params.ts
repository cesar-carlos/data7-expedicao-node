export type Param<T = any> = {
  key: string;
  value: T;
  operator?: string;
};

export enum ComparisonOperator {
  EQUALS = '=',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  LIKE = 'LIKE',
  NOT_LIKE = 'NOT LIKE',
  IN = 'IN',
  NOT_IN = 'NOT IN',
  IS_NULL = 'IS NULL',
  IS_NOT_NULL = 'IS NOT NULL',
  BETWEEN = 'BETWEEN',
  CUSTOM = 'CUSTOM',
}

export class Params {
  /**
   * Cria um parâmetro com operador de igualdade (=)
   */
  public static equals<T>(key: string, value: T): Param<T> {
    return { key, value, operator: ComparisonOperator.EQUALS };
  }

  /**
   * Cria um parâmetro com operador de diferença (!=)
   */
  public static notEquals<T>(key: string, value: T): Param<T> {
    return { key, value, operator: ComparisonOperator.NOT_EQUALS };
  }

  /**
   * Cria um parâmetro com operador maior que (>)
   */
  public static greaterThan<T>(key: string, value: T): Param<T> {
    return { key, value, operator: ComparisonOperator.GREATER_THAN };
  }

  /**
   * Cria um parâmetro com operador maior ou igual (>=)
   */
  public static greaterThanOrEqual<T>(key: string, value: T): Param<T> {
    return { key, value, operator: ComparisonOperator.GREATER_THAN_OR_EQUAL };
  }

  /**
   * Cria um parâmetro com operador menor que (<)
   */
  public static lessThan<T>(key: string, value: T): Param<T> {
    return { key, value, operator: ComparisonOperator.LESS_THAN };
  }

  /**
   * Cria um parâmetro com operador menor ou igual (<=)
   */
  public static lessThanOrEqual<T>(key: string, value: T): Param<T> {
    return { key, value, operator: ComparisonOperator.LESS_THAN_OR_EQUAL };
  }

  /**
   * Cria um parâmetro com operador LIKE
   */
  public static like(key: string, value: string): Param<string> {
    return { key, value, operator: ComparisonOperator.LIKE };
  }

  /**
   * Cria um parâmetro com operador NOT LIKE
   */
  public static notLike(key: string, value: string): Param<string> {
    return { key, value, operator: ComparisonOperator.NOT_LIKE };
  }

  /**
   * Cria um parâmetro com operador IN
   */
  public static in<T>(key: string, values: T[]): Param<T[]> {
    return { key, value: values, operator: ComparisonOperator.IN };
  }

  /**
   * Cria um parâmetro com operador NOT IN
   */
  public static notIn<T>(key: string, values: T[]): Param<T[]> {
    return { key, value: values, operator: ComparisonOperator.NOT_IN };
  }

  /**
   * Cria um parâmetro com operador IS NULL
   */
  public static isNull(key: string): Param<null> {
    return { key, value: null, operator: ComparisonOperator.IS_NULL };
  }

  /**
   * Cria um parâmetro com operador IS NOT NULL
   */
  public static isNotNull(key: string): Param<null> {
    return { key, value: null, operator: ComparisonOperator.IS_NOT_NULL };
  }

  /**
   * Cria um parâmetro com operador BETWEEN
   */
  public static between<T>(key: string, min: T, max: T): Param<[T, T]> {
    return { key, value: [min, max], operator: ComparisonOperator.BETWEEN };
  }

  /**
   * Cria um parâmetro com operador customizado
   */
  public static custom<T>(key: string, value: T, operator: string): Param<T> {
    return { key, value, operator };
  }

  /**
   * Método legacy para compatibilidade (usar equals ao invés deste)
   * @deprecated Use Params.equals() instead
   */
  public static create<T>(key: string, value: T): Param<T> {
    return Params.equals(key, value);
  }

  /**
   * Converte array de parâmetros simples para formato Param
   */
  public static fromKeyValue(params: Array<{ key: string; value: any }>): Param[] {
    return params.map((p) => Params.equals(p.key, p.value));
  }

  /**
   * Valida se um parâmetro está corretamente formatado
   */
  public static isValid(param: Param): boolean {
    return (
      param &&
      typeof param.key === 'string' &&
      param.key.length > 0 &&
      param.value !== undefined &&
      (param.operator === undefined || typeof param.operator === 'string')
    );
  }

  /**
   * Gera uma string SQL WHERE a partir de um array de parâmetros
   */
  public static toWhereClause(params: Param[]): string {
    if (!params || params.length === 0) return '';

    const conditions = params
      .filter((p) => Params.isValid(p))
      .map((p) => {
        const operator = p.operator || ComparisonOperator.EQUALS;

        switch (operator) {
          case ComparisonOperator.IS_NULL:
            return `${p.key} IS NULL`;
          case ComparisonOperator.IS_NOT_NULL:
            return `${p.key} IS NOT NULL`;
          case ComparisonOperator.IN:
            return `${p.key} IN (${Array.isArray(p.value) ? p.value.map((v) => (typeof v === 'string' ? `'${v}'` : v)).join(', ') : p.value})`;
          case ComparisonOperator.NOT_IN:
            return `${p.key} NOT IN (${Array.isArray(p.value) ? p.value.map((v) => (typeof v === 'string' ? `'${v}'` : v)).join(', ') : p.value})`;
          case ComparisonOperator.BETWEEN:
            return Array.isArray(p.value) && p.value.length === 2
              ? `${p.key} BETWEEN ${p.value[0]} AND ${p.value[1]}`
              : `${p.key} = ${p.value}`;
          case ComparisonOperator.LIKE:
          case ComparisonOperator.NOT_LIKE:
            return `${p.key} ${operator} '${p.value}'`;
          case ComparisonOperator.CUSTOM:
            return `${p.key} ${p.value}`;
          default:
            return typeof p.value === 'string'
              ? `${p.key} ${operator} '${p.value}'`
              : `${p.key} ${operator} ${p.value}`;
        }
      });

    return conditions.length > 0 ? conditions.join(' AND ') : '';
  }
}

// Re-export Pagination and OrderBy for backward compatibility
export { Pagination } from './local.base.pagination';
export { OrderBy } from './local.base.orderby';
