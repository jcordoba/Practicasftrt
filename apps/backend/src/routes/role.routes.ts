import { Router } from 'express';
import { 
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  getRolePermissions,
  seedRoles
} from '../modules/roles/controllers/role.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { rbacMiddleware } from '../modules/auth/middlewares/rbac.guard';

const router = Router();

// Rutas protegidas que requieren autenticación
router.use(jwtMiddleware);

// [AUTHENTICATED] Obtener todos los roles
router.get('/', getAllRoles);

// [AUTHENTICATED] Obtener un rol por ID
router.get('/:id', getRoleById);

// [ADMIN] Crear un nuevo rol
router.post('/', rbacMiddleware(['ADMIN_TECNICO']), createRole);

// [ADMIN] Actualizar un rol
router.put('/:id', rbacMiddleware(['ADMIN_TECNICO']), updateRole);

// [ADMIN] Eliminar un rol
router.delete('/:id', rbacMiddleware(['ADMIN_TECNICO']), deleteRole);

// [ADMIN] Asignar permisos a un rol
router.post('/:id/permissions', rbacMiddleware(['ADMIN_TECNICO']), assignPermissions);

// [AUTHENTICATED] Obtener permisos de un rol
router.get('/:id/permissions', getRolePermissions);

// [ADMIN] Sembrar roles predeterminados
router.post('/seed', rbacMiddleware(['ADMIN_TECNICO']), seedRoles);

export default router;