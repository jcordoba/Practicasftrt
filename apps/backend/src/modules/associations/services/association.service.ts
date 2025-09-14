import prisma from '../../../prisma';
import { CreateAssociationDto, UpdateAssociationDto } from '../dtos/association.dto';

export class AssociationService {
  async create(dto: CreateAssociationDto) {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    if (!dto.unionId) throw new Error('El unionId es obligatorio');
    
    // Verificar si la unión existe
    const union = await prisma.union.findUnique({
      where: { id: dto.unionId }
    });
    
    if (!union) {
      throw new Error('La unión especificada no existe');
    }
    
    // Verificar si ya existe una asociación con ese nombre en la unión
    const existingAssociation = await prisma.association.findFirst({
      where: {
        nombre: {
          equals: dto.nombre,
          mode: 'insensitive'
        },
        unionId: dto.unionId
      }
    });
    
    if (existingAssociation) {
      throw new Error('Ya existe una asociación con ese nombre en la unión seleccionada');
    }
    
    return await prisma.association.create({
      data: {
        nombre: dto.nombre,
        unionId: dto.unionId
      },
      include: {
        union: true
      }
    });
  }

  async update(id: string, dto: UpdateAssociationDto) {
    // Verificar si la asociación existe
    const existingAssociation = await prisma.association.findUnique({
      where: { id }
    });
    
    if (!existingAssociation) {
      throw new Error('Asociación no encontrada');
    }
    
    // Verificar nombre duplicado si se está actualizando
    if (dto.nombre) {
      const duplicateAssociation = await prisma.association.findFirst({
        where: {
          nombre: {
            equals: dto.nombre,
            mode: 'insensitive'
          },
          unionId: existingAssociation.unionId,
          id: {
            not: id
          }
        }
      });
      
      if (duplicateAssociation) {
        throw new Error('Ya existe una asociación con ese nombre en la unión seleccionada');
      }
    }
    
    return await prisma.association.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre })
      },
      include: {
        union: true
      }
    });
  }

  async softDelete(id: string) {
    const existingAssociation = await prisma.association.findUnique({
      where: { id }
    });
    
    if (!existingAssociation) {
      throw new Error('Asociación no encontrada');
    }
    
    return await prisma.association.delete({
      where: { id }
    });
  }

  async findAll(unionId?: string) {
    return await prisma.association.findMany({
      where: {
        ...(unionId && { unionId })
      },
      include: {
        union: true
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.association.findUnique({
      where: { id },
      include: {
        union: true
      }
    });
  }
}