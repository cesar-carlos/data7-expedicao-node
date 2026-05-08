export default class ExpedicaoVersaoAppConsultaDto {
  CodVersaoApp: number;
  NomeApp: string;
  Ativo: string;
  IdEmpresa?: string;
  IdExecutavel?: string;
  DataVersaoApp: Date;
  Versao: string;
  ServerHost?: string;
  PathExec?: string;

  constructor(params: {
    CodVersaoApp: number;
    NomeApp: string;
    Ativo: string;
    IdEmpresa?: string;
    IdExecutavel?: string;
    DataVersaoApp: Date;
    Versao: string;
    ServerHost?: string;
    PathExec?: string;
  }) {
    this.CodVersaoApp = params.CodVersaoApp;
    this.NomeApp = params.NomeApp;
    this.Ativo = params.Ativo;
    this.IdEmpresa = params.IdEmpresa;
    this.IdExecutavel = params.IdExecutavel;
    this.DataVersaoApp = params.DataVersaoApp;
    this.Versao = params.Versao;
    this.ServerHost = params.ServerHost;
    this.PathExec = params.PathExec;
  }

  static fromObject(object: any): ExpedicaoVersaoAppConsultaDto {
    return new ExpedicaoVersaoAppConsultaDto({
      CodVersaoApp: object.CodVersaoApp,
      NomeApp: object.NomeApp,
      Ativo: object.Ativo,
      IdEmpresa: object.IdEmpresa,
      IdExecutavel: object.IdExecutavel,
      DataVersaoApp: object.DataVersaoApp,
      Versao: object.Versao,
      ServerHost: object.ServerHost,
      PathExec: object.PathExec,
    });
  }

  toJson(): any {
    return {
      CodVersaoApp: this.CodVersaoApp,
      NomeApp: this.NomeApp,
      Ativo: this.Ativo,
      IdEmpresa: this.IdEmpresa,
      IdExecutavel: this.IdExecutavel,
      DataVersaoApp: this.DataVersaoApp,
      Versao: this.Versao,
      ServerHost: this.ServerHost,
      PathExec: this.PathExec,
    };
  }
}
