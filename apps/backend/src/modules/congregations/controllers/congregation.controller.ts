import { NextFunction, Request, Response, Router } from 'express';
import { CongregationService } from '../services/congregation.service';

const router = Router();
const congregationService = new CongregationService();

type CongregationAuthUser = {
  role?: string | null;
  roles?: Array<{
    role?: {
      nombre?: string | null;
    } | null;
  }>;
};

type AuthorizedRequest = Request & {
  user?: CongregationAuthUser;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Error desconocido';
}

// Middleware de autorización básica (reemplazar por RBAC real)
function authorize(req: AuthorizedRequest, res: Response, next: NextFunction) {
  const user = req.user;

  const roleNames: string[] = Array.isArray(user?.roles)
    ? user.roles
        .map((userRole) => userRole?.role?.nombre)
        .filter((roleName: unknown): roleName is string => typeof roleName === 'string')
    : [];

  const isAuthorized =
    ['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS'].includes(user?.role) ||
    roleNames.some((roleName) =>
      ['ADMINISTRADOR_TECNICO', 'COORDINADOR_PRACTICAS'].includes(roleName),
    );

  if (!user || !isAuthorized) {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}

// Crear congregación
router.post('/', authorize, async (req: Request, res: Response) => {
  try {
    const congregation = await congregationService.create(req.body);
    res.status(201).json(congregation);
  } catch (error: unknown) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
});

// Editar congregación
router.put('/:id', authorize, async (req: Request, res: Response) => {
  try {
    const congregation = await congregationService.update(req.params.id, req.body);
    res.json(congregation);
  } catch (error: unknown) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
});

// Eliminar (soft delete) congregación
router.delete('/:id', authorize, async (req: Request, res: Response) => {
  try {
    await congregationService.softDelete(req.params.id);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
});

// Consultar todas las congregaciones (opcionalmente por districtId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { districtId } = req.query;
    const congregations = await congregationService.findAll(districtId as string | undefined);
    res.json(congregations);
  } catch (error: unknown) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

// Consultar congregación por id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const congregation = await congregationService.findById(req.params.id);
    if (!congregation) return res.status(404).json({ message: 'No encontrada' });
    res.json(congregation);
  } catch (error: unknown) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
});

export default router;
