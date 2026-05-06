import CreateUserLoginAppService from '../../services/create.user.login.app.service';
import { LoginAppRequest } from '../../validation/login.app.validation';
import { createNotImplementedHandler, handleController } from '../controller.helpers';

export default class CreateLoginAppController {
  public static get = createNotImplementedHandler('CreateLoginAppController', 'get');

  public static post = handleController(async (req, res) => {
    const createUserLoginAppService = new CreateUserLoginAppService();
    const { Nome, Senha, FotoUsuario, CodUsuario }: LoginAppRequest = (req as any).validatedBody || req.body;

    const result = await createUserLoginAppService.execute({
      Nome,
      Senha,
      FotoUsuario: FotoUsuario ? Buffer.from(FotoUsuario, 'base64') : undefined,
      CodUsuario,
    });

    const response = {
      CodLoginApp: result.CodLoginApp,
      Nome: result.Nome,
      Ativo: result.Ativo,
      CodUsuario: result.CodUsuario,
      FotoUsuario: result.FotoUsuario
        ? result.FotoUsuario instanceof Buffer
          ? result.FotoUsuario.toString('base64')
          : result.FotoUsuario
        : null,
    };

    res.status(201).send({
      message: 'Usuário criado com sucesso',
      user: response,
    });
  });

  public static put = createNotImplementedHandler('CreateLoginAppController', 'put');
  public static delete = createNotImplementedHandler('CreateLoginAppController', 'delete');
}
