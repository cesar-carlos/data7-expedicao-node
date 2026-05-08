import { STATUS } from '../../type/status';

export type devedor = {
  cnpj_cpf?: string;
  nome?: string;
};

export type valor = {
  original: string;
};

export type infoAdicionais = {
  nome: string;
  valor: string;
};

export type responseCreatePixDto = {
  sysId: string;
  calendario: { criacao: Date; expiracao: number };
  txid: string;
  revisao: number;
  location: string;
  status: STATUS;
  devedor: devedor;
  valor: valor;
  chave: string;
  solicitacaoPagador: string;
  infoAdicionais: infoAdicionais[];
  qrcode: string;
  imagemQrcode: string;
};
