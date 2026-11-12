import SocketErrorCode from '../socket/protocol/socket.error.code';

/** THROW de regra de expedição na base (50011–50099). */
export const SQL_BUSINESS_RULE_MIN = 50011;
export const SQL_BUSINESS_RULE_MAX = 50099;

const TRIGGER_ABORT_MESSAGES = [
  'The transaction ended in the trigger. The batch has been aborted.',
  'The statement has been terminated.',
];

const DRIVER_LEAK_MARKERS = [
  'Invalid object name',
  'Invalid column name',
  'Violation of',
  'Cannot insert the value NULL',
  'Cannot insert duplicate key',
  'The conversion of',
  'Conversion failed',
  'Incorrect syntax',
  'Must declare the scalar',
  'String or binary data would be truncated',
  'The transaction ended in the trigger',
  'The statement has been terminated',
  'RequestError',
  'tedious',
  'at line ',
  'too many parameters',
  'maximum of 2100',
];

const CONNECTION_CODES = new Set([
  'ETIMEOUT',
  'ESOCKET',
  'ELOGIN',
  'ECONNCLOSED',
  'ENOTOPEN',
  'EINSTLOOKUP',
  'EINVALIDSTATE',
]);

const UNIQUE_CONFERIR_INDEX = 'UX_Conferir_OrigemAtiva';
const UNIQUE_CONFERIR_MESSAGE = 'Ja existe conferencia ativa para esta origem. Nao e permitido gerar outra.';
const INTERNAL_CLIENT_MESSAGE = 'Falha ao processar a solicitacao.';
const SQL_FALLBACK_MESSAGE = 'Falha ao processar no banco.';
const CONNECTION_CLIENT_MESSAGE = 'Falha de conexao com o banco.';
const TOO_MANY_PARAMETERS_MESSAGE = 'Muitos itens nesta operacao. Tente novamente.';

/** SQL Server Msg 8003: more than 2100 parameters in one request. */
export const SQL_TOO_MANY_PARAMETERS = 8003;

const SQL_CLIENT_MESSAGES: Record<number, string> = {
  241: 'Data ou hora invalida.',
  245: 'Valor incompativel com o tipo do campo.',
  515: 'Campo obrigatorio ausente.',
  547: 'Registro relacionado impede esta operacao.',
  1205: 'Conflito de gravacao. Tente novamente.',
  1222: 'O registro esta em uso. Tente novamente.',
  2601: 'Registro duplicado.',
  2627: 'Registro duplicado.',
  334: 'Nao foi possivel gravar o registro no banco.',
  1934: 'Falha ao gravar no banco (opcoes SET).',
  3609: 'A operacao foi recusada pela regra do banco.',
  8003: TOO_MANY_PARAMETERS_MESSAGE,
  8114: 'Valor incompativel com o tipo do campo.',
  8134: 'Operacao numerica invalida.',
  8152: 'Texto maior do que o campo permite.',
};

export type ClassifiedClientError = {
  identifier: string;
  message: string;
  clientMessage: string;
  code: SocketErrorCode;
  sqlNumber?: number;
  isBusinessRule: boolean;
  diagnostic?: string;
};

export class SocketClientError extends Error {
  readonly code: SocketErrorCode;

  constructor(message: string, code: SocketErrorCode = SocketErrorCode.INVALID_PAYLOAD) {
    super(message);
    this.name = 'SocketClientError';
    this.code = code;
  }
}

export function conferirDuplicateOriginError(): RepositoryError {
  return new RepositoryError(UNIQUE_CONFERIR_MESSAGE, { sqlNumber: 50016 });
}

export class RepositoryError extends Error {
  readonly sqlNumber?: number;
  readonly isBusinessRule: boolean;

  constructor(message: string, options?: { cause?: unknown; sqlNumber?: number }) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'RepositoryError';
    this.sqlNumber = options?.sqlNumber;
    this.isBusinessRule = isExpedicaoBusinessRuleNumber(options?.sqlNumber);
  }
}

export function isExpedicaoBusinessRuleNumber(value: number | undefined): boolean {
  if (value === undefined) return false;
  return value >= SQL_BUSINESS_RULE_MIN && value <= SQL_BUSINESS_RULE_MAX;
}

export function socketErrorCodeFor(error: unknown, fallback: SocketErrorCode = SocketErrorCode.INTERNAL_ERROR): SocketErrorCode {
  return classifyClientError(error, fallback).code;
}

export function httpStatusForClientError(classified: ClassifiedClientError): number {
  switch (classified.code) {
    case SocketErrorCode.INVALID_PAYLOAD:
      return 400;
    case SocketErrorCode.UNAUTHORIZED:
      return 401;
    case SocketErrorCode.NOT_FOUND:
      return 404;
    case SocketErrorCode.BUSINESS_RULE_VIOLATION:
      return classified.sqlNumber === 50016 ? 409 : 422;
    default:
      return 500;
  }
}

/**
 * Preserva a cadeia de erros do driver e promove THROW 50xxx a regra de negócio.
 */
export function wrapRepositoryError(err: unknown): Error {
  if (err instanceof RepositoryError || err instanceof SocketClientError) {
    return err;
  }

  let sqlNumber = readSqlNumber(err);
  let message = readSqlMessage(err, sqlNumber);
  const raw = rawErrorMessage(err);

  if (sqlNumber === undefined && isTooManyParametersMessage(raw)) {
    sqlNumber = SQL_TOO_MANY_PARAMETERS;
  }

  if ((sqlNumber === 2601 || sqlNumber === 2627) && raw.includes(UNIQUE_CONFERIR_INDEX)) {
    sqlNumber = 50016;
    message = UNIQUE_CONFERIR_MESSAGE;
  }

  if (err instanceof Error) {
    return new RepositoryError(message, { cause: err, sqlNumber });
  }

  return new RepositoryError(message, { sqlNumber });
}

export function classifyClientError(
  error: unknown,
  fallbackCode: SocketErrorCode = SocketErrorCode.INTERNAL_ERROR,
): ClassifiedClientError {
  if (error instanceof SocketClientError) {
    return buildClassified({
      identifier: error.code,
      message: error.message,
      code: error.code,
    });
  }

  const repositoryError = findRepositoryError(error);
  const sqlNumber = repositoryError?.sqlNumber ?? readSqlNumber(error);
  const driverCode = readDriverCode(error);
  const extracted = repositoryError?.message || readSqlMessage(error, sqlNumber) || rawErrorMessage(error);
  const diagnostic = extracted || String(error);

  if (repositoryError?.isBusinessRule || isExpedicaoBusinessRuleNumber(sqlNumber)) {
    const number = repositoryError?.sqlNumber ?? sqlNumber;
    const message = sanitizeBusinessMessage(extracted, number);
    return buildClassified({
      identifier: String(number ?? 'REGRA'),
      message,
      code: SocketErrorCode.BUSINESS_RULE_VIOLATION,
      sqlNumber: number,
      isBusinessRule: true,
    });
  }

  if (isConnectionError(driverCode, sqlNumber, diagnostic)) {
    return buildClassified({
      identifier: 'SQL-CONN',
      message: CONNECTION_CLIENT_MESSAGE,
      code: SocketErrorCode.INTERNAL_ERROR,
      sqlNumber,
      diagnostic,
    });
  }

  if (sqlNumber === SQL_TOO_MANY_PARAMETERS || isTooManyParametersMessage(diagnostic)) {
    return buildClassified({
      identifier: `SQL-${SQL_TOO_MANY_PARAMETERS}`,
      message: TOO_MANY_PARAMETERS_MESSAGE,
      code: SocketErrorCode.INTERNAL_ERROR,
      sqlNumber: SQL_TOO_MANY_PARAMETERS,
      diagnostic,
    });
  }

  if (sqlNumber !== undefined) {
    return buildClassified({
      identifier: `SQL-${sqlNumber}`,
      message: SQL_CLIENT_MESSAGES[sqlNumber] ?? SQL_FALLBACK_MESSAGE,
      code: SocketErrorCode.INTERNAL_ERROR,
      sqlNumber,
      diagnostic,
    });
  }

  if (looksLikeDriverLeak(diagnostic)) {
    return buildClassified({
      identifier: 'INTERNAL_ERROR',
      message: INTERNAL_CLIENT_MESSAGE,
      code: SocketErrorCode.INTERNAL_ERROR,
      diagnostic,
    });
  }

  const message = extracted.trim() || INTERNAL_CLIENT_MESSAGE;
  return buildClassified({
    identifier: fallbackCode,
    message,
    code: fallbackCode,
    diagnostic: diagnostic !== message ? diagnostic : undefined,
  });
}

function buildClassified(params: {
  identifier: string;
  message: string;
  code: SocketErrorCode;
  sqlNumber?: number;
  isBusinessRule?: boolean;
  diagnostic?: string;
}): ClassifiedClientError {
  const message = params.message.trim();
  return {
    identifier: params.identifier,
    message,
    clientMessage: `[${params.identifier}] ${message}`,
    code: params.code,
    sqlNumber: params.sqlNumber,
    isBusinessRule: params.isBusinessRule === true,
    diagnostic: params.diagnostic,
  };
}

function sanitizeBusinessMessage(text: string, sqlNumber: number | undefined): string {
  const trimmed = text.trim();
  if (trimmed && !isTriggerAbortMessage(trimmed) && !looksLikeDriverLeak(trimmed)) {
    return trimmed;
  }
  if (sqlNumber === 50016) return UNIQUE_CONFERIR_MESSAGE;
  return 'A operacao viola uma regra de negocio da expedicao.';
}

function findRepositoryError(error: unknown, seen = new Set<unknown>()): RepositoryError | undefined {
  if (error === null || error === undefined || seen.has(error)) return undefined;
  seen.add(error);

  if (error instanceof RepositoryError) return error;
  if (error instanceof Error && error.cause) {
    return findRepositoryError(error.cause, seen);
  }
  return undefined;
}

function readSqlNumber(err: unknown): number | undefined {
  const numbers = collectSqlNumbers(err);
  const business = numbers.find((value) => isExpedicaoBusinessRuleNumber(value));
  if (business !== undefined) return business;
  return numbers[0];
}

function readSqlMessage(err: unknown, sqlNumber: number | undefined): string {
  if (sqlNumber === 2601 || sqlNumber === 2627) {
    const raw = rawErrorMessage(err);
    if (raw.includes(UNIQUE_CONFERIR_INDEX)) {
      return UNIQUE_CONFERIR_MESSAGE;
    }
  }

  const candidates = collectSqlMessages(err);
  const withoutAbort = candidates.filter((text) => !isTriggerAbortMessage(text));
  if (withoutAbort.length > 0) return withoutAbort[0];
  if (candidates.length > 0) return candidates[0];
  return String(err);
}

function collectSqlNumbers(err: unknown, seen = new Set<unknown>()): number[] {
  if (err === null || err === undefined || seen.has(err)) return [];
  seen.add(err);

  const numbers: number[] = [];
  if (typeof err !== 'object') return numbers;

  const record = err as Record<string, unknown>;
  pushNumber(numbers, record.number);
  if (typeof record.code === 'number') {
    pushNumber(numbers, record.code);
  }

  const info = isRecord(record.info) ? record.info : isRecord(record.originalError) ? readInfo(record.originalError) : undefined;
  if (info) {
    pushNumber(numbers, info.number);
  }

  if (Array.isArray(record.precedingErrors)) {
    for (const nested of record.precedingErrors) {
      numbers.push(...collectSqlNumbers(nested, seen));
    }
  }

  if (record.originalError) {
    numbers.push(...collectSqlNumbers(record.originalError, seen));
  }

  if (err instanceof Error && err.cause) {
    numbers.push(...collectSqlNumbers(err.cause, seen));
  }

  return numbers;
}

function collectSqlMessages(err: unknown, seen = new Set<unknown>()): string[] {
  if (err === null || err === undefined || seen.has(err)) return [];
  seen.add(err);

  const messages: string[] = [];
  const raw = rawErrorMessage(err);
  if (raw) messages.push(raw);

  if (typeof err !== 'object') return messages;
  const record = err as Record<string, unknown>;

  if (Array.isArray(record.precedingErrors)) {
    for (const nested of record.precedingErrors) {
      messages.push(...collectSqlMessages(nested, seen));
    }
  }

  if (record.originalError) {
    messages.push(...collectSqlMessages(record.originalError, seen));
  }

  if (err instanceof Error && err.cause) {
    messages.push(...collectSqlMessages(err.cause, seen));
  }

  return messages;
}

function rawErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  if (typeof err === 'string' && err.trim()) return err.trim();
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return '';
}

function readDriverCode(err: unknown, seen = new Set<unknown>()): string | undefined {
  if (err === null || err === undefined || seen.has(err)) return undefined;
  seen.add(err);
  if (typeof err !== 'object') return undefined;

  const record = err as Record<string, unknown>;
  if (typeof record.code === 'string' && record.code.trim()) return record.code.trim().toUpperCase();

  if (record.originalError) {
    const nested = readDriverCode(record.originalError, seen);
    if (nested) return nested;
  }

  if (err instanceof Error && err.cause) {
    return readDriverCode(err.cause, seen);
  }

  return undefined;
}

function isConnectionError(driverCode: string | undefined, sqlNumber: number | undefined, diagnostic: string): boolean {
  if (driverCode && CONNECTION_CODES.has(driverCode)) return true;
  if (sqlNumber === 53 || sqlNumber === 4060 || sqlNumber === 18456) return true;
  return /failed to connect|connect etimedout|login failed/i.test(diagnostic);
}

function looksLikeDriverLeak(message: string): boolean {
  return DRIVER_LEAK_MARKERS.some((marker) => message.includes(marker));
}

function isTriggerAbortMessage(message: string): boolean {
  return TRIGGER_ABORT_MESSAGES.some((abort) => message.includes(abort));
}

function isTooManyParametersMessage(message: string): boolean {
  return /too many parameters|maximum of 2100/i.test(message);
}

function pushNumber(target: number[], value: unknown): void {
  if (typeof value === 'number' && Number.isFinite(value)) {
    target.push(value);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readInfo(originalError: Record<string, unknown>): Record<string, unknown> | undefined {
  return isRecord(originalError.info) ? originalError.info : originalError;
}
