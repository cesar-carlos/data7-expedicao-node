import { ResponsePixDto } from './response.pix.dto';

export enum STATUS_GN {
  ATIVA = 'ATIVA',
  CONCLUIDA = 'CONCLUIDA',
  REMOVIDA_PELO_USUARIO_RECEBEDOR = 'REMOVIDA_PELO_USUARIO_RECEBEDOR',
  REMOVIDA_PELO_PSP = 'REMOVIDA_PELO_PSP',
}

type loc = {
  id: number;
  location: string;
  tipoCob: string;
  criacao: Date;
};

type devedor = {
  cpf: string;
  nome: string;
};

type valor = {
  original: string;
};

type infoAdicionais = {
  nome: string;
  valor: string;
};

export type responsePixDetailDto = {
  calendario: { criacao: Date; expiracao: number };
  txid: string;
  revisao: number;
  loc: loc;
  location: string;
  status: STATUS_GN;
  devedor: devedor;
  valor: valor;
  chave: string;
  solicitacaoPagador: string;
  infoAdicionais: infoAdicionais[];
  pix?: ResponsePixDto[];
};
