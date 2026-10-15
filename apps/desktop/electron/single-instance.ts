import { app } from 'electron';

export function claimSingleInstance(onSecondInstance: () => void): boolean {
  const gotLock = app.requestSingleInstanceLock();
  if (!gotLock) {
    return false;
  }
  app.on('second-instance', () => {
    onSecondInstance();
  });
  return true;
}
