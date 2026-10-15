import fs from 'fs';

function writeChunk(fd: number, chunk: string | Uint8Array): void {
  if (typeof chunk === 'string') {
    fs.writeSync(fd, chunk);
    return;
  }
  fs.writeSync(fd, Buffer.from(chunk));
}

function wrap(stream: NodeJS.WriteStream, fd: number): void {
  stream.write = ((
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((error?: Error | null) => void),
    callback?: (error?: Error | null) => void,
  ) => {
    writeChunk(fd, chunk);
    const done = typeof encoding === 'function' ? encoding : callback;
    if (done) {
      done();
    }
    return true;
  }) as typeof stream.write;
}

/**
 * Com stdout em pipe o Node segura o buffer e as últimas linhas somem no kill.
 * O supervisor do desktop pede cada linha na hora.
 */
export function enableDesktopLineConsole(): void {
  wrap(process.stdout, 1);
  wrap(process.stderr, 2);
}
