import { Router } from 'express';

import { handleController } from '../controller.helpers';
import GeralHealth from './geral.health';
import GeralSequenciaController from './geral.sequencia.controller';
import GeralProcessoExecutavelController from './geral.processo.executavel.controller';
import UsuarioConsultaController from './usuario.consulta.controller';
import { validateQuery } from '../../middleware/validation.middleware';
import { usuarioConsultaQuerySchema } from '../../validation/usuario.consulta.validation';

export default class RouterGeral {
  static router = new RouterGeral().getRouter();
  private _router = Router();

  constructor() {
    this.index();
    this.health();
    this.sequenciaRegistro();
    this.processoExecutavel();
    this.usuarioConsulta();
  }

  private getRouter() {
    return this._router;
  }

  private index() {
    this._router.get(
      '/',
      handleController((_req, res) => {
        res.send('Data7 geral');
      }),
    );
  }

  private health() {
    this._router.get('/health', GeralHealth.get);
  }

  private sequenciaRegistro() {
    this._router.get('/sequencia', GeralSequenciaController.get);
    this._router.get('/sequencia/:nome', GeralSequenciaController.get);
    this._router.post('/sequencia', GeralSequenciaController.post);
    this._router.put('/sequencia', GeralSequenciaController.put);
    this._router.delete('/sequencia', GeralSequenciaController.delete);
  }

  private processoExecutavel() {
    this._router.get('/processoExecutavel', GeralProcessoExecutavelController.get);
    this._router.post('/processoExecutavel', GeralProcessoExecutavelController.post);
    this._router.put('/processoExecutavel/:CodProcessoExecutavel', GeralProcessoExecutavelController.put);
    this._router.delete('/processoExecutavel', GeralProcessoExecutavelController.delete);
  }

  private usuarioConsulta() {
    this._router.get('/usuarios', validateQuery(usuarioConsultaQuerySchema), UsuarioConsultaController.get);
    this._router.post('/usuarios', UsuarioConsultaController.post);
    this._router.put('/usuarios', UsuarioConsultaController.put);
    this._router.delete('/usuarios', UsuarioConsultaController.delete);
  }
}
