import { Router } from 'express';
import VersaoAppController from '../controllers/expedicao/versaoapp.controller';
import { validateQuery } from '../middleware/validation.middleware';
import { consultaVersaoAppQuerySchema } from '../validation/consulta.versaoapp.validation';

const router = Router();

// Rota para consultar versões de app
router.get('/versaoapp', validateQuery(consultaVersaoAppQuerySchema), VersaoAppController.get);
router.post('/versaoapp', VersaoAppController.post);
router.put('/versaoapp', VersaoAppController.put);
router.delete('/versaoapp', VersaoAppController.delete);

export default router;
