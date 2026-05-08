export default class EnvironmentDatabaseDto {
  readonly codEmpresa: number;
  readonly codFilial: number;
  readonly codUsuario: number;
  readonly nomeUsuario: string;
  readonly codEstacaoTrabalho: number;
  readonly estacaoTrabalho: string;

  constructor(params: {
    codEmpresa: number;
    codFilial: number;
    codUsuario: number;
    nomeUsuario: string;
    codEstacaoTrabalho: number;
    estacaoTrabalho: string;
  }) {
    this.codEmpresa = params.codEmpresa;
    this.codFilial = params.codFilial;
    this.codUsuario = params.codUsuario;
    this.nomeUsuario = params.nomeUsuario;
    this.codEstacaoTrabalho = params.codEstacaoTrabalho;
    this.estacaoTrabalho = params.estacaoTrabalho;
  }

  static fromObject(object: any) {
    return new EnvironmentDatabaseDto({
      codEmpresa: object.codEmpresa || object.CodEmpresa,
      codFilial: object.codFilial || object.CodFilial,
      codUsuario: object.codUsuario || object.CodUsuario,
      nomeUsuario: object.nomeUsuario || object.NomeUsuario,
      codEstacaoTrabalho: object.codEstacaoTrabalho || object.CodEstacaoTrabalho,
      estacaoTrabalho: object.estacaoTrabalho || object.EstacaoTrabalho,
    });
  }

  public toJson(): any {
    return {
      codEmpresa: this.codEmpresa,
      codFilial: this.codFilial,
      codUsuario: this.codUsuario,
      nomeUsuario: this.nomeUsuario,
      codEstacaoTrabalho: this.codEstacaoTrabalho,
      estacaoTrabalho: this.estacaoTrabalho,
    };
  }
}
