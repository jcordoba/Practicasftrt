import { Request, Response, Router } from 'express';
import { AssociationService } from '../services/association.service';

const router = Router();
const associationService = new AssociationService();

// Crear asociación
router.post('/', async (req: Request, res: Response) => {
  try {
    const association = await associationService.create(req.body);
    res.status(201).json(association);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Editar asociación
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const association = await associationService.update(req.params.id, req.body);
    res.json(association);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Eliminar (soft delete) asociación
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await associationService.softDelete(req.params.id);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Consultar todas las asociaciones (opcionalmente por unionId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { unionId } = req.query;
    const associations = await associationService.findAll(unionId as string | undefined);
    res.json(associations);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Consultar asociación por id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const association = await associationService.findById(req.params.id);
    if (!association) return res.status(404).json({ message: 'No encontrada' });
    res.json(association);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

export default router;
