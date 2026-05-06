import { getLocalDbContext } from '../../di/database.context';
import { DI_BIND } from '../../di/bind.tokens';
import { Request, Response } from 'express';

import { Params } from '../../contracts/local.base.params';

import LocalBaseRepositoryContract from '../../contracts/local.base.repository.contract';
import ProcessoExecutavelDto from '../../dto/common.data/processo.executavel.dto';
import AppDependencys from '../../aplication/app.dependencys';

export default class GeralProcessoExecutavelController {
  public static async get(req: Request, res: Response) {
    try {
      const repository = GeralProcessoExecutavelController.getRepository();
      const params = GeralProcessoExecutavelController.buildParams(req);
      let itens: ProcessoExecutavelDto[] = [];

      if (params.length === 0) {
        itens = await repository.select();
      }

      if (params.length != 0) {
        itens = await repository.selectWhere(params);
      }

      const sortIntens = itens.sort((a, b) => {
        return a.DataAbertura < b.DataAbertura ? 1 : -1;
      });

      res.status(200).send(sortIntens);
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  }

  public static async post(req: Request, res: Response) {
    res.status(404).send({ message: 'not implemented get' });
  }

  public static async put(req: Request, res: Response) {
    const repository = await GeralProcessoExecutavelController.getRepository();
    const { CodProcessoExecutavel } = req.params;

    const reqProcessoExecutavelDto = req.body as ProcessoExecutavelDto;
    const baseProcessoExecutavelDto = await repository.selectWhere([
      { key: 'CodProcessoExecutavel', value: parseInt(CodProcessoExecutavel as string) },
    ]);

    if (!baseProcessoExecutavelDto || baseProcessoExecutavelDto.length === 0) {
      res.status(404).send({ message: 'not found' });
      return;
    }

    const newProcessoExecutavelDto = baseProcessoExecutavelDto[0].copyWith(reqProcessoExecutavelDto);
    await repository.update(newProcessoExecutavelDto);
    res.send(201).send();
  }

  public static async delete(req: Request, res: Response) {
    res.status(404).send({ message: 'not implemented get' });
  }

  public static getRepository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ProcessoExecutavelDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ProcessoExecutavelDto,
    });
  }

  public static buildParams(req: Request): Params[] {
    const _params: Params[] = [];
    for (const keyName in req.query) {
      const value = req.query[keyName];
      _params.push({ key: keyName, value: value });
    }

    return _params;
  }
}
