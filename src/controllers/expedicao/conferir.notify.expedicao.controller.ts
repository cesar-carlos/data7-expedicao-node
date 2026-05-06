import { createNotImplementedHandler, handleController } from '../controller.helpers';
import ExpedicaoConferirConsultaDto from '../../dto/expedicao/expedicao.conferir.consulta.dto';
import SocketNotificationEmitterService from '../../services/socket.notification.emitter.service';

export default class ConferirNotifyExpedicaoController {
  private static readonly emitter = new SocketNotificationEmitterService();

  public static get = createNotImplementedHandler('ConferirNotifyExpedicaoController', 'get');
  public static post = createNotImplementedHandler('ConferirNotifyExpedicaoController', 'post');
  public static put = handleController((req, res) => {
    const conferir = ExpedicaoConferirConsultaDto.fromObject(req.body);
    ConferirNotifyExpedicaoController.emitter.emitMutation('conferir.update.listen', [conferir.toJson()]);
    res.status(204).send();
  });
  public static delete = createNotImplementedHandler('ConferirNotifyExpedicaoController', 'delete');
}
