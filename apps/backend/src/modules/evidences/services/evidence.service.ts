import { Evidence, EvidenceStatus } from '../entities/evidence.entity';
import { CreateEvidenceSchema, UpdateEvidenceStatusSchema } from '../dtos/evidence.dto';

export class EvidenceService {
  private evidences: Evidence[] = [];

  // Subir evidencia (solo estudiante)
  create(dto: any): Evidence {
    CreateEvidenceSchema.parse(dto);
    const now = new Date();
    const evidence = new Evidence();
    evidence.id = (Math.random() * 1e18).toString(36);
    Object.assign(evidence, dto);
    evidence.estado = 'PENDIENTE';
    evidence.fecha_subida = now;
    evidence.sincronizado = false;
    this.evidences.push(evidence);
    return evidence;
  }

  // Cambiar estado de evidencia (docente o pastor)
  updateStatus(id: string, dto: any): Evidence {
    UpdateEvidenceStatusSchema.parse(dto);
    const evidence = this.evidences.find(e => e.id === id);
    if (!evidence) throw new Error('Evidencia no encontrada');
    evidence.estado = dto.estado;
    evidence.revisado_por = dto.revisado_por;
    evidence.fecha_revision = new Date();
    if (dto.motivo_rechazo) evidence.motivo_rechazo = dto.motivo_rechazo;
    return evidence;
  }

  // Listar evidencias por asignación
  findByAssignment(asignacion_id: string): Evidence[] {
    return this.evidences.filter(e => e.asignacion_id === asignacion_id);
  }

  // Simular sincronización offline
  syncEvidence(id: string): Evidence {
    const evidence = this.evidences.find(e => e.id === id);
    if (!evidence) throw new Error('Evidencia no encontrada');
    evidence.sincronizado = true;
    return evidence;
  }
}