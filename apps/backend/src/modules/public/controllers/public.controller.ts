import { Request, Response } from 'express';
import { PublicService } from '../services/public.service';

const API_KEY = process.env.PUBLIC_API_KEY || 'changeme';

function checkApiKey(req: Request, res: Response): boolean {
  const key = req.headers['x-api-key'];
  if (key !== API_KEY) {
    res.status(401).json({ message: 'Unauthorized' });
    return false;
  }
  return true;
}

export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * @swagger
   * /api/public/assignments:
   *   get:
   *     summary: Obtener asignaciones públicas filtradas por programa
   *     tags:
   *       - Público
   *     parameters:
   *       - in: query
   *         name: programId
   *         schema:
   *           type: string
   *         description: ID del programa académico
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: Lista de asignaciones
   *         content:
   *           application/json:
   *             example: [{ "id": "1", "nombre": "Asignación 1", "programId": "progA" }]
   */
  async getAssignments(req: Request, res: Response) {
    if (!checkApiKey(req, res)) return;
    const { programId } = req.query;
    const data = await this.publicService.getAssignments(programId as string);
    res.json(data);
  }

  /**
   * @swagger
   * /api/public/students:
   *   get:
   *     summary: Obtener estudiantes públicos filtrados por programa
   *     tags:
   *       - Público
   *     parameters:
   *       - in: query
   *         name: programId
   *         schema:
   *           type: string
   *         description: ID del programa académico
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: Lista de estudiantes
   *         content:
   *           application/json:
   *             example: [{ "id": "stu1", "nombre": "Estudiante 1", "programId": "progA" }]
   */
  async getStudents(req: Request, res: Response) {
    if (!checkApiKey(req, res)) return;
    const { programId } = req.query;
    const data = await this.publicService.getStudents(programId as string);
    res.json(data);
  }

  /**
   * @swagger
   * /api/public/practices:
   *   get:
   *     summary: Obtener prácticas públicas filtradas por programa
   *     tags:
   *       - Público
   *     parameters:
   *       - in: query
   *         name: programId
   *         schema:
   *           type: string
   *         description: ID del programa académico
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: Lista de prácticas
   *         content:
   *           application/json:
   *             example: [{ "id": "pr1", "nombre": "Práctica 1", "programId": "progA" }]
   */
  async getPractices(req: Request, res: Response) {
    if (!checkApiKey(req, res)) return;
    const { programId } = req.query;
    const data = await this.publicService.getPractices(programId as string);
    res.json(data);
  }
}