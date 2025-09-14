// role.entity.ts - Entidad para roles

export class Role {
  id: string;
  nombre: string;
  descripcion: string;
  estado: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  permissions?: any[];

  constructor(data: any) {
    this.id = data.id;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.estado = data.estado;
    this.fecha_creacion = data.fecha_creacion;
    this.fecha_actualizacion = data.fecha_actualizacion;
    this.permissions = data.permissions || [];
  }

  isActive(): boolean {
    return this.estado === 'ACTIVO';
  }

  getPermissionNames(): string[] {
    return this.permissions?.map(rp => rp.permission.nombre) || [];
  }

  hasPermission(permissionName: string): boolean {
    return this.getPermissionNames().includes(permissionName);
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      estado: this.estado,
      fecha_creacion: this.fecha_creacion,
      fecha_actualizacion: this.fecha_actualizacion,
      permissions: this.getPermissionNames()
    };
  }
}