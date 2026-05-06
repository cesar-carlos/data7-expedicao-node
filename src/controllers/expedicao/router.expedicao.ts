import { Router, Request, Response } from 'express';

import ConferirExpedicaoController from './conferir.expedicao.controller';
import ConferirNotifyExpedicaoController from './conferir.notify.expedicao.controller';
import SeparacaoNotifyExpedicaoController from './separacao.notify.expedicao.controller';
import expedicaoCreateLoginAppRoute from '../../route/expedicao.create.login.app.route';
import SeparacaoExpedicaoController from './separacao.expedicao.controller';
import loginAppRoute from '../../route/login.app.route';
import versaoAppRoute from '../../route/versaoapp.route';

export default class RouterExpedicao {
  static router = new RouterExpedicao().getRouter();
  private _router = Router();

  constructor() {
    this.index();
    this.conferirExpedicaoController();
    this.conferirNotifyExpedicaoController();
    this.sepacaoExpedicaoController();
    this.sepacaoNotifyExpedicaoController();
    this.createLoginAppRouteWithValidation();
    this.loginAppRoute();
    this.versaoAppRoute();
  }

  private getRouter() {
    return this._router;
  }

  private index() {
    this._router.get('/', (req: Request, res: Response) => {
      res.status(200).send({ message: 'Expedição API' });
    });
  }

  private conferirExpedicaoController() {
    this._router.get('/conferir', ConferirExpedicaoController.get);
    this._router.post('/conferir', ConferirExpedicaoController.post);
    this._router.put('/conferir', ConferirExpedicaoController.put);
    this._router.delete('/conferir', ConferirExpedicaoController.delete);
  }

  private conferirNotifyExpedicaoController() {
    this._router.get('/conferir/notify', ConferirNotifyExpedicaoController.get);
    this._router.post('/conferir/notify', ConferirNotifyExpedicaoController.post);
    this._router.put('/conferir/notify', ConferirNotifyExpedicaoController.put);
    this._router.delete('/conferir/notify', ConferirNotifyExpedicaoController.delete);
  }

  private sepacaoExpedicaoController() {
    this._router.get('/separacao', SeparacaoExpedicaoController.get);
    this._router.post('/separacao', SeparacaoExpedicaoController.post);
    this._router.put('/separacao', SeparacaoExpedicaoController.put);
    this._router.delete('/separacao', SeparacaoExpedicaoController.delete);
  }

  private sepacaoNotifyExpedicaoController() {
    this._router.get('/separacao/notify', SeparacaoNotifyExpedicaoController.get);
    this._router.post('/separacao/notify', SeparacaoNotifyExpedicaoController.post);
    this._router.put('/separacao/notify', SeparacaoNotifyExpedicaoController.put);
    this._router.delete('/separacao/notify', SeparacaoNotifyExpedicaoController.delete);
  }

  private createLoginAppRouteWithValidation() {
    this._router.use('/', expedicaoCreateLoginAppRoute);
  }

  private loginAppRoute() {
    this._router.use('/', loginAppRoute);
  }

  private versaoAppRoute() {
    this._router.use('/', versaoAppRoute);
  }
}
