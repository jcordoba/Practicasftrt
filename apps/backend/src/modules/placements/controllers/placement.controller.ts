// Controller para endpoints de Asignaciones (Placements)
import { Request, Response } from 'express';
import { PlacementService } from '../services/placement.service';
import { CreatePlacementDto, UpdatePlacementDto } from '../dtos/placement.dto';

type PlacementRequest = Request & {
  user?: {
    sub?: string;
    id?: string;
  };
};

export class PlacementController {
  private placementService: PlacementService;

  constructor() {
    this.placementService = new PlacementService();
  }

  /**
   * @swagger
   * /api/placements:
   *   post:
   *     summary: Crear una nueva asignación de estudiante a centro de práctica
   *     tags:
   *       - Asignaciones
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - studentId
   *               - centerId
   *               - termId
   *             properties:
   *               studentId:
   *                 type: string
   *               centerId:
   *                 type: string
   *               termId:
   *                 type: string
   *               tutorId:
   *                 type: string
   *               teacherId:
   *                 type: string
   *               startDate:
   *                 type: string
   *                 format: date
   *               endDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       201:
   *         description: Asignación creada exitosamente
   *       400:
   *         description: Error de validación
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreatePlacementDto = req.body;
      const authReq = req as PlacementRequest;
      const assignedBy = authReq.user?.sub || authReq.user?.id;
      const placement = await this.placementService.create(data, assignedBy);
      res.status(201).json(placement);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/placements:
   *   get:
   *     summary: Obtener todas las asignaciones
   *     tags:
   *       - Asignaciones
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: termId
   *         schema:
   *           type: string
   *       - in: query
   *         name: centerId
   *         schema:
   *           type: string
   *       - in: query
   *         name: studentId
   *         schema:
   *           type: string
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lista de asignaciones
   */
  async findAll(req: Request, res: Response) {
    try {
      const { termId, centerId, studentId, status } = req.query;
      const placements = await this.placementService.findAll({
        termId: termId as string,
        centerId: centerId as string,
        studentId: studentId as string,
        status: status as string,
      });
      res.json(placements);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }

  /**
   * @swagger
   * /api/placements/{id}:
   *   get:
   *     summary: Obtener una asignación por ID
   *     tags:
   *       - Asignaciones
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Detalles de la asignación
   *       404:
   *         description: Asignación no encontrada
   */
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const placement = await this.placementService.findById(id);
      res.json(placement);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(404).json({ message });
    }
  }

  /**
   * @swagger
   * /api/placements/student/{studentId}:
   *   get:
   *     summary: Obtener asignaciones de un estudiante
   *     tags:
   *       - Asignaciones
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: studentId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Historial de asignaciones del estudiante
   */
  async findByStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const placements = await this.placementService.findByStudent(studentId);
      res.json(placements);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }

  /**
   * @swagger
   * /api/placements/{id}:
   *   put:
   *     summary: Actualizar una asignación
   *     tags:
   *       - Asignaciones
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Asignación actualizada
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdatePlacementDto = req.body;
      const placement = await this.placementService.update(id, data);
      res.json(placement);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/placements/{id}/cancel:
   *   patch:
   *     summary: Cancelar una asignación
   *     tags:
   *       - Asignaciones
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Asignación cancelada
   */
  async cancel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const placement = await this.placementService.cancel(id);
      res.json({ message: 'Asignación cancelada exitosamente', placement });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/placements/stats:
   *   get:
   *     summary: Obtener estadísticas de asignaciones
   *     tags:
   *       - Asignaciones
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: termId
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Estadísticas de asignaciones
   */
  async getStats(req: Request, res: Response) {
    try {
      const { termId } = req.query;
      const stats = await this.placementService.getStats({
        termId: termId as string,
      });
      res.json(stats);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }

  /**
   * Get placements for the authenticated user
   */
  async findMy(req: Request, res: Response) {
    try {
      const authReq = req as { user?: { id?: string } };
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const placements = await this.placementService.findByStudent(userId);
      res.json(placements);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }
}
