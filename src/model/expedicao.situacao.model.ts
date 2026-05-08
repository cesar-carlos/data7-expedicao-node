export default abstract class ExpedicaoSituacaoModel {
  static readonly aguardando: string = 'AGUARDANDO';
  static readonly emPausa: string = 'EM PAUSA';
  static readonly emAndamento: string = 'EM ANDAMENTO';
  static readonly emSeparacao: string = 'EM SEPARACAO';
  static readonly emConverencia: string = 'EM CONFERENCIA';
  static readonly cancelada: string = 'CANCELADA';
  static readonly devolvida: string = 'DEVOLVIDA';
  static readonly separando: string = 'SEPARANDO';
  static readonly separado: string = 'SEPARADO';
  static readonly conferindo: string = 'CONFERINDO';
  static readonly conferido: string = 'CONFERIDO';
  static readonly entregue: string = 'ENTREGUE';
  static readonly embalando: string = 'EMBALANDO';
  static readonly finalizada: string = 'FINALIZADA';
  static readonly naoLocalizada: string = 'NÃO LOCALIZADO';

  static situacao: { [key: string]: string } = {
    [ExpedicaoSituacaoModel.aguardando]: 'Aguardando',
    [ExpedicaoSituacaoModel.emPausa]: 'Em Pausa',
    [ExpedicaoSituacaoModel.emAndamento]: 'Em Andamento',
    [ExpedicaoSituacaoModel.emSeparacao]: 'Em Separação',
    [ExpedicaoSituacaoModel.emConverencia]: 'Em Conferência',
    [ExpedicaoSituacaoModel.cancelada]: 'Cancelada',
    [ExpedicaoSituacaoModel.devolvida]: 'Devolvida',
    [ExpedicaoSituacaoModel.separando]: 'Separando',
    [ExpedicaoSituacaoModel.separado]: 'Separado',
    [ExpedicaoSituacaoModel.conferindo]: 'Conferindo',
    [ExpedicaoSituacaoModel.conferido]: 'Conferido',
    [ExpedicaoSituacaoModel.entregue]: 'Entregue',
    [ExpedicaoSituacaoModel.embalando]: 'Embalando',
    [ExpedicaoSituacaoModel.finalizada]: 'Finalizada',
    [ExpedicaoSituacaoModel.naoLocalizada]: 'Não Localizada',
    '': '',
  };
}
