import { Request } from 'express';
import { Params } from '../../contracts/local.base.params';
import ProcessoExecutavelDto from '../../dto/common.data/processo.executavel.dto';
import AppExpressError from '../../aplication/app.express.error';
import { createNotImplementedHandler, handleController } from '../controller.helpers';
import { createProcessoExecutavelRepository } from '../../factory/geral.factory';

export default class GeralProcessoExecutavelController {
  public static get = handleController(async (req, res) => {
    const repository = createProcessoExecutavelRepository();
    const params = GeralProcessoExecutavelController.buildParams(req);
    const itens = params.length === 0 ? await repository.select() : await repository.selectWhere(params);

    const sortItens = itens.sort((a, b) => {
      return a.DataAbertura < b.DataAbertura ? 1 : -1;
    });

    res.status(200).send(sortItens);
  });

  public static post = createNotImplementedHandler('GeralProcessoExecutavelController', 'post');

  public static put = handleController(async (req, res) => {
    const repository = createProcessoExecutavelRepository();
    const codProcessoExecutavel = Number.parseInt(String(req.params.CodProcessoExecutavel), 10);

    if (Number.isNaN(codProcessoExecutavel)) {
      throw new AppExpressError({
        message: 'CodProcessoExecutavel invalid',
        statusCode: 400,
        code: 'INVALID_REQUEST',
      });
    }

    const reqProcessoExecutavelDto = req.body as ProcessoExecutavelDto;
    const baseProcessoExecutavelDto = await repository.selectWhere([
      { key: 'CodProcessoExecutavel', value: codProcessoExecutavel },
    ]);

    if (!baseProcessoExecutavelDto || baseProcessoExecutavelDto.length === 0) {
      throw new AppExpressError({
        message: 'not found',
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    }

    const newProcessoExecutavelDto = baseProcessoExecutavelDto[0].copyWith(reqProcessoExecutavelDto);
    await repository.update(newProcessoExecutavelDto);
    res.status(201).send();
  });

  public static delete = createNotImplementedHandler('GeralProcessoExecutavelController', 'delete');

  public static buildParams(req: Request): Params[] {
    const params: Params[] = [];

    for (const keyName in req.query) {
      params.push({ key: keyName, value: req.query[keyName] });
    }

    return params;
  }
}
