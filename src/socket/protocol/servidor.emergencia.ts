import ExpedicaoBasicListenEvent from '../../model/expedicao.basic.listen.event';

/** Broadcast e unicast. O cliente não emite este canal — só escuta. */
export const SERVIDOR_EMERGENCIA_LISTEN = 'servidor.emergencia.listen';

export const SERVIDOR_EMERGENCIA_NIVEIS = ['aviso', 'urgente', 'desconectar'] as const;
export const SERVIDOR_EMERGENCIA_ACOES = ['nenhuma', 'desconectar'] as const;

export const SERVIDOR_EMERGENCIA_CODIGOS = {
  AVISO: 'SERVIDOR_AVISO',
  MANUTENCAO: 'SERVIDOR_MANUTENCAO',
  DESCONECTAR: 'SERVIDOR_DESCONECTAR',
} as const;

export type ServidorEmergenciaNivel = (typeof SERVIDOR_EMERGENCIA_NIVEIS)[number];
export type ServidorEmergenciaAcao = (typeof SERVIDOR_EMERGENCIA_ACOES)[number];

export interface ServidorEmergenciaInput {
  Nivel: ServidorEmergenciaNivel;
  Mensagem: string;
  Codigo?: string;
  Acao?: ServidorEmergenciaAcao;
  PrazoMs?: number;
}

export interface ServidorEmergenciaMensagem {
  Nivel: ServidorEmergenciaNivel;
  Codigo: string;
  Mensagem: string;
  Acao: ServidorEmergenciaAcao;
  PrazoMs: number;
  EmitidoEm: string;
}

const DEFAULT_PRAZO_DESCONECTAR_MS = 5_000;
const MAX_PRAZO_MS = 60_000;

function defaultCodigo(nivel: ServidorEmergenciaNivel): string {
  if (nivel === 'desconectar') return SERVIDOR_EMERGENCIA_CODIGOS.DESCONECTAR;
  if (nivel === 'urgente') return SERVIDOR_EMERGENCIA_CODIGOS.MANUTENCAO;
  return SERVIDOR_EMERGENCIA_CODIGOS.AVISO;
}

function defaultAcao(nivel: ServidorEmergenciaNivel, acao: ServidorEmergenciaAcao | undefined): ServidorEmergenciaAcao {
  if (acao) return acao;
  return nivel === 'desconectar' ? 'desconectar' : 'nenhuma';
}

function resolvePrazoMs(acao: ServidorEmergenciaAcao, prazoMs: number | undefined): number {
  const fallback = acao === 'desconectar' ? DEFAULT_PRAZO_DESCONECTAR_MS : 0;
  const raw = prazoMs === undefined ? fallback : prazoMs;
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(Math.max(Math.trunc(raw), 0), MAX_PRAZO_MS);
}

export function buildServidorEmergenciaMensagem(
  input: ServidorEmergenciaInput,
  now: Date = new Date(),
): ServidorEmergenciaMensagem {
  const acao = defaultAcao(input.Nivel, input.Acao);
  const codigo = input.Codigo?.trim() || defaultCodigo(input.Nivel);
  return {
    Nivel: input.Nivel,
    Codigo: codigo,
    Mensagem: input.Mensagem.trim(),
    Acao: acao,
    PrazoMs: resolvePrazoMs(acao, input.PrazoMs),
    EmitidoEm: now.toISOString(),
  };
}

export function serializeServidorEmergenciaListen(mensagem: ServidorEmergenciaMensagem): string {
  return JSON.stringify(
    new ExpedicaoBasicListenEvent({
      Data: [mensagem as unknown as Record<string, unknown>],
    }).toJson(),
  );
}
