import { spawn } from 'child_process';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function waitForPort(port, timeoutMs) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ host: '127.0.0.1', port });
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`A tela não abriu na porta ${port}.`));
          return;
        }
        setTimeout(attempt, 300);
      });
    };
    attempt();
  });
}

const vite = spawn('npx', ['vite'], { cwd: root, stdio: 'inherit', shell: true });
let electron;

const stop = () => {
  if (electron && !electron.killed) {
    electron.kill();
  }
  if (!vite.killed) {
    vite.kill();
  }
};

process.on('SIGINT', () => {
  stop();
  process.exit(0);
});

waitForPort(5173, 60_000)
  .then(() => {
    electron = spawn('npx', ['tsc', '-p', 'tsconfig.electron.json'], { cwd: root, stdio: 'inherit', shell: true });
    electron.on('exit', (code) => {
      if (code !== 0) {
        stop();
        process.exit(code ?? 1);
        return;
      }
      electron = spawn('npx', ['electron', '.'], { cwd: root, stdio: 'inherit', shell: true });
      electron.on('exit', () => {
        stop();
        process.exit(0);
      });
    });
  })
  .catch((error) => {
    console.error(error);
    stop();
    process.exit(1);
  });
