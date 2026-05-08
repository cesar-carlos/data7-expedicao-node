import { handleController } from '../controller.helpers';

export default class GeralHealth {
  public static get = handleController(async (_req, res) => {
    res.status(200).send({ status: 'UP' });
  });
}
