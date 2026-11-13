import { v4 as uuidv4 } from 'uuid';
import { describe, expect, test, vi } from 'vitest';
import { OrderBy } from '../../../../src/contracts/local.base.orderby';
import ConferirRepository from '../../../../src/socket/conferir/conferir.repository';
import ExpedicaoConferirConsultaDto from '../../../../src/dto/expedicao/expedicao.conferir.consulta.dto';
import { requestSocket, startSocketTestServer } from '../../../helpers/socket.server';

describe('conferir socket contract', () => {
  test('should return serialized repository rows on the requested reply channel', async () => {
    const row = new ExpedicaoConferirConsultaDto({
      CodEmpresa: 1, CodConferir: 42, Origem: 'SE', CodOrigem: 7,
      Situacao: 'AGUARDANDO', CodCarrinhoPercurso: 9,
      DataLancamento: new Date('2026-01-01T00:00:00.000Z'), HoraLancamento: '08:00',
      TipoEntidade: 'C', CodEntidade: 1, NomeEntidade: 'Cliente de teste',
      CodPrioridade: 1, NomePrioridade: 'Normal', Historico: '', Observacao: '',
    });
    const consulta = vi.spyOn(ConferirRepository.prototype, 'consulta').mockResolvedValue([row]);
    const server = await startSocketTestServer();
    try {
      const socket = await server.connect();
      const responseIn = uuidv4();
      const wirePayload = await requestSocket(socket, 'conferir.consulta', {
        Session: socket.id, ResponseIn: responseIn, Where: '',
      });
      expect(typeof wirePayload).toBe('string');
      const payload: unknown = JSON.parse(String(wirePayload));
      expect(payload).toEqual({
        Session: socket.id, ResponseIn: responseIn,
        Data: JSON.parse(JSON.stringify([row.toJson()])),
      });
      expect(consulta).toHaveBeenCalledExactlyOnceWith('', undefined, OrderBy.fromQueryString());
    } finally {
      await server.close();
      vi.restoreAllMocks();
    }
  });
});
