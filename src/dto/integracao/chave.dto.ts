export default class ChaveDto {
  constructor(
    readonly codEmpresa: number | null,
    readonly codFilial: number | null,
    readonly codCobrancaDigital: number | null,
    readonly uuid: string,
    readonly status: string,
    readonly dataCriacao: Date,
    readonly chave: string,
  ) {}

  static fromJson(json: any): ChaveDto {
    return new ChaveDto(
      json.codEmpresa || json.CodEmpresa,
      json.codFilial || json.CodFilial,
      json.codCobrancaDigital || json.CodCobrancaDigital,
      json.uuid || json.UUID,
      json.status || json.Status,
      new Date(json.dataCriacao || json.DataCriacao),
      json.chave,
    );
  }

  static fromObject(object: any): ChaveDto {
    return new ChaveDto(
      object.codEmpresa || object.CodEmpresa,
      object.codFilial || object.CodFilial,
      object.codCobrancaDigital || object.CodCobrancaDigital,
      object.uuid || object.UUID,
      object.status || object.Status,
      new Date(object.dataCriacao || object.DataCriacao),
      object.chave,
    );
  }

  toJson(): any {
    return {
      codEmpresa: this.codEmpresa,
      codFilial: this.codFilial,
      codCobrancaDigital: this.codCobrancaDigital,
      uuid: this.uuid,
      status: this.status,
      dataCriacao: this.dataCriacao,
      chave: this.chave,
    };
  }
}
