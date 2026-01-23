// Controller para endpoints de Términos Académicos
import { Request, Response } from 'express';
import { TermService } from '../services/term.service';
import { CreateTermDto, UpdateTermDto } from '../dtos/term.dto';

export class TermController {
  private termService: TermService;

  constructor() {
    this.termService = new TermService();
  }

  /**
   * @swagger
   * /api/terms:
   *   post:
   *     summary: Crear un nuevo término académico
   *     tags:
   *       - Términos
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - academicYear
   *               - academicPeriod
   *               - startDate
   *               - endDate
   *             properties:
   *               name:
   *                 type: string
   *                 example: "2025-1"
   *               academicYear:
   *                 type: integer
   *                 example: 2025
   *               academicPeriod:
   *                 type: integer
   *                 example: 1
   *               startDate:
   *                 type: string
   *                 format: date
   *                 example: "2025-02-01"
   *               endDate:
   *                 type: string
   *                 format: date
   *                 example: "2025-06-30"
   *               status:
   *                 type: string
   *                 enum: [ACTIVE, INACTIVE, COMPLETED]
   *     responses:
   *       201:
   *         description: Término creado exitosamente
   *       400:
   *         description: Error de validación
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateTermDto = req.body;
      const term = await this.termService.create(data);
      res.status(201).json(term);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/terms:
   *   get:
   *     summary: Obtener todos los términos académicos
   *     tags:
   *       - Términos
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: academicYear
   *         schema:
   *           type: integer
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ACTIVE, INACTIVE, COMPLETED]
   *     responses:
   *       200:
   *         description: Lista de términos
   */
  async findAll(req: Request, res: Response) {
    try {
      const { academicYear, status } = req.query;
      const terms = await this.termService.findAll({
        academicYear: academicYear ? parseInt(academicYear as string) : undefined,
        status: status as string,
      });
      res.json(terms);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }

  /**
   * @swagger
   * /api/terms/active:
   *   get:
   *     summary: Obtener el término activo actual
   *     tags:
   *       - Términos
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Término activo
   *       404:
   *         description: No hay término activo
   */
  async getActiveTerm(req: Request, res: Response) {
    try {
      const term = await this.termService.getActiveTerm();
      if (!term) {
        return res.status(404).json({ message: 'No hay término académico activo' });
      }
      res.json(term);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }

  /**
   * @swagger
   * /api/terms/{id}:
   *   get:
   *     summary: Obtener un término por ID
   *     tags:
   *       - Términos
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
   *         description: Detalles del término
   *       404:
   *         description: Término no encontrado
   */
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const term = await this.termService.findById(id);
      res.json(term);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(404).json({ message });
    }
  }

  /**
   * @swagger
   * /api/terms/{id}/stats:
   *   get:
   *     summary: Obtener estadísticas de un término
   *     tags:
   *       - Términos
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
   *         description: Estadísticas del término
   */
  async getStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stats = await this.termService.getTermStats(id);
      res.json(stats);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(404).json({ message });
    }
  }

  /**
   * @swagger
   * /api/terms/{id}:
   *   put:
   *     summary: Actualizar un término
   *     tags:
   *       - Términos
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
   *         description: Término actualizado
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateTermDto = req.body;
      const term = await this.termService.update(id, data);
      res.json(term);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/terms/{id}/activate:
   *   patch:
   *     summary: Marcar un término como activo
   *     tags:
   *       - Términos
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
   *         description: Término activado
   */
  async setActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const term = await this.termService.setActive(id);
      res.json({ message: 'Término activado exitosamente', term });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/terms/{id}/status:
   *   patch:
   *     summary: Cambiar el estado de un término
   *     tags:
   *       - Términos
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [ACTIVE, INACTIVE, COMPLETED]
   *     responses:
   *       200:
   *         description: Estado actualizado
   */
  async changeStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const term = await this.termService.changeStatus(id, status);
      res.json({ message: 'Estado actualizado exitosamente', term });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }
}
