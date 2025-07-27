export type EvaluationCorte = 1 | 2;

export interface EvaluationCriterio {
  id: string;
  nombre: string;
  descripcion?: string;
  puntaje: number; // 0 a 5
}

export interface Evaluation {
  id: string;
  asignacion_id: string;
  corte: EvaluationCorte;
  fecha: string;
  evaluador_id: string; // pastor tutor
  nota: number; // 0 a 5
  criterios: EvaluationCriterio[];
  observaciones: string;
  creado_por: string;
  fecha_creacion: Date;
  actualizado_por?: string;
  fecha_actualizacion?: Date;
  historial?: Array<{
    nota: number;
    criterios: EvaluationCriterio[];
    observaciones: string;
    actualizado_por: string;
    fecha_actualizacion: Date;
  }>;
  programId?: string | null;
}
// Entidad que representa una evaluación semestral de desempeño de un estudiante