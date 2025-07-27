import { Request, Response, Router } from 'express';
import { InstitutionService } from '../services/institution.service';

const router = Router();
const institutionService = new InstitutionService();

// Middleware de autorización básica (reemplazar por RBAC real)
function authorize(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (!user || !['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS'].includes(user.role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

// Crear institución
router.post('/', authorize, (req: Request, res: Response) => {
  try {
    const institution = institutionService.create(req.body);
    res.status(201).json(institution);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Editar institución
router.put('/:id', authorize, (req: Request, res: Response) => {
  try {
    const institution = institutionService.update(req.params.id, req.body);
    res.json(institution);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar (soft delete) institución
router.delete('/:id', authorize, (req: Request, res: Response) => {
  try {
    institutionService.softDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Consultar todas las instituciones
router.get('/', (req: Request, res: Response) => {
  const institutions = institutionService.findAll();
  res.json(institutions);
});

// Consultar institución por id
router.get('/:id', (req: Request, res: Response) => {
  const institution = institutionService.findById(req.params.id);
  if (!institution) return res.status(404).json({ message: 'No encontrada' });
  res.json(institution);
});

export default router;