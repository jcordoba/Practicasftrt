// association.entity.ts

export interface Association {
  id: string;
  nombre: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  unionId: string; // Referencia a la Unión superior
}