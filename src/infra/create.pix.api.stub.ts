import CreatePixApiContract from '../contracts/create.pix.api.contract';
import { requestCreatePixDTO } from '../dto/api.requets/request.create.pix.dto';
import { responseCreatePixDto } from '../dto/api.responses/response.create.pix.dto';

/**
 * Fallback quando não há adapter real (Gerencianet/Sicredi) registrado.
 * Permite resolver CreatePixApiContract quando API_PIX está definido; substitua por implementação real em produção.
 */
export default class CreatePixApiStub implements CreatePixApiContract {
  async execute(_request: requestCreatePixDTO): Promise<responseCreatePixDto> {
    throw new Error(
      'CreatePixApiContract: registre um adapter de PIX (ex.: Gerencianet) em app.dependencys.integracao.pix — esta instância é apenas um stub.',
    );
  }
}
