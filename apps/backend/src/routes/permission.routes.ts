import { Router } from 'express';
import { 
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  seedPermissions,
  getMyPermissions
} from '../modules/permissions/controllers/permission.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { rbacMiddleware } from '../modules/auth/middlewares/rbac.guard';

const router = Router();

// Rutas protegidas que requieren autenticación
router.use(jwtMiddleware);

// [AUTHENTICATED] Obtener todos los permisos
router.get('/', getAllPermissions);

// [AUTHENTICATED] Obtener un permiso por ID
router.get('/:id', getPermissionById);

// [ADMIN] Crear un nuevo permiso
router.post('/', rbacMiddleware(['ADMIN_TECNICO']), createPermission);

// [ADMIN] Actualizar un permiso
router.put('/:id', rbacMiddleware(['ADMIN_TECNICO']), updatePermission);

// [ADMIN] Eliminar un permiso
router.delete('/:id', rbacMiddleware(['ADMIN_TECNICO']), deletePermission);

// [AUTHENTICATED] Obtener permisos del usuario actual
router.get('/user/me', getMyPermissions);

// [ADMIN] Sembrar permisos predeterminados
router.post('/seed', rbacMiddleware(['ADMIN_TECNICO']), seedPermissions);

export default router;