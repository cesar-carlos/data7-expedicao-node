export default interface LocalBaseRepositorySequenceContract<T> {
  select(name: string): Promise<T | undefined>;
}
