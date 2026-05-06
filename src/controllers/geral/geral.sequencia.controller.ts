import AppExpressError from '../../aplication/app.express.error';
import { createSequenceRepository } from '../../factory/geral.factory';
import { createNotImplementedHandler, handleController } from '../controller.helpers';

export default class GeralSequenciaController {
  public static get = handleController(async (req, res) => {
    const sequenceNome = req.params.nome;
    const repository = createSequenceRepository();
    const sequenceDto = await repository.select(sequenceNome);

    if (sequenceDto === undefined) {
      throw new AppExpressError({
        message: 'sequence not found',
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    }

    res.status(200).send(sequenceDto);
  });

  public static post = createNotImplementedHandler('GeralSequenciaController', 'post');
  public static put = createNotImplementedHandler('GeralSequenciaController', 'put');
  public static delete = createNotImplementedHandler('GeralSequenciaController', 'delete');
}
