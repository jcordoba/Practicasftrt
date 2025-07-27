export type EvidenceStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export class Evidence {
  id: string = '';
  asignacion_id: string = '';
  archivo: string = ''; // ruta o nombre del archivo
  fecha: string = '';
  hora: string = '';
  ubicacion?: string = '';
  estado: EvidenceStatus = 'PENDIENTE';
  subido_por: string = ''; // estudiante
  fecha_subida: Date = new Date();
  revisado_por?: string = ''; // docente o pastor
  fecha_revision?: Date;
  motivo_rechazo?: string = '';
  sincronizado: boolean = false;
}
// Entidad que representa una evidencia fotográfica de práctica