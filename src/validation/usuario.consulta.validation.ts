import { z } from 'zod';

export const usuarioConsultaQuerySchema = z.object({
  CodUsuario: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
      message: 'CodUsuario deve ser um número válido maior que 0',
    }),

  NomeUsuario: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length > 0, {
      message: 'NomeUsuario não pode ser uma string vazia',
    }),

  CodEmpresa: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
      message: 'CodEmpresa deve ser um número válido maior que 0',
    }),

  Ativo: z
    .string()
    .optional()
    .refine((val) => !val || ['S', 'N'].includes(val.toUpperCase()), {
      message: 'Ativo deve ser "S" ou "N"',
    })
    .transform((val) => val?.toUpperCase()),

  Page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Page deve ser um número válido maior que 0',
    }),

  Offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'Offset deve ser um número válido maior ou igual a 0',
    }),

  Limit: z
    .string()
    .optional()
    .default('1000')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 1000, {
      message: 'Limit deve ser um número válido entre 1 e 1000',
    }),
});

export type UsuarioConsultaQuery = z.infer<typeof usuarioConsultaQuerySchema>;
