import ItemLiberacaoBloqueioDto from './item.liberacao.bloqueio.dto';
import ItemLiberacaoBloqueioSituacaoDto from './item.liberacao.bloqueio.situacao.dto';

export default class LiberacaoBloqueioDto {
  readonly codEmpresa: number;
  readonly codFilial: number;
  readonly codLiberacaoBloqueio: number;
  readonly origem: string;
  readonly codOrigem: number;
  readonly codCliente: number;
  readonly dataHoraBloqueio: Date;
  readonly codUsuarioBloqueio: number;
  readonly nomeUsuarioBloqueio: string;
  readonly estacaoTrabalhoBloqueio: string;
  readonly itemLiberacaoBloqueio: ItemLiberacaoBloqueioDto[];
  readonly itemLiberacaoBloqueioSituacao?: ItemLiberacaoBloqueioSituacaoDto[];

  constructor(params: {
    codEmpresa: number;
    codFilial: number;
    codLiberacaoBloqueio: number;
    origem: string;
    codOrigem: number;
    codCliente: number;
    dataHoraBloqueio: Date;
    codUsuarioBloqueio: number;
    nomeUsuarioBloqueio: string;
    estacaoTrabalhoBloqueio: string;
    itemLiberacaoBloqueio: ItemLiberacaoBloqueioDto[];
    itemLiberacaoBloqueioSituacao?: ItemLiberacaoBloqueioSituacaoDto[];
  }) {
    this.codEmpresa = params.codEmpresa;
    this.codFilial = params.codFilial;
    this.codLiberacaoBloqueio = params.codLiberacaoBloqueio;
    this.origem = params.origem;
    this.codOrigem = params.codOrigem;
    this.codCliente = params.codCliente;
    this.dataHoraBloqueio = params.dataHoraBloqueio;
    this.codUsuarioBloqueio = params.codUsuarioBloqueio;
    this.nomeUsuarioBloqueio = params.nomeUsuarioBloqueio;
    this.estacaoTrabalhoBloqueio = params.estacaoTrabalhoBloqueio;
    this.itemLiberacaoBloqueio = params.itemLiberacaoBloqueio;
    this.itemLiberacaoBloqueioSituacao = params.itemLiberacaoBloqueioSituacao;
  }

  static fromObject(object: any) {
    return new LiberacaoBloqueioDto({
      codEmpresa: object.CodEmpresa || object.codEmpresa,
      codFilial: object.CodFilial || object.codFilial,
      codLiberacaoBloqueio: object.CodLiberacaoBloqueio || object.codLiberacaoBloqueio,
      origem: object.Origem || object.origem,
      codOrigem: object.CodOrigem || object.codOrigem,
      codCliente: object.CodCliente || object.codCliente,
      dataHoraBloqueio: object.DataHoraBloqueio || object.dataHoraBloqueio,
      codUsuarioBloqueio: object.CodUsuarioBloqueio || object.codUsuarioBloqueio,
      nomeUsuarioBloqueio: object.NomeUsuarioBloqueio || object.nomeUsuarioBloqueio,
      estacaoTrabalhoBloqueio: object.EstacaoTrabalhoBloqueio || object.estacaoTrabalhoBloqueio,
      itemLiberacaoBloqueio: object.ItemLiberacaoBloqueio || object.itemLiberacaoBloqueio || [],
      itemLiberacaoBloqueioSituacao: object.ItemLiberacaoBloqueioSituacao || object.itemLiberacaoBloqueioSituacao || [],
    });
  }
}
