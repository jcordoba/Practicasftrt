// district.entity.ts

export interface District {
  id: string;
  nombre: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  associationId: string; // Referencia a la Asociación superior
}