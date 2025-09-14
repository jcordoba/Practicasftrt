import prisma from '../../../prisma';
import { CreateUnionDto, UpdateUnionDto } from '../dtos/union.dto';

export class UnionService {
  async create(dto: CreateUnionDto) {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    
    // Verificar si ya existe una unión con ese nombre
    const existingUnion = await prisma.union.findFirst({
      where: {
        nombre: {
          equals: dto.nombre,
          mode: 'insensitive'
        }
      }
    });
    
    if (existingUnion) {
      throw new Error('Ya existe una unión con ese nombre');
    }
    
    return await prisma.union.create({
      data: {
        nombre: dto.nombre
      }
    });
  }

  async update(id: string, dto: UpdateUnionDto) {
    // Verificar si la unión existe
    const existingUnion = await prisma.union.findUnique({
      where: { id }
    });
    
    if (!existingUnion) {
      throw new Error('Unión no encontrada');
    }
    
    // Verificar nombre duplicado si se está actualizando
    if (dto.nombre) {
      const duplicateUnion = await prisma.union.findFirst({
        where: {
          nombre: {
            equals: dto.nombre,
            mode: 'insensitive'
          },
          id: {
            not: id
          }
        }
      });
      
      if (duplicateUnion) {
        throw new Error('Ya existe una unión con ese nombre');
      }
    }
    
    return await prisma.union.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre })
      }
    });
  }

  async softDelete(id: string) {
    const existingUnion = await prisma.union.findUnique({
      where: { id }
    });
    
    if (!existingUnion) {
      throw new Error('Unión no encontrada');
    }
    
    return await prisma.union.delete({
      where: { id }
    });
  }

  async findAll({ estado, nombre }: { estado?: 'ACTIVO' | 'INACTIVO'; nombre?: string } = {}) {
    return await prisma.union.findMany({
      where: {
        ...(estado && { estado }),
        ...(nombre && {
          nombre: {
            contains: nombre,
            mode: 'insensitive'
          }
        })
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.union.findUnique({
      where: { id }
    });
  }
}