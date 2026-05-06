import { Request, Response } from 'express';
import { ConsultaVersaoAppQuery } from '../../validation/consulta.versaoapp.validation';
import ConsultaVersaoAppService from '../../services/consulta.versaoapp.service';
import { handleController } from '../controller.helpers';

export default class VersaoAppController {
  public static get = handleController(async (req: Request, res: Response): Promise<void> => {
    const consultaService = new ConsultaVersaoAppService();
    const { NomeApp, CodVersaoApp, Ativo, Page, Offset, Limit } = (req as any)
      .validatedQuery as ConsultaVersaoAppQuery;

    let currentPage: number;

    if (Offset !== undefined) {
      currentPage = Math.floor(Offset / Limit) + 1;
    } else {
      currentPage = Page;
    }

    const currentLimit = Limit;

    let resultado;

    if (CodVersaoApp) {
      resultado = await consultaService.consultarPorCodigo(CodVersaoApp);
      if (!resultado) {
        res.status(404).send({
          message: 'Versão de App não encontrada',
        });
        return;
      }

      res.status(200).send({
        message: 'Versão de App encontrada',
        data: resultado,
        total: 1,
      });
      return;
    }

    if (NomeApp) {
      resultado = await consultaService.consultarPorNomeApp(NomeApp, currentPage, currentLimit);
      res.status(200).send({
        message: `${resultado.total} versão(ões) de app encontrada(s)`,
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
        message: `${resultado.total} versão(ões) de app ativa(s) encontrada(s)`,
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
      message: `${resultado.total} versão(ões) de app encontrada(s)`,
      data: resultado.data,
      total: resultado.total,
      page: resultado.page,
      limit: resultado.limit,
      totalPages: resultado.totalPages,
      offset: resultado.offset,
    });
  });

  public static post = handleController((_req: Request, res: Response) => {
    res.status(404).send({ message: 'not implemented post' });
  });

  public static put = handleController((_req: Request, res: Response) => {
    res.status(404).send({ message: 'not implemented put' });
  });

  public static delete = handleController((_req: Request, res: Response) => {
    res.status(404).send({ message: 'not implemented delete' });
  });
}
