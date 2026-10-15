import net from 'net';

export function probePort(port: number, host = '127.0.0.1', timeoutMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    const finish = (open: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}
