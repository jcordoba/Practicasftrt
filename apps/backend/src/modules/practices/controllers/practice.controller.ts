import { PracticeService } from '../services/practice.service';
import { Request, Response } from 'express';
import { PracticeStatus } from '@prisma/client';

export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  /**
   * @swagger
   * /api/practices:
   *   post:
   *     summary: Crear una nueva práctica
   *     tags:
   *       - Prácticas
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           example: { "name": "Práctica 1", "description": "Descripción", "programId": "progA" }
   *     responses:
   *       201:
   *         description: Práctica creada
   *         content:
   *           application/json:
   *             example: { "id": "pr1", "name": "Práctica 1", "description": "Descripción", "programId": "progA" }
   */
  async create(req: Request, res: Response) {
    try {
      const practice = await this.practiceService.create(req.body);
      res.status(201).json(practice);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear la práctica';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/practices:
   *   get:
   *     summary: Listar prácticas con filtros opcionales
   *     tags:
   *       - Prácticas
   *     parameters:
   *       - in: query
   *         name: programId
   *         schema:
   *           type: string
   *         description: ID del programa académico
   *       - in: query
   *         name: studentId
   *         schema:
   *           type: string
   *         description: ID del estudiante
   *       - in: query
   *         name: tutorId
   *         schema:
   *           type: string
   *         description: ID del tutor
   *       - in: query
   *         name: teacherId
   *         schema:
   *           type: string
   *         description: ID del docente
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
   *         description: Estado de la práctica
   *     responses:
   *       200:
   *         description: Lista de prácticas
   *         content:
   *           application/json:
   *             example: [{ "id": "pr1", "name": "Práctica 1", "programId": "progA", "status": "PENDING" }]
   */
  async findAll(req: Request, res: Response) {
    const { studentId, tutorId, teacherId, status } = req.query;
    const practiceStatus = typeof status === 'string' ? (status as PracticeStatus) : undefined;
    const practices = await this.practiceService.findAll({
      studentId: studentId as string,
      tutorId: tutorId as string,
      teacherId: teacherId as string,
      status: practiceStatus,
    });
    res.json(practices);
  }

  /**
   * Get practices for the authenticated user
   */
  async findMy(req: Request, res: Response) {
    try {
      const authReq = req as { user?: { id?: string } };
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const practices = await this.practiceService.findAll({
        studentId: userId,
      });
      res.json(practices);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener prácticas', error });
    }
  }

  /**
   * Get statistics for the authenticated student
   */
  async getMyStats(req: Request, res: Response) {
    try {
      const authReq = req as { user?: { id?: string } };
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const stats = await this.practiceService.getStudentStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener estadísticas', error });
    }
  }

  /**
   * Get grades for the authenticated student
   */
  async getMyGrades(req: Request, res: Response) {
    try {
      const authReq = req as { user?: { id?: string } };
      const userId = authReq.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      const grades = await this.practiceService.getStudentGrades(userId);
      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener calificaciones', error });
    }
  }

  /**
   * @swagger
   * /api/practices/{id}:
   *   get:
   *     summary: Obtener una práctica por ID
   *     tags:
   *       - Prácticas
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la práctica
   *     responses:
   *       200:
   *         description: Práctica encontrada
   *         content:
   *           application/json:
   *             example: { "id": "pr1", "name": "Práctica 1", "programId": "progA" }
   *       404:
   *         description: Práctica no encontrada
   */
  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const practice = await this.practiceService.findOne(id);
    if (!practice) return res.status(404).json({ message: 'Practice not found' });
    res.json(practice);
  }

  /**
   * @swagger
   * /api/practices/{id}:
   *   put:
   *     summary: Actualizar una práctica
   *     tags:
   *       - Prácticas
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la práctica
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           example: { "name": "Práctica Actualizada" }
   *     responses:
   *       200:
   *         description: Práctica actualizada
   *         content:
   *           application/json:
   *             example: { "id": "pr1", "name": "Práctica Actualizada", "programId": "progA" }
   *       404:
   *         description: Práctica no encontrada
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const practice = await this.practiceService.update(id, req.body);
      if (!practice) return res.status(404).json({ message: 'Practice not found' });
      res.json(practice);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar la práctica';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/practices/{id}:
   *   delete:
   *     summary: Eliminar una práctica
   *     tags:
   *       - Prácticas
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la práctica
   *     responses:
   *       204:
   *         description: Eliminada correctamente
   *       404:
   *         description: Práctica no encontrada
   */
  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const ok = await this.practiceService.remove(id);
    if (!ok) return res.status(404).json({ message: 'Practice not found' });
    res.status(204).send();
  }
}
