// congregation.entity.ts

export interface Congregation {
  id: string;
  nombre: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  districtId: string; // Referencia al Distrito superior
  esCentroPractica: boolean; // Indica si es centro de práctica
}