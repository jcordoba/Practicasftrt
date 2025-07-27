import { Congregation } from '../entities/congregation.entity';
import { CreateCongregationDto, UpdateCongregationDto } from '../dtos/congregation.dto';

export class CongregationService {
  private congregations: Congregation[] = [];

  create(dto: CreateCongregationDto): Congregation {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    if (!dto.districtId) throw new Error('El districtId es obligatorio');
    if (typeof dto.esCentroPractica !== 'boolean') throw new Error('El campo esCentroPractica es obligatorio');
    if (this.congregations.some(c => c.nombre.toLowerCase() === dto.nombre.toLowerCase() && c.districtId === dto.districtId)) {
      throw new Error('Ya existe una congregación con ese nombre en el distrito seleccionado');
    }
    const now = new Date();
    const congregation: Congregation = {
      id: (Math.random() * 1e18).toString(36),
      nombre: dto.nombre,
      districtId: dto.districtId,
      esCentroPractica: dto.esCentroPractica,
      estado: 'ACTIVO',
      fecha_creacion: now,
      fecha_actualizacion: now
    };
    this.congregations.push(congregation);
    return congregation;
  }

  update(id: string, dto: UpdateCongregationDto): Congregation {
    const congregation = this.congregations.find(c => c.id === id && c.estado === 'ACTIVO');
    if (!congregation) throw new Error('Congregación no encontrada');
    if (dto.nombre) {
      if (this.congregations.some(c => c.nombre.toLowerCase() === dto.nombre!.toLowerCase() && c.districtId === congregation.districtId && c.id !== id)) {
        throw new Error('Ya existe una congregación con ese nombre en el distrito seleccionado');
      }
      congregation.nombre = dto.nombre;
    }
    if (typeof dto.esCentroPractica === 'boolean') congregation.esCentroPractica = dto.esCentroPractica;
    if (dto.estado) congregation.estado = dto.estado;
    congregation.fecha_actualizacion = new Date();
    return congregation;
  }

  softDelete(id: string): boolean {
    const congregation = this.congregations.find(c => c.id === id && c.estado === 'ACTIVO');
    if (!congregation) throw new Error('Congregación no encontrada');
    congregation.estado = 'INACTIVO';
    congregation.fecha_actualizacion = new Date();
    return true;
  }

  findAll(districtId?: string): Congregation[] {
    return this.congregations.filter(c => c.estado === 'ACTIVO' && (!districtId || c.districtId === districtId));
  }

  findById(id: string): Congregation | undefined {
    return this.congregations.find(c => c.id === id && c.estado === 'ACTIVO');
  }
}