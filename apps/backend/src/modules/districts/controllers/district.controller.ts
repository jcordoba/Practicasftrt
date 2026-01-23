import { Request, Response, Router } from 'express';
import { DistrictService } from '../services/district.service';

const router = Router();
const districtService = new DistrictService();

// Crear distrito
router.post('/', async (req: Request, res: Response) => {
  try {
    const district = await districtService.create(req.body);
    res.status(201).json(district);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Editar distrito
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const district = await districtService.update(req.params.id, req.body);
    res.json(district);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Eliminar (soft delete) distrito
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await districtService.softDelete(req.params.id);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Consultar todos los distritos (opcionalmente por associationId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { associationId } = req.query;
    const districts = await districtService.findAll(associationId as string | undefined);
    res.json(districts);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

// Consultar distrito por id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const district = await districtService.findById(req.params.id);
    if (!district) return res.status(404).json({ message: 'No encontrado' });
    res.json(district);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Error desconocido' });
  }
});

export default router;
