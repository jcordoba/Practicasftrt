export type AssignmentStatus = 'ACTIVO' | 'TRASLADADO' | 'FINALIZADO';

export class Assignment {
  id: string = '';
  estudiante_id: string = '';
  practica_id: string = '';
  centro_id: string = '';
  fecha_inicio?: Date;
  estado: AssignmentStatus = 'ACTIVO';
  usuario_asignador: string = '';
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  programId?: string | null = null;
}
// Entidad Assignment: representa la asignación de un estudiante a un centro de práctica