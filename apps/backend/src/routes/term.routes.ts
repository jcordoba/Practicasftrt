// Rutas para el módulo de Términos Académicos
import { Router } from 'express';
import { TermController } from '../modules/terms/controllers/term.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { rbacMiddleware } from '../modules/auth/middlewares/rbac.guard';

const router = Router();
const termController = new TermController();

// Todas las rutas requieren autenticación JWT
router.use(jwtMiddleware);

/**
 * GET /api/terms - Obtener todos los términos
 * Accesible para todos los roles autenticados
 */
router.get('/', (req, res) => termController.findAll(req, res));

/**
 * GET /api/terms/active - Obtener el término activo actual
 * Accesible para todos los roles autenticados
 */
router.get('/active', (req, res) => termController.getActiveTerm(req, res));

/**
 * GET /api/terms/:id - Obtener un término por ID
 * Accesible para todos los roles autenticados
 */
router.get('/:id', (req, res) => termController.findById(req, res));

/**
 * GET /api/terms/:id/stats - Obtener estadísticas de un término
 * Accesible para coordinadores y administradores
 */
router.get(
  '/:id/stats',
  rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']),
  (req, res) => termController.getStats(req, res),
);

/**
 * POST /api/terms - Crear un nuevo término
 * Solo coordinadores y administradores
 */
router.post('/', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req, res) =>
  termController.create(req, res),
);

/**
 * PUT /api/terms/:id - Actualizar un término
 * Solo coordinadores y administradores
 */
router.put('/:id', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req, res) =>
  termController.update(req, res),
);

/**
 * PATCH /api/terms/:id/activate - Marcar un término como activo
 * Solo coordinadores y administradores
 */
router.patch(
  '/:id/activate',
  rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']),
  (req, res) => termController.setActive(req, res),
);

/**
 * PATCH /api/terms/:id/status - Cambiar el estado de un término
 * Solo coordinadores y administradores
 */
router.patch(
  '/:id/status',
  rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']),
  (req, res) => termController.changeStatus(req, res),
);

export default router;
