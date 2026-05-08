import { getLocalDbContext } from '../di/database.context';
import { DI_BIND } from '../di/bind.tokens';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import ExpedicaoLoginAppDto from '../dto/expedicao/expedicao.login.app.dto';
import AppDependencys from '../aplication/app.dependencys';
import { PasswordHelper } from '../helper/password.helper';

export default class LoginAppService {
  public async authenticate(data: { Nome: string; Senha: string }): Promise<ExpedicaoLoginAppDto | null> {
    try {
      const repository = this.repository();

      const users = await repository.selectWhere([
        { key: 'Nome', operator: '=', value: data.Nome },
        { key: 'Ativo', operator: '=', value: 'S' },
      ]);

      if (users.length === 0) {
        return null;
      }

      const user = users[0];
      const isPasswordValid = await PasswordHelper.verifyPassword(data.Senha, user.Senha);

      if (!isPasswordValid) {
        return null;
      }

      return new ExpedicaoLoginAppDto({
        CodLoginApp: user.CodLoginApp,
        Ativo: user.Ativo,
        Nome: user.Nome,
        Senha: '',
        CodUsuario: user.CodUsuario,
        FotoUsuario: user.FotoUsuario,
      });
    } catch (error: any) {
      throw new Error(`Erro ao autenticar usuário: ${error.message}`);
    }
  }

  public async FindByName(name: string): Promise<ExpedicaoLoginAppDto | null> {
    try {
      const repository = this.repository();
      const result = await repository.selectWhere([['Nome', 'LIKE', `'${name}'`]]);
      if (result.length > 0) return result[0];
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async FindById(id: number): Promise<ExpedicaoLoginAppDto | null> {
    try {
      const repository = this.repository();
      const result = await repository.selectWhere([['CodLoginApp', '=', `${id}`]]);
      if (result.length > 0) return result[0];

      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async update(data: {
    CodLoginApp: number;
    Senha?: string;
    Ativo?: string;
    CodUsuario?: number;
    FotoUsuario?: string | null;
  }): Promise<ExpedicaoLoginAppDto | null> {
    try {
      const repository = this.repository();

      const existingUser = await this.FindById(data.CodLoginApp);
      if (!existingUser) {
        throw new Error('Usuário não encontrado');
      }

      const updateData: Partial<ExpedicaoLoginAppDto> = {};

      if (data.Ativo !== undefined) updateData.Ativo = data.Ativo;
      if (data.CodUsuario !== undefined) updateData.CodUsuario = data.CodUsuario;

      if (data.Senha !== undefined) {
        updateData.Senha = await PasswordHelper.hashPassword(data.Senha);
      }

      if (data.FotoUsuario !== undefined) {
        updateData.FotoUsuario = data.FotoUsuario ? Buffer.from(data.FotoUsuario, 'base64') : null;
      }

      const updatedUser = new ExpedicaoLoginAppDto({
        CodLoginApp: existingUser.CodLoginApp,
        Nome: existingUser.Nome,
        Senha: updateData.Senha ?? existingUser.Senha,
        Ativo: updateData.Ativo ?? existingUser.Ativo,
        CodUsuario: updateData.CodUsuario ?? existingUser.CodUsuario,
        FotoUsuario: updateData.FotoUsuario !== undefined ? updateData.FotoUsuario : existingUser.FotoUsuario,
      });

      await repository.update(updatedUser);

      return new ExpedicaoLoginAppDto({
        CodLoginApp: updatedUser.CodLoginApp,
        Nome: updatedUser.Nome,
        Senha: '',
        Ativo: updatedUser.Ativo,
        CodUsuario: updatedUser.CodUsuario,
        FotoUsuario: updatedUser.FotoUsuario,
      });
    } catch (error: any) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  private repository() {
    return AppDependencys.resolve<LocalBaseRepositoryContract<ExpedicaoLoginAppDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ExpedicaoLoginAppDto,
    });
  }
}
