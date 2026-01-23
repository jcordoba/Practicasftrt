// Controller para endpoints de Centros de Práctica
import { Request, Response } from 'express';
import { CenterService } from '../services/center.service';
import { CreateCenterDto, UpdateCenterDto } from '../dtos/center.dto';

export class CenterController {
  private centerService: CenterService;

  constructor() {
    this.centerService = new CenterService();
  }

  /**
   * @swagger
   * /api/centers:
   *   post:
   *     summary: Crear un nuevo centro de práctica
   *     tags:
   *       - Centros
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre
   *               - tipo
   *             properties:
   *               nombre:
   *                 type: string
   *               tipo:
   *                 type: string
   *                 enum: [congregacion, institucion]
   *               congregationId:
   *                 type: string
   *               institutionId:
   *                 type: string
   *               direccion:
   *                 type: string
   *               ciudad:
   *                 type: string
   *               telefono:
   *                 type: string
   *               correoContacto:
   *                 type: string
   *               nombreContacto:
   *                 type: string
   *               capacidadMaxima:
   *                 type: integer
   *               observaciones:
   *                 type: string
   *     responses:
   *       201:
   *         description: Centro creado exitosamente
   *       400:
   *         description: Error de validación
   *       401:
   *         description: No autorizado
   */
  async create(req: Request, res: Response) {
    try {
      const data: CreateCenterDto = req.body;
      const center = await this.centerService.create(data);
      res.status(201).json(center);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/centers:
   *   get:
   *     summary: Obtener todos los centros de práctica
   *     tags:
   *       - Centros
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: tipo
   *         schema:
   *           type: string
   *           enum: [congregacion, institucion]
   *       - in: query
   *         name: ciudad
   *         schema:
   *           type: string
   *       - in: query
   *         name: estado
   *         schema:
   *           type: string
   *           enum: [ACTIVO, INACTIVO]
   *     responses:
   *       200:
   *         description: Lista de centros
   */
  async findAll(req: Request, res: Response) {
    try {
      const { tipo, ciudad, estado } = req.query;
      const centers = await this.centerService.findAll({
        tipo: tipo as string,
        ciudad: ciudad as string,
        estado: estado as string,
      });
      res.json(centers);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }

  /**
   * @swagger
   * /api/centers/available:
   *   get:
   *     summary: Obtener centros con capacidad disponible
   *     tags:
   *       - Centros
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Lista de centros disponibles
   */
  async findAvailable(req: Request, res: Response) {
    try {
      const centers = await this.centerService.findAvailable();
      res.json(centers);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message });
    }
  }

  /**
   * @swagger
   * /api/centers/{id}:
   *   get:
   *     summary: Obtener un centro por ID
   *     tags:
   *       - Centros
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
   *         description: Detalles del centro
   *       404:
   *         description: Centro no encontrado
   */
  async findById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const center = await this.centerService.findById(id);
      res.json(center);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(404).json({ message });
    }
  }

  /**
   * @swagger
   * /api/centers/{id}:
   *   put:
   *     summary: Actualizar un centro
   *     tags:
   *       - Centros
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
   *     responses:
   *       200:
   *         description: Centro actualizado
   *       404:
   *         description: Centro no encontrado
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateCenterDto = req.body;
      const center = await this.centerService.update(id, data);
      res.json(center);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }

  /**
   * @swagger
   * /api/centers/{id}:
   *   delete:
   *     summary: Desactivar un centro (soft delete)
   *     tags:
   *       - Centros
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
   *         description: Centro desactivado
   *       400:
   *         description: Error (tiene estudiantes asignados)
   */
  async softDelete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const center = await this.centerService.softDelete(id);
      res.json({ message: 'Centro desactivado exitosamente', center });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(400).json({ message });
    }
  }
}
