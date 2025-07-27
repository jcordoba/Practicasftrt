import { Association } from '../entities/association.entity';
import { CreateAssociationDto, UpdateAssociationDto } from '../dtos/association.dto';

export class AssociationService {
  private associations: Association[] = [];

  create(dto: CreateAssociationDto): Association {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    if (!dto.unionId) throw new Error('El unionId es obligatorio');
    if (this.associations.some(a => a.nombre.toLowerCase() === dto.nombre.toLowerCase() && a.unionId === dto.unionId)) {
      throw new Error('Ya existe una asociación con ese nombre en la unión seleccionada');
    }
    const now = new Date();
    const association: Association = {
      id: (Math.random() * 1e18).toString(36),
      nombre: dto.nombre,
      unionId: dto.unionId,
      estado: 'ACTIVO',
      fecha_creacion: now,
      fecha_actualizacion: now
    };
    this.associations.push(association);
    return association;
  }

  update(id: string, dto: UpdateAssociationDto): Association {
    const association = this.associations.find(a => a.id === id && a.estado === 'ACTIVO');
    if (!association) throw new Error('Asociación no encontrada');
    if (dto.nombre) {
      if (this.associations.some(a => a.nombre.toLowerCase() === dto.nombre!.toLowerCase() && a.unionId === association.unionId && a.id !== id)) {
        throw new Error('Ya existe una asociación con ese nombre en la unión seleccionada');
      }
      association.nombre = dto.nombre;
    }
    if (dto.estado) association.estado = dto.estado;
    association.fecha_actualizacion = new Date();
    return association;
  }

  softDelete(id: string): boolean {
    const association = this.associations.find(a => a.id === id && a.estado === 'ACTIVO');
    if (!association) throw new Error('Asociación no encontrada');
    association.estado = 'INACTIVO';
    association.fecha_actualizacion = new Date();
    return true;
  }

  findAll(unionId?: string): Association[] {
    return this.associations.filter(a => a.estado === 'ACTIVO' && (!unionId || a.unionId === unionId));
  }

  findById(id: string): Association | undefined {
    return this.associations.find(a => a.id === id && a.estado === 'ACTIVO');
  }
}