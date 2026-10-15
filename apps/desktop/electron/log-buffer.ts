import fs from 'fs';
import path from 'path';

import { redactText } from '../shared/config-schema';
import type { LogLine } from '../shared/ipc-contract';

const LIVE_LIMIT = 400;
const ERROR_VIEW_LIMIT = 500;
const MAX_ERROR_BYTES = 2 * 1024 * 1024;
const ROTATED_FILES = 3;

function isErrorText(stream: 'out' | 'err', text: string): boolean {
  if (stream === 'err') {
    return true;
  }
  return /\b(error|exception|unhandledrejection|uncaughtexception|falha)\b/i.test(text);
}

export class LogBuffer {
  private readonly live: LogLine[] = [];
  private readonly errors: LogLine[] = [];
  private nextId = 1;
  private pending: Record<'out' | 'err', string> = { out: '', err: '' };
  private errorOffset = 0;
  private readonly errorFile: string;
  private readonly offsetFile: string;

  constructor(
    directory: string,
    private readonly secrets: () => readonly string[],
  ) {
    fs.mkdirSync(directory, { recursive: true });
    this.errorFile = path.join(directory, 'errors.log');
    this.offsetFile = path.join(directory, 'errors.offset');
    this.errorOffset = this.readOffset();
    this.reloadErrors();
  }

  append(stream: 'out' | 'err', chunk: string): LogLine[] {
    const combined = this.pending[stream] + chunk;
    const parts = combined.split(/\r?\n/);
    this.pending[stream] = parts.pop() ?? '';
    const created: LogLine[] = [];
    for (const part of parts) {
      if (!part.trim()) {
        continue;
      }
      created.push(this.push(stream, part));
    }
    return created;
  }

  flush(stream: 'out' | 'err'): LogLine[] {
    const pending = this.pending[stream];
    this.pending[stream] = '';
    if (!pending.trim()) {
      return [];
    }
    return [this.push(stream, pending)];
  }

  recent(): LogLine[] {
    return [...this.live];
  }

  errorLines(): LogLine[] {
    return [...this.errors];
  }

  clearLive(): void {
    this.live.length = 0;
  }

  clearErrorView(): void {
    this.errors.length = 0;
    this.errorOffset = this.fileSize();
    fs.writeFileSync(this.offsetFile, String(this.errorOffset), 'utf8');
  }

  exportText(): string {
    return this.errors.map((line) => `${line.at} ${line.text}`).join('\n');
  }

  private push(stream: 'out' | 'err', text: string): LogLine {
    const textRedacted = redactText(text, this.secrets());
    const line: LogLine = {
      id: this.nextId++,
      at: new Date().toISOString(),
      stream,
      text: textRedacted,
      error: isErrorText(stream, textRedacted),
    };
    this.live.push(line);
    if (this.live.length > LIVE_LIMIT) {
      this.live.splice(0, this.live.length - LIVE_LIMIT);
    }
    if (line.error) {
      this.errors.push(line);
      if (this.errors.length > ERROR_VIEW_LIMIT) {
        this.errors.splice(0, this.errors.length - ERROR_VIEW_LIMIT);
      }
      this.appendErrorFile(line);
    }
    return line;
  }

  private appendErrorFile(line: LogLine): void {
    this.rotateIfNeeded();
    fs.appendFileSync(this.errorFile, `${line.at} ${line.text}\n`, 'utf8');
  }

  private rotateIfNeeded(): void {
    if (this.fileSize() < MAX_ERROR_BYTES) {
      return;
    }
    const oldest = `${this.errorFile}.${ROTATED_FILES}`;
    if (fs.existsSync(oldest)) {
      fs.rmSync(oldest);
    }
    for (let index = ROTATED_FILES - 1; index >= 1; index -= 1) {
      const source = `${this.errorFile}.${index}`;
      if (fs.existsSync(source)) {
        fs.renameSync(source, `${this.errorFile}.${index + 1}`);
      }
    }
    if (fs.existsSync(this.errorFile)) {
      fs.renameSync(this.errorFile, `${this.errorFile}.1`);
    }
    this.errorOffset = 0;
    fs.writeFileSync(this.offsetFile, '0', 'utf8');
  }

  private reloadErrors(): void {
    const size = this.fileSize();
    if (size === 0) {
      return;
    }
    const start = this.errorOffset > size ? 0 : this.errorOffset;
    const fd = fs.openSync(this.errorFile, 'r');
    try {
      const buffer = Buffer.alloc(size - start);
      fs.readSync(fd, buffer, 0, buffer.length, start);
      const lines = buffer
        .toString('utf8')
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);
      const tail = lines.slice(-ERROR_VIEW_LIMIT);
      for (const text of tail) {
        this.errors.push({
          id: this.nextId++,
          at: '',
          stream: 'err',
          text,
          error: true,
        });
      }
    } finally {
      fs.closeSync(fd);
    }
  }

  private fileSize(): number {
    if (!fs.existsSync(this.errorFile)) {
      return 0;
    }
    return fs.statSync(this.errorFile).size;
  }

  private readOffset(): number {
    if (!fs.existsSync(this.offsetFile)) {
      return 0;
    }
    const parsed = Number.parseInt(fs.readFileSync(this.offsetFile, 'utf8'), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
}
