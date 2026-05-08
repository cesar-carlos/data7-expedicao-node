# ParamsCommonRepository.build - Formatos Suportados

## 📋 **Formatos de Entrada Suportados**

O método `ParamsCommonRepository.build()` agora suporta múltiplos formatos de parâmetros:

### 1. **String Direta**

```typescript
const params = "CodLoginApp = 82 AND Ativo = 'S'";
const result = ParamsCommonRepository.build(params);
// Resultado: "CodLoginApp = 82 AND Ativo = 'S'"
```

### 2. **Array de Strings** (formato legado)

```typescript
const params = ["NomeUsuario = 'Administrador'", "Ativo = 'S'"];
const result = ParamsCommonRepository.build(params);
// Resultado: "NomeUsuario = 'Administrador' AND Ativo = 'S'"
```

### 3. **Array de Objetos** (formato estruturado)

```typescript
const params = [
  { key: 'Nome', operator: '=', value: 'João' },
  { key: 'Ativo', operator: '=', value: 'S' },
];
const result = ParamsCommonRepository.build(params);
// Resultado: "Nome = 'João' AND Ativo = 'S'"
```

### 4. **Array de Arrays** (novo formato) ✨

```typescript
// Formato com 3 elementos: [key, operator, value]
const params = [
  ['CodLoginApp', '=', '82'],
  ['Ativo', '=', 'S'],
];
const result = ParamsCommonRepository.build(params);
// Resultado: "CodLoginApp = '82' AND Ativo = 'S'"

// Formato com 2 elementos: [key, value] (assume operator '=')
const params2 = [
  ['CodLoginApp', '82'],
  ['Nome', 'João'],
];
const result2 = ParamsCommonRepository.build(params2);
// Resultado: "CodLoginApp = '82' AND Nome = 'João'"
```

## 🔧 **Exemplos Práticos**

### **Login Service - FindById**

```typescript
// Antes (não funcionava)
const result = await repository.selectWhere([['CodLoginApp', '=', `${id}`]]);

// Agora funciona! ✅
const result = await repository.selectWhere([['CodLoginApp', '=', '82']]);
// Gera SQL: WHERE CodLoginApp = '82'
```

### **Consulta com Múltiplos Filtros**

```typescript
const filters = [
  ['Nome', 'LIKE', '%João%'],
  ['Ativo', '=', 'S'],
  ['CodEmpresa', '=', '1'],
];
const result = await repository.selectWhere(filters);
// Gera SQL: WHERE Nome LIKE '%João%' AND Ativo = 'S' AND CodEmpresa = '1'
```

### **Misturando Operadores**

```typescript
const params = [
  ['CodLoginApp', '!=', '5'],
  ['DataCriacao', '>=', '2024-01-01'],
  ['Status', 'IN', '(1,2,3)'],
];
// Resultado: "CodLoginApp != '5' AND DataCriacao >= '2024-01-01' AND Status IN (1,2,3)"
```

## ⚡ **Tratamento de Valores**

### **Strings Automáticas**

```typescript
// Valores string são automaticamente envolvidos em aspas simples
[['Nome', '=', 'João']] → "Nome = 'João'"

// Valores já com aspas são mantidos
[['Nome', '=', "'João'"]] → "Nome = 'João'"

// Valores numéricos como string
[['Id', '=', '123']] → "Id = '123'"
```

### **Operadores Suportados**

```typescript
['Campo', '=', 'valor'][('Campo', '!=', 'valor')][('Campo', '>', 'valor')][('Campo', '<', 'valor')][ // Igualdade // Diferença // Maior que // Menor que
  ('Campo', '>=', 'valor')
][('Campo', '<=', 'valor')][('Campo', 'LIKE', '%valor%')][('Campo', 'IN', '(1,2,3)')]; // Maior ou igual // Menor ou igual // Like pattern // In list
```

## 🛡️ **Validações e Erros**

### **Array Inválido**

```typescript
// ❌ Erro - Array vazio
[['CodLoginApp']][
  // Erro: "Array deve ter 2 ou 3 elementos, recebido: 1"

  // ❌ Erro - Elemento não é array
  (['CodLoginApp', '=', '82'], 'string_invalida')
][
  // Erro: "Parâmetro de array inválido..."

  // ✅ Válido - Array com 2 elementos
  ['CodLoginApp', '82']
][
  // Resultado: "CodLoginApp = '82'"

  // ✅ Válido - Array com 3 elementos
  ['CodLoginApp', '=', '82']
];
// Resultado: "CodLoginApp = '82'"
```

## 🎯 **Casos de Uso por Service**

### **LoginAppService.FindById**

```typescript
// Novo formato suportado
public async FindById(id: number): Promise<ExpedicaoLoginAppDto | null> {
  const repository = this.repository();
  const result = await repository.selectWhere([['CodLoginApp', '=', `${id}`]]);
  return result.length > 0 ? result[0] : null;
}
```

### **UsuarioConsultaService**

```typescript
// Múltiplos filtros com array de arrays
public async consultarComFiltros(filtros: any) {
  const params = [
    ['CodEmpresa', '=', filtros.empresa],
    ['Ativo', '=', 'S'],
    ['Nome', 'LIKE', `%${filtros.nome}%`]
  ];
  return await repository.selectWhere(params);
}
```

## 🚀 **Vantagens do Novo Formato**

### **Legibilidade**

```typescript
// Antes (confuso)
[['CodLoginApp', '=', `${id}`]][ // Mistura template literal
  // Agora (claro)
  ['CodLoginApp', '=', id.toString()]
]; // Explicitamente string
```

### **Flexibilidade**

```typescript
// Suporte a todos os operadores SQL
[['Data', '>=', '2024-01-01']][['Status', 'IN', '(1,2,3,4)']][['Nome', 'LIKE', '%admin%']];
```

### **Compatibilidade**

```typescript
// Todos os formatos continuam funcionando
const legacy1 = 'CodLoginApp = 82'; // ✅ String
const legacy2 = ["Nome = 'João'"]; // ✅ Array string
const legacy3 = [{ key: 'Id', value: 1, operator: '=' }]; // ✅ Array objeto
const novo = [['CodLoginApp', '=', '82']]; // ✅ Array array
```

---

## ✅ **Status de Implementação**

- [x] **String Direta**: Suportado
- [x] **Array de Strings**: Suportado
- [x] **Array de Objetos**: Suportado
- [x] **Array de Arrays**: ✨ **NOVO** - Implementado
- [x] **Validação de Erros**: Mensagens claras
- [x] **Tratamento de Aspas**: Automático
- [x] **Backward Compatibility**: 100% compatível

**Formato `[['CodLoginApp', '=', '82']]` totalmente suportado! 🎉**
