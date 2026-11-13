# Erros da expedição

Toda falha que chega no coletor ou no HTTP precisa ser identificável pelo prefixo. Sem o prefixo, o abort da trigger e o `AppError{ message: ... }` do Dart escondem a causa.

Ponto único no servidor: `src/utils/repository.error.ts` (`classifyClientError`).  
Socket.IO: `emitSocketError` em `src/socket/socket.event.helpers.ts`. O emit é JSON string.  
HTTP: `AppExpressError.fromUnknown` em `src/aplication/app.express.error.ts`.  
Coletor desktop: `AppError.fromSocket` / `AppError.display` em `lib/src/app/app_error.dart`.  
Coletor `exp`: `SocketRequestHelper` + `DataError` em `lib/core/network/socket_request_helper.dart` / `lib/core/errors/app_error.dart`.

## Envelope Socket.IO

O contrato legado permanece:

```json
{
  "Session": "...",
  "ResponseIn": "...",
  "Error": ["[50014] Carrinho sem itens para conferir. Nao e possivel iniciar a conferencia deste carrinho."],
  "Code": "BUSINESS_RULE_VIOLATION"
}
```

- `Error` é sempre `string[]`, com **uma** linha no formato `[identificador] mensagem`.
- `Code` e `RequestId` são metadados. O coletor antigo pode ignorá-los; a identificação rápida está no texto de `Error`.

## Como ler o prefixo

| Prefixo | Significa | O que fazer |
| --- | --- | --- |
| `[50011]`–`[50099]` | `THROW` de regra na base | Ler a mensagem. A tabela está em [Triggers](./triggers.md). |
| `[SQL-CONN]` | Falha de conexão / login / **timeout de request** | Conferir SQL Server e `.env`. Se `GET /usuarios` responde rápido, o pool está no ar: a consulta não terminou em 30 s. O Node **cancela** a request nesse timeout para soltar lock; o texto para o cliente não muda. Não subir `SQL_REQUEST_TIMEOUT_MS`. [Separar](../socket/separar.md). |
| `[SQL-1222]` | `LOCK_TIMEOUT` na lista | `SET LOCK_TIMEOUT` nas consultas (padrão 5 s, `SQL_LOCK_TIMEOUT_MS`). O coletor já trata como “registro em uso”. Não é recusa de payload. |
| `[SQL-153]` | `FETCH NEXT` 0 / NULL | `LIMIT` inválido. O helper agora clampa para ≥ 1 — [paginação](../contratos/paginacao.md). |
| `[SQL-547]`, `[SQL-2627]`, … | Erro SQL conhecido, sem nome de tabela | Integridade, duplicata, lock, conversão. |
| `[SQL-208]` e outros `[SQL-n]` | Erro SQL sem mapeamento específico | Ver o log do servidor (texto técnico depois do `\|`). |
| `[INVALID_PAYLOAD]` | Envelope Socket inválido | `Where` que não é lista nem SQL, `Mutation` inválida, `CodCarrinho` ausente nas consultas de item. |
| `[UNAUTHORIZED]` | Sem permissão | Login / sessão. A conexão Socket.IO **ainda não** autentica. |
| `[NOT_FOUND]` | Registro ausente | Sequência inexistente; estágio sem `CodCarrinho` no insert de scan. |
| `[INTERNAL_ERROR]` | Falha não classificada | Sequência com `Valor <= 0`; resto no log. |

O cliente **não** recebe nome de objeto, constraint nem `The transaction ended in the trigger`. Isso fica só no log.

`conferir.insert` no Socket.IO usa o mesmo `[50016]` do índice: o pré-check da aplicação chama `conferirDuplicateOriginError()`; se dois pedidos passam juntos, o unique da base ainda mapeia 2601/2627 → 50016.

## THROW da conferência

| Prefixo | Quando | Mensagem (resumo) |
| --- | --- | --- |
| `[50011]` | Percurso `SE` vira `SEPARADO` com quantidade pendente | Separacao nao pode ser fechada… |
| `[50014]` | Insert de estágio `CO` sem `ItemConferir` daquele carrinho | Carrinho sem itens para conferir… |
| `[50012]` | Conferência obrigatória sem item em carrinho `SEPARADO` | Nao e possivel gerar conferencia sem item… |
| `[50013]` | `ItemConferir` origem `SE` apontando para estágio inválido | Item a conferir deve apontar para estagio de separacao… |
| `[50016]` | `conferir.insert` com origem já ativa, ou trigger `04` | Ja existe conferencia ativa… |

Se o script `03 -` falhar com 50016 na `Estacao`: rode `03a - diagnostico-conferir-duplicadas.sql`, depois `03b - cancelar-conferir-duplicadas.sql`, depois o `03 -` de novo. O `03b -` cancela extras (`Situacao = CANCELADA`) e preserva uma conferência por origem (a que tem scan / carrinho aberto / mais item separado).

Cancelar carrinho **não** gera `THROW`.

Scripts: `D:\Developer\Data7\Expedicao\Expedicao Correcoes\`. Ainda não aplicados na `Estacao`. Sem esses scripts o servidor não inventa o `50014`; a tela volta a ficar vazia.

## SQL interno mapeado

| Prefixo | Número | Mensagem |
| --- | --- | --- |
| `[SQL-241]` / `[SQL-245]` / `[SQL-8114]` | conversão | Data ou hora invalida / Valor incompativel… |
| `[SQL-515]` | NULL obrigatório | Campo obrigatorio ausente. |
| `[SQL-547]` | FK | Registro relacionado impede esta operacao. |
| `[SQL-1205]` | deadlock | Conflito de gravacao. Tente novamente. |
| `[SQL-1222]` | lock / `LOCK_TIMEOUT` de lista | O registro esta em uso. Tente novamente. |
| `[SQL-334]` | `OUTPUT` sem `INTO` em tabela com trigger | Nao foi possivel gravar o registro no banco. |
| `[SQL-1934]` | `ANSI_WARNINGS OFF` + índice filtrado (FireDAC no `UPDATE Expedicao.Conferir`, Local Erro 886) | Falha ao gravar no banco (opcoes SET). Rode o script `03` (DROP do UX). |
| `[SQL-2601]` / `[SQL-2627]` | unique genérico | Registro duplicado. |
| `[SQL-3609]` | abort da trigger sem `THROW` 50xxx | A operacao foi recusada pela regra do banco. |
| `[SQL-8134]` | divisão | Operacao numerica invalida. |
| `[SQL-8152]` | truncamento | Texto maior do que o campo permite. |
| `[SQL-8003]` | mais de 2100 parâmetros no mesmo request | Muitos itens nesta operacao. Tente novamente. |
| `[SQL-153]` | `FETCH NEXT` 0 / NULL | Falha ao processar no banco. |
| `[SQL-CONN]` | `ETIMEOUT`, `ESOCKET`, `ELOGIN`, 4060, 18456, `Timeout: Request failed to complete` | Falha de conexao com o banco. Request > 30 s entra aqui mesmo com o pool saudável. |

## HTTP

O mesmo texto prefixado vai em `message`. `code` replica o `Code` do Socket.

| `code` | Status |
| --- | --- |
| `INVALID_PAYLOAD` | 400 |
| `UNAUTHORIZED` | 401 |
| `NOT_FOUND` | 404 |
| `BUSINESS_RULE_VIOLATION` (`50016`) | 409 |
| `BUSINESS_RULE_VIOLATION` (demais) | 422 |
| `INTERNAL_ERROR` | 500 |

`AppExpressError` já construído (validação de rota, etc.) **não** é reclassificado.

## Coletor Flutter

Desktop (`app_expedicao`):

1. O repositório lê `Error` (string ou lista) com `AppError.fromSocket`.
2. O serviço relança `AppError.fromUnknown(e)` — não embrulha com `Exception('Erro ao X: $e')`.
3. `AppError.toString()` e `AppError.display` devolvem **só** a mensagem. O dump `AppError{ message: ... }` não deve voltar.
4. O snackbar do `LoadingProcessDialogGenericWidget` usa `AppError.display`.

`exp` (`app\exp`):

1. `SocketRequestHelper` decodifica a string JSON e, se houver `Error`, completa com `DataError`.
2. A mensagem deve preservar o prefixo `[identificador]`. Não embrulhar com `Exception('Erro ao X: $e')`.

Abrir carrinho sem snapshot, com as triggers na `Estacao`:

`[50014] Carrinho sem itens para conferir. Nao e possivel iniciar a conferencia deste carrinho.`

## Log do servidor

`errorCode` + `error=[prefixo] mensagem | texto técnico`.

O trecho depois de ` | ` é diagnóstico (nome de objeto, abort da trigger). Não vai no `Error` do cliente.

Testes: `test/src/utils/repository.error.test.ts` e `test/src/aplication/app.express.error.test.ts`.
