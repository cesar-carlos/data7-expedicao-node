import { handleController } from '../controller.helpers';
import AppExpressError from '../../aplication/app.express.error';
import ServidorEmergenciaService, { getServidorEmergenciaIo } from '../../services/servidor.emergencia.service';
import { buildServidorEmergenciaMensagem } from '../../socket/protocol/servidor.emergencia';
import { servidorEmergenciaBodySchema } from '../../validation/servidor.emergencia.validation';

export default class ServidorEmergenciaController {
  public static post = handleController((req, res) => {
    const body = servidorEmergenciaBodySchema.parse(req.body);
    const mensagem = buildServidorEmergenciaMensagem(body);
    const service = new ServidorEmergenciaService(getServidorEmergenciaIo());

    if (body.SocketId) {
      const result = service.emitToSocket(body.SocketId, mensagem);
      if (!result) {
        throw new AppExpressError({
          message: 'Cliente não encontrado.',
          statusCode: 404,
          code: 'NOT_FOUND',
        });
      }
      res.status(204).send();
      return;
    }

    service.emitToAll(mensagem);
    res.status(204).send();
  });
}
