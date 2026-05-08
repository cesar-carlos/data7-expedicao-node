import { Params, Pagination, OrderBy } from './local.base.params';

export default interface LocalBaseConsultaRepositoryContract<T> {
  select(pagination?: Pagination): Promise<T[]>;
  selectWhere<P>(params: Params[], pagination?: Pagination, orderBy?: OrderBy): Promise<T[]>;
}
