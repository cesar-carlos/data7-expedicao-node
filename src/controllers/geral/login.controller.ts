import AppExpressError from '../../aplication/app.express.error';
import LoginConfigService from '../../services/login.config.service';
import { createNotImplementedHandler, handleController } from '../controller.helpers';

export default class LoginController {
  public static get = createNotImplementedHandler('LoginController', 'get');

  public static post = handleController((req, res) => {
    const { email, password } = req.body;

    const loginConfigService = new LoginConfigService();
    const token = loginConfigService.auth(email, password);

    if (token === 'unauthorized') {
      throw new AppExpressError({
        message: 'unauthorized',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });
    }

    res.status(200).send({ token });
  });

  public static put = createNotImplementedHandler('LoginController', 'put');
  public static delete = createNotImplementedHandler('LoginController', 'delete');
}
