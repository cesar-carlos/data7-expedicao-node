export default class ItemLiberacaoBloqueioDto {
  readonly codLiberacaoBloqueio: number;
  readonly item: string;
  public status: string;
  readonly codRegra: number;
  readonly regra: string;
  readonly mensagemBloqueio: string;
  readonly descricaoBloqueio: string;
  readonly observacaoBloqueio: string;
  readonly dataHoraSolicitacao: Date;
  readonly codUsuarioSolicitacao: number;
  readonly nomeUsuarioSolicitacao: string;
  readonly estacaoTrabalhoSolicitacao: string;
  readonly observacaoLiberacaoBloqueio: string;
  public motivoRejeicaoLiberacaoBloqueio: string;

  constructor(params: {
    codLiberacaoBloqueio: number;
    item: string;
    status: string;
    codRegra: number;
    regra: string;
    mensagemBloqueio: string;
    descricaoBloqueio: string;
    observacaoBloqueio: string;
    dataHoraSolicitacao: Date;
    codUsuarioSolicitacao: number;
    nomeUsuarioSolicitacao: string;
    estacaoTrabalhoSolicitacao: string;
    observacaoLiberacaoBloqueio: string;
    motivoRejeicaoLiberacaoBloqueio: string;
  }) {
    this.codLiberacaoBloqueio = params.codLiberacaoBloqueio;
    this.item = params.item;
    this.status = params.status;
    this.codRegra = params.codRegra;
    this.regra = params.regra;
    this.mensagemBloqueio = params.mensagemBloqueio;
    this.descricaoBloqueio = params.descricaoBloqueio;
    this.observacaoBloqueio = params.observacaoBloqueio;
    this.dataHoraSolicitacao = params.dataHoraSolicitacao;
    this.codUsuarioSolicitacao = params.codUsuarioSolicitacao;
    this.nomeUsuarioSolicitacao = params.nomeUsuarioSolicitacao;
    this.estacaoTrabalhoSolicitacao = params.estacaoTrabalhoSolicitacao;
    this.observacaoLiberacaoBloqueio = params.observacaoLiberacaoBloqueio;
    this.motivoRejeicaoLiberacaoBloqueio = params.motivoRejeicaoLiberacaoBloqueio;
  }

  static fromObject(object: any) {
    return new ItemLiberacaoBloqueioDto({
      codLiberacaoBloqueio: object.CodLiberacaoBloqueio || object.codLiberacaoBloqueio,
      item: object.Item || object.item,
      status: object.Status || object.status,
      codRegra: object.CodRegra || object.codRegra,
      regra: object.Regra || object.regra,
      mensagemBloqueio: object.MensagemBloqueio || object.mensagemBloqueio,
      descricaoBloqueio: object.DescricaoBloqueio || object.descricaoBloqueio,
      observacaoBloqueio: object.ObservacaoBloqueio || object.observacaoBloqueio,
      dataHoraSolicitacao: object.DataHoraSolicitacao || object.dataHoraSolicitacao,
      codUsuarioSolicitacao: object.CodUsuarioSolicitacao || object.codUsuarioSolicitacao,
      nomeUsuarioSolicitacao: object.NomeUsuarioSolicitacao || object.nomeUsuarioSolicitacao,
      estacaoTrabalhoSolicitacao: object.EstacaoTrabalhoSolicitacao || object.estacaoTrabalhoSolicitacao,
      observacaoLiberacaoBloqueio: object.ObservacaoLiberacaoBloqueio || object.observacaoLiberacaoBloqueio,
      motivoRejeicaoLiberacaoBloqueio: object.MotivoRejeicaoLiberacaoBloqueio || object.motivoRejeicaoLiberacaoBloqueio,
    });
  }

  public toJson(): any {
    return {
      codLiberacaoBloqueio: this.codLiberacaoBloqueio,
      item: this.item,
      status: this.status,
      codRegra: this.codRegra,
      regra: this.regra,
      mensagemBloqueio: this.mensagemBloqueio,
      descricaoBloqueio: this.descricaoBloqueio,
      observacaoBloqueio: this.observacaoBloqueio,
      dataHoraSolicitacao: this.dataHoraSolicitacao,
      codUsuarioSolicitacao: this.codUsuarioSolicitacao,
      nomeUsuarioSolicitacao: this.nomeUsuarioSolicitacao,
      estacaoTrabalhoSolicitacao: this.estacaoTrabalhoSolicitacao,
      observacaoLiberacaoBloqueio: this.observacaoLiberacaoBloqueio,
      motivoRejeicaoLiberacaoBloqueio: this.motivoRejeicaoLiberacaoBloqueio,
    };
  }
}
