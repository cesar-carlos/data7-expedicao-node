export class Pagination {
  public limit: number;
  public offset: number;
  public page: number;

  private constructor(query?: string) {
    const params = query ? new URLSearchParams(query) : undefined;
    this.limit = params?.get('LIMIT') ? Number(params.get('LIMIT')) : 1000;
    this.offset = params?.get('OFFSET') ? Number(params.get('OFFSET')) : 0;
    this.page = params?.get('PAGE') ? Number(params.get('PAGE')) : 1;
  }

  static fromObject(obj?: any): Pagination {
    if (!obj) return new Pagination();
    return new Pagination(`LIMIT=${obj.limit || 1000}&OFFSET=${obj.offset || 0}&PAGE=${obj.page || 1}`);
  }

  static fromQueryString(queryString?: string): Pagination {
    if (!queryString) return new Pagination();
    return new Pagination(queryString);
  }

  static create(limit: number = 1000, offset: number = 0, page: number = 1): Pagination {
    return new Pagination(`LIMIT=${limit}&OFFSET=${offset}&PAGE=${page}`);
  }

  getLimit(): number {
    return this.limit;
  }

  getOffset(): number {
    return this.offset;
  }

  getPage(): number {
    return this.page;
  }
}

// Re-export OrderBy for backward compatibility
export { OrderBy } from './local.base.orderby';
