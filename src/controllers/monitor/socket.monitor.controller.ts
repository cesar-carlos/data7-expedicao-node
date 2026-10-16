import { handleController } from '../controller.helpers';
import { getSocketMonitor } from '../../socket/monitor/socket.monitor';
import { socketMonitorParamsSchema } from '../../validation/socket.monitor.validation';

export default class SocketMonitorController {
  public static list = handleController((_req, res) => {
    res.status(200).json(getSocketMonitor().snapshot());
  });

  public static detail = handleController((req, res) => {
    const { socketId } = socketMonitorParamsSchema.parse(req.params);
    const detail = getSocketMonitor().detail(socketId);
    if (!detail) {
      res.status(404).json({ message: 'Cliente não encontrado.' });
      return;
    }
    res.status(200).json(detail);
  });
}
