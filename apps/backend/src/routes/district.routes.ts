import { Router } from 'express';
import districtRouter from '../modules/districts/controllers/district.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';

const router = Router();

router.use(jwtMiddleware);
router.use('/', districtRouter);

export default router;