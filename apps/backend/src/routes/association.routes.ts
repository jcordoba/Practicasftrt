import { Router } from 'express';
import associationRouter from '../modules/associations/controllers/association.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

// Apply JWT authentication to all association routes
router.use(jwtMiddleware);

// Apply role-based authorization for sensitive operations
const adminOrCoordinatorGuard = roleGuard(['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS']);

// Apply the role guard to routes that modify data
router.post('/', adminOrCoordinatorGuard, associationRouter);
router.put('/:id', adminOrCoordinatorGuard, associationRouter);
router.delete('/:id', adminOrCoordinatorGuard, associationRouter);

// Public routes (read-only operations)
router.get('/', associationRouter);
router.get('/:id', associationRouter);

export default router;
