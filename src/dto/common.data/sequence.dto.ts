export default class SequenceDto {
  readonly Nome: string;
  readonly Valor: number;

  constructor(params: { Nome: string; Valor: number }) {
    this.Nome = params.Nome;
    this.Valor = params.Valor;
  }

  static fromObject(object: any): SequenceDto {
    return new SequenceDto({
      Nome: object.Nome,
      Valor: object.Valor,
    });
  }

  static fromJson(json: string): SequenceDto {
    return SequenceDto.fromObject(JSON.parse(json));
  }

  toJson(): any {
    return {
      Nome: this.Nome,
      Valor: this.Valor,
    };
  }
}
