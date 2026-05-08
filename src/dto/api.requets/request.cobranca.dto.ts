export type DataBase = {
  Provedor: string;
  Usuario: string;
  Senha: string;
  Servidor: string;
  Base: string;
  Porta: number;
};

export type Filial = {
  CodEmpresa: number;
  CodFilial: number;
  Nome: string;
  CNPJ: string;
};

export type Usuario = {
  CodUsuario: number;
  NomeUsuario: string;
  EstacaoTrabalho: string;
  IP: string;
};

export type Cliente = {
  CodEmpresa: number;
  CodFilial: number;
  CodCobrancaDigital: number;
  CodCliente: number;
  NomeCliente: string;
  CNPJ_CPF: string;
  Telefone: string;
  EMail: string;
  Endereco: string;
  Numero: string;
  Complemento: string;
  Bairro: string;
  CEP: string;
  CodigoIBGE: string;
  NomeMunicipio: string;
  UF: string;
};

export type LiberacaoKey = {
  CodEmpresa: number;
  CodFilial: number;
  CNPJ: string;
  Origem: string;
  CodOrigem: number;
  nomeUsuario: string;
  estacaoTrabalho: string;
  IP: string;
};

export type Parcelas = {
  SysId: string;
  Origem: string;
  CodOrigem: number;
  LiberacaoKey: LiberacaoKey;
  NumeroParcela: string;
  QtdParcela: number;
  TipoCobranca: string;
  DataEmissao: Date;
  DataVenda: Date;
  DataVencimento: Date;
  ValorParcela: number;
  Observacao: string;
};

export type requestCobrancaDTO = {
  DataBase: DataBase;
  Filial: Filial;
  Usuario: Usuario;
  Cliente: Cliente;
  Parcelas: Parcelas[];
};
