import { describe, expect, test } from 'vitest';

import SocketErrorCode from '../../../src/socket/protocol/socket.error.code';
import {
  RepositoryError,
  SocketClientError,
  classifyClientError,
  conferirDuplicateOriginError,
  httpStatusForClientError,
  socketErrorCodeFor,
  wrapRepositoryError,
} from '../../../src/utils/repository.error';

describe('wrapRepositoryError', () => {
  test('should promote THROW 50014 to a business rule', () => {
    const driverError = Object.assign(new Error('Carrinho sem itens para conferir. Nao e possivel iniciar a conferencia deste carrinho.'), {
      number: 50014,
    });

    const wrapped = wrapRepositoryError(driverError);

    expect(wrapped).toBeInstanceOf(RepositoryError);
    expect(wrapped.message).toContain('Carrinho sem itens para conferir');
    expect((wrapped as RepositoryError).sqlNumber).toBe(50014);
    expect((wrapped as RepositoryError).isBusinessRule).toBe(true);
    expect(socketErrorCodeFor(wrapped)).toBe(SocketErrorCode.BUSINESS_RULE_VIOLATION);
  });

  test('should prefer the THROW message over the trigger abort', () => {
    const abort = Object.assign(new Error('The transaction ended in the trigger. The batch has been aborted.'), {
      number: 3609,
      precedingErrors: [
        Object.assign(new Error('Separacao nao pode ser fechada: ainda existe quantidade pendente em carrinho aberto ou cancelado. Finalize ou separe de novo.'), {
          number: 50011,
        }),
      ],
    });

    const wrapped = wrapRepositoryError(abort) as RepositoryError;

    expect(wrapped.sqlNumber).toBe(50011);
    expect(wrapped.isBusinessRule).toBe(true);
    expect(wrapped.message).toContain('Separacao nao pode ser fechada');
  });

  test('should map the unique conferir index to a business rule', () => {
    const driverError = Object.assign(
      new Error("Cannot insert duplicate key row in object 'Expedicao.Conferir' with unique index 'UX_Conferir_OrigemAtiva'."),
      { number: 2601 },
    );

    const wrapped = wrapRepositoryError(driverError) as RepositoryError;

    expect(wrapped.sqlNumber).toBe(50016);
    expect(wrapped.isBusinessRule).toBe(true);
    expect(wrapped.message).toContain('Ja existe conferencia ativa');
  });

  test('should keep an unexpected SQL error as internal', () => {
    const driverError = Object.assign(new Error('Invalid object name Expedicao.Foo'), { number: 208 });
    const wrapped = wrapRepositoryError(driverError) as RepositoryError;

    expect(wrapped.sqlNumber).toBe(208);
    expect(wrapped.isBusinessRule).toBe(false);
    expect(socketErrorCodeFor(wrapped)).toBe(SocketErrorCode.INTERNAL_ERROR);
  });

  test('should keep a SocketClientError as-is', () => {
    const error = new SocketClientError('Where deve ser uma lista de parametros.');
    expect(wrapRepositoryError(error)).toBe(error);
  });

  test('should not wrap a RepositoryError twice', () => {
    const first = wrapRepositoryError(Object.assign(new Error('Carrinho sem itens para conferir.'), { number: 50014 }));
    const second = wrapRepositoryError(first);
    expect(second).toBe(first);
  });

  test('should tag too many parameters as 8003 when the driver omits the number', () => {
    const wrapped = wrapRepositoryError(
      new Error('The incoming request has too many parameters. The server supports a maximum of 2100 parameters.'),
    ) as RepositoryError;

    expect(wrapped.sqlNumber).toBe(8003);
  });
});

describe('classifyClientError', () => {
  test('should prefix the business rule number for the client', () => {
    const wrapped = wrapRepositoryError(Object.assign(
      new Error('Carrinho sem itens para conferir. Nao e possivel iniciar a conferencia deste carrinho.'),
      { number: 50014 },
    ));

    const classified = classifyClientError(wrapped);

    expect(classified.identifier).toBe('50014');
    expect(classified.clientMessage).toBe(
      '[50014] Carrinho sem itens para conferir. Nao e possivel iniciar a conferencia deste carrinho.',
    );
    expect(classified.code).toBe(SocketErrorCode.BUSINESS_RULE_VIOLATION);
    expect(httpStatusForClientError(classified)).toBe(422);
  });

  test('should prefix conferir duplicate origin as 50016', () => {
    const classified = classifyClientError(conferirDuplicateOriginError());

    expect(classified.identifier).toBe('50016');
    expect(classified.clientMessage).toBe(
      '[50016] Ja existe conferencia ativa para esta origem. Nao e permitido gerar outra.',
    );
    expect(classified.code).toBe(SocketErrorCode.BUSINESS_RULE_VIOLATION);
    expect(httpStatusForClientError(classified)).toBe(409);
  });

  test('should classify a SocketClientError with its own code', () => {
    const classified = classifyClientError(
      new SocketClientError('conferir.item.consulta exige CodCarrinho no Where.'),
    );

    expect(classified.clientMessage).toBe('[INVALID_PAYLOAD] conferir.item.consulta exige CodCarrinho no Where.');
    expect(classified.code).toBe(SocketErrorCode.INVALID_PAYLOAD);
  });

  test('should classify unique conferir as 50016 conflict', () => {
    const wrapped = wrapRepositoryError(Object.assign(
      new Error("Cannot insert duplicate key row in object 'Expedicao.Conferir' with unique index 'UX_Conferir_OrigemAtiva'."),
      { number: 2601 },
    ));

    const classified = classifyClientError(wrapped);

    expect(classified.identifier).toBe('50016');
    expect(classified.clientMessage).toContain('[50016] Ja existe conferencia ativa');
    expect(httpStatusForClientError(classified)).toBe(409);
  });

  test('should hide SQL object names and keep the number', () => {
    const wrapped = wrapRepositoryError(Object.assign(new Error('Invalid object name Expedicao.Foo'), { number: 208 }));
    const classified = classifyClientError(wrapped);

    expect(classified.clientMessage).toBe('[SQL-208] Falha ao processar no banco.');
    expect(classified.diagnostic).toContain('Invalid object name');
    expect(classified.clientMessage).not.toContain('Expedicao.Foo');
  });

  test('should map a foreign key failure without leaking the constraint', () => {
    const wrapped = wrapRepositoryError(Object.assign(
      new Error('The INSERT statement conflicted with the FOREIGN KEY constraint FK_ItemConferir.'),
      { number: 547 },
    ));

    const classified = classifyClientError(wrapped);
    expect(classified.clientMessage).toBe('[SQL-547] Registro relacionado impede esta operacao.');
  });

  test('should map a connection timeout', () => {
    const driverError = Object.assign(new Error('Failed to connect to localhost:1433 in 15000ms'), {
      code: 'ETIMEOUT',
    });

    const classified = classifyClientError(wrapRepositoryError(driverError));
    expect(classified.clientMessage).toBe('[SQL-CONN] Falha de conexao com o banco.');
  });

  test('should keep a validation message with the fallback code', () => {
    const classified = classifyClientError(
      new Error('usuario.insert expected at least one item'),
      SocketErrorCode.INVALID_PAYLOAD,
    );

    expect(classified.clientMessage).toBe('[INVALID_PAYLOAD] usuario.insert expected at least one item');
    expect(classified.code).toBe(SocketErrorCode.INVALID_PAYLOAD);
  });

  test('should classify SQL 8003 without leaking the driver text', () => {
    const wrapped = wrapRepositoryError(
      Object.assign(
        new Error(
          'The incoming request has too many parameters. The server supports a maximum of 2100 parameters.',
        ),
        { number: 8003 },
      ),
    );

    const classified = classifyClientError(wrapped);

    expect((wrapped as RepositoryError).sqlNumber).toBe(8003);
    expect(classified.clientMessage).toBe('[SQL-8003] Muitos itens nesta operacao. Tente novamente.');
    expect(classified.clientMessage).not.toContain('too many parameters');
  });

  test('should classify SQL 334 without leaking OUTPUT/trigger text', () => {
    const classified = classifyClientError(
      Object.assign(
        new Error(
          "The target table 'Expedicao.CarrinhoPercursoEstagio' of the DML statement cannot have any enabled triggers if the statement contains an OUTPUT clause without INTO clause.",
        ),
        { number: 334 },
      ),
    );

    expect(classified.identifier).toBe('SQL-334');
    expect(classified.clientMessage).toBe('[SQL-334] Nao foi possivel gravar o registro no banco.');
    expect(classified.clientMessage).not.toContain('OUTPUT');
  });

  test('should classify SQL 1934 without leaking ANSI_WARNINGS', () => {
    const classified = classifyClientError(
      Object.assign(
        new Error(
          "UPDATE failed because the following SET options have incorrect settings: 'ANSI_WARNINGS'.",
        ),
        { number: 1934 },
      ),
    );

    expect(classified.identifier).toBe('SQL-1934');
    expect(classified.clientMessage).toBe('[SQL-1934] Falha ao gravar no banco (opcoes SET).');
    expect(classified.clientMessage).not.toContain('ANSI_WARNINGS');
  });

  test('should classify the 2100 parameter text when the driver omits the number', () => {
    const classified = classifyClientError(
      new Error(
        'The incoming request has too many parameters. The server supports a maximum of 2100 parameters. Reduce the number of parameters and resend the request.',
      ),
    );

    expect(classified.identifier).toBe('SQL-8003');
    expect(classified.clientMessage).toBe('[SQL-8003] Muitos itens nesta operacao. Tente novamente.');
  });

  test('should classify a wrapped RepositoryError through Error.cause', () => {
    const wrapped = wrapRepositoryError(Object.assign(
      new Error('Carrinho sem itens para conferir.'),
      { number: 50014 },
    ));
    const outer = new Error('Erro ao adicionar carrinho', { cause: wrapped });

    const classified = classifyClientError(outer);
    expect(classified.identifier).toBe('50014');
    expect(classified.code).toBe(SocketErrorCode.BUSINESS_RULE_VIOLATION);
  });
});
