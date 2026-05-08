import fs from 'fs';
import path from 'path';
import util from 'util';

import { STATUS } from '../type/status';

import AppCobrancaPix from './app.cobranca.pix';
import ProcessInfo from '../entities/process.info';
import AppAbortCharge from './app.cancelar.cobranca';
import AppRegraStatusCobrancaPix from './app.regra.status.cobranca.pix';
import AppCobrancaPixValidar from './app.cobranca.pix.validar';
import AppTestDatabeses from './app.test.databeses';

export default class AppCobrancaAutoBuild {
  async execute(patth: string): Promise<ProcessInfo> {
    try {
      const readDir = util.promisify(fs.readdir);
      const files = await readDir(patth);
      const appChargeValidDatabese = new AppTestDatabeses();
      const infoDatabese = await appChargeValidDatabese.execute();
      if (infoDatabese.process.status === 'error') return infoDatabese;

      for (const file of files) {
        if (file?.includes('.log')) {
          const fullPath = path.resolve(patth, file);
          const fileData = fs.readFileSync(fullPath, 'utf8');

          fs.unlinkSync(fullPath);
          const request = JSON.parse(fileData.toString());

          //METHOD DELETE
          if (request?.Method === 'DELETE') {
            await new AppAbortCharge({
              sysId: request.SysId,
              requerente: 'CS',
            }).execute();
          }

          //METHOD POST
          if (request?.Method === 'POST') {
            const data = request?.Body.Data;
            const infoValid = new AppCobrancaPixValidar().execute(data);
            if (infoValid.process.status === 'error') return infoValid;
            const appCobrancaPix = new AppCobrancaPix();
            await appCobrancaPix.execute(data);
          }

          //METHOD PUT
          if (request?.Method === 'PUT') {
            const { CodLiberacaoBloqueio, IdLiberacao } = request?.Body;
            const appRegraStatusCobrancaPix = new AppRegraStatusCobrancaPix();
            await appRegraStatusCobrancaPix.execute({
              codLiberacaoBloqueio: CodLiberacaoBloqueio,
              idLiberacao: IdLiberacao,
            });
          }
        }
      }

      return new ProcessInfo({ status: 'success' }, STATUS.MENSAGEM_BLOQUEIO, '');
    } catch (err: any) {
      return new ProcessInfo({ status: 'error' }, err.message, '');
    }
  }
}
