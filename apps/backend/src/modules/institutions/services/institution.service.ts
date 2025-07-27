import { Institution } from '../entities/institution.entity';
import { CreateInstitutionDto, UpdateInstitutionDto } from '../dtos/institution.dto';

export class InstitutionService {
  private institutions: Institution[] = [];

  create(dto: CreateInstitutionDto): Institution {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    if (typeof dto.esCentroPractica !== 'boolean') throw new Error('El campo esCentroPractica es obligatorio');
    if (this.institutions.some(i => i.nombre.toLowerCase() === dto.nombre.toLowerCase())) {
      throw new Error('Ya existe una institución con ese nombre');
    }
    const now = new Date();
    const institution: Institution = {
      id: (Math.random() * 1e18).toString(36),
      nombre: dto.nombre,
      esCentroPractica: dto.esCentroPractica,
      estado: 'ACTIVO',
      fecha_creacion: now,
      fecha_actualizacion: now
    };
    this.institutions.push(institution);
    return institution;
  }

  update(id: string, dto: UpdateInstitutionDto): Institution {
    const institution = this.institutions.find(i => i.id === id && i.estado === 'ACTIVO');
    if (!institution) throw new Error('Institución no encontrada');
    if (dto.nombre) {
      if (this.institutions.some(i => i.nombre.toLowerCase() === dto.nombre!.toLowerCase() && i.id !== id)) {
        throw new Error('Ya existe una institución con ese nombre');
      }
      institution.nombre = dto.nombre;
    }
    if (typeof dto.esCentroPractica === 'boolean') institution.esCentroPractica = dto.esCentroPractica;
    if (dto.estado) institution.estado = dto.estado;
    institution.fecha_actualizacion = new Date();
    return institution;
  }

  softDelete(id: string): boolean {
    const institution = this.institutions.find(i => i.id === id && i.estado === 'ACTIVO');
    if (!institution) throw new Error('Institución no encontrada');
    institution.estado = 'INACTIVO';
    institution.fecha_actualizacion = new Date();
    return true;
  }

  findAll(): Institution[] {
    return this.institutions.filter(i => i.estado === 'ACTIVO');
  }

  findById(id: string): Institution | undefined {
    return this.institutions.find(i => i.id === id && i.estado === 'ACTIVO');
  }
}