import { Request, Response } from 'express';
import { LoginRequest } from '../../validation/login.validation';
import { ConsultaLoginAppQuery } from '../../validation/consulta.login.app.validation';
import { UpdateLoginAppRequest, UpdateLoginAppQuery } from '../../validation/login.app.validation';
import ConsultaLoginAppService from '../../services/consulta.login.app.service';
import LoginAppService from '../../services/login.app.service';

export default class LoginAppController {
  public static async get(req: Request, res: Response): Promise<void> {
    try {
      const consultaService = new ConsultaLoginAppService();
      const { Nome, CodLoginApp, Ativo, Page, Offset, Limit } = (req as any).validatedQuery as ConsultaLoginAppQuery;

      let currentPage: number;

      if (Offset !== undefined) {
        currentPage = Math.floor(Offset / Limit) + 1;
      } else {
        currentPage = Page;
      }

      const currentLimit = Limit;

      let resultado;

      if (CodLoginApp) {
        resultado = await consultaService.consultarPorCodigo(CodLoginApp);
        if (!resultado) {
          res.status(404).send({
            message: 'Usuário não encontrado',
          });
          return;
        }

        res.status(200).send({
          message: 'Usuário encontrado',
          data: resultado,
          total: 1,
        });
        return;
      }

      if (Nome) {
        resultado = await consultaService.consultarPorNome(Nome, currentPage, currentLimit);
        res.status(200).send({
          message: `${resultado.total} usuário(s) encontrado(s)`,
          data: resultado.data,
          total: resultado.total,
          page: resultado.page,
          limit: resultado.limit,
          totalPages: resultado.totalPages,
          offset: resultado.offset,
        });
        return;
      }

      if (Ativo === 'S') {
        resultado = await consultaService.consultarAtivos(currentPage, currentLimit);
        res.status(200).send({
          message: `${resultado.total} usuário(s) ativo(s) encontrado(s)`,
          data: resultado.data,
          total: resultado.total,
          page: resultado.page,
          limit: resultado.limit,
          totalPages: resultado.totalPages,
          offset: resultado.offset,
        });
        return;
      }

      resultado = await consultaService.consultarTodos(currentPage, currentLimit);
      res.status(200).send({
        message: `${resultado.total} usuário(s) encontrado(s)`,
        data: resultado.data,
        total: resultado.total,
        page: resultado.page,
        limit: resultado.limit,
        totalPages: resultado.totalPages,
        offset: resultado.offset,
      });
    } catch (error: any) {
      res.status(400).send({
        message: `Erro na consulta: ${error.message}`,
      });
    }
  }

  public static async post(req: Request, res: Response): Promise<void> {
    try {
      const loginAppService = new LoginAppService();
      const { Nome, Senha }: LoginRequest = req.body;
      const user = await loginAppService.authenticate({ Nome, Senha });

      if (!user) {
        res.status(401).send({
          message: 'Credenciais inválidas ou usuário inativo',
        });
        return;
      }

      const userResponse = {
        CodLoginApp: user.CodLoginApp,
        Nome: user.Nome,
        Ativo: user.Ativo,
        CodUsuario: user.CodUsuario,
        FotoUsuario: user.FotoUsuario
          ? user.FotoUsuario instanceof Buffer
            ? user.FotoUsuario.toString('base64')
            : user.FotoUsuario
          : null,
      };

      res.status(200).send({
        message: 'Login realizado com sucesso',
        user: userResponse,
      });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }

  public static async put(req: Request, res: Response): Promise<void> {
    try {
      const loginAppService = new LoginAppService();
      const queryData = (req as any).validatedQuery as UpdateLoginAppQuery;
      const updateData = (req as any).validatedBody as UpdateLoginAppRequest;

      const updatedUser = await loginAppService.update({
        CodLoginApp: queryData.CodLoginApp,
        Senha: updateData.Senha,
        Ativo: updateData.Ativo,
        CodUsuario: updateData.CodUsuario,
        FotoUsuario: updateData.FotoUsuario,
      });

      if (!updatedUser) {
        res.status(404).send({
          message: 'Usuário não encontrado para atualização',
        });
        return;
      }

      const userResponse = {
        CodLoginApp: updatedUser.CodLoginApp,
        Nome: updatedUser.Nome,
        Ativo: updatedUser.Ativo,
        CodUsuario: updatedUser.CodUsuario,
        FotoUsuario: updatedUser.FotoUsuario
          ? updatedUser.FotoUsuario instanceof Buffer
            ? updatedUser.FotoUsuario.toString('base64')
            : updatedUser.FotoUsuario
          : null,
      };

      res.status(200).send({
        message: 'Usuário atualizado com sucesso',
        user: userResponse,
      });
    } catch (error: any) {
      if (error.message.includes('não encontrado') || error.message.includes('já existe')) {
        res.status(400).send({
          message: error.message,
        });
      } else {
        res.status(500).send({
          message: `Erro interno: ${error.message}`,
        });
      }
    }
  }

  public static delete(req: Request, res: Response): void {
    res.status(404).send({ message: 'not implemented delete' });
  }
}
