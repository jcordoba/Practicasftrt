// Rutas para el módulo de Centros de Práctica
import { Router } from 'express';
import { CenterController } from '../modules/centers/controllers/center.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { rbacMiddleware } from '../modules/auth/middlewares/rbac.guard';

const router = Router();
const centerController = new CenterController();

// Aplicar middleware de autenticación a todas las rutas
router.use(jwtMiddleware);

// Rutas públicas para ver centros (todos los roles autenticados)
router.get('/', (req, res) => centerController.findAll(req, res));
router.get('/available', (req, res) => centerController.findAvailable(req, res));
router.get('/:id', (req, res) => centerController.findById(req, res));

// Rutas protegidas solo para coordinadores y administradores
router.post('/', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req, res) =>
  centerController.create(req, res),
);

router.put('/:id', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req, res) =>
  centerController.update(req, res),
);

router.delete(
  '/:id',
  rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']),
  (req, res) => centerController.softDelete(req, res),
);

export default router;
