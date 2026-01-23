import { Router } from 'express';
import districtRouter from '../modules/districts/controllers/district.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { roleGuard } from '../middleware/role.guard';

const router = Router();

// Apply JWT authentication to all district routes
router.use(jwtMiddleware);

// Apply role-based authorization for sensitive operations
const adminOrCoordinatorGuard = roleGuard(['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS']);

// Apply the role guard to routes that modify data
router.post('/', adminOrCoordinatorGuard, districtRouter);
router.put('/:id', adminOrCoordinatorGuard, districtRouter);
router.delete('/:id', adminOrCoordinatorGuard, districtRouter);

// Public routes (read-only operations for authenticated users)
router.get('/', districtRouter);
router.get('/:id', districtRouter);

export default router;
