import { Router } from 'express';

import { handleController } from '../controller.helpers';
import WebhookRegisterController from './register.webhook.controller';
import CobrancaController from './cobranca.controller';
import PagamentoController from './pagamento.controller';

export default class RouterCobrancaDigital {
  static router = new RouterCobrancaDigital().getRouter();
  private _router = Router();

  constructor() {
    this.index();
    this.webhookRegister();
    this.cobranca();
    this.pagamento();
  }

  private getRouter() {
    return this._router;
  }

  private index() {
    this._router.get(
      '/',
      handleController((_req, res) => {
        res.send('Data7 Cobrança Digital');
      }),
    );
  }

  private webhookRegister() {
    this._router.get('/webhook', WebhookRegisterController.get);
    this._router.post('/webhook', WebhookRegisterController.post);
    this._router.put('/webhook', WebhookRegisterController.put);
    this._router.delete('/webhook', WebhookRegisterController.delete);
  }

  private cobranca() {
    this._router.get('/cobranca', CobrancaController.get);
    this._router.get('/cobranca/:id', CobrancaController.get);
    //this._router.post('/cobranca', CobrancaController.post);
    this._router.put('/cobranca', CobrancaController.put);
    this._router.delete('/cobranca/:sysId', CobrancaController.delete);
  }

  private pagamento() {
    this._router.get('/pagamento', PagamentoController.getOrigem);
    this._router.get('/pagamento/:txid', PagamentoController.get);
    this._router.post('/pagamento', PagamentoController.post);
    //this._router.put('/pagamento', PagamentoController.put);
    this._router.delete('/pagamento/:sysId', PagamentoController.delete);
  }
}
