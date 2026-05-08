export default class UsuarioDto {
  CodUsuario: number;
  NomeUsuario: string;
  Ativo: string;

  constructor(params: { CodUsuario: number; NomeUsuario: string; Ativo: string }) {
    this.CodUsuario = params.CodUsuario;
    this.NomeUsuario = params.NomeUsuario;
    this.Ativo = params.Ativo;
  }

  static fromObject(object: any) {
    return new UsuarioDto({
      CodUsuario: object.CodUsuario || object.codUsuario,
      NomeUsuario: object.NomeUsuario || object.nomeUsuario,
      Ativo: object.Ativo || object.ativo,
    });
  }

  public toJson(): any {
    return {
      CodUsuario: this.CodUsuario,
      NomeUsuario: this.NomeUsuario,
      Ativo: this.Ativo,
    };
  }
}
