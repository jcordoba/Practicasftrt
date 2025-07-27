import { Router } from 'express';
import { 
  getAllUsers, 
  getMyProfile, 
  createUser, 
  updateUser, 
  assignRoles,
  activateDeactivateUser
} from '../modules/users/controllers/user.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { roleGuard } from '../../../middleware/role.guard';

const router = Router();

// Rutas protegidas que requieren autenticación
router.use(jwtMiddleware);

// [AUTHENTICATED] Obtener mi perfil
router.get('/profile', getMyProfile);

// Rutas protegidas que requieren autenticación y rol de COORDINATOR o ADMIN
const adminOrCoordinator = roleGuard(['COORDINATOR', 'ADMIN']);

router.get('/', adminOrCoordinator, getAllUsers);
router.post('/', adminOrCoordinator, createUser);
router.put('/:id', adminOrCoordinator, updateUser);
router.post('/:id/roles', adminOrCoordinator, assignRoles);
router.patch('/:id/activate', adminOrCoordinator, activateDeactivateUser);

export default router;