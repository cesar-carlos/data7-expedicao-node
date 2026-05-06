import { Request, Response } from 'express';

import { UsuarioConsultaQuery } from '../../validation/usuario.consulta.validation';
import UsuarioConsultaService from '../../services/usuario.consulta.service';

export default class UsuarioConsultaController {
  public static async get(req: Request, res: Response): Promise<void> {
    try {
      const usuarioConsultaService = new UsuarioConsultaService();
      const { CodUsuario, NomeUsuario, CodEmpresa, Ativo, Page, Offset, Limit } = (req as any)
        .validatedQuery as UsuarioConsultaQuery;

      let currentPage: number;

      if (Offset !== undefined) {
        currentPage = Math.floor(Offset / Limit) + 1;
      } else {
        currentPage = Page;
      }

      const currentLimit = Limit;

      let resultado;

      if (CodUsuario) {
        resultado = await usuarioConsultaService.consultarPorCodigo(CodUsuario);
        if (!resultado) {
          res.status(404).send({
            message: 'Usuário não encontrado',
          });
          return;
        }

        res.status(200).send({
          message: 'Usuário encontrado',
          data: resultado.toJson(),
          total: 1,
        });
        return;
      }

      if (NomeUsuario) {
        resultado = await usuarioConsultaService.consultarPorNome(NomeUsuario, currentPage, currentLimit);
        res.status(200).send({
          message: `${resultado.total} usuário(s) encontrado(s) com nome "${NomeUsuario}"`,
          data: resultado.data.map((usuario: any) => usuario.toJson()),
          total: resultado.total,
          page: resultado.page,
          limit: resultado.limit,
          totalPages: resultado.totalPages,
          offset: resultado.offset,
        });
        return;
      }

      if (CodEmpresa) {
        resultado = await usuarioConsultaService.consultarPorEmpresa(CodEmpresa, currentPage, currentLimit);
        res.status(200).send({
          message: `${resultado.total} usuário(s) encontrado(s) na empresa ${CodEmpresa}`,
          data: resultado.data.map((usuario: any) => usuario.toJson()),
          total: resultado.total,
          page: resultado.page,
          limit: resultado.limit,
          totalPages: resultado.totalPages,
        });
        return;
      }

      if (Ativo === 'S') {
        resultado = await usuarioConsultaService.consultarAtivos(currentPage, currentLimit);
        res.status(200).send({
          message: `${resultado.total} usuário(s) ativo(s) encontrado(s)`,
          data: resultado.data.map((usuario: any) => usuario.toJson()),
          total: resultado.total,
          page: resultado.page,
          limit: resultado.limit,
          totalPages: resultado.totalPages,
        });
        return;
      }

      resultado = await usuarioConsultaService.consultarTodos(currentPage, currentLimit);
      res.status(200).send({
        message: `${resultado.total} usuário(s) encontrado(s)`,
        data: resultado.data.map((usuario: any) => usuario.toJson()),
        total: resultado.total,
        page: resultado.page,
        limit: resultado.limit,
        totalPages: resultado.totalPages,
        offset: resultado.offset,
      });
    } catch (error: any) {
      res.status(400).send({
        message: `Erro na consulta de usuários: ${error.message}`,
      });
    }
  }

  public static async post(req: Request, res: Response): Promise<void> {
    res.status(405).send({
      message: 'Método POST não permitido para consulta de usuários. Use GET.',
    });
  }

  public static async put(req: Request, res: Response): Promise<void> {
    res.status(405).send({
      message: 'Método PUT não implementado para consulta de usuários.',
    });
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    res.status(405).send({
      message: 'Método DELETE não implementado para consulta de usuários.',
    });
  }
}
