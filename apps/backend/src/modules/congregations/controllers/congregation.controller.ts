import { Request, Response, Router } from 'express';
import { CongregationService } from '../services/congregation.service';

const router = Router();
const congregationService = new CongregationService();

// Middleware de autorización básica (reemplazar por RBAC real)
function authorize(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (!user || !['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS'].includes(user.role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

// Crear congregación
router.post('/', authorize, async (req: Request, res: Response) => {
  try {
    const congregation = await congregationService.create(req.body);
    res.status(201).json(congregation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Editar congregación
router.put('/:id', authorize, async (req: Request, res: Response) => {
  try {
    const congregation = await congregationService.update(req.params.id, req.body);
    res.json(congregation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar (soft delete) congregación
router.delete('/:id', authorize, async (req: Request, res: Response) => {
  try {
    await congregationService.softDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Consultar todas las congregaciones (opcionalmente por districtId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { districtId } = req.query;
    const congregations = await congregationService.findAll(districtId as string | undefined);
    res.json(congregations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Consultar congregación por id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const congregation = await congregationService.findById(req.params.id);
    if (!congregation) return res.status(404).json({ message: 'No encontrada' });
    res.json(congregation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;