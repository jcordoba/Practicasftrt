// institution.entity.ts

export interface Institution {
  id: string;
  nombre: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  esCentroPractica: boolean; // Indica si es centro de práctica
}