import { Assignment, AssignmentStatus } from '../entities/assignment.entity';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dtos/assignment.dto';

export class AssignmentService {
  private assignments: Assignment[] = [];

  // Asignar manualmente un estudiante a una práctica y centro
  create(dto: CreateAssignmentDto): Assignment {
    // Regla: Un estudiante no puede estar asignado a más de un centro en el mismo semestre
    const yaAsignado = this.assignments.find(a => a.estudiante_id === dto.estudiante_id && a.estado === 'ACTIVO');
    if (yaAsignado) {
      throw new Error('El estudiante ya tiene una asignación activa para este semestre.');
    }
    // TODO: Validar múltiples prácticas activas en la misma iglesia y pastor
    const now = new Date();
    const assignment: Assignment = {
      id: (Math.random() * 1e18).toString(36),
      ...dto,
      estado: 'ACTIVO',
      fecha_creacion: now,
      fecha_actualizacion: now,
      programId: dto.programId || null
    };
    this.assignments.push(assignment);
    return assignment;
  }

  // Actualizar asignación (solo centro, estado o fecha_inicio)
  update(id: string, dto: UpdateAssignmentDto): Assignment {
    const assignment = this.assignments.find(a => a.id === id);
    if (!assignment) throw new Error('Asignación no encontrada');
    if (dto.centro_id) assignment.centro_id = dto.centro_id;
    if (dto.estado) assignment.estado = dto.estado as AssignmentStatus;
    if (dto.fecha_inicio) assignment.fecha_inicio = dto.fecha_inicio;
    if (dto.programId) assignment.programId = dto.programId;
    assignment.fecha_actualizacion = new Date();
    return assignment;
  }

  // Listar asignaciones por estudiante, estado, o programa
  findAll(filter?: { estudiante_id?: string; estado?: AssignmentStatus; programId?: string }): Assignment[] {
    return this.assignments.filter(a =>
      (!filter?.estudiante_id || a.estudiante_id === filter.estudiante_id) &&
      (!filter?.estado || a.estado === filter.estado) &&
      (!filter?.programId || a.programId === filter.programId)
    );
  }

  // Historial completo de un estudiante
  getHistorial(estudiante_id: string): Assignment[] {
    return this.assignments.filter(a => a.estudiante_id === estudiante_id);
  }
}