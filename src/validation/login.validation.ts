import { z } from 'zod';

export const loginSchema = z.object({
  Nome: z.string().min(1, 'Nome é obrigatório').max(30, 'Nome deve ter no máximo 30 caracteres').trim(),
  Senha: z.string().min(1, 'Senha é obrigatória').max(20, 'Senha deve ter no máximo 20 caracteres'),
});

export type LoginRequest = z.infer<typeof loginSchema>;
