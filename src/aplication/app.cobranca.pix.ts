import { getLocalDbContext, getOnlineDbContext } from '../di/database.context';
import { DI_BIND } from '../di/bind.tokens';
import { STATUS } from '../type/status';
import { requestCobrancaDTO } from '../dto/api.requets/request.cobranca.dto';

import ContractBaseRepository from '../contracts/base.repository.contract';
import CobrancaPix from '../entities/cobranca.pix';

import Filial from '../entities/filial';
import Cliente from '../entities/cliente';
import Usuario from '../entities/usuario';
import Cobranca from '../entities/cobranca';

import ProcessInfo from '../entities/process.info';
import AppDependencys from './app.dependencys';
import CreatePixApiContract from '../contracts/create.pix.api.contract';
import CobrancaDigitalPixDto from '../dto/integracao/cobranca.digital.pix.dto';
import AppCobrancaPixValidar from './app.cobranca.pix.validar';
import LocalBaseRepositoryContract from '../contracts/local.base.repository.contract';

import CobrancaPixService from '../services/cobranca.pix.service';
import CreatePixService from '../services/create.pix.service';

import CobrancaParcela from '../entities/cobranca.parcela';
import AppTestDatabeses from './app.test.databeses';
import CobrancaLiberacaoKey from '../entities/cobranca.liberacao.key';
import ItemLiberacaoBloqueioDto from '../dto/common.data/item.liberacao.bloqueio.dto';
import AppRegraStatusCobrancaPix from './app.regra.status.cobranca.pix';
import CobrancaDigitalTituloDto from '../dto/integracao/cobranca.digital.titulo.dto';
import PagamentoPix from '../entities/pagamento.pix';
import CobrancaDigitalDto from '../dto/integracao/cobranca.digital.dto';
import CobrancaPixLiberacaoBloqueioService from '../services/cobranca.pix.liberacao.bloqueio.service';

export default class AppCobrancaPix {
  private cobrancaPixValidar = new AppCobrancaPixValidar();
  private api: string = process.env.API_PIX || '';

  private localRepositoryItemLiberacaoBloqueio = AppDependencys.resolve<
    LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto>
  >({
    context: getLocalDbContext(),
    bind: DI_BIND.LocalBaseRepositoryContract_ItemLiberacaoBloqueioDto,
  });

  private localRepositoryCobrancaDigitalPix = AppDependencys.resolve<
    LocalBaseRepositoryContract<CobrancaDigitalPixDto>
  >({
    context: getLocalDbContext(),
    bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPixDto,
  });

  private onlineRepository = AppDependencys.resolve<ContractBaseRepository<CobrancaPix>>({
    context: getOnlineDbContext(),
    bind: DI_BIND.ContractBaseRepository_CobrancaPix,
  });

  private appDependencys = AppDependencys.resolve<CreatePixApiContract>({
    context: this.api.toLocaleLowerCase(),
    bind: DI_BIND.CreatePixApiContract,
  });

  /// <summary>
  /// Cria uma cobrança digital
  /// </summary>
  public async execute(input: requestCobrancaDTO[]): Promise<ProcessInfo> {
    try {
      //TODO: Validar se a cobrança
      const info = this.cobrancaPixValidar.execute(input);
      if (info.process.status === 'error') return info;

      const cobrancaPixService = new CobrancaPixService(
        this.localRepositoryCobrancaDigitalPix,
        this.onlineRepository,
        new CreatePixService(this.appDependencys),
      );

      const appChargeValidDatabese = new AppTestDatabeses();
      const infoDatabese = await appChargeValidDatabese.execute();
      if (infoDatabese.process.status === 'error') return infoDatabese;

      for (const reqCobranca of input) {
        let idLiberacao: number;
        let sysId: string;

        try {
          idLiberacao = Number.parseInt(reqCobranca.Parcelas[0].SysId.split('.')[0]);
          sysId = reqCobranca.Parcelas[0].SysId.split('-')[0];
        } catch (error) {
          return new ProcessInfo({ status: 'error' }, 'SysId  invalido', 'CobSysId fora do formato esperado');
        }

        const usuario = new Usuario({
          codUsuario: reqCobranca.Usuario.CodUsuario,
          nomeUsuario: reqCobranca.Usuario.NomeUsuario,
          estacaoTrabalho: reqCobranca.Usuario.EstacaoTrabalho,
        });

        const filial = new Filial({
          codEmpresa: reqCobranca.Filial.CodEmpresa,
          codFilial: reqCobranca.Filial.CodFilial,
          nome: reqCobranca.Filial.Nome,
          cnpj: reqCobranca.Filial.CNPJ,
        });

        const cliente = new Cliente({
          codEmpresa: reqCobranca.Cliente.CodEmpresa,
          codFilial: reqCobranca.Cliente.CodFilial,
          codCobrancaDigital: reqCobranca.Cliente.CodCobrancaDigital,
          codCliente: reqCobranca.Cliente.CodCliente,
          nomeCliente: reqCobranca.Cliente.NomeCliente,
          cnpj_cpf: reqCobranca.Cliente.CNPJ_CPF,
          telefone: reqCobranca.Cliente.Telefone,
          eMail: reqCobranca.Cliente.EMail,
          endereco: reqCobranca.Cliente.Endereco,
          numero: reqCobranca.Cliente.Numero,
          complemento: reqCobranca.Cliente.Complemento,
          bairro: reqCobranca.Cliente.Bairro,
          cep: reqCobranca.Cliente.CEP,
          codigoIBGE: reqCobranca.Cliente.CodigoIBGE,
          nomeMunicipio: reqCobranca.Cliente.NomeMunicipio,
          uf: reqCobranca.Cliente.UF,
        });

        const parcelas = reqCobranca.Parcelas.map((parcela) => {
          return new CobrancaParcela({
            sysId: parcela.SysId,
            status: 'A',
            origem: parcela.Origem,
            codOrigem: parcela.CodOrigem,

            liberacaoKey: new CobrancaLiberacaoKey({
              codEmpresa: parcela.LiberacaoKey.CodEmpresa,
              codFilial: parcela.LiberacaoKey.CodFilial,
              cnpj: parcela.LiberacaoKey.CNPJ,
              idLiberacao: idLiberacao.toString(),
              origem: parcela.LiberacaoKey.Origem,
              codOrigem: parcela.LiberacaoKey.CodOrigem,
              item: parcela.NumeroParcela,
              nomeUsuario: parcela.LiberacaoKey.nomeUsuario,
              estacaoTrabalho: parcela.LiberacaoKey.estacaoTrabalho,
              ip: parcela.LiberacaoKey.IP,
            }),

            numeroParcela: parcela.NumeroParcela,
            qtdParcela: parcela.QtdParcela,
            tipoCobranca: parcela.TipoCobranca,
            dataEmissao: parcela.DataEmissao,
            dataVenda: parcela.DataVenda,
            dataVencimento: parcela.DataVencimento,
            valorParcela: parcela.ValorParcela,
            observacao: parcela.Observacao,
          });
        });

        /* CONSULTA ORIGEM */
        for (const parc of parcelas) {
          const existisPayment = await this.existisPaymentFromOrigem(parc.origem, parc.codOrigem, parc.numeroParcela);
          if (existisPayment) {
            parc.status = 'B';
          }
        }

        /* CRIA A COBRANCA */
        if (!parcelas.some((parc) => parc.status === 'A')) continue;

        const cobPix = new Cobranca(
          sysId,
          usuario,
          filial,
          cliente,
          parcelas.filter((parc) => parc.status === 'A'),
        );

        const infoCob = await cobrancaPixService.execute(cobPix);
        if (infoCob.process.status === 'error') {
          throw new Error(infoCob.result);
        }

        /// <summary>
        /// ATIVA COBRANÇA PARA PAGAMENTO
        /// </summary>
        setTimeout(() => {
          this.localRepositoryItemLiberacaoBloqueio
            .selectWhere([{ key: 'Status', value: 'B' }])
            .then((bloqueios) => {
              if (bloqueios && bloqueios.length > 0) {
                for (const bloqueio of bloqueios) {
                  if (bloqueio.mensagemBloqueio?.includes('INFO-REQUEST')) {
                    try {
                      const jsonObservacaoBloqueio = bloqueio.observacaoBloqueio.replace('\\', '');
                      const keys = JSON.parse(jsonObservacaoBloqueio);

                      if (keys.CodCobrancaDigital == idLiberacao) {
                        new AppRegraStatusCobrancaPix().execute({
                          codLiberacaoBloqueio: bloqueio.codLiberacaoBloqueio,
                          idLiberacao: idLiberacao,
                        });
                      }
                    } catch (err) {}
                  }
                }
              }
            })
            .catch((err) => {});
        }, 3000);
      }

      /// <summary>
      /// Retorno de sucesso
      /// </summary>
      return new ProcessInfo({ status: 'success' }, STATUS.MENSAGEM_BLOQUEIO, '');
    } catch (error: any) {
      return new ProcessInfo({ status: 'error' }, error.message, error.stack);
    }
  }

  //checar o pagamento
  public async existisPaymentFromOrigem(origem: string, codOrigem: number, parcela: string): Promise<boolean> {
    const localRepoCobrancaDigital = AppDependencys.resolve<LocalBaseRepositoryContract<CobrancaDigitalDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalDto,
    });

    const localRepoCobrancaDigitalTitulo = AppDependencys.resolve<
      LocalBaseRepositoryContract<CobrancaDigitalTituloDto>
    >({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalTituloDto,
    });

    const localRepoCobrancaDigitalPix = AppDependencys.resolve<LocalBaseRepositoryContract<CobrancaDigitalPixDto>>({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_CobrancaDigitalPixDto,
    });

    const localRepoItemLiberacaoBloqueio = AppDependencys.resolve<
      LocalBaseRepositoryContract<ItemLiberacaoBloqueioDto>
    >({
      context: getLocalDbContext(),
      bind: DI_BIND.LocalBaseRepositoryContract_ItemLiberacaoBloqueioDto,
    });

    const onlineCobrancaPix = AppDependencys.resolve<ContractBaseRepository<CobrancaPix>>({
      context: getOnlineDbContext(),
      bind: DI_BIND.ContractBaseRepository_CobrancaPix,
    });

    const onlineDataPagamentoPix = AppDependencys.resolve<ContractBaseRepository<PagamentoPix>>({
      context: getOnlineDbContext(),
      bind: DI_BIND.ContractBaseRepository_PagamentoPix,
    });

    const cobrancaPixLiberacaoBloqueioService = new CobrancaPixLiberacaoBloqueioService(
      localRepoCobrancaDigital,
      localRepoCobrancaDigitalTitulo,
      localRepoCobrancaDigitalPix,
      localRepoItemLiberacaoBloqueio,
      onlineCobrancaPix,
      onlineDataPagamentoPix,
    );

    const fromOrigem = await cobrancaPixLiberacaoBloqueioService.fromOrigem(origem, codOrigem, parcela);
    if (!fromOrigem) return false;

    if (fromOrigem.process.status === 'success') return true;
    return false;
  }
}
