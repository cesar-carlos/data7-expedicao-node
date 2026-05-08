import bcrypt from 'bcryptjs';

export class PasswordHelper {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Criptografa uma senha usando bcrypt
   * @param password Senha em texto plano
   * @returns Senha criptografada
   */
  public static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error: any) {
      throw new Error(`Erro ao criptografar senha: ${error.message}`);
    }
  }

  /**
   * Verifica se uma senha em texto plano corresponde ao hash
   * @param password Senha em texto plano
   * @param hashedPassword Senha criptografada
   * @returns True se a senha for válida
   */
  public static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: any) {
      throw new Error(`Erro ao verificar senha: ${error.message}`);
    }
  }

  /**
   * Valida se a senha atende aos critérios mínimos de segurança
   * @param password Senha para validar
   * @returns True se a senha for válida
   */
  public static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 4) {
      errors.push('Senha deve ter no mínimo 6 caracteres');
    }

    if (password.length > 20) {
      errors.push('Senha deve ter no máximo 50 caracteres');
    }

    // Pode adicionar mais validações se necessário:
    // if (!/[A-Z]/.test(password)) {
    //   errors.push('Senha deve conter pelo menos uma letra maiúscula');
    // }

    // if (!/[a-z]/.test(password)) {
    //   errors.push('Senha deve conter pelo menos uma letra minúscula');
    // }

    // if (!/\d/.test(password)) {
    //   errors.push('Senha deve conter pelo menos um número');
    // }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
