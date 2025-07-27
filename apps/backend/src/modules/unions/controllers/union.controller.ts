import { Request, Response, Router } from 'express';
import { UnionService } from '../services/union.service';

const router = Router();
const unionService = new UnionService();

// Middleware de autorización básica (solo ejemplo, reemplazar por RBAC real)
function authorize(req: Request, res: Response, next: Function) {
  const user = req.user as any;
  if (!user || !['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS'].includes(user.role)) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

// Crear unión
router.post('/', authorize, (req: Request, res: Response) => {
  try {
    const union = unionService.create(req.body);
    res.status(201).json(union);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Editar unión
router.put('/:id', authorize, (req: Request, res: Response) => {
  try {
    const union = unionService.update(req.params.id, req.body);
    res.json(union);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Desactivar unión (soft delete)
router.delete('/:id', authorize, (req: Request, res: Response) => {
  try {
    const union = unionService.softDelete(req.params.id);
    res.json(union);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Consultar uniones (GET, acceso abierto a autenticados)
router.get('/', (req: Request, res: Response) => {
  const { estado, nombre } = req.query;
  const result = unionService.findAll({
    estado: estado as 'ACTIVO' | 'INACTIVO',
    nombre: nombre as string
  });
  res.json(result);
});

// Consultar unión por ID
router.get('/:id', (req: Request, res: Response) => {
  const union = unionService.findById(req.params.id);
  if (!union) return res.status(404).json({ message: 'No encontrada' });
  res.json(union);
});

export default router;