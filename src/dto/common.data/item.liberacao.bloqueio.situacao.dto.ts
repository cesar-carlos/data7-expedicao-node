export default class ItemLiberacaoBloqueioSituacaoDto {
  readonly codLiberacaoBloqueio: number;
  readonly item: string;
  readonly status: string;
  readonly rotinaLiberacao: string | undefined;
  readonly dataHoraLiberacao: Date | undefined;
  readonly codUsuarioLiberacao: number | undefined;
  readonly estacaoTrabalhoLiberacao: string | undefined;
  readonly observacaoLiberacao: string | undefined;
  readonly motivoRejeicaoLiberacaoBloqueio: string | undefined;
  readonly complemento: string | undefined;

  constructor(params: {
    codLiberacaoBloqueio: number;
    item: string;
    status: string;
    rotinaLiberacao: string | undefined;
    dataHoraLiberacao: Date | undefined;
    codUsuarioLiberacao: number | undefined;
    estacaoTrabalhoLiberacao: string | undefined;
    observacaoLiberacao: string | undefined;
    motivoRejeicaoLiberacaoBloqueio: string | undefined;
    complemento: string | undefined;
  }) {
    this.codLiberacaoBloqueio = params.codLiberacaoBloqueio;
    this.item = params.item;
    this.status = params.status;
    this.rotinaLiberacao = params.rotinaLiberacao;
    this.dataHoraLiberacao = params.dataHoraLiberacao;
    this.codUsuarioLiberacao = params.codUsuarioLiberacao;
    this.estacaoTrabalhoLiberacao = params.estacaoTrabalhoLiberacao;
    this.observacaoLiberacao = params.observacaoLiberacao;
    this.motivoRejeicaoLiberacaoBloqueio = params.motivoRejeicaoLiberacaoBloqueio;
    this.complemento = params.complemento;
  }

  static fromObject(object: any) {
    return new ItemLiberacaoBloqueioSituacaoDto({
      codLiberacaoBloqueio: object.CodLiberacaoBloqueio || object.codLiberacaoBloqueio,
      item: object.Item || object.item,
      status: object.Status || object.status,
      rotinaLiberacao: object.RotinaLiberacao || object.rotinaLiberacao,
      dataHoraLiberacao: object.DataHoraLiberacao || object.dataHoraLiberacao,
      codUsuarioLiberacao: object.CodUsuarioLiberacao || object.codUsuarioLiberacao,
      estacaoTrabalhoLiberacao: object.EstacaoTrabalhoLiberacao || object.estacaoTrabalhoLiberacao,
      observacaoLiberacao: object.ObservacaoLiberacao || object.observacaoLiberacao,
      motivoRejeicaoLiberacaoBloqueio: object.MotivoRejeicaoLiberacaoBloqueio || object.motivoRejeicaoLiberacaoBloqueio,
      complemento: object.Complemento || object.complemento,
    });
  }

  public toJson(): any {
    return {
      codLiberacaoBloqueio: this.codLiberacaoBloqueio,
      item: this.item,
      status: this.status,
      rotinaLiberacao: this.rotinaLiberacao,
      dataHoraLiberacao: this.dataHoraLiberacao,
      codUsuarioLiberacao: this.codUsuarioLiberacao,
      estacaoTrabalhoLiberacao: this.estacaoTrabalhoLiberacao,
      observacaoLiberacao: this.observacaoLiberacao,
      motivoRejeicaoLiberacaoBloqueio: this.motivoRejeicaoLiberacaoBloqueio,
      complemento: this.complemento,
    };
  }
}
