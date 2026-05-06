import { Request, Response } from 'express';
import { ConsultaVersaoAppQuery } from '../../validation/consulta.versaoapp.validation';
import ConsultaVersaoAppService from '../../services/consulta.versaoapp.service';

export default class VersaoAppController {
  public static async get(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (error: any) {
      res.status(400).send({
        message: `Erro na consulta: ${error.message}`,
      });
    }
  }

  public static post(req: Request, res: Response): void {
    res.status(404).send({ message: 'not implemented post' });
  }

  public static put(req: Request, res: Response): void {
    res.status(404).send({ message: 'not implemented put' });
  }

  public static delete(req: Request, res: Response): void {
    res.status(404).send({ message: 'not implemented delete' });
  }
}
