import { getLocalDbContext } from '../di/database.context';
import { DI_BIND } from '../di/bind.tokens';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import LocalBaseRepositorySequenceContract from '../contracts/local.base.repository.sequence.contract';
import ExpedicaoLoginAppDto from '../dto/expedicao/expedicao.login.app.dto';
import AppDependencys from '../aplication/app.dependencys';
import SequenceDto from '../dto/common.data/sequence.dto';
import { PasswordHelper } from '../helper/password.helper';

export default class CreateUserLoginAppService {
  public async execute(data: {
    Nome: string;
    Senha: string;
    CodUsuario?: number;
    FotoUsuario?: Buffer;
  }): Promise<ExpedicaoLoginAppDto> {
    try {
      await this.validateUniqueUser(data.Nome);

      const passwordValidation = PasswordHelper.validatePasswordStrength(data.Senha);
      if (!passwordValidation.isValid) {
        throw new Error(`Senha inválida: ${passwordValidation.errors.join(', ')}`);
      }

      const repository = this.repository();
      const sequence = await this.sequence();
      const codLoginApp = sequence?.Valor ?? 0;

      const hashedPassword = await PasswordHelper.hashPassword(data.Senha);

      const model = new ExpedicaoLoginAppDto({
        CodLoginApp: codLoginApp,
        Ativo: 'S',
        Nome: data.Nome,
        Senha: hashedPassword,
        CodUsuario: data.CodUsuario,
        FotoUsuario: data.FotoUsuario,
      });

      await repository.insert(model);

      return new ExpedicaoLoginAppDto({
        CodLoginApp: codLoginApp,
        Ativo: 'S',
        Nome: data.Nome,
        Senha: '',
        CodUsuario: data.CodUsuario,
        FotoUsuario: data.FotoUsuario,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private async validateUniqueUser(nome: string): Promise<void> {
    try {
      const repository = this.repository();
      const existingUsers = await repository.selectWhere([{ key: 'Nome', operator: '=', value: nome }]);

      if (existingUsers.length > 0) {
        throw new Error(`Já existe um usuário com o nome "${nome}"`);
      }
    } catch (error: any) {
      if (error.message.includes('Já existe um usuário')) {
        throw error;
      }
      throw new Error(`Erro ao validar usuário único: ${error.message}`);
    }
  }

  public async sequence(): Promise<SequenceDto | undefined> {
    try {
      const name = 'Expedicao.LoginApp_Sequencia_1';
      const repository = this.sequenceRepository();
      return await repository.select(name);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private sequenceRepository() {
    return AppDependencys.resolve<LocalBaseRepositorySequenceContract<SequenceDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositorySequenceContract_SequenceDto,
    });
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ExpedicaoLoginAppDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoLoginAppDto,
    });
  }
}
