import { STATUS } from '../type/status';

import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import ItemLiberacaoBloqueioDto from '../dto/common.data/item.liberacao.bloqueio.dto';
import ContractBaseRepository from '../contracts/base.repository.contract';
import CobrancaDigitalDto from '../dto/integracao/cobranca.digital.dto';
import CobrancaPix from '../entities/cobranca.pix';

export default class RegraStatusCobrancaPixService {
  constructor(
    private localRepositoryLiberacao: LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto>,
    private localRepositoryCobranca: LocalBaseRepositoryContract<CobrancaDigitalDto>,
    private onlineRepositoryCobranca: ContractBaseRepository<CobrancaPix>,
  ) {}

  async execute(codLiberacaoBloqueio: number, idLiberacao: number): Promise<void> {
    const msg = `INFO-REQUEST ${STATUS.MENSAGEM_BLOQUEIO}`;

    const itensLiberacaoBloqueio = await this.localRepositoryLiberacao.selectWhere([
      { key: 'CodLiberacaoBloqueio ', value: codLiberacaoBloqueio },
    ]);

    const status = this.rule(itensLiberacaoBloqueio);
    if (status === STATUS.ATIVO) {
      const cobrancasOnLine = await this.onlineRepositoryCobranca.findWhere(
        'liberacaoKey.idLiberacao',
        idLiberacao.toString(),
      );

      if (cobrancasOnLine === undefined || cobrancasOnLine.length <= 0) {
        itensLiberacaoBloqueio?.forEach(async (item) => {
          if (item.status === 'B' && item.mensagemBloqueio?.trim().replace(':', '') === `${msg}`) {
            item.status = 'R';
            item.motivoRejeicaoLiberacaoBloqueio = 'Cobrança não encontrada na base de dados online';
            await this.localRepositoryLiberacao.update(item);
          }
        });
      }

      cobrancasOnLine?.forEach(async (cobranca) => {
        if (cobranca.STATUS === STATUS.AGUARDANDO) {
          cobranca.STATUS = STATUS.ATIVO;
          await this.onlineRepositoryCobranca.update(cobranca);
        }
      });
    }

    ///* */
    if (status === STATUS.CANCELADO_SISTEMA) {
      const cobrancasOnLine = await this.onlineRepositoryCobranca.findWhere(
        'liberacaoKey.idLiberacao',
        idLiberacao.toString(),
      );

      const cobrancasLocal = await this.localRepositoryCobranca.selectWhere([
        { key: 'CodCobrancaDigital ', value: idLiberacao },
      ]);

      cobrancasLocal?.forEach(async (cobranca) => {
        if (cobranca.situacao === STATUS.ATIVO) {
          cobranca.situacao = STATUS.CANCELADO_SISTEMA;
          await this.localRepositoryCobranca.update(cobranca);
        }
      });

      cobrancasOnLine?.forEach(async (cobranca) => {
        if (cobranca.STATUS === STATUS.AGUARDANDO) {
          cobranca.STATUS = STATUS.CANCELADO_SISTEMA;
          await this.onlineRepositoryCobranca.update(cobranca);
        }
      });

      itensLiberacaoBloqueio?.forEach(async (item) => {
        if (item.status === 'B' && item.mensagemBloqueio?.trim() === `INFO-REQUEST: ${STATUS.MENSAGEM_BLOQUEIO}`) {
          item.status = 'R';
          item.motivoRejeicaoLiberacaoBloqueio = 'Cobrança não encontrada na base de dados online';
          await this.localRepositoryLiberacao.update(item);
        }
      });
    }

    //
    ///* */
    if (status === STATUS.CONCLUIDO_MANUAL) {
      const cobrancasOnLine = await this.onlineRepositoryCobranca.findWhere(
        'liberacaoKey.idLiberacao',
        idLiberacao.toString(),
      );

      cobrancasOnLine?.forEach(async (cobranca) => {
        if (cobranca.STATUS === STATUS.ATIVO || cobranca.STATUS === STATUS.AGUARDANDO) {
          cobranca.STATUS = STATUS.CONCLUIDO;
          await this.onlineRepositoryCobranca.update(cobranca);
        }
      });

      const cobrancasLocal = await this.localRepositoryCobranca.selectWhere([
        { key: 'CodCobrancaDigital ', value: idLiberacao },
      ]);

      cobrancasLocal?.forEach(async (cobranca) => {
        if (cobranca.situacao === STATUS.ATIVO) {
          cobranca.situacao = STATUS.CONCLUIDO_MANUAL;
          await this.localRepositoryCobranca.update(cobranca);
        }
      });
    }
  }

  ///* RULE */
  private rule(itensLiberacaoBloqueio?: ItemLiberacaoBloqueioDto[]): STATUS {
    const msg = `INFO-REQUEST ${STATUS.MENSAGEM_BLOQUEIO}`;
    if (itensLiberacaoBloqueio === undefined) return STATUS.CANCELADO_SISTEMA;
    if (itensLiberacaoBloqueio.length <= 0) return STATUS.CANCELADO_SISTEMA;

    const qtdLiberadas = itensLiberacaoBloqueio.reduce((acc, item) => {
      if (item.status === 'L') return acc + 1;
      return acc;
    }, 0);

    if (qtdLiberadas === itensLiberacaoBloqueio.length) return STATUS.CONCLUIDO_MANUAL;

    for (const item of itensLiberacaoBloqueio) {
      if (item.status === 'B' && item.mensagemBloqueio?.trim().replace(':', '') !== `${msg}`) {
        return STATUS.AGUARDANDO;
      }

      if (item.status === 'R') return STATUS.CANCELADO_SISTEMA;
    }

    return STATUS.ATIVO;
  }
}
