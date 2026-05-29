import prisma from '../../../prisma';
import { CreatePracticeDto, UpdatePracticeDto } from '../dtos/practice.dto';
import { Practice, PracticeStatus } from '@prisma/client';

type PracticeWithRelations = Practice & {
  student: unknown;
  tutor: unknown;
  teacher: unknown;
  reports: Array<{
    hours?: number | null;
  }>;
};

type StudentGrade = Awaited<ReturnType<typeof prisma.evaluationDetail.findMany>>[number];

export class PracticeService {
  private normalizeOptionalId(value?: string): string | undefined {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private async validateReferencedUsers(
    studentId: string,
    tutorId?: string,
    teacherId?: string,
  ): Promise<void> {
    const uniqueIds = Array.from(
      new Set([studentId, tutorId, teacherId].filter(Boolean) as string[]),
    );
    if (uniqueIds.length === 0) return;

    const users = await prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });

    const existingIds = new Set(users.map((user) => user.id));

    if (!existingIds.has(studentId)) {
      throw new Error('El estudiante asignado no existe. Debe usar el ID real de un usuario.');
    }
    if (tutorId && !existingIds.has(tutorId)) {
      throw new Error('El tutor asignado no existe. Verifique el ID ingresado.');
    }
    if (teacherId && !existingIds.has(teacherId)) {
      throw new Error('El docente asignado no existe. Verifique el ID ingresado.');
    }
  }

  async create(data: CreatePracticeDto): Promise<PracticeWithRelations> {
    const studentId = data.studentId?.trim();
    const tutorId = this.normalizeOptionalId(data.tutorId);
    const teacherId = this.normalizeOptionalId(data.teacherId);

    if (!studentId) {
      throw new Error('El studentId es obligatorio.');
    }

    await this.validateReferencedUsers(studentId, tutorId, teacherId);

    return await prisma.practice.create({
      data: {
        name: data.name,
        description: data.description,
        studentId,
        ...(tutorId && { tutorId }),
        ...(teacherId && { teacherId }),
        institution: data.institution,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || PracticeStatus.PENDING,
        hours: data.hours,
      },
      select: {
        id: true,
        name: true,
        description: true,
        institution: true,
        startDate: true,
        endDate: true,
        status: true,
        hours: true,
        studentId: true,
        tutorId: true,
        teacherId: true,
        programId: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    });
  }

  async findAll(filter?: {
    studentId?: string;
    tutorId?: string;
    teacherId?: string;
    status?: PracticeStatus;
  }): Promise<PracticeWithRelations[]> {
    return (await prisma.practice.findMany({
      where: {
        ...(filter?.studentId && { studentId: filter.studentId }),
        ...(filter?.tutorId && { tutorId: filter.tutorId }),
        ...(filter?.teacherId && { teacherId: filter.teacherId }),
        ...(filter?.status && { status: filter.status }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        institution: true,
        startDate: true,
        endDate: true,
        status: true,
        hours: true,
        studentId: true,
        tutorId: true,
        teacherId: true,
        programId: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    })) as PracticeWithRelations[];
  }

  async findOne(id: string): Promise<PracticeWithRelations | null> {
    return await prisma.practice.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        institution: true,
        startDate: true,
        endDate: true,
        status: true,
        hours: true,
        studentId: true,
        tutorId: true,
        teacherId: true,
        programId: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    });
  }

  async update(id: string, data: UpdatePracticeDto): Promise<Practice | null> {
    try {
      const existingPractice = await prisma.practice.findUnique({
        where: { id },
        select: {
          studentId: true,
          tutorId: true,
          teacherId: true,
        },
      });

      if (!existingPractice) {
        return null;
      }

      const hasStudentId = Object.prototype.hasOwnProperty.call(data, 'studentId');
      const hasTutorId = Object.prototype.hasOwnProperty.call(data, 'tutorId');
      const hasTeacherId = Object.prototype.hasOwnProperty.call(data, 'teacherId');

      const studentId = hasStudentId ? data.studentId?.trim() : existingPractice.studentId;
      if (!studentId) {
        throw new Error('El studentId es obligatorio.');
      }

      const tutorId = hasTutorId
        ? (this.normalizeOptionalId(data.tutorId) ?? null)
        : existingPractice.tutorId;
      const teacherId = hasTeacherId
        ? (this.normalizeOptionalId(data.teacherId) ?? null)
        : existingPractice.teacherId;

      await this.validateReferencedUsers(studentId, tutorId ?? undefined, teacherId ?? undefined);

      return (await prisma.practice.update({
        where: { id },
        data: {
          ...(hasStudentId && { studentId }),
          ...(hasTutorId && { tutorId }),
          ...(hasTeacherId && { teacherId }),
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.institution && { institution: data.institution }),
          ...(data.startDate && { startDate: data.startDate }),
          ...(data.endDate && { endDate: data.endDate }),
          ...(data.status && { status: data.status }),
          ...(data.hours && { hours: data.hours }),
        },
        select: {
          id: true,
          name: true,
          description: true,
          institution: true,
          startDate: true,
          endDate: true,
          status: true,
          hours: true,
          studentId: true,
          tutorId: true,
          teacherId: true,
          programId: true,
          createdAt: true,
          updatedAt: true,
          student: true,
          tutor: true,
          teacher: true,
          reports: true,
        },
      })) as PracticeWithRelations;
    } catch {
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await prisma.practice.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    const practice = await prisma.practice.findUnique({
      where: { id },
    });
    return !!practice;
  }

  async findByStudent(studentId: string): Promise<PracticeWithRelations[]> {
    return (await prisma.practice.findMany({
      where: { studentId },
      select: {
        id: true,
        name: true,
        description: true,
        institution: true,
        startDate: true,
        endDate: true,
        status: true,
        hours: true,
        studentId: true,
        tutorId: true,
        teacherId: true,
        programId: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    })) as PracticeWithRelations[];
  }

  async findByTutor(tutorId: string): Promise<PracticeWithRelations[]> {
    return (await prisma.practice.findMany({
      where: { tutorId },
      select: {
        id: true,
        name: true,
        description: true,
        institution: true,
        startDate: true,
        endDate: true,
        status: true,
        hours: true,
        studentId: true,
        tutorId: true,
        teacherId: true,
        programId: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    })) as PracticeWithRelations[];
  }

  async findByTeacher(teacherId: string): Promise<PracticeWithRelations[]> {
    return (await prisma.practice.findMany({
      where: { teacherId },
      select: {
        id: true,
        name: true,
        description: true,
        institution: true,
        startDate: true,
        endDate: true,
        status: true,
        hours: true,
        studentId: true,
        tutorId: true,
        teacherId: true,
        programId: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    })) as PracticeWithRelations[];
  }

  async getStudentStats(studentId: string): Promise<{
    totalPractices: number;
    activePractices: number;
    completedPractices: number;
    totalHoursLogged: number;
    totalHoursRequired: number;
    totalReports: number;
    averageHoursPerReport: number;
  }> {
    const practices = await this.findByStudent(studentId);
    const totalReports = practices.reduce((sum, p) => sum + (p.reports?.length || 0), 0);
    const totalHoursLogged = practices.reduce((sum, p) => {
      const reportHours = p.reports.reduce((hours, report) => hours + (report.hours ?? 0), 0);
      return sum + reportHours;
    }, 0);

    return {
      totalPractices: practices.length,
      activePractices: practices.filter((p) => p.status === 'IN_PROGRESS').length,
      completedPractices: practices.filter((p) => p.status === 'COMPLETED').length,
      totalHoursLogged,
      totalHoursRequired: practices.reduce((sum, p) => sum + p.hours, 0),
      totalReports,
      averageHoursPerReport: totalReports > 0 ? totalHoursLogged / totalReports : 0,
    };
  }

  async getStudentGrades(studentId: string): Promise<StudentGrade[]> {
    // Get evaluations for all placements of the student
    const evaluations = await prisma.evaluationDetail.findMany({
      where: {
        placement: {
          studentId: studentId,
        },
      },
      select: {
        id: true,
        placementId: true,
        evaluationPeriod: true,
        evaluationDate: true,
        evaluationType: true,
        finalGrade: true,
        evaluationDimensions: true,
        attendanceRecord: true,
        status: true,
        observations: true,
        placement: {
          select: {
            id: true,
            center: {
              select: {
                id: true,
                nombre: true,
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
            program: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: { evaluationDate: 'desc' },
    });

    return evaluations;
  }
}
