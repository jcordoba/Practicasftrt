import prisma from '../../../prisma';
import { CreateDistrictDto, UpdateDistrictDto } from '../dtos/district.dto';

export class DistrictService {
  async create(dto: CreateDistrictDto) {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    if (!dto.associationId) throw new Error('El associationId es obligatorio');
    
    // Verificar si la asociación existe
    const association = await prisma.association.findUnique({
      where: { id: dto.associationId }
    });
    
    if (!association) {
      throw new Error('La asociación especificada no existe');
    }
    
    // Verificar si ya existe un distrito con ese nombre en la asociación
    const existingDistrict = await prisma.district.findFirst({
      where: {
        nombre: {
          equals: dto.nombre,
          mode: 'insensitive'
        },
        associationId: dto.associationId
      }
    });
    
    if (existingDistrict) {
      throw new Error('Ya existe un distrito con ese nombre en la asociación seleccionada');
    }
    
    return await prisma.district.create({
      data: {
        nombre: dto.nombre,
        associationId: dto.associationId
      },
      include: {
        association: {
          include: {
            union: true
          }
        }
      }
    });
  }

  async update(id: string, dto: UpdateDistrictDto) {
    // Verificar si el distrito existe
    const existingDistrict = await prisma.district.findUnique({
      where: { id }
    });
    
    if (!existingDistrict) {
      throw new Error('Distrito no encontrado');
    }
    
    // Verificar nombre duplicado si se está actualizando
    if (dto.nombre) {
      const duplicateDistrict = await prisma.district.findFirst({
        where: {
          nombre: {
            equals: dto.nombre,
            mode: 'insensitive'
          },
          associationId: existingDistrict.associationId,
          id: {
            not: id
          }
        }
      });
      
      if (duplicateDistrict) {
        throw new Error('Ya existe un distrito con ese nombre en la asociación seleccionada');
      }
    }
    
    return await prisma.district.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre })
      },
      include: {
        association: {
          include: {
            union: true
          }
        }
      }
    });
  }

  async softDelete(id: string) {
    const existingDistrict = await prisma.district.findUnique({
      where: { id }
    });
    
    if (!existingDistrict) {
      throw new Error('Distrito no encontrado');
    }
    
    return await prisma.district.delete({
      where: { id }
    });
  }

  async findAll(associationId?: string) {
    return await prisma.district.findMany({
      where: {
        ...(associationId && { associationId })
      },
      include: {
        association: {
          include: {
            union: true
          }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.district.findUnique({
      where: { id },
      include: {
        association: {
          include: {
            union: true
          }
        }
      }
    });
  }
}