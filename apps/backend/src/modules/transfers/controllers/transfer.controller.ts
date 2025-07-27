import { TransferService } from '../services/transfer.service';
import { CreateTransferSchema, UpdateTransferSchema } from '../dtos/transfer.dto';

const transferService = new TransferService();

// Simulación de middleware de autenticación y roles
function requireRole(roles: string[], userRole: string) {
  if (!roles.includes(userRole)) throw new Error('No autorizado');
}

// Registrar traslado (solo coordinador)
export function createTransfer(req: any, res: any) {
  try {
    requireRole(['COORDINADOR'], req.user.role);
    const parsed = CreateTransferSchema.parse(req.body);
    const transfer = transferService.create(parsed);
    res.status(201).json(transfer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Actualizar traslado (solo coordinador)
export function updateTransfer(req: any, res: any) {
  try {
    requireRole(['COORDINADOR'], req.user.role);
    const parsed = UpdateTransferSchema.parse(req.body);
    const transfer = transferService.update(req.params.id, parsed);
    res.json(transfer);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Listar traslados por asignación (coordinador, docente, autenticado)
export function listTransfersByAssignment(req: any, res: any) {
  try {
    // Todos los autenticados pueden consultar
    const transfers = transferService.findByAssignment(req.params.asignacion_id);
    res.json(transfers);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}