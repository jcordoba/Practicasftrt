import { Assignment, AssignmentStatus } from '../entities/assignment.entity';
import { CreateAssignmentDto, UpdateAssignmentDto } from '../dtos/assignment.dto';

export class AssignmentService {
  private assignments: Assignment[] = [];

  // Asignar manualmente un estudiante a una práctica y centro
  async create(dto: CreateAssignmentDto): Promise<Assignment> {
    // Regla 1: Validar múltiples prácticas del mismo estudiante en el mismo centro
    // No permitir la misma práctica del mismo estudiante en el mismo centro
    const mismaPracticaEnMismoCentro = this.assignments.find(a => 
      a.estudiante_id === dto.estudiante_id && 
      a.centro_id === dto.centro_id && 
      a.practica_id === dto.practica_id &&
      a.estado === 'ACTIVO'
    );
    
    if (mismaPracticaEnMismoCentro) {
      throw new Error('El estudiante ya está asignado a esta práctica en este centro.');
    }
    
    // Regla 2: Un estudiante no puede estar asignado a más de un centro en el mismo semestre
    // (solo aplicar si no es el mismo centro)
    const asignacionesActivasOtroCentro = this.assignments.filter(a => 
      a.estudiante_id === dto.estudiante_id && 
      a.centro_id !== dto.centro_id && 
      a.estado === 'ACTIVO'
    );
    
    if (asignacionesActivasOtroCentro.length > 0) {
      throw new Error('El estudiante ya tiene una asignación activa para este semestre.');
    }
    
    // Permitir múltiples prácticas diferentes en el mismo centro
    console.log(`Permitiendo asignación para estudiante ${dto.estudiante_id} en centro ${dto.centro_id} para práctica ${dto.practica_id}`);
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
  async update(id: string, dto: UpdateAssignmentDto): Promise<Assignment> {
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
  async findAll(filter?: { estudiante_id?: string; estado?: AssignmentStatus; programId?: string }): Promise<Assignment[]> {
    return this.assignments.filter(a =>
      (!filter?.estudiante_id || a.estudiante_id === filter.estudiante_id) &&
      (!filter?.estado || a.estado === filter.estado) &&
      (!filter?.programId || a.programId === filter.programId)
    );
  }

  // Historial completo de un estudiante
  async getHistorial(estudiante_id: string): Promise<Assignment[]> {
    return this.assignments.filter(a => a.estudiante_id === estudiante_id);
  }
}