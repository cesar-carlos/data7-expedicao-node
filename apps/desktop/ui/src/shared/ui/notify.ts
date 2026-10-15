import { Notify } from 'quasar';

export function notifyOk(message: string): void {
  Notify.create({
    message,
    color: 'positive',
    position: 'bottom',
    timeout: 2200,
  });
}

export function notifyError(message: string): void {
  Notify.create({
    message,
    color: 'negative',
    position: 'bottom',
    timeout: 6000,
  });
}
