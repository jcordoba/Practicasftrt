import { Router } from 'express';
import associationRouter from '../modules/associations/controllers/association.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';

const router = Router();

router.use(jwtMiddleware);
router.use('/', associationRouter);

export default router;