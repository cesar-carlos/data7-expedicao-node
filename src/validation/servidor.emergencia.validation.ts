import { z } from 'zod';

import {
  SERVIDOR_EMERGENCIA_ACOES,
  SERVIDOR_EMERGENCIA_NIVEIS,
} from '../socket/protocol/servidor.emergencia';

export const servidorEmergenciaBodySchema = z.object({
  Nivel: z.enum(SERVIDOR_EMERGENCIA_NIVEIS),
  Mensagem: z.string().trim().min(1).max(500),
  Codigo: z.string().trim().min(1).max(64).optional(),
  Acao: z.enum(SERVIDOR_EMERGENCIA_ACOES).optional(),
  PrazoMs: z.number().int().min(0).max(60_000).optional(),
  SocketId: z.string().trim().min(1).max(128).optional(),
});

export type ServidorEmergenciaBody = z.infer<typeof servidorEmergenciaBodySchema>;
