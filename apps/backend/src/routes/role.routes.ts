import { Router } from 'express';
import { 
  getAllRoles, 
  seedRoles
} from '../modules/roles/controllers/role.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { rbacMiddleware } from '../modules/auth/middlewares/rbac.guard';

const router = Router();

// Rutas protegidas que requieren autenticación
router.use(jwtMiddleware);

// [AUTHENTICATED] Obtener todos los roles
router.get('/', getAllRoles);

// [ADMIN] Sembrar roles predeterminados
router.post('/seed', rbacMiddleware(['ADMIN_TECNICO']), seedRoles);

export default router;