import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const socketRoot = path.join(__dirname, '..', 'src', 'socket');

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (name.endsWith('.event.ts')) files.push(p);
  }
  return files;
}

const re =
  /constructor\(\s*\r?\n\s*private readonly io: SocketIOServer,\s*\r?\n\s*private readonly socket: Socket,\s*\r?\n\s*\)/g;

for (const file of walk(socketRoot)) {
  let s = fs.readFileSync(file, 'utf8');
  const next = s.replace(re, 'constructor(io: SocketIOServer, socket: Socket)');
  if (next !== s) {
    fs.writeFileSync(file, next);
    console.log(path.relative(path.join(__dirname, '..'), file));
  }
}
