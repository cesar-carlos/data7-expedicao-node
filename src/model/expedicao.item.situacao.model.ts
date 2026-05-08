export default abstract class ExpedicaoItemSituacaoModel {
  static readonly separado: string = 'SP';
  static readonly cancelado: string = 'CA';
  static readonly pendente: string = 'PE';
  static readonly conferido: string = 'CO';
  static readonly embalado: string = 'EM';
  static readonly entregue: string = 'EN';
  static readonly expedido: string = 'EX';
  static readonly iniciado: string = 'IN';
  static readonly pausado: string = 'PA';
  static readonly reiniciado: string = 'RE';
  static readonly vazio: string = '';

  static getDescricao(situacao: string): string {
    return ExpedicaoItemSituacaoModel._situacao[situacao] || '';
  }

  private static readonly _situacao: { [key: string]: string } = {
    SP: 'Separado',
    CA: 'Cancelado',
    PE: 'Pendente',
    CO: 'Conferido',
    EM: 'Embalado',
    EN: 'Entregue',
    EX: 'Expedido',
    IN: 'Iniciado',
    PA: 'Pausado',
    RE: 'Reiniciado',
    '': '',
  };
}
