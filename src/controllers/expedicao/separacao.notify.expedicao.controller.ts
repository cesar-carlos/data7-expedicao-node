import { createNotImplementedHandler, handleController } from '../controller.helpers';
import ExpedicaoSepararConsultaDto from '../../dto/expedicao/expedicao.separar.consulta.dto';
import SocketNotificationEmitterService from '../../services/socket.notification.emitter.service';

export default class SeparacaoNotifyExpedicaoController {
  private static readonly emitter = new SocketNotificationEmitterService();

  public static get = createNotImplementedHandler('SeparacaoNotifyExpedicaoController', 'get');
  public static post = handleController((req, res) => {
    const separars = Array.isArray(req.body.Data)
      ? req.body.Data.map((item: unknown) => ExpedicaoSepararConsultaDto.fromObject(item))
      : [ExpedicaoSepararConsultaDto.fromObject(req.body)];

    SeparacaoNotifyExpedicaoController.emitter.emitData(
      'separar.update.listen',
      separars.map((item: ExpedicaoSepararConsultaDto) => item.toJson()),
    );
    res.status(204).send();
  });
  public static put = createNotImplementedHandler('SeparacaoNotifyExpedicaoController', 'put');
  public static delete = createNotImplementedHandler('SeparacaoNotifyExpedicaoController', 'delete');
}
