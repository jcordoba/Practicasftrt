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
router.post('/', authorize, (req: Request, res: Response) => {
  try {
    const congregation = congregationService.create(req.body);
    res.status(201).json(congregation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Editar congregación
router.put('/:id', authorize, (req: Request, res: Response) => {
  try {
    const congregation = congregationService.update(req.params.id, req.body);
    res.json(congregation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar (soft delete) congregación
router.delete('/:id', authorize, (req: Request, res: Response) => {
  try {
    congregationService.softDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Consultar todas las congregaciones (opcionalmente por districtId)
router.get('/', (req: Request, res: Response) => {
  const { districtId } = req.query;
  const congregations = congregationService.findAll(districtId as string | undefined);
  res.json(congregations);
});

// Consultar congregación por id
router.get('/:id', (req: Request, res: Response) => {
  const congregation = congregationService.findById(req.params.id);
  if (!congregation) return res.status(404).json({ message: 'No encontrada' });
  res.json(congregation);
});

export default router;