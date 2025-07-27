import { Router } from 'express';
import institutionRouter from '../modules/institutions/controllers/institution.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';

const router = Router();

router.use(jwtMiddleware);
router.use('/', institutionRouter);

export default router;