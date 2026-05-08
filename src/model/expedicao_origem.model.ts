export default abstract class ExpedicaoOrigemModel {
  static readonly separacao: string = 'SE';
  static readonly conferencia: string = 'CO';
  static readonly expedicao: string = 'EX';
  static readonly carrinhoPercurso: string = 'CP';
  static readonly conferenciaFinal: string = 'CF';
  static readonly vazio: string = '';

  static getDescricao(origem: string): string {
    return ExpedicaoOrigemModel._origem[origem] ?? '';
  }

  private static readonly _origem: { [key: string]: string } = {
    SE: 'Separação',
    CO: 'Conferencia',
    EX: 'Expedição',
    CP: 'Carrinho Percurso',
    CF: 'Conferencia',
    EM: 'Embalagem',
    '': '',
  };
}
