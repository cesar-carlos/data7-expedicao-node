import { Router } from 'express';

import { validateQuery } from '../middleware/validation.middleware';
import { usuarioConsultaQuerySchema } from '../validation/usuario.consulta.validation';
import UsuarioConsultaController from '../controllers/geral/usuario.consulta.controller';

const usuarioConsultaRoute = Router();

usuarioConsultaRoute.get('/usuarios', validateQuery(usuarioConsultaQuerySchema), UsuarioConsultaController.get);

// usuarioConsultaRoute.post('/usuarios', UsuarioConsultaController.post);
// usuarioConsultaRoute.put('/usuarios', UsuarioConsultaController.put);
usuarioConsultaRoute.delete('/usuarios', UsuarioConsultaController.delete);

export default usuarioConsultaRoute;
