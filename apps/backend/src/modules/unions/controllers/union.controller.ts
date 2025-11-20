import { Request, Response, Router } from 'express';
import { UnionService } from '../services/union.service';

const router = Router();
const unionService = new UnionService();

// Crear unión
router.post('/', async (req: Request, res: Response) => {
  try {
    const union = await unionService.create(req.body);
    res.status(201).json(union);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Editar unión
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const union = await unionService.update(req.params.id, req.body);
    res.json(union);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Desactivar unión (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const union = await unionService.softDelete(req.params.id);
    res.json(union);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Consultar uniones (GET, acceso abierto a autenticados)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { estado, nombre } = req.query;
    const result = await unionService.findAll({
      estado: estado as 'ACTIVO' | 'INACTIVO',
      nombre: nombre as string,
    });
    res.json(result);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Consultar unión por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const union = await unionService.findById(req.params.id);
    if (!union) return res.status(404).json({ message: 'No encontrada' });
    res.json(union);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

export default router;
