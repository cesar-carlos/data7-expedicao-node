import fs from 'fs';

const cache = new Map<string, string>();

/**
 * Lê o arquivo SQL uma vez e reutiliza o conteúdo (menos I/O em requisições quentes).
 */
export function readSqlFileCached(absolutePath: string): string {
  let content = cache.get(absolutePath);
  if (content === undefined) {
    content = fs.readFileSync(absolutePath, 'utf8');
    cache.set(absolutePath, content);
  }
  return content;
}
