import { Union } from '../entities/union.entity';
import { CreateUnionDto, UpdateUnionDto } from '../dtos/union.dto';

export class UnionService {
  private unions: Union[] = [];

  create(dto: CreateUnionDto): Union {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    if (this.unions.some(u => u.nombre.toLowerCase() === dto.nombre.toLowerCase())) {
      throw new Error('Ya existe una unión con ese nombre');
    }
    const now = new Date();
    const union = new Union();
    union.id = (Math.random() * 1e18).toString(36);
    union.nombre = dto.nombre;
    union.estado = 'ACTIVO';
    union.fecha_creacion = now;
    union.fecha_actualizacion = now;
    this.unions.push(union);
    return union;
  }

  update(id: string, dto: UpdateUnionDto): Union {
    const union = this.unions.find(u => u.id === id);
    if (!union) throw new Error('Unión no encontrada');
    if (dto.nombre && this.unions.some(u => u.nombre.toLowerCase() === dto.nombre!.toLowerCase() && u.id !== id)) {
      throw new Error('Ya existe una unión con ese nombre');
    }
    if (dto.nombre) union.nombre = dto.nombre;
    if (dto.estado) union.estado = dto.estado as 'ACTIVO' | 'INACTIVO';
    union.fecha_actualizacion = new Date();
    return union;
  }

  softDelete(id: string): Union {
    const union = this.unions.find(u => u.id === id);
    if (!union) throw new Error('Unión no encontrada');
    union.estado = 'INACTIVO';
    union.fecha_actualizacion = new Date();
    return union;
  }

  findAll({ estado, nombre }: { estado?: 'ACTIVO' | 'INACTIVO'; nombre?: string } = {}): Union[] {
    return this.unions.filter(u =>
      (estado ? u.estado === estado : true) &&
      (nombre ? u.nombre.toLowerCase().includes(nombre.toLowerCase()) : true)
    );
  }

  findById(id: string): Union | undefined {
    return this.unions.find(u => u.id === id);
  }
}