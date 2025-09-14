import { Router } from 'express';
import { 
  getAllUsers, 
  getMyProfile, 
  createUser, 
  updateUser, 
  assignRoles,
  getUserRoles,
  getUserPermissions,
  getMyRoles,
  getMyPermissions,
  checkMyPermission,
  checkMyRole,
  activateDeactivateUser
} from '../modules/users/controllers/user.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { roleGuard } from '../middleware/role.guard';
import { rbacMiddleware } from '../modules/auth/middlewares/rbac.guard';

const router = Router();

// Rutas protegidas que requieren autenticación
router.use(jwtMiddleware);

// [AUTHENTICATED] Obtener mi perfil
router.get('/profile', getMyProfile);

// [AUTHENTICATED] Obtener mis roles
router.get('/me/roles', getMyRoles);

// [AUTHENTICATED] Obtener mis permisos
router.get('/me/permissions', getMyPermissions);

// [AUTHENTICATED] Verificar si tengo un permiso específico
router.get('/me/permissions/:permission/check', checkMyPermission);

// [AUTHENTICATED] Verificar si tengo un rol específico
router.get('/me/roles/:role/check', checkMyRole);

// [AUTHENTICATED] Obtener roles de un usuario específico
router.get('/:id/roles', getUserRoles);

// [AUTHENTICATED] Obtener permisos de un usuario específico
router.get('/:id/permissions', getUserPermissions);

// Rutas protegidas que requieren autenticación y rol de COORDINATOR, ADMIN o ADMIN_TECNICO
const adminOrCoordinator = roleGuard(['COORDINATOR', 'ADMIN', 'ADMIN_TECNICO']);

router.get('/', adminOrCoordinator, getAllUsers);
router.post('/', rbacMiddleware(['ADMIN_TECNICO']), createUser);
router.put('/:id', adminOrCoordinator, updateUser);
router.post('/:id/roles', rbacMiddleware(['ADMIN_TECNICO']), assignRoles);
router.patch('/:id/activate', rbacMiddleware(['ADMIN_TECNICO']), activateDeactivateUser);

export default router;