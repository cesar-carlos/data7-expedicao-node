import { DI_BIND } from '../../di/bind.tokens';
import ExpedicaoPercursoEstagioDto from '../../dto/expedicao/expedicao.percurso.estagio.dto';
import BaseSocketRepository from '../base.socket.repository';

export default class ExpedicaoPercursoEstagioRepository extends BaseSocketRepository<ExpedicaoPercursoEstagioDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoPercursoEstagioDto,
      sequenceName: 'Expedicao.PercursoEstagio_Sequencia_1',
    });
  }
}
