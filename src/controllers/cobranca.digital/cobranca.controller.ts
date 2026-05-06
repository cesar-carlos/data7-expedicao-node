import { STATUS } from '../../type/status';
import { Request, Response } from 'express';

import AppAbortCharge from '../../aplication/app.cancelar.cobranca';

import AppCobrancaPix from '../../aplication/app.cobranca.pix';
import AppCobrancaAutoBuild from '../../aplication/app.cobranca.auto.build';
import AppRegraStatusCobrancaPix from '../../aplication/app.regra.status.cobranca.pix';
import { handleController } from '../controller.helpers';

export default class CobrancaController {
  public static get = handleController(async (req: Request, res: Response) => {
    try {
      const path = req.headers.local_path as string;
      const appCobrancaAutoBuild = new AppCobrancaAutoBuild();
      const result = await appCobrancaAutoBuild.execute(path);

      res.header('INFO-REQUEST', result.result);
      res.status(204).send();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.header('INFO-REQUEST', message);
      res.status(204).send();
    }
  });

  public static post = handleController(async (req: Request, res: Response) => {
    try {
      const data = req.body?.Data;

      if (!data) {
        res.header('INFO-REQUEST', 'data not found');
        res.status(400).send();
        return;
      }

      if (!Array.isArray(data)) {
        res.header('INFO-REQUEST', 'data invalid');
        res.status(400).send();
        return;
      }

      const appCobrancaPix = new AppCobrancaPix();
      const info = await appCobrancaPix.execute(data);

      if (info.process.status === 'error') {
        res.header('INFO-REQUEST', info.result);
        res.status(400).send();
        return;
      }

      res.header('INFO-REQUEST', STATUS.MENSAGEM_BLOQUEIO);
      res.status(204).send();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.header('INFO-REQUEST', message);
      res.status(500).send(message);
    }
  });

  public static put = handleController(async (req: Request, res: Response) => {
    try {
      const { CodLiberacaoBloqueio, IdLiberacao } = req.query;
      const codLiberacaoBloqueio = parseInt(CodLiberacaoBloqueio as string);
      const idLiberacao = parseInt(IdLiberacao as string);

      const appRegraStatusCobrancaPix = new AppRegraStatusCobrancaPix();
      await appRegraStatusCobrancaPix.execute({ codLiberacaoBloqueio, idLiberacao });
      res.status(204).send();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.header('INFO-REQUEST', message);
      res.status(500).send(message);
    }
  });

  public static delete = handleController(async (req: Request, res: Response) => {
    try {
      const { sysId } = req.params;

      if (!sysId) {
        res.header('INFO-REQUEST', 'sysId not found or provedor not found');
        res.status(400).send();
        return;
      }

      const appAbortCharge = new AppAbortCharge({
        sysId: sysId,
        requerente: 'CS',
      });

      await appAbortCharge.execute();
      res.status(204).send();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      res.header('INFO-REQUEST', message);
      res.status(500).send(message);
    }
  });
}
