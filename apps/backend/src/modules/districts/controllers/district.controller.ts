import { Request, Response, Router } from 'express';
import { DistrictService } from '../services/district.service';

const router = Router();
const districtService = new DistrictService();

// Middleware de autorización básica (reemplazar por RBAC real)
function authorize(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (!user || !['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS'].includes(user.role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

// Crear distrito
router.post('/', authorize, (req: Request, res: Response) => {
  try {
    const district = districtService.create(req.body);
    res.status(201).json(district);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Editar distrito
router.put('/:id', authorize, (req: Request, res: Response) => {
  try {
    const district = districtService.update(req.params.id, req.body);
    res.json(district);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar (soft delete) distrito
router.delete('/:id', authorize, (req: Request, res: Response) => {
  try {
    districtService.softDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Consultar todos los distritos (opcionalmente por associationId)
router.get('/', (req: Request, res: Response) => {
  const { associationId } = req.query;
  const districts = districtService.findAll(associationId as string | undefined);
  res.json(districts);
});

// Consultar distrito por id
router.get('/:id', (req: Request, res: Response) => {
  const district = districtService.findById(req.params.id);
  if (!district) return res.status(404).json({ message: 'No encontrado' });
  res.json(district);
});

export default router;