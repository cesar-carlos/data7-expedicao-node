export default class ExpedicaoMotivoRecusaDto {
  CodMotivoRecusa: number;
  Descricao: string;
  Ativo: string;

  constructor(params: { CodMotivoRecusa: number; Descricao: string; Ativo: string }) {
    this.CodMotivoRecusa = params.CodMotivoRecusa;
    this.Descricao = params.Descricao;
    this.Ativo = params.Ativo;
  }

  public copyWith(params: { CodMotivoRecusa: number; Descricao: string; Ativo: string }): ExpedicaoMotivoRecusaDto {
    return new ExpedicaoMotivoRecusaDto({
      CodMotivoRecusa: params.CodMotivoRecusa ?? this.CodMotivoRecusa,
      Descricao: params.Descricao ?? this.Descricao,
      Ativo: params.Ativo ?? this.Ativo,
    });
  }

  static fromObject(object: any): ExpedicaoMotivoRecusaDto {
    return new ExpedicaoMotivoRecusaDto({
      CodMotivoRecusa: object.CodMotivoRecusa,
      Descricao: object.Descricao,
      Ativo: object.Ativo,
    });
  }

  toJson(): any {
    return {
      CodMotivoRecusa: this.CodMotivoRecusa,
      Descricao: this.Descricao,
      Ativo: this.Ativo,
    };
  }
}
