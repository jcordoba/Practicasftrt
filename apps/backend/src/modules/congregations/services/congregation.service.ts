import prisma from '../../../prisma';
import { CreateCongregationDto, UpdateCongregationDto } from '../dtos/congregation.dto';

export class CongregationService {
  async create(dto: CreateCongregationDto) {
    if (!dto.nombre) throw new Error('El nombre es obligatorio');
    if (!dto.districtId) throw new Error('El districtId es obligatorio');
    if (typeof dto.esCentroPractica !== 'boolean') throw new Error('El campo esCentroPractica es obligatorio');
    
    // Verificar si el distrito existe
    const district = await prisma.district.findUnique({
      where: { id: dto.districtId }
    });
    
    if (!district) {
      throw new Error('El distrito especificado no existe');
    }
    
    // Verificar si ya existe una congregación con ese nombre en el distrito
    const existingCongregation = await prisma.congregation.findFirst({
      where: {
        nombre: {
          equals: dto.nombre,
          mode: 'insensitive'
        },
        districtId: dto.districtId
      }
    });
    
    if (existingCongregation) {
      throw new Error('Ya existe una congregación con ese nombre en el distrito seleccionado');
    }
    
    return await prisma.congregation.create({
      data: {
        nombre: dto.nombre,
        districtId: dto.districtId,
        esCentroPractica: dto.esCentroPractica
      },
      include: {
        district: {
          include: {
            association: {
              include: {
                union: true
              }
            }
          }
        }
      }
    });
  }

  async update(id: string, dto: UpdateCongregationDto) {
    // Verificar si la congregación existe
    const existingCongregation = await prisma.congregation.findUnique({
      where: { id }
    });
    
    if (!existingCongregation) {
      throw new Error('Congregación no encontrada');
    }
    
    // Verificar nombre duplicado si se está actualizando
    if (dto.nombre) {
      const duplicateCongregation = await prisma.congregation.findFirst({
        where: {
          nombre: {
            equals: dto.nombre,
            mode: 'insensitive'
          },
          districtId: existingCongregation.districtId,
          id: {
            not: id
          }
        }
      });
      
      if (duplicateCongregation) {
        throw new Error('Ya existe una congregación con ese nombre en el distrito seleccionado');
      }
    }
    
    return await prisma.congregation.update({
      where: { id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre }),
        ...(typeof dto.esCentroPractica === 'boolean' && { esCentroPractica: dto.esCentroPractica })
      },
      include: {
        district: {
          include: {
            association: {
              include: {
                union: true
              }
            }
          }
        }
      }
    });
  }

  async softDelete(id: string) {
    const existingCongregation = await prisma.congregation.findUnique({
      where: { id }
    });
    
    if (!existingCongregation) {
      throw new Error('Congregación no encontrada');
    }
    
    return await prisma.congregation.delete({
      where: { id }
    });
  }

  async findAll(districtId?: string) {
    return await prisma.congregation.findMany({
      where: {
        ...(districtId && { districtId })
      },
      include: {
        district: {
          include: {
            association: {
              include: {
                union: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });
  }

  async findById(id: string) {
    return await prisma.congregation.findUnique({
      where: { id },
      include: {
        district: {
          include: {
            association: {
              include: {
                union: true
              }
            }
          }
        }
      }
    });
  }
}