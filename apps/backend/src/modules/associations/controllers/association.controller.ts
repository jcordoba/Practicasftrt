import { Request, Response, Router } from 'express';
import { AssociationService } from '../services/association.service';

const router = Router();
const associationService = new AssociationService();

// Middleware de autorización básica (reemplazar por RBAC real)
function authorize(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (!user || !['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS'].includes(user.role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

// Crear asociación
router.post('/', authorize, (req: Request, res: Response) => {
  try {
    const association = associationService.create(req.body);
    res.status(201).json(association);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Editar asociación
router.put('/:id', authorize, (req: Request, res: Response) => {
  try {
    const association = associationService.update(req.params.id, req.body);
    res.json(association);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Eliminar (soft delete) asociación
router.delete('/:id', authorize, (req: Request, res: Response) => {
  try {
    associationService.softDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Consultar todas las asociaciones (opcionalmente por unionId)
router.get('/', (req: Request, res: Response) => {
  const { unionId } = req.query;
  const associations = associationService.findAll(unionId as string | undefined);
  res.json(associations);
});

// Consultar asociación por id
router.get('/:id', (req: Request, res: Response) => {
  const association = associationService.findById(req.params.id);
  if (!association) return res.status(404).json({ message: 'No encontrada' });
  res.json(association);
});

export default router;