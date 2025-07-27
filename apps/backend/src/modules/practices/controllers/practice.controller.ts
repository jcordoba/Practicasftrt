import { PracticeService } from '../services/practice.service';
import { Request, Response } from 'express';

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
    const practice = await this.practiceService.create(req.body);
    res.status(201).json(practice);
  }

  /**
   * @swagger
   * /api/practices:
   *   get:
   *     summary: Listar prácticas (opcional filtro por programId)
   *     tags:
   *       - Prácticas
   *     parameters:
   *       - in: query
   *         name: programId
   *         schema:
   *           type: string
   *         description: ID del programa académico
   *     responses:
   *       200:
   *         description: Lista de prácticas
   *         content:
   *           application/json:
   *             example: [{ "id": "pr1", "name": "Práctica 1", "programId": "progA" }]
   */
  async findAll(req: Request, res: Response) {
    const { programId } = req.query;
    const practices = await this.practiceService.findAll({ programId: programId as string });
    res.json(practices);
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
    const { id } = req.params;
    const practice = await this.practiceService.update(id, req.body);
    if (!practice) return res.status(404).json({ message: 'Practice not found' });
    res.json(practice);
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