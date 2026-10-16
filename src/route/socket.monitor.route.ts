import { Router } from 'express';

import SocketMonitorController from '../controllers/monitor/socket.monitor.controller';
import { requireLoopback } from '../middleware/loopback.middleware';
import { validateParams } from '../middleware/validation.middleware';
import { socketMonitorParamsSchema } from '../validation/socket.monitor.validation';

const router = Router();

router.get('/internal/sockets', requireLoopback, SocketMonitorController.list);
router.get(
  '/internal/sockets/:socketId',
  requireLoopback,
  validateParams(socketMonitorParamsSchema),
  SocketMonitorController.detail,
);

export default router;
