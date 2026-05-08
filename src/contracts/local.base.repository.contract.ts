import { Params, Pagination, OrderBy } from './local.base.params';

export default interface LocalBaseRepositoryContract<T> {
  select(pagination?: Pagination): Promise<T[]>;
  selectWhere(params: Params[], pagination?: Pagination, orderBy?: OrderBy): Promise<T[]>;
  insert(entity: T): Promise<void>;
  insertWithReturn?(entity: T): Promise<T>;
  update(entity: T): Promise<void>;
  delete(entity: T): Promise<void>;
}
