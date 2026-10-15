import { Dialog } from 'quasar';

export function confirmAction(options: { title: string; message: string; okLabel: string }): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (accepted: boolean): void => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(accepted);
    };
    Dialog.create({
      title: options.title,
      message: options.message,
      persistent: true,
      ok: { label: options.okLabel, color: 'negative', unelevated: true, noCaps: true, dense: true },
      cancel: { label: 'Cancelar', flat: true, noCaps: true, dense: true, color: 'primary' },
    })
      .onOk(() => finish(true))
      .onCancel(() => finish(false))
      .onDismiss(() => finish(false));
  });
}
