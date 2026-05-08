export default class ExpedicaoLoginAppDto {
  CodLoginApp: number;
  Ativo: string;
  Nome: string;
  Senha: string;
  CodUsuario?: number;
  FotoUsuario?: Buffer | null; // varbinary - dados binários da imagem

  constructor(params: {
    CodLoginApp: number;
    Ativo: string;
    Nome: string;
    Senha: string;
    CodUsuario?: number;
    FotoUsuario?: Buffer | null; // varbinary - dados binários da imagem
  }) {
    this.CodLoginApp = params.CodLoginApp;
    this.Ativo = params.Ativo;
    this.Nome = params.Nome;
    this.Senha = params.Senha;
    this.CodUsuario = params.CodUsuario;
    this.FotoUsuario = params.FotoUsuario;
  }

  public copyWith(params: {
    CodLoginApp?: number;
    Ativo?: string;
    Nome?: string;
    Senha?: string;
    CodUsuario?: number;
    FotoUsuario?: Buffer | null; // varbinary - dados binários da imagem
  }) {
    return new ExpedicaoLoginAppDto({
      CodLoginApp: params.CodLoginApp ?? this.CodLoginApp,
      Ativo: params.Ativo ?? this.Ativo,
      Nome: params.Nome ?? this.Nome,
      Senha: params.Senha ?? this.Senha,
      CodUsuario: params.CodUsuario ?? this.CodUsuario,
      FotoUsuario: params.FotoUsuario ?? this.FotoUsuario,
    });
  }

  public static fromObject(json: any): ExpedicaoLoginAppDto {
    return new ExpedicaoLoginAppDto({
      CodLoginApp: json.CodLoginApp,
      Ativo: json.Ativo,
      Nome: json.Nome,
      Senha: json.Senha,
      CodUsuario: json.CodUsuario,
      FotoUsuario: json.FotoUsuario ? Buffer.from(json.FotoUsuario) : null,
    });
  }

  toJson(): any {
    return {
      CodLoginApp: this.CodLoginApp,
      Ativo: this.Ativo,
      Nome: this.Nome,
      Senha: this.Senha,
      CodUsuario: this.CodUsuario,
      FotoUsuario: this.FotoUsuario ? this.FotoUsuario.toString('base64') : null,
    };
  }
}
