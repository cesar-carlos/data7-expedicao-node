import { describe, expect, it } from 'vitest';

import {
  SERVIDOR_EMERGENCIA_CODIGOS,
  SERVIDOR_EMERGENCIA_LISTEN,
  buildServidorEmergenciaMensagem,
  serializeServidorEmergenciaListen,
} from '../../../../src/socket/protocol/servidor.emergencia';

describe('servidor.emergencia payload', () => {
  it('should keep the listen channel name stable', () => {
    expect(SERVIDOR_EMERGENCIA_LISTEN).toBe('servidor.emergencia.listen');
  });

  it('should default aviso to no disconnect', () => {
    const mensagem = buildServidorEmergenciaMensagem({
      Nivel: 'aviso',
      Mensagem: 'Servidor em manutencao breve.',
    });

    expect(mensagem.Codigo).toBe(SERVIDOR_EMERGENCIA_CODIGOS.AVISO);
    expect(mensagem.Acao).toBe('nenhuma');
    expect(mensagem.PrazoMs).toBe(0);
    expect(mensagem.Mensagem).toBe('Servidor em manutencao breve.');
  });

  it('should default desconectar to 5 seconds', () => {
    const mensagem = buildServidorEmergenciaMensagem({
      Nivel: 'desconectar',
      Mensagem: 'Conexao sera encerrada.',
    });

    expect(mensagem.Codigo).toBe(SERVIDOR_EMERGENCIA_CODIGOS.DESCONECTAR);
    expect(mensagem.Acao).toBe('desconectar');
    expect(mensagem.PrazoMs).toBe(5000);
  });

  it('should serialize as ExpedicaoBasicListenEvent Data', () => {
    const mensagem = buildServidorEmergenciaMensagem(
      {
        Nivel: 'urgente',
        Mensagem: 'Pare as consultas.',
        Codigo: 'SERVIDOR_MANUTENCAO',
        Acao: 'nenhuma',
        PrazoMs: 0,
      },
      new Date('2026-11-13T12:00:00.000Z'),
    );

    expect(JSON.parse(serializeServidorEmergenciaListen(mensagem))).toEqual({
      Data: [
        {
          Nivel: 'urgente',
          Codigo: 'SERVIDOR_MANUTENCAO',
          Mensagem: 'Pare as consultas.',
          Acao: 'nenhuma',
          PrazoMs: 0,
          EmitidoEm: '2026-11-13T12:00:00.000Z',
        },
      ],
    });
  });
});
