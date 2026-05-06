/**
 * INSERTs que usam `CASE WHEN @Item = '00000' OR @Item = '' THEN MAX(Item)+1`.
 * Parâmetro NULL no driver não satisfaz essas condições no SQL Server.
 */
export function normalizeExpedicaoItemSequenceKey(raw: unknown): string {
  if (raw === undefined || raw === null) {
    return '00000';
  }
  if (typeof raw === 'string' && raw.trim().length === 0) {
    return '00000';
  }
  return typeof raw === 'string' ? raw : String(raw);
}

/** DTOs Expedicao.* com `Item` e `copyWith({ Item })` para INSERT com sequência no SQL. */
export function withNormalizedExpedicaoLineItem<T extends { Item: string; copyWith(p: { Item: string }): T }>(
  entity: T,
): T {
  const item = normalizeExpedicaoItemSequenceKey(entity.Item);
  return item === entity.Item ? entity : entity.copyWith({ Item: item });
}
