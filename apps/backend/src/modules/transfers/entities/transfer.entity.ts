export class Transfer {
  id: string = '';
  asignacion_id: string = '';
  centro_anterior_id: string = '';
  centro_nuevo_id: string = '';
  motivo: string = '';
  usuario_responsable: string = '';
  fecha?: Date;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
}
// Entidad Transfer: representa el traslado de una asignación de estudiante entre centros de práctica