// Service para la lógica de negocio de Asignaciones (Placements)
import prisma from '../../../prisma';
import { CreatePlacementDto, UpdatePlacementDto } from '../dtos/placement.dto';

export class PlacementService {
  /**
   * Crear una nueva asignación de estudiante a centro de práctica
   */
  async create(data: CreatePlacementDto, assignedBy: string) {
    // Validar que el estudiante existe
    const student = await prisma.user.findUnique({
      where: { id: data.studentId },
      include: { roles: { include: { role: true } } },
    });

    if (!student) {
      throw new Error('Estudiante no encontrado');
    }

    // Validar que tiene rol de estudiante
    const hasStudentRole = student.roles.some((ur) => ur.role.nombre === 'ESTUDIANTE');
    if (!hasStudentRole) {
      throw new Error('El usuario no es un estudiante');
    }

    // Validar que el centro existe y tiene capacidad
    const center = await prisma.center.findUnique({
      where: { id: data.centerId },
    });

    if (!center) {
      throw new Error('Centro de práctica no encontrado');
    }

    if (center.capacidadDisponible <= 0) {
      throw new Error('El centro no tiene capacidad disponible');
    }

    // Validar que el término existe
    const term = await prisma.term.findUnique({
      where: { id: data.termId },
    });

    if (!term) {
      throw new Error('Término académico no encontrado');
    }

    // Validar que el estudiante no tenga otra asignación activa en el mismo término
    const existingPlacement = await prisma.placement.findFirst({
      where: {
        studentId: data.studentId,
        termId: data.termId,
        status: 'ACTIVE',
      },
    });

    if (existingPlacement) {
      throw new Error('El estudiante ya tiene una asignación activa en este término');
    }

    // Validar tutor si se proporciona
    if (data.tutorId) {
      const tutor = await prisma.user.findUnique({
        where: { id: data.tutorId },
        include: { roles: { include: { role: true } } },
      });

      if (!tutor) {
        throw new Error('Pastor tutor no encontrado');
      }

      const hasTutorRole = tutor.roles.some((ur) => ur.role.nombre === 'PASTOR_TUTOR');
      if (!hasTutorRole) {
        throw new Error('El usuario no es un pastor tutor');
      }
    }

    // Validar docente si se proporciona
    if (data.teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: data.teacherId },
        include: { roles: { include: { role: true } } },
      });

      if (!teacher) {
        throw new Error('Docente no encontrado');
      }

      const hasTeacherRole = teacher.roles.some((ur) => ur.role.nombre === 'DOCENTE');
      if (!hasTeacherRole) {
        throw new Error('El usuario no es un docente');
      }
    }

    // Crear la asignación
    const placement = await prisma.placement.create({
      data: {
        studentId: data.studentId,
        centerId: data.centerId,
        termId: data.termId,
        tutorId: data.tutorId,
        teacherId: data.teacherId,
        programId: data.programId,
        startDate: data.startDate ? new Date(data.startDate) : term.startDate,
        endDate: data.endDate ? new Date(data.endDate) : term.endDate,
        status: (data.status as string) || 'ACTIVE',
        assignedBy: assignedBy,
      },
      include: {
        student: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        center: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            ciudad: true,
          },
        },
        term: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            academicPeriod: true,
          },
        },
        tutor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    // Decrementar capacidad del centro
    await prisma.center.update({
      where: { id: data.centerId },
      data: {
        capacidadDisponible: {
          decrement: 1,
        },
      },
    });

    return placement;
  }

  /**
   * Obtener todas las asignaciones con filtros
   */
  async findAll(filters?: {
    termId?: string;
    centerId?: string;
    studentId?: string;
    status?: string;
  }) {
    const where: Record<string, unknown> = {};

    if (filters?.termId) where.termId = filters.termId;
    if (filters?.centerId) where.centerId = filters.centerId;
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.status) where.status = filters.status;

    const placements = await prisma.placement.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        center: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            ciudad: true,
          },
        },
        term: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            academicPeriod: true,
          },
        },
        tutor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return placements;
  }

  /**
   * Obtener una asignación por ID
   */
  async findById(id: string) {
    const placement = await prisma.placement.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        center: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            direccion: true,
            ciudad: true,
            telefono: true,
            correoContacto: true,
            nombreContacto: true,
          },
        },
        term: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            academicPeriod: true,
            startDate: true,
            endDate: true,
          },
        },
        tutor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        evaluationDetails: {
          select: {
            id: true,
            evaluationPeriod: true,
            finalGrade: true,
            evaluationDate: true,
          },
        },
      },
    });

    if (!placement) {
      throw new Error('Asignación no encontrada');
    }

    return placement;
  }

  /**
   * Obtener asignaciones de un estudiante
   */
  async findByStudent(studentId: string) {
    const placements = await prisma.placement.findMany({
      where: { studentId },
      include: {
        center: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            ciudad: true,
          },
        },
        term: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            academicPeriod: true,
          },
        },
        tutor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return placements;
  }

  /**
   * Actualizar una asignación
   */
  async update(id: string, data: UpdatePlacementDto) {
    // Verificar que la asignación existe
    const existingPlacement = await this.findById(id);

    // Si se cambia el centro, validar capacidad
    if (data.centerId && data.centerId !== existingPlacement.centerId) {
      const newCenter = await prisma.center.findUnique({
        where: { id: data.centerId },
      });

      if (!newCenter) {
        throw new Error('Centro de práctica no encontrado');
      }

      if (newCenter.capacidadDisponible <= 0) {
        throw new Error('El centro no tiene capacidad disponible');
      }

      // Incrementar capacidad del centro anterior
      await prisma.center.update({
        where: { id: existingPlacement.centerId },
        data: {
          capacidadDisponible: {
            increment: 1,
          },
        },
      });

      // Decrementar capacidad del nuevo centro
      await prisma.center.update({
        where: { id: data.centerId },
        data: {
          capacidadDisponible: {
            decrement: 1,
          },
        },
      });
    }

    // Validar tutor si se proporciona
    if (data.tutorId) {
      const tutor = await prisma.user.findUnique({
        where: { id: data.tutorId },
        include: { roles: { include: { role: true } } },
      });

      if (!tutor) {
        throw new Error('Pastor tutor no encontrado');
      }

      const hasTutorRole = tutor.roles.some((ur) => ur.role.nombre === 'PASTOR_TUTOR');
      if (!hasTutorRole) {
        throw new Error('El usuario no es un pastor tutor');
      }
    }

    // Validar docente si se proporciona
    if (data.teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: data.teacherId },
        include: { roles: { include: { role: true } } },
      });

      if (!teacher) {
        throw new Error('Docente no encontrado');
      }

      const hasTeacherRole = teacher.roles.some((ur) => ur.role.nombre === 'DOCENTE');
      if (!hasTeacherRole) {
        throw new Error('El usuario no es un docente');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.centerId) updateData.centerId = data.centerId;
    if (data.tutorId !== undefined) updateData.tutorId = data.tutorId;
    if (data.teacherId !== undefined) updateData.teacherId = data.teacherId;
    if (data.programId !== undefined) updateData.programId = data.programId;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.status) updateData.status = data.status;

    const updatedPlacement = await prisma.placement.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        center: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            ciudad: true,
          },
        },
        term: {
          select: {
            id: true,
            name: true,
            academicYear: true,
            academicPeriod: true,
          },
        },
        tutor: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        teacher: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return updatedPlacement;
  }

  /**
   * Cancelar una asignación
   */
  async cancel(id: string) {
    const placement = await this.findById(id);

    // Solo se pueden cancelar asignaciones activas
    if (placement.status !== 'ACTIVE') {
      throw new Error('Solo se pueden cancelar asignaciones activas');
    }

    // Incrementar capacidad del centro
    await prisma.center.update({
      where: { id: placement.centerId },
      data: {
        capacidadDisponible: {
          increment: 1,
        },
      },
    });

    const updatedPlacement = await prisma.placement.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        student: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        center: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            ciudad: true,
          },
        },
      },
    });

    return updatedPlacement;
  }

  /**
   * Obtener estadísticas de asignaciones
   */
  async getStats(filters?: { termId?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.termId) where.termId = filters.termId;

    const total = await prisma.placement.count({ where });
    const active = await prisma.placement.count({
      where: { ...where, status: 'ACTIVE' },
    });
    const completed = await prisma.placement.count({
      where: { ...where, status: 'COMPLETED' },
    });
    const cancelled = await prisma.placement.count({
      where: { ...where, status: 'CANCELLED' },
    });
    const pending = await prisma.placement.count({
      where: { ...where, status: 'PENDING' },
    });

    return {
      total,
      active,
      completed,
      cancelled,
      pending,
    };
  }
}
