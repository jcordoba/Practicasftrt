// union.entity.ts

export class Union {
  id: string = '';
  nombre: string = '';
  estado: 'ACTIVO' | 'INACTIVO' = 'ACTIVO';
  fecha_creacion: Date = new Date();
  fecha_actualizacion: Date = new Date();
}