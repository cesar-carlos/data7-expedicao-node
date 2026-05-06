import { createNotImplementedHandler, handleController } from '../controller.helpers';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import SocketNotificationEmitterService from '../../services/socket.notification.emitter.service';
import AppApi from '../../aplication/app.api';

export default class SeparacaoNotifyExpedicaoController {
  public static get = createNotImplementedHandler('SeparacaoNotifyExpedicaoController', 'get');
  public static post = handleController((req, res) => {
    const separars = Array.isArray(req.body.Data)
      ? req.body.Data.map((item: unknown) => ExpedicaoSepararConsultaDto.fromObject(item))
      : [ExpedicaoSepararConsultaDto.fromObject(req.body)];

    new SocketNotificationEmitterService(AppApi.getInstance().getIO()).emitData(
      'separar.update.listen',
      separars.map((item: ExpedicaoSepararConsultaDto) => item.toJson()),
    );
    res.status(204).send();
  });
  public static put = createNotImplementedHandler('SeparacaoNotifyExpedicaoController', 'put');
  public static delete = createNotImplementedHandler('SeparacaoNotifyExpedicaoController', 'delete');
}
