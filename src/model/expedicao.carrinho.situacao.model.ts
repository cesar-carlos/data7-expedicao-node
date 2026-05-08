export abstract class ExpedicaoCarrinhoSituacaoModel {
  static readonly liberado: string = 'LIBERADO';
  static readonly emUso: string = 'EM USO';
  static readonly cancelado: string = 'CANCELADO';
  static readonly finalizado: string = 'FINALIZADO';

  static situacao: { [key: string]: string } = {
    [ExpedicaoCarrinhoSituacaoModel.liberado]: 'Liberado',
    [ExpedicaoCarrinhoSituacaoModel.emUso]: 'Em Uso',
    [ExpedicaoCarrinhoSituacaoModel.cancelado]: 'Cancelado',
    [ExpedicaoCarrinhoSituacaoModel.finalizado]: 'Finalizado',
    '': '',
  };
}
