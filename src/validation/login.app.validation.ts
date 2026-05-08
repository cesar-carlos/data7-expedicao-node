import { z } from 'zod';

export const loginAppSchema = z.object({
  Nome: z.string().min(1, 'Nome é obrigatório').max(30, 'Nome deve ter no máximo 30 caracteres').trim(),
  Senha: z.string().min(4, 'Senha deve ter no mínimo 6 caracteres').max(20, 'Senha deve ter no máximo 50 caracteres'),
  CodUsuario: z.number().optional(),
  FotoUsuario: z
    .union([z.string(), z.null()])
    .optional()
    .refine((val) => {
      if (!val || val === null) return true;
      try {
        Buffer.from(val, 'base64');
        return true;
      } catch {
        return false;
      }
    }, 'FotoUsuario deve ser uma string base64 válida ou null'),
});

export const updateLoginAppSchema = z.object({
  Senha: z
    .string()
    .min(4, 'Senha deve ter no mínimo 4 caracteres')
    .max(20, 'Senha deve ter no máximo 20 caracteres')
    .optional(),
  Ativo: z.enum(['S', 'N'], { message: 'Ativo deve ser "S" ou "N"' }).optional(),
  CodUsuario: z.number().optional(),

  FotoUsuario: z
    .union([z.string(), z.null()])
    .optional()
    .refine((val) => {
      if (!val || val === null) return true;
      try {
        Buffer.from(val, 'base64');
        return true;
      } catch {
        return false;
      }
    }, 'FotoUsuario deve ser uma string base64 válida ou null'),
});

export const updateLoginAppQuerySchema = z.object({
  CodLoginApp: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'CodLoginApp deve ser um número válido maior que 0',
    }),
});

export type LoginAppRequest = z.infer<typeof loginAppSchema>;
export type UpdateLoginAppRequest = z.infer<typeof updateLoginAppSchema>;
export type UpdateLoginAppQuery = z.infer<typeof updateLoginAppQuerySchema>;
