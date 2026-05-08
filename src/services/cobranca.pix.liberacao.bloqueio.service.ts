import CobrancaDigitalDto from '../dto/integracao/cobranca.digital.dto';
import CobrancaDigitalTituloDto from '../dto/integracao/cobranca.digital.titulo.dto';
import ItemLiberacaoBloqueioDto from '../dto/common.data/item.liberacao.bloqueio.dto';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';
import CobrancaPixConsultaService from './cobranca.pix.consulta.service';
import ContractBaseRepository from '../contracts/base.repository.contract';
import CobrancaDigitalPixDto from '../dto/integracao/cobranca.digital.pix.dto';
import PagamentoPix from '../entities/pagamento.pix';
import ProcessInfo from '../entities/process.info';
import CobrancaPix from '../entities/cobranca.pix';

export default class CobrancaPixLiberacaoBloqueioService {
  constructor(
    readonly localRepoCobrancaDigital: LocalBaseRepositoryContract<CobrancaDigitalDto>,
    readonly localRepoCobrancaDigitalTitulo: LocalBaseRepositoryContract<CobrancaDigitalTituloDto>,
    readonly localRepoCobrancaDigitalPix: LocalBaseRepositoryContract<CobrancaDigitalPixDto>,
    readonly localRepoItemLiberacaoBloqueio: LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto>,
    readonly onlineCobrancaPix: ContractBaseRepository<CobrancaPix>,
    readonly onlinePagamentoPix: ContractBaseRepository<PagamentoPix>,
  ) {}

  async fromOrigem(Origem: string, CodOrigem: number, Parcela: string): Promise<ProcessInfo> {
    try {
      const tituloAtivo = (
        await this.localRepoCobrancaDigitalTitulo.selectWhere([
          { key: 'SysId', value: `%.${Origem}.${CodOrigem}-${Parcela}`, operator: 'like' },
          { key: 'Status', value: `AT`, operator: 'like' },
        ])
      )?.[0];

      if (!tituloAtivo) {
        return new ProcessInfo({ status: 'warning' }, 'não existe titulo ativo.', '');
      }

      const localCobrancaDigitalPix = await this.localRepoCobrancaDigitalPix.selectWhere([
        { key: 'SysId', value: `%.${Origem}.${CodOrigem}-${Parcela}`, operator: 'like' },
      ]);

      if (!localCobrancaDigitalPix || localCobrancaDigitalPix.length === 0) {
        return new ProcessInfo({ status: 'warning' }, 'titulos não localizados', '');
      }

      let exists = false;
      const cobrancaPixConsultaService = new CobrancaPixConsultaService(this.onlinePagamentoPix);
      for (const cobPix of localCobrancaDigitalPix) {
        const pagamento = await cobrancaPixConsultaService.execute(cobPix.txId);
        if (!pagamento) continue;

        if (pagamento.valor.toFixed(2) === tituloAtivo.valor.toFixed(2)) {
          tituloAtivo.status = 'PGR';
          await this.localRepoCobrancaDigitalTitulo.update(tituloAtivo);
          exists = true;
          break;
        }
      }

      if (!exists) {
        return new ProcessInfo({ status: 'warning' }, 'pagamento não encontrado.', '');
      }

      const localRepoCobrancaDigital = (
        await this.localRepoCobrancaDigital.selectWhere([
          { key: 'CodEmpresa', value: tituloAtivo.codEmpresa },
          { key: 'CodCobrancaDigital', value: tituloAtivo.codCobrancaDigital },
        ])
      )?.[0];

      if (!localRepoCobrancaDigital) {
        return new ProcessInfo({ status: 'warning' }, 'cobrança digital não encontrada.', '');
      }

      setTimeout(() => {
        this.localRepoCobrancaDigital.update(localRepoCobrancaDigital);
      }, 2000);

      return new ProcessInfo({ status: 'success' }, 'liberado', '');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async fromIdLiberacao(codEmpresa: number, idLiberacao: number, parcela: string): Promise<ProcessInfo> {
    throw new Error('Method not implemented.');
  }
}
