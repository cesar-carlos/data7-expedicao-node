export default class CobrancaDigitalConfigDto {
  constructor(
    readonly codEmpresa: number,
    readonly codConfiguracao: number,
    readonly ativo: string,
    readonly gerenciadora: string,
    readonly clientId: string,
    readonly clientSecret: string,
    readonly certificado: string,
  ) {}

  static fromJson(json: any): CobrancaDigitalConfigDto {
    return new CobrancaDigitalConfigDto(
      json.codEmpresa || json.CodEmpresa,
      json.codConfiguracao || json.CodConfiguracao,
      json.ativo || json.Ativo,
      json.gerenciadora || json.Gerenciadora,
      json.clientId || json.ClientId,
      json.clientSecret || json.ClientSecret,
      json.certificado || json.Certificado,
    );
  }

  toJson(): any {
    return {
      codEmpresa: this.codEmpresa,
      codConfiguracao: this.codConfiguracao,
      ativo: this.ativo,
      gerenciadora: this.gerenciadora,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      certificado: this.certificado,
    };
  }

  //create method from object
  static fromObject(object: any): CobrancaDigitalConfigDto {
    return new CobrancaDigitalConfigDto(
      object.codEmpresa || object.CodEmpresa,
      object.codConfiguracao || object.CodConfiguracao,
      object.ativo || object.Ativo,
      object.gerenciadora || object.Gerenciadora,
      object.clientId || object.ClientId,
      object.clientSecret || object.ClientSecret,
      object.certificado || object.Certificado,
    );
  }
}
