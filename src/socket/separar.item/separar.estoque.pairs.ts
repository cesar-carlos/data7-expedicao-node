export type SepararEstoquePair = {
  codEmpresa: number;
  codSepararEstoque: number;
};

/** Um par por separação. Pares diferentes não podem ir no mesmo AND. */
export function uniqueSepararEstoquePairs(
  items: ReadonlyArray<{ CodEmpresa: number; CodSepararEstoque: number }>,
): SepararEstoquePair[] {
  const unique = new Map<string, SepararEstoquePair>();

  for (const item of items) {
    const codEmpresa = Number(item.CodEmpresa);
    const codSepararEstoque = Number(item.CodSepararEstoque);
    if (!Number.isFinite(codEmpresa) || !Number.isFinite(codSepararEstoque)) {
      continue;
    }
    unique.set(`${codEmpresa}:${codSepararEstoque}`, { codEmpresa, codSepararEstoque });
  }

  return [...unique.values()];
}
