import { Router } from 'express';
import CreateLoginAppController from '../controllers/expedicao/create.login.app.controller';
import { validateBody } from '../middleware/validation.middleware';
import { loginAppSchema } from '../validation/login.app.validation';

const router = Router();

router.get('/create-login-app', CreateLoginAppController.get);
router.post('/create-login-app', validateBody(loginAppSchema), CreateLoginAppController.post);
router.put('/create-login-app', CreateLoginAppController.put);
router.delete('/create-login-app', CreateLoginAppController.delete);

export default router;
