import { District } from '../entities/district.entity';
import { CreateDistrictDto, UpdateDistrictDto } from '../dtos/district.dto';

export class DistrictService {
  private districts: District[] = [];

  create(dto: CreateDistrictDto): District {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    if (!dto.associationId) throw new Error('El associationId es obligatorio');
    if (this.districts.some(d => d.nombre.toLowerCase() === dto.nombre.toLowerCase() && d.associationId === dto.associationId)) {
      throw new Error('Ya existe un distrito con ese nombre en la asociación seleccionada');
    }
    const now = new Date();
    const district: District = {
      id: (Math.random() * 1e18).toString(36),
      nombre: dto.nombre,
      associationId: dto.associationId,
      estado: 'ACTIVO',
      fecha_creacion: now,
      fecha_actualizacion: now
    };
    this.districts.push(district);
    return district;
  }

  update(id: string, dto: UpdateDistrictDto): District {
    const district = this.districts.find(d => d.id === id && d.estado === 'ACTIVO');
    if (!district) throw new Error('Distrito no encontrado');
    if (dto.nombre) {
      if (this.districts.some(d => d.nombre.toLowerCase() === dto.nombre!.toLowerCase() && d.associationId === district.associationId && d.id !== id)) {
        throw new Error('Ya existe un distrito con ese nombre en la asociación seleccionada');
      }
      district.nombre = dto.nombre;
    }
    if (dto.estado) district.estado = dto.estado;
    district.fecha_actualizacion = new Date();
    return district;
  }

  softDelete(id: string): boolean {
    const district = this.districts.find(d => d.id === id && d.estado === 'ACTIVO');
    if (!district) throw new Error('Distrito no encontrado');
    district.estado = 'INACTIVO';
    district.fecha_actualizacion = new Date();
    return true;
  }

  findAll(associationId?: string): District[] {
    return this.districts.filter(d => d.estado === 'ACTIVO' && (!associationId || d.associationId === associationId));
  }

  findById(id: string): District | undefined {
    return this.districts.find(d => d.id === id && d.estado === 'ACTIVO');
  }
}