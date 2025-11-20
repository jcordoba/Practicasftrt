import { Router } from 'express';
import unionRouter from '../modules/unions/controllers/union.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

// Apply JWT authentication to all union routes
router.use(jwtMiddleware);

// Apply role-based authorization for sensitive operations
const adminOrCoordinatorGuard = roleGuard(['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS']);

// Apply the role guard to routes that modify data
router.post('/', adminOrCoordinatorGuard, unionRouter);
router.put('/:id', adminOrCoordinatorGuard, unionRouter);
router.delete('/:id', adminOrCoordinatorGuard, unionRouter);

// Public routes (read-only operations for authenticated users)
router.get('/', unionRouter);
router.get('/:id', unionRouter);

export default router;
