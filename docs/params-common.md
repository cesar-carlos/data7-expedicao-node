# Parâmetros de consulta SQL

`ParamsCommonRepository.build` monta o texto do `WHERE` a partir de quatro formatos. No SQL Server, o caminho atual da consulta paginada é `buildWhereParameterized`: o fragmento usa `@nome` e os valores entram por `request.input`. `build` continua para o formato legado e para o operador `CUSTOM`.

## String

```typescript
ParamsCommonRepository.build("CodLoginApp = 82 AND Ativo = 'S'");
```

O texto é usado como veio.

## Lista de strings

```typescript
ParamsCommonRepository.build(["Nome = 'Joao'", "Ativo = 'S'"]);
// Nome = 'Joao' AND Ativo = 'S'
```

## Lista de objetos

```typescript
ParamsCommonRepository.build([
  { key: 'Nome', operator: '=', value: 'Joao' },
  { key: 'Ativo', operator: '=', value: 'S' },
]);
```

## Lista de listas

```typescript
ParamsCommonRepository.build([
  ['CodLoginApp', '=', 82],
  ['Ativo', '=', 'S'],
]);
```

Cada item tem chave, operador e valor. O valor é escapado conforme o tipo. Identificadores inválidos são recusados.
