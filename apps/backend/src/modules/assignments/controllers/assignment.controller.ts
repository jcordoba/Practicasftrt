import { AssignmentService } from '../services/assignment.service';
import { CreateAssignmentSchema, UpdateAssignmentSchema } from '../dtos/assignment.dto';

const assignmentService = new AssignmentService();

// Simulación de middleware de autenticación y roles
function requireRole(roles: string[], userRole: string) {
  if (!roles.includes(userRole)) throw new Error('No autorizado');
}

// Crear asignación (solo coordinador o docente)
export function createAssignment(req: any, res: any) {
  try {
    requireRole(['COORDINADOR', 'DOCENTE'], req.user.role);
    const parsed = CreateAssignmentSchema.parse(req.body);
    // Validar existencia de programa si programId está presente
    if (parsed.programId) {
      // TODO: Validar existencia real en base de datos
    }
    const assignment = assignmentService.create(parsed);
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Actualizar asignación (solo coordinador o docente)
export function updateAssignment(req: any, res: any) {
  try {
    requireRole(['COORDINADOR', 'DOCENTE'], req.user.role);
    const parsed = UpdateAssignmentSchema.parse(req.body);
    if (parsed.programId) {
      // TODO: Validar existencia real en base de datos
    }
    const assignment = assignmentService.update(req.params.id, parsed);
    res.json(assignment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Listar asignaciones (coordinador, docente, autenticado)
export function listAssignments(req: any, res: any) {
  try {
    // Todos los autenticados pueden consultar
    const filter = {
      estudiante_id: req.query.estudiante_id,
      estado: req.query.estado,
      programId: req.query.programId
    };
    const assignments = assignmentService.findAll(filter);
    res.json(assignments);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Historial de asignaciones por estudiante (autenticado o estudiante dueño)
export function getHistorial(req: any, res: any) {
  try {
    // Solo el estudiante dueño o roles pueden consultar
    if (req.user.role !== 'ESTUDIANTE' && !['COORDINADOR', 'DOCENTE'].includes(req.user.role)) throw new Error('No autorizado');
    if (req.user.role === 'ESTUDIANTE' && req.user.id !== req.params.estudiante_id) throw new Error('No autorizado');
    const historial = assignmentService.getHistorial(req.params.estudiante_id);
    res.json(historial);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}