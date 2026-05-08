import { z } from 'zod';

export const consultaLoginAppQuerySchema = z.object({
  Nome: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => val.length > 0, 'Nome não pode estar vazio')
    .refine((val) => val.length <= 100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),

  CodLoginApp: z
    .string()
    .regex(/^\d+$/, 'Código deve ser um número válido')
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), 'Código deve ser um número válido')
    .optional(),

  Ativo: z
    .enum(['S', 'N', 's', 'n'], {
      message: 'Ativo deve ser S ou N',
    })
    .transform((val) => val.toUpperCase())
    .optional(),

  Page: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val > 0, 'Página deve ser um número maior que 0')
    .default(1),

  Offset: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? (typeof val === 'string' ? parseInt(val, 10) : val) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), 'Offset deve ser um número maior ou igual a 0'),

  Limit: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val))
    .refine((val) => !isNaN(val) && val > 0 && val <= 1000, 'Limit deve ser entre 1 e 1000')
    .default(1000),
});

export type ConsultaLoginAppQuery = z.infer<typeof consultaLoginAppQuerySchema>;
