import fs from 'fs';
import path from 'path';

import { app, nativeImage, type NativeImage } from 'electron';

function iconFile(name: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, name);
  }
  return path.resolve(__dirname, '..', '..', 'assets', name);
}

export function appIcon(): NativeImage {
  const file = iconFile('icon.ico');
  if (!fs.existsSync(file)) {
    return nativeImage.createEmpty();
  }
  return nativeImage.createFromPath(file);
}
