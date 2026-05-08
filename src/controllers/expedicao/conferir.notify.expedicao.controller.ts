import { createNotImplementedHandler, handleController } from '../controller.helpers';
import ExpedicaoConferirConsultaDto from '../../dto/expedicao/expedicao.conferir.consulta.dto';
import SocketNotificationEmitterService from '../../services/socket.notification.emitter.service';
import AppApi from '../../aplication/app.api';

export default class ConferirNotifyExpedicaoController {
  public static get = createNotImplementedHandler('ConferirNotifyExpedicaoController', 'get');
  public static post = createNotImplementedHandler('ConferirNotifyExpedicaoController', 'post');
  public static put = handleController((req, res) => {
    const conferir = ExpedicaoConferirConsultaDto.fromObject(req.body);
    new SocketNotificationEmitterService(AppApi.getInstance().getIO()).emitMutation('conferir.update.listen', [
      conferir.toJson(),
    ]);
    res.status(204).send();
  });
  public static delete = createNotImplementedHandler('ConferirNotifyExpedicaoController', 'delete');
}
