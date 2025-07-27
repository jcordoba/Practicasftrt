import { ProgramService } from '../services/program.service';
import { Request, Response } from 'express';

export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  /**
   * @swagger
   * /api/programs:
   *   post:
   *     summary: Crear un nuevo programa académico
   *     tags:
   *       - Programas
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           example: { "name": "Ingeniería", "code": "ING", "description": "Programa de Ingeniería" }
   *     responses:
   *       201:
   *         description: Programa creado
   *         content:
   *           application/json:
   *             example: { "id": "1", "name": "Ingeniería", "code": "ING", "description": "Programa de Ingeniería" }
   */
  async create(req: Request, res: Response) {
    const program = await this.programService.create(req.body);
    res.status(201).json(program);
  }

  /**
   * @swagger
   * /api/programs:
   *   get:
   *     summary: Listar programas académicos (opcional filtro por programId)
   *     tags:
   *       - Programas
   *     parameters:
   *       - in: query
   *         name: programId
   *         schema:
   *           type: string
   *         description: ID del programa académico
   *     responses:
   *       200:
   *         description: Lista de programas
   *         content:
   *           application/json:
   *             example: [{ "id": "1", "name": "Ingeniería", "code": "ING" }]
   */
  async findAll(req: Request, res: Response) {
    const { programId } = req.query;
    const programs = await this.programService.findAll({ programId: programId as string });
    res.json(programs);
  }

  /**
   * @swagger
   * /api/programs/{id}:
   *   get:
   *     summary: Obtener un programa académico por ID
   *     tags:
   *       - Programas
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del programa
   *     responses:
   *       200:
   *         description: Programa encontrado
   *         content:
   *           application/json:
   *             example: { "id": "1", "name": "Ingeniería", "code": "ING" }
   *       404:
   *         description: Programa no encontrado
   */
  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const program = await this.programService.findOne(id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  }

  /**
   * @swagger
   * /api/programs/{id}:
   *   put:
   *     summary: Actualizar un programa académico
   *     tags:
   *       - Programas
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del programa
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           example: { "name": "Ingeniería Actualizada" }
   *     responses:
   *       200:
   *         description: Programa actualizado
   *         content:
   *           application/json:
   *             example: { "id": "1", "name": "Ingeniería Actualizada", "code": "ING" }
   *       404:
   *         description: Programa no encontrado
   */
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const program = await this.programService.update(id, req.body);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  }

  /**
   * @swagger
   * /api/programs/{id}:
   *   delete:
   *     summary: Eliminar un programa académico
   *     tags:
   *       - Programas
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID del programa
   *     responses:
   *       204:
   *         description: Eliminado correctamente
   *       404:
   *         description: Programa no encontrado
   */
  async remove(req: Request, res: Response) {
    const { id } = req.params;
    const ok = await this.programService.remove(id);
    if (!ok) return res.status(404).json({ message: 'Program not found' });
    res.status(204).send();
  }
}