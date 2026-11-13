import { Router } from 'express';

import SocketMonitorController from '../controllers/monitor/socket.monitor.controller';
import ServidorEmergenciaController from '../controllers/monitor/servidor.emergencia.controller';
import { requireLoopback } from '../middleware/loopback.middleware';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import { socketMonitorParamsSchema } from '../validation/socket.monitor.validation';
import { servidorEmergenciaBodySchema } from '../validation/servidor.emergencia.validation';

const router = Router();

router.get('/internal/sockets', requireLoopback, SocketMonitorController.list);
router.post(
  '/internal/sockets/emergencia',
  requireLoopback,
  validateBody(servidorEmergenciaBodySchema),
  ServidorEmergenciaController.post,
);
router.get(
  '/internal/sockets/:socketId',
  requireLoopback,
  validateParams(socketMonitorParamsSchema),
  SocketMonitorController.detail,
);

export default router;
