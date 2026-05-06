import CobrancaPixLiberacaoBloqueioService from '../../services/cobranca.pix.liberacao.bloqueio.service';
import CobrancaPixConsultaPagamentoService from '../../services/cobranca.pix.consulta.pagamento.service';
import { createNotImplementedHandler, handleController, requireValue } from '../controller.helpers';
import {
  createCobrancaDigitalPixRepository,
  createCobrancaDigitalRepository,
  createCobrancaDigitalTituloRepository,
  createItemLiberacaoBloqueioRepository,
  createOnlineCobrancaRepository,
  createOnlinePagamentoRepository,
} from '../../factory/integracao.pix.factory';
import AppExpressError from '../../aplication/app.express.error';

export default class PagamentoController {
  public static get = createNotImplementedHandler('PagamentoController', 'get');

  public static getOrigem = handleController(async (req, res) => {
    const chave = requireValue(req.query.chave, 'invalid parameters');
    const origem = requireValue(req.query.origem, 'invalid parameters');
    const codOrigem = Number.parseInt(String(requireValue(req.query.codOrigem, 'invalid parameters')), 10);

    if (Number.isNaN(codOrigem)) {
      throw new AppExpressError({
        message: 'invalid parameters',
        statusCode: 400,
        code: 'INVALID_REQUEST',
      });
    }

    const cobrancaPixConsultaPagamentoService = new CobrancaPixConsultaPagamentoService(
      createCobrancaDigitalPixRepository(),
      createOnlinePagamentoRepository(),
    );

    const result = await cobrancaPixConsultaPagamentoService.execute(String(chave), String(origem), codOrigem);
    if (!result) {
      throw new AppExpressError({
        message: 'not found',
        statusCode: 404,
        code: 'NOT_FOUND',
      });
    }

    res.status(200).send(result);
  });

  public static post = createNotImplementedHandler('PagamentoController', 'post');

  public static put = handleController(async (req, res) => {
    const body = { ...req.body };
    const cobrancaPixLiberacaoBloqueioService = new CobrancaPixLiberacaoBloqueioService(
      createCobrancaDigitalRepository(),
      createCobrancaDigitalTituloRepository(),
      createCobrancaDigitalPixRepository(),
      createItemLiberacaoBloqueioRepository(),
      createOnlineCobrancaRepository(),
      createOnlinePagamentoRepository(),
    );

    if (body.CodEmpresa && body.CodCobrancaDigital && body.Parcela && body.Tipo === 'LIBERACAO-REGRA') {
      const fromIdLiberacao = await cobrancaPixLiberacaoBloqueioService.fromIdLiberacao(
        body.CodEmpresa,
        body.CodCobrancaDigital,
        body.Parcela,
      );

      if (fromIdLiberacao.process.status === 'error') {
        throw new AppExpressError({
          message: String(fromIdLiberacao.result),
          statusCode: 500,
          code: 'LIBERACAO_RULE_ERROR',
          details: fromIdLiberacao.info,
        });
      }

      res.status(200).send(fromIdLiberacao);
      return;
    }

    if (body.CodEmpresa && body.Origem && body.CodOrigem && body.Parcela && body.Tipo === 'LIBERACAO-REGRA') {
      const fromOrigem = await cobrancaPixLiberacaoBloqueioService.fromOrigem(
        body.Origem,
        body.CodOrigem,
        body.Parcela,
      );

      res.status(200).send(fromOrigem);
      return;
    }

    res.status(204).send();
  });

  public static delete = createNotImplementedHandler('PagamentoController', 'delete');
}
