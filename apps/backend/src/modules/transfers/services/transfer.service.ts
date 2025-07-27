import { Transfer } from '../entities/transfer.entity';
import { CreateTransferDto, UpdateTransferDto } from '../dtos/transfer.dto';

export class TransferService {
  private transfers: Transfer[] = [];

  // Registrar traslado de asignación
  create(dto: CreateTransferDto): Transfer {
    // TODO: Validar que todas las prácticas activas del estudiante se trasladen juntas
    const now = new Date();
    const transfer = new Transfer();
    transfer.id = (Math.random() * 1e18).toString(36);
    transfer.asignacion_id = dto.asignacion_id;
    transfer.centro_nuevo_id = dto.centro_nuevo_id;
    transfer.motivo = dto.motivo;
    transfer.usuario_responsable = dto.usuario_responsable;
    transfer.fecha = dto.fecha instanceof Date ? dto.fecha : new Date(dto.fecha);
    transfer.centro_anterior_id = ''; // Se debe obtener del Assignment original
    transfer.fecha_creacion = now;
    transfer.fecha_actualizacion = now;
    this.transfers.push(transfer);
    return transfer;
  }

  // Actualizar traslado (motivo, usuario o fecha)
  update(id: string, dto: UpdateTransferDto): Transfer {
    const transfer = this.transfers.find(t => t.id === id);
    if (!transfer) throw new Error('Traslado no encontrado');
    if (dto.motivo) transfer.motivo = dto.motivo;
    if (dto.usuario_responsable) transfer.usuario_responsable = dto.usuario_responsable;
    if (dto.fecha) transfer.fecha = dto.fecha instanceof Date ? dto.fecha : new Date(dto.fecha);
    transfer.fecha_actualizacion = new Date();
    return transfer;
  }

  // Historial de traslados por asignación
  findByAssignment(asignacion_id: string): Transfer[] {
    return this.transfers.filter(t => t.asignacion_id === asignacion_id);
  }
}