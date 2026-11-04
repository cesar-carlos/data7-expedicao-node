import { describe, expect, it } from 'vitest';

import { assembleConferenciaConsultaRows } from '../../../../src/socket/conferencia.item/conferencia.item.refresh';

type Row = {
  CodEmpresa: number;
  CodConferir: number;
  Item: string;
  Nome: string;
};

const item = (Item: string, CodConferir = 10): Row => ({
  CodEmpresa: 1,
  CodConferir,
  Item,
  Nome: `item ${Item}`,
});

describe('assembleConferenciaConsultaRows', () => {
  it('keeps only the mutated items and drops extra product rows', () => {
    const loaded = [item('00002', 10), item('00001', 10), item('00009', 10)];

    const result = assembleConferenciaConsultaRows([item('00001'), item('00002')], loaded);

    expect(result.missing).toEqual([]);
    expect(result.rows.map((row) => row.Item)).toEqual(['00001', '00002']);
  });

  it('asks again only for the item that was not in the product query', () => {
    const result = assembleConferenciaConsultaRows([item('00001'), item('00003')], [item('00001')]);

    expect(result.rows.map((row) => row.Item)).toEqual(['00001']);
    expect(result.missing.map((row) => row.Item)).toEqual(['00003']);
  });

  it('uses the fetched row without repeating an item already loaded', () => {
    const result = assembleConferenciaConsultaRows(
      [item('00001'), item('00001'), item('00003')],
      [item('00001')],
      [item('00003', 10)],
    );

    expect(result.missing).toEqual([]);
    expect(result.rows.map((row) => row.Item)).toEqual(['00001', '00003']);
  });
});
