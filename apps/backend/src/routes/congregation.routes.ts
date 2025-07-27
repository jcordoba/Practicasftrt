import { Router } from 'express';
import congregationRouter from '../modules/congregations/controllers/congregation.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';

const router = Router();

router.use(jwtMiddleware);
router.use('/', congregationRouter);

export default router;