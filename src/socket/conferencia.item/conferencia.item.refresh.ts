type ConferenciaItemKey = {
  CodEmpresa: number;
  CodConferir: number;
  Item: string;
};

export function conferenciaItemKey(item: ConferenciaItemKey): string {
  return `${item.CodEmpresa}:${item.CodConferir}:${item.Item}`;
}

export function uniqueConferenciaItems(items: readonly ConferenciaItemKey[]): ConferenciaItemKey[] {
  return Array.from(
    new Map(items.map((item) => [conferenciaItemKey(item), item])).values(),
  );
}

function groupConferenciaRows<TRow extends ConferenciaItemKey>(rows: readonly TRow[]): Map<string, TRow[]> {
  const grouped = new Map<string, TRow[]>();
  for (const row of rows) {
    const key = conferenciaItemKey(row);
    const bucket = grouped.get(key);
    if (bucket) {
      bucket.push(row);
    } else {
      grouped.set(key, [row]);
    }
  }
  return grouped;
}

/**
 * Monta o listen só com os itens da mutação.
 * A consulta por produto pode trazer linhas a mais; essas ficam de fora.
 * Item ausente vai para `missing` e só então é buscado de novo.
 */
export function assembleConferenciaConsultaRows<TRow extends ConferenciaItemKey>(
  items: readonly ConferenciaItemKey[],
  alreadyLoaded: readonly TRow[],
  fetched: readonly TRow[] = [],
): { rows: TRow[]; missing: ConferenciaItemKey[] } {
  const uniqueItems = uniqueConferenciaItems(items);
  const loadedByKey = groupConferenciaRows(alreadyLoaded);
  const fetchedByKey = groupConferenciaRows(fetched);
  const rows: TRow[] = [];
  const missing: ConferenciaItemKey[] = [];

  for (const item of uniqueItems) {
    const found = loadedByKey.get(conferenciaItemKey(item)) ?? fetchedByKey.get(conferenciaItemKey(item));
    if (found) {
      rows.push(...found);
    } else {
      missing.push(item);
    }
  }

  return { rows, missing };
}
