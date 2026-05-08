export default class CobrancaDigitalAdicionaisDto {
  readonly codEmpresa: number;
  readonly codCobrancaDigital: number;
  readonly item: string;
  readonly sequencia: number;
  readonly adicional: string;

  constructor(params: {
    codEmpresa: number;
    codCobrancaDigital: number;
    item: string;
    sequencia: number;
    adicional: string;
  }) {
    this.codEmpresa = params.codEmpresa;
    this.codCobrancaDigital = params.codCobrancaDigital;
    this.item = params.item;
    this.sequencia = params.sequencia;
    this.adicional = params.adicional;
  }

  static create(params: {
    codEmpresa: number;
    codCobrancaDigital: number;
    item: string;
    sequencia: number;
    adicional: string;
  }) {
    return new CobrancaDigitalAdicionaisDto(params);
  }

  static fromObject(object: any) {
    return new CobrancaDigitalAdicionaisDto({
      codEmpresa: object.codEmpresa || object.CodEmpresa,
      codCobrancaDigital: object.codCobrancaDigital || object.CodCobrancaDigital,
      item: object.item || object.Item,
      sequencia: object.sequencia || object.Sequencia,
      adicional: object.adicional || object.Adicional,
    });
  }
}
