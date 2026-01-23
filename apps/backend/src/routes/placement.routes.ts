// Rutas para el módulo de Asignaciones (Placements)
import { Router } from 'express';
import { PlacementController } from '../modules/placements/controllers/placement.controller';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { rbacMiddleware } from '../modules/auth/middlewares/rbac.guard';

const router = Router();
const placementController = new PlacementController();

// Todas las rutas requieren autenticación JWT
router.use(jwtMiddleware);

/**
 * GET /api/placements/stats - Obtener estadísticas de asignaciones
 * Accesible para coordinadores y administradores
 */
router.get(
  '/stats',
  rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']),
  (req, res) => placementController.getStats(req, res),
);

/**
 * GET /api/placements/student/:studentId - Obtener asignaciones de un estudiante
 * Accesible para todos los roles autenticados
 */
router.get('/student/:studentId', (req, res) => placementController.findByStudent(req, res));

/**
 * GET /api/placements - Obtener todas las asignaciones con filtros
 * Accesible para todos los roles autenticados
 */
router.get('/', (req, res) => placementController.findAll(req, res));

/**
 * GET /api/placements/:id - Obtener una asignación por ID
 * Accesible para todos los roles autenticados
 */
router.get('/:id', (req, res) => placementController.findById(req, res));

/**
 * POST /api/placements - Crear una nueva asignación
 * Solo coordinadores y administradores
 */
router.post('/', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req, res) =>
  placementController.create(req, res),
);

/**
 * PUT /api/placements/:id - Actualizar una asignación
 * Solo coordinadores y administradores
 */
router.put('/:id', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req, res) =>
  placementController.update(req, res),
);

/**
 * PATCH /api/placements/:id/cancel - Cancelar una asignación
 * Solo coordinadores y administradores
 */
router.patch(
  '/:id/cancel',
  rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']),
  (req, res) => placementController.cancel(req, res),
);

export default router;
