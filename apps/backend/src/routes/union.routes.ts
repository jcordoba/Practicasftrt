import { Router } from 'express';
import unionRouter from '../modules/unions/controllers/union.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';

const router = Router();

// Proteger todas las rutas con JWT
router.use(jwtMiddleware);

router.use('/', unionRouter);

export default router;