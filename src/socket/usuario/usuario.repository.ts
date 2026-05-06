import { DI_BIND } from '../../di/bind.tokens';
import UsuarioConsultaDto from '../../dto/common.data/usuario.consulta.dto';
import UsuarioDto from '../../dto/common.data/usuario';
import BaseSocketRepository from '../base.socket.repository';

export default class UsuarioRepository extends BaseSocketRepository<UsuarioDto, UsuarioConsultaDto> {
  constructor() {
    super({
      repositoryBind: DI_BIND.LocalBaseRepositoryContract_UsuarioDto,
      consultaBind: DI_BIND.LocalBaseConsultaRepositoryContract_UsuarioConsultaDto,
      sequenceName: 'Usuario_Sequencia',
    });
  }

  public override async insert(models: UsuarioDto[]): Promise<void> {
    void models;
    throw new Error('Not implemented');
  }

  public override async update(models: UsuarioDto[]): Promise<void> {
    void models;
    throw new Error('Not implemented');
  }

  public override async delete(models: UsuarioDto[]): Promise<void> {
    void models;
    throw new Error('Not implemented');
  }
}
