export type InfoAdicionais = {
  nome: string;
  valor: string;
};

export default class CobrancaPixInputDTO {
  readonly id: string;
  readonly expiracao: number;
  readonly cnpj_cpf: string;
  readonly nome: string;
  readonly valor: number;
  readonly solicitacaoPagador: string;
  readonly infoAdicionais: InfoAdicionais[];

  constructor(params: {
    id: string;
    expiracao: number;
    cnpj_cpf: string;
    nome: string;
    valor: number;
    solicitacaoPagador: string;
    infoAdicionais: InfoAdicionais[];
  }) {
    this.id = params.id;
    this.expiracao = params.expiracao;
    this.cnpj_cpf = params.cnpj_cpf;
    this.nome = params.nome;
    this.valor = params.valor;
    this.solicitacaoPagador = params.solicitacaoPagador;
    this.infoAdicionais = params.infoAdicionais;
  }
}
