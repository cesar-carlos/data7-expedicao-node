export class OrderBy {
  public orderBy: string;
  public orderDirection: string;

  private constructor(query?: string) {
    const params = query ? new URLSearchParams(query) : undefined;
    this.orderBy = params?.get('order_by') ?? '';
    this.orderDirection = params?.get('order_direction') ?? '';
  }

  static fromObject(obj?: any): OrderBy {
    if (!obj) return new OrderBy();
    return new OrderBy(`order_by=${obj.field || ''}&order_direction=${obj.direction || ''}`);
  }

  static fromQueryString(queryString?: string): OrderBy {
    if (!queryString) return new OrderBy();
    return new OrderBy(queryString);
  }

  static create(field: string = '', direction: string = 'ASC'): OrderBy {
    return new OrderBy(`order_by=${field}&order_direction=${direction}`);
  }

  getOrderBy(): string {
    return this.orderBy;
  }

  getOrderDirection(): string {
    return this.orderDirection;
  }

  // 🔥 AGORA SUPORTA MÚLTIPLOS CAMPOS CORRETAMENTE
  getFullOrderBy(): string {
    if (!this.orderBy) return '';

    const fields = this.orderBy
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);
    const directions = this.orderDirection
      .split(',')
      .map((d) => d.trim().toUpperCase())
      .filter(Boolean);

    if (fields.length === 0) return '';

    const FIELD = /^(\[[^\]]+\]|[a-zA-Z_][\w.$#@]*)$/;

    const parts = fields.map((field, index) => {
      const f = field.trim();
      if (!FIELD.test(f)) {
        throw new Error(`ORDER BY: campo não permitido: ${field}`);
      }
      const dir = (directions[index] || 'ASC').toUpperCase();
      if (dir !== 'ASC' && dir !== 'DESC') {
        throw new Error(`ORDER BY: direção inválida: ${directions[index]}`);
      }
      return `${f} ${dir}`;
    });

    return parts.join(', ');
  }

  isValid(): boolean {
    if (!this.orderBy) return false;

    const fields = this.orderBy.split(',').map((f) => f.trim()).filter(Boolean);
    const directions = this.orderDirection.split(',').map((d) => d.trim()).filter(Boolean);

    if (fields.length === 0) return false;
    if (fields.length !== directions.length) return false;

    const FIELD = /^(\[[^\]]+\]|[a-zA-Z_][\w.$#@]*)$/;
    if (!fields.every((f) => FIELD.test(f))) return false;

    return directions.every((d) => ['ASC', 'DESC'].includes(d.toUpperCase()));
  }
}
