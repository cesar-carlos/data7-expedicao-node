export default class PagamentoQrCode {
  constructor(readonly id: string, readonly idloc: number, readonly qrcode: string, readonly imagemQrcode: string) {}

  //create method from json
  static fromJson(json: any): PagamentoQrCode {
    return new PagamentoQrCode(
      json.id || json.Id,
      json.idloc || json.Idloc,
      json.qrcode || json.Qrcode,
      json.imagemQrcode || json.ImagemQrcode,
    );
  }

  toJson(): any {
    return {
      id: this.id,
      idloc: this.idloc,
      qrcode: this.qrcode,
      imagemQrcode: this.imagemQrcode,
    };
  }

  static fromObject(obj: any): PagamentoQrCode {
    return new PagamentoQrCode(
      obj.id || obj.Id,
      obj.idloc || obj.Idloc,
      obj.qrcode || obj.Qrcode,
      obj.imagemQrcode || obj.ImagemQrcode,
    );
  }
}
