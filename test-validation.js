// Teste rápido da validação de FotoUsuario com null
const { z } = require('zod');

const updateLoginAppSchema = z.object({
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

// Teste 1: FotoUsuario como null
console.log('Teste 1 - FotoUsuario: null');
try {
  const result1 = updateLoginAppSchema.parse({
    Ativo: 'S',
    FotoUsuario: null,
  });
  console.log('✅ Sucesso:', result1);
} catch (error) {
  console.log('❌ Erro:', error.issues);
}

// Teste 2: FotoUsuario como string base64 válida
console.log('\nTeste 2 - FotoUsuario: string base64');
try {
  const result2 = updateLoginAppSchema.parse({
    Ativo: 'S',
    FotoUsuario: 'SGVsbG8gV29ybGQ=', // "Hello World" em base64
  });
  console.log('✅ Sucesso:', result2);
} catch (error) {
  console.log('❌ Erro:', error.issues);
}

// Teste 3: Sem FotoUsuario
console.log('\nTeste 3 - Sem FotoUsuario');
try {
  const result3 = updateLoginAppSchema.parse({
    Ativo: 'S',
  });
  console.log('✅ Sucesso:', result3);
} catch (error) {
  console.log('❌ Erro:', error.issues);
}
