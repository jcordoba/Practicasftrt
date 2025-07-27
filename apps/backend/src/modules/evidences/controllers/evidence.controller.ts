import { EvidenceService } from '../services/evidence.service';
import { CreateEvidenceSchema, UpdateEvidenceStatusSchema } from '../dtos/evidence.dto';

const evidenceService = new EvidenceService();

function requireRole(roles: string[], userRole: string) {
  if (!roles.includes(userRole)) throw new Error('No autorizado');
}

// Subir evidencia (solo estudiante)
export function createEvidence(req: any, res: any) {
  try {
    requireRole(['ESTUDIANTE'], req.user.role);
    const parsed = CreateEvidenceSchema.parse(req.body);
    const evidence = evidenceService.create(parsed);
    res.status(201).json(evidence);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Cambiar estado de evidencia (docente o pastor)
export function updateEvidenceStatus(req: any, res: any) {
  try {
    requireRole(['DOCENTE','PASTOR'], req.user.role);
    const parsed = UpdateEvidenceStatusSchema.parse(req.body);
    const evidence = evidenceService.updateStatus(req.params.id, parsed);
    res.json(evidence);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Listar evidencias por asignación (estudiante, pastor, docente, coordinador)
export function listEvidencesByAssignment(req: any, res: any) {
  try {
    requireRole(['ESTUDIANTE','PASTOR','DOCENTE','COORDINADOR'], req.user.role);
    const evidences = evidenceService.findByAssignment(req.params.asignacion_id);
    res.json(evidences);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Simular sincronización offline (solo estudiante)
export function syncEvidence(req: any, res: any) {
  try {
    requireRole(['ESTUDIANTE'], req.user.role);
    const evidence = evidenceService.syncEvidence(req.params.id);
    res.json(evidence);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}