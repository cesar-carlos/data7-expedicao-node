import ProcessInfo from '../entities/process.info';
import { requestCobrancaDTO } from '../dto/api.requets/request.cobranca.dto';

export default class AppCobrancaPixValidar {
  private infoSuccess = new ProcessInfo({ status: 'success' }, 'request validado', 'cobrança validado com sucesso');

  public execute(request: requestCobrancaDTO[]): ProcessInfo {
    return this.infoSuccess;
  }
}
