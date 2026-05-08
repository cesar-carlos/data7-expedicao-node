export type params = {
  txid: string;
};

export type devedor = {
  cnpj_cpf: string;
  nome: string;
};

export type valor = {
  original: string;
};

export type infoAdicionais = {
  nome: string;
  valor: string;
};

export type requestCreatePixDTO = {
  sysId: string;
  params: params;
  calendario: { expiracao: number };
  devedor: devedor;
  valor: valor;
  solicitacaoPagador: string;
  infoAdicionais: infoAdicionais[];
};
