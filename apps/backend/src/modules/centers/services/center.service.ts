// Service para la lógica de negocio de Centros de Práctica
import prisma from '../../../prisma';
import { CreateCenterDto, UpdateCenterDto } from '../dtos/center.dto';

export class CenterService {
  /**
   * Crear un nuevo centro de práctica
   */
  async create(data: CreateCenterDto) {
    // Validar que si es tipo congregacion, tenga congregationId
    if (data.tipo === 'congregacion' && !data.congregationId) {
      throw new Error('Para tipo "congregacion" se requiere congregationId');
    }

    // Validar que si es tipo institucion, tenga institutionId
    if (data.tipo === 'institucion' && !data.institutionId) {
      throw new Error('Para tipo "institucion" se requiere institutionId');
    }

    const capacidadMaxima = data.capacidadMaxima || 5;

    const center = await prisma.center.create({
      data: {
        nombre: data.nombre,
        tipo: data.tipo,
        congregationId: data.congregationId,
        institutionId: data.institutionId,
        direccion: data.direccion,
        ciudad: data.ciudad,
        telefono: data.telefono,
        correoContacto: data.correoContacto,
        nombreContacto: data.nombreContacto,
        capacidadMaxima: capacidadMaxima,
        capacidadDisponible: capacidadMaxima, // Inicialmente igual a la máxima
        observaciones: data.observaciones,
      },
    });

    return center;
  }

  /**
   * Obtener todos los centros con filtros opcionales
   */
  async findAll(filters?: { tipo?: string; ciudad?: string; estado?: string }) {
    const where: Record<string, unknown> = {};

    if (filters?.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters?.ciudad) {
      where.ciudad = filters.ciudad;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    const centers = await prisma.center.findMany({
      where,
      orderBy: {
        fecha_creacion: 'desc',
      },
    });

    return centers;
  }

  /**
   * Obtener un centro por ID
   */
  async findById(id: string) {
    const center = await prisma.center.findUnique({
      where: { id },
      include: {
        placements: {
          include: {
            student: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!center) {
      throw new Error('Centro no encontrado');
    }

    return center;
  }

  /**
   * Actualizar un centro
   */
  async update(id: string, data: UpdateCenterDto) {
    // Verificar que el centro existe
    await this.findById(id);

    // Si se actualiza capacidadMaxima, ajustar capacidadDisponible
    const updateData: Record<string, unknown> = { ...data };

    if (data.capacidadMaxima !== undefined) {
      const center = await prisma.center.findUnique({ where: { id } });
      const currentUsed = center!.capacidadMaxima - center!.capacidadDisponible;
      updateData.capacidadDisponible = data.capacidadMaxima - currentUsed;

      // Validar que no sea negativa
      if (updateData.capacidadDisponible < 0) {
        throw new Error(
          'La nueva capacidad máxima es menor que la cantidad de estudiantes asignados',
        );
      }
    }

    const updatedCenter = await prisma.center.update({
      where: { id },
      data: updateData,
    });

    return updatedCenter;
  }

  /**
   * Soft delete de un centro (cambiar estado a INACTIVO)
   */
  async softDelete(id: string) {
    // Verificar que el centro existe
    await this.findById(id);

    // Verificar que no tenga estudiantes asignados actualmente
    const center = await prisma.center.findUnique({
      where: { id },
      include: {
        placements: {
          where: {
            status: 'ACTIVE',
          },
        },
      },
    });

    if (center && center.placements.length > 0) {
      throw new Error('No se puede desactivar un centro con estudiantes asignados activos');
    }

    const deletedCenter = await prisma.center.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    return deletedCenter;
  }

  /**
   * Obtener centros disponibles (con capacidad)
   */
  async findAvailable() {
    const centers = await prisma.center.findMany({
      where: {
        estado: 'ACTIVO',
        capacidadDisponible: {
          gt: 0,
        },
      },
      orderBy: {
        capacidadDisponible: 'desc',
      },
    });

    return centers;
  }

  /**
   * Decrementar capacidad disponible cuando se asigna un estudiante
   */
  async decrementCapacity(id: string) {
    const center = await prisma.center.findUnique({ where: { id } });

    if (!center) {
      throw new Error('Centro no encontrado');
    }

    if (center.capacidadDisponible <= 0) {
      throw new Error('El centro no tiene capacidad disponible');
    }

    await prisma.center.update({
      where: { id },
      data: {
        capacidadDisponible: center.capacidadDisponible - 1,
      },
    });
  }

  /**
   * Incrementar capacidad disponible cuando se libera un espacio
   */
  async incrementCapacity(id: string) {
    const center = await prisma.center.findUnique({ where: { id } });

    if (!center) {
      throw new Error('Centro no encontrado');
    }

    if (center.capacidadDisponible >= center.capacidadMaxima) {
      throw new Error('La capacidad ya está al máximo');
    }

    await prisma.center.update({
      where: { id },
      data: {
        capacidadDisponible: center.capacidadDisponible + 1,
      },
    });
  }
}
