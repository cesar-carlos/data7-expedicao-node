export default class CobrancaDigitalLogDto {
  constructor(readonly id: string, readonly message: string, readonly details: string) {}

  static fromObject(object: any): CobrancaDigitalLogDto {
    return new CobrancaDigitalLogDto(
      object.id || object.ID,
      object.message || object.Message,
      object.details || object.Details,
    );
  }
}
