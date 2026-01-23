// Service para la lógica de negocio de Términos Académicos
import prisma from '../../../prisma';
import { CreateTermDto, UpdateTermDto } from '../dtos/term.dto';

export class TermService {
  /**
   * Crear un nuevo término académico
   */
  async create(data: CreateTermDto) {
    // Validar que no exista ya un término con el mismo nombre
    const existingTerm = await prisma.term.findUnique({
      where: { name: data.name },
    });

    if (existingTerm) {
      throw new Error(`Ya existe un término académico con el nombre "${data.name}"`);
    }

    // Validar fechas
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }

    const term = await prisma.term.create({
      data: {
        name: data.name,
        academicYear: data.academicYear,
        academicPeriod: data.academicPeriod,
        startDate: startDate,
        endDate: endDate,
        status: data.status || 'ACTIVE',
      },
    });

    return term;
  }

  /**
   * Obtener todos los términos con filtros opcionales
   */
  async findAll(filters?: { academicYear?: number; status?: string }) {
    const where: Record<string, unknown> = {};

    if (filters?.academicYear) {
      where.academicYear = filters.academicYear;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const terms = await prisma.term.findMany({
      where,
      orderBy: [{ academicYear: 'desc' }, { academicPeriod: 'desc' }],
    });

    return terms;
  }

  /**
   * Obtener un término por ID
   */
  async findById(id: string) {
    const term = await prisma.term.findUnique({
      where: { id },
      include: {
        placements: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                nombre: true,
                email: true,
              },
            },
            status: true,
          },
        },
        evaluationDetails: {
          select: {
            id: true,
            evaluationPeriod: true,
            finalGrade: true,
          },
        },
      },
    });

    if (!term) {
      throw new Error('Término académico no encontrado');
    }

    return term;
  }

  /**
   * Obtener el término activo actual
   */
  async getActiveTerm() {
    const activeTerm = await prisma.term.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: [{ academicYear: 'desc' }, { academicPeriod: 'desc' }],
    });

    return activeTerm;
  }

  /**
   * Actualizar un término
   */
  async update(id: string, data: UpdateTermDto) {
    // Verificar que el término existe
    await this.findById(id);

    // Si se está actualizando el nombre, validar que no exista otro con ese nombre
    if (data.name) {
      const existingTerm = await prisma.term.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });

      if (existingTerm) {
        throw new Error(`Ya existe otro término académico con el nombre "${data.name}"`);
      }
    }

    // Validar fechas si se están actualizando
    if (data.startDate || data.endDate) {
      const currentTerm = await prisma.term.findUnique({ where: { id } });
      const startDate = data.startDate ? new Date(data.startDate) : currentTerm!.startDate;
      const endDate = data.endDate ? new Date(data.endDate) : currentTerm!.endDate;

      if (endDate <= startDate) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.academicYear) updateData.academicYear = data.academicYear;
    if (data.academicPeriod) updateData.academicPeriod = data.academicPeriod;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.status) updateData.status = data.status;

    const updatedTerm = await prisma.term.update({
      where: { id },
      data: updateData,
    });

    return updatedTerm;
  }

  /**
   * Marcar un término como activo (y desactivar los demás)
   */
  async setActive(id: string) {
    // Verificar que el término existe
    await this.findById(id);

    // Desactivar todos los términos activos
    await prisma.term.updateMany({
      where: { status: 'ACTIVE' },
      data: { status: 'INACTIVE' },
    });

    // Activar el término seleccionado
    const activatedTerm = await prisma.term.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    return activatedTerm;
  }

  /**
   * Cambiar estado de un término (soft delete)
   */
  async changeStatus(id: string, status: string) {
    // Verificar que el término exists
    await this.findById(id);

    // Validar que no tenga asignaciones activas si se va a desactivar o completar
    if (status === 'INACTIVE' || status === 'COMPLETED') {
      const term = await prisma.term.findUnique({
        where: { id },
        include: {
          placements: {
            where: { status: 'ACTIVE' },
          },
        },
      });

      if (term && term.placements.length > 0) {
        throw new Error('No se puede cambiar el estado de un término con asignaciones activas');
      }
    }

    const updatedTerm = await prisma.term.update({
      where: { id },
      data: { status },
    });

    return updatedTerm;
  }

  /**
   * Obtener estadísticas de un término
   */
  async getTermStats(id: string) {
    const term = await this.findById(id);

    const totalPlacements = await prisma.placement.count({
      where: { termId: id },
    });

    const activePlacements = await prisma.placement.count({
      where: { termId: id, status: 'ACTIVE' },
    });

    const completedPlacements = await prisma.placement.count({
      where: { termId: id, status: 'COMPLETED' },
    });

    const totalEvaluations = await prisma.evaluationDetail.count({
      where: { termId: id },
    });

    return {
      term,
      stats: {
        totalPlacements,
        activePlacements,
        completedPlacements,
        totalEvaluations,
      },
    };
  }
}
