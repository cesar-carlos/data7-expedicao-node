import { STATUS } from '../type/status';
import { requestCobrancaDTO } from '../dto/api.requets/request.cobranca.dto';

import CreatePixApiContract from '../contracts/create.pix.api.contract';

import Filial from '../entities/filial';
import Cliente from '../entities/cliente';
import Usuario from '../entities/usuario';
import Cobranca from '../entities/cobranca';
import ProcessInfo from '../entities/process.info';
import CobrancaParcela from '../entities/cobranca.parcela';
import CobrancaLiberacaoKey from '../entities/cobranca.liberacao.key';

import AppCobrancaPixValidar from './app.cobranca.pix.validar';
import AppTestDatabeses from './app.test.databeses';
import AppRegraStatusCobrancaPix from './app.regra.status.cobranca.pix';

import CobrancaPixService from '../services/cobranca.pix.service';
import CreatePixService from '../services/create.pix.service';
import CobrancaPixLiberacaoBloqueioService from '../services/cobranca.pix.liberacao.bloqueio.service';
import {
  createCobrancaDigitalPixRepository,
  createCobrancaDigitalRepository,
  createCobrancaDigitalTituloRepository,
  createItemLiberacaoBloqueioRepository,
  createOnlineCobrancaRepository,
  createOnlinePagamentoRepository,
  createPixApiContract,
} from '../factory/integracao.pix.factory';

type ParsedCobrancaRequest = {
  idLiberacao: number;
  sysId: string;
  usuario: Usuario;
  filial: Filial;
  cliente: Cliente;
  parcelas: CobrancaParcela[];
};

export default class AppCobrancaPix {
  private readonly cobrancaPixValidar = new AppCobrancaPixValidar();
  private readonly databaseValidator = new AppTestDatabeses();
  private readonly api: string = process.env.API_PIX || '';

  private readonly localRepositoryItemLiberacaoBloqueio = createItemLiberacaoBloqueioRepository();
  private readonly localRepositoryCobrancaDigitalPix = createCobrancaDigitalPixRepository();
  private readonly localRepositoryCobrancaDigital = createCobrancaDigitalRepository();
  private readonly localRepositoryCobrancaDigitalTitulo = createCobrancaDigitalTituloRepository();
  private readonly onlineRepository = createOnlineCobrancaRepository();
  private readonly onlineDataPagamentoPix = createOnlinePagamentoRepository();

  public async execute(input: requestCobrancaDTO[]): Promise<ProcessInfo> {
    try {
      const validationInfo = await this.validateExecution(input);
      if (validationInfo) {
        return validationInfo;
      }

      const cobrancaPixService = this.createCobrancaPixService();

      for (const reqCobranca of input) {
        const parsedRequest = this.parseRequest(reqCobranca);
        await this.markExistingPayments(parsedRequest.parcelas);

        const parcelasPendentes = parsedRequest.parcelas.filter((parcela) => parcela.status === 'A');
        if (parcelasPendentes.length === 0) {
          continue;
        }

        const cobranca = new Cobranca(
          parsedRequest.sysId,
          parsedRequest.usuario,
          parsedRequest.filial,
          parsedRequest.cliente,
          parcelasPendentes,
        );

        const infoCob = await cobrancaPixService.execute(cobranca);
        if (infoCob.process.status === 'error') {
          throw new Error(infoCob.result);
        }

        void this.activateCobrancaForPagamento(parsedRequest.idLiberacao);
      }

      return new ProcessInfo({ status: 'success' }, STATUS.MENSAGEM_BLOQUEIO, '');
    } catch (error: any) {
      return new ProcessInfo({ status: 'error' }, error.message, error.stack);
    }
  }

  private async validateExecution(input: requestCobrancaDTO[]): Promise<ProcessInfo | null> {
    const info = this.cobrancaPixValidar.execute(input);
    if (info.process.status === 'error') {
      return info;
    }

    const databaseInfo = await this.databaseValidator.execute();
    if (databaseInfo.process.status === 'error') {
      return databaseInfo;
    }

    return null;
  }

  private createCobrancaPixService(): CobrancaPixService {
    return new CobrancaPixService(
      this.localRepositoryCobrancaDigitalPix,
      this.onlineRepository,
      new CreatePixService(this.resolvePixApi()),
    );
  }

  private createLiberacaoBloqueioService(): CobrancaPixLiberacaoBloqueioService {
    return new CobrancaPixLiberacaoBloqueioService(
      this.localRepositoryCobrancaDigital,
      this.localRepositoryCobrancaDigitalTitulo,
      this.localRepositoryCobrancaDigitalPix,
      this.localRepositoryItemLiberacaoBloqueio,
      this.onlineRepository,
      this.onlineDataPagamentoPix,
    );
  }

  private resolvePixApi(): CreatePixApiContract {
    const apiContext = this.api.toLocaleLowerCase().trim();
    if (!apiContext) {
      throw new Error('API_PIX not configured');
    }

    return createPixApiContract(apiContext);
  }

  private parseRequest(reqCobranca: requestCobrancaDTO): ParsedCobrancaRequest {
    const primeiraParcela = reqCobranca.Parcelas?.[0];
    if (!primeiraParcela?.SysId) {
      throw new Error('Invalid SysId');
    }

    const idLiberacao = Number.parseInt(primeiraParcela.SysId.split('.')[0], 10);
    const sysId = primeiraParcela.SysId.split('-')[0];

    if (Number.isNaN(idLiberacao) || !sysId) {
      throw new Error('CobSysId out of expected format');
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

    return {
      idLiberacao,
      sysId,
      usuario,
      filial,
      cliente,
      parcelas,
    };
  }

  private async markExistingPayments(parcelas: CobrancaParcela[]): Promise<void> {
    const existingPayments = await Promise.all(
      parcelas.map((parcela) =>
        this.existsPaymentFromOrigem(parcela.origem, parcela.codOrigem, parcela.numeroParcela),
      ),
    );

    existingPayments.forEach((existsPayment, index) => {
      if (existsPayment) {
        parcelas[index].status = 'B';
      }
    });
  }

  private async existsPaymentFromOrigem(origem: string, codOrigem: number, parcela: string): Promise<boolean> {
    const fromOrigem = await this.createLiberacaoBloqueioService().fromOrigem(origem, codOrigem, parcela);
    return fromOrigem.process.status === 'success';
  }

  private async activateCobrancaForPagamento(idLiberacao: number): Promise<void> {
    await this.wait(3000);

    try {
      const bloqueios = await this.localRepositoryItemLiberacaoBloqueio.selectWhere([{ key: 'Status', value: 'B' }]);

      for (const bloqueio of bloqueios || []) {
        if (!bloqueio.mensagemBloqueio?.includes('INFO-REQUEST')) {
          continue;
        }

        const keys = this.parseObservacaoBloqueio(bloqueio.observacaoBloqueio);
        if (!keys) {
          continue;
        }

        if (Number(keys.CodCobrancaDigital) !== idLiberacao) {
          continue;
        }

        await new AppRegraStatusCobrancaPix().execute({
          codLiberacaoBloqueio: bloqueio.codLiberacaoBloqueio,
          idLiberacao,
        });
      }
    } catch (error) {
      console.error('Error while activating charge for payment', {
        idLiberacao,
        error,
      });
    }
  }

  private parseObservacaoBloqueio(observacaoBloqueio: string | undefined): { CodCobrancaDigital?: number } | null {
    if (!observacaoBloqueio) {
      return null;
    }

    try {
      const jsonObservacaoBloqueio = observacaoBloqueio.replace('\\', '');
      return JSON.parse(jsonObservacaoBloqueio);
    } catch (error) {
      console.error('Error while parsing observacao bloqueio', {
        observacaoBloqueio,
        error,
      });
      return null;
    }
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
