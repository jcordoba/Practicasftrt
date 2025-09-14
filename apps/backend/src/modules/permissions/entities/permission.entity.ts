// permission.entity.ts - Entidad Permission

export class Permission {
  id: string;
  nombre: string;
  descripcion: string;
  modulo: string;
  accion: string;
  estado: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;

  constructor(data: any) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.modulo = data.modulo;
    this.accion = data.accion;
    this.estado = data.estado;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_actualizacion = data.fecha_actualizacion;
  }

  isActive(): boolean {
    return this.estado === 'ACTIVO';
  }

  getFullName(): string {
    return `${this.modulo}.${this.nombre}`;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      modulo: this.modulo,
      accion: this.accion,
      estado: this.estado,
      fecha_creacion: this.fecha_creacion,
      fecha_actualizacion: this.fecha_actualizacion
    };
  }
}