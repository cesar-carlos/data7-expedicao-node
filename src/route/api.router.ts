import { Router } from 'express';

import { handleController } from '../controllers/controller.helpers';
import RouterExpedicao from '../controllers/expedicao/router.expedicao';
import RouterGeral from '../controllers/geral/router.geral';
import socketMonitorRouter from './socket.monitor.route';

export default class ApiRoute {
  static router = new ApiRoute().getRouter();
  private _router = Router();

  constructor() {
    this.index();
    this.geral();
    this.expedicao();
    this.monitor();
  }

  private getRouter() {
    return this._router;
  }

  private index() {
    this._router.get(
      '/',
      handleController((_req, res) => {
        res.send('Data7 API');
      }),
    );
  }

  private geral() {
    this._router.use(RouterGeral.router);
  }

  private expedicao() {
    this._router.use('/expedicao', RouterExpedicao.router);
  }

  private monitor() {
    this._router.use(socketMonitorRouter);
  }
}
