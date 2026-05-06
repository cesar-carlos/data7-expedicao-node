import { STATUS } from '../../type/status';
import { Request, Response } from 'express';

import AppAbortCharge from '../../aplication/app.cancelar.cobranca';
import ResponseInfoDTO from '../../dto/api.responses/response.info.dto';

import AppCobrancaPix from '../../aplication/app.cobranca.pix';
import AppCobrancaAutoBuild from '../../aplication/app.cobranca.auto.build';
import AppRegraStatusCobrancaPix from '../../aplication/app.regra.status.cobranca.pix';

export default class CobrancaController {
  public static async get(req: Request, res: Response) {
    try {
      const path = req.headers.local_path as string;
      const appCobrancaAutoBuild = new AppCobrancaAutoBuild();
      const result = await appCobrancaAutoBuild.execute(path);

      res.header('INFO-REQUEST', result.result);
      res.status(204).send();
    } catch (err: any) {
      res.header('INFO-REQUEST', err.message);
      res.status(204).send();
    }
  }

  //** POST **//
  public static async post(req: Request, res: Response) {
    try {
      const data = req.body?.Data;

      if (!data) return new ResponseInfoDTO({ info: 'INFO-REQUEST', message: 'data not found', statusCode: 400 });

      if (!Array.isArray(data))
        return new ResponseInfoDTO({ info: 'INFO-REQUEST', message: 'data invalid', statusCode: 400 });

      const appCobrancaPix = new AppCobrancaPix();
      const info = await appCobrancaPix.execute(data);

      if (info.process.status === 'error') {
        res.header('INFO-REQUEST', info.result);
        res.status(400).send();
        return;
      }

      res.header('INFO-REQUEST', STATUS.MENSAGEM_BLOQUEIO);
      res.status(204).send();
    } catch (error: any) {
      res.header('INFO-REQUEST', error.message);
      res.status(500).send(error.message);
    }
  }

  public static async put(req: Request, res: Response) {
    try {
      const { CodLiberacaoBloqueio, IdLiberacao } = req.query;
      const codLiberacaoBloqueio = parseInt(CodLiberacaoBloqueio as string);
      const idLiberacao = parseInt(IdLiberacao as string);

      const appRegraStatusCobrancaPix = new AppRegraStatusCobrancaPix();
      appRegraStatusCobrancaPix.execute({ codLiberacaoBloqueio, idLiberacao });
      res.status(204).send();
    } catch (error: any) {
      res.header('INFO-REQUEST', error.message);
      res.status(500).send(error.message);
    }
  }

  public static delete(req: Request, res: Response) {
    try {
      const { sysId } = req.params;

      if (!sysId) {
        res.header('INFO-REQUEST', 'sysId not found or provedor not found');
        return;
      }

      const appAbortCharge = new AppAbortCharge({
        sysId: sysId,
        requerente: 'CS',
      });

      appAbortCharge.execute();
      res.status(204).send();
    } catch (error: any) {
      res.header('INFO-REQUEST', error.message);
      res.status(500).send(error.message);
    }
  }
}
