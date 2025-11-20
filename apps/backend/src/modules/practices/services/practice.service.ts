import prisma from '../../../prisma';
import { CreatePracticeDto, UpdatePracticeDto } from '../dtos/practice.dto';
import { Practice, PracticeStatus } from '@prisma/client';

type PracticeWithRelations = Practice & {
  student: unknown;
  tutor: unknown;
  teacher: unknown;
  reports: unknown[];
};

export class PracticeService {
  async create(data: CreatePracticeDto): Promise<PracticeWithRelations> {
    return await prisma.practice.create({
      data: {
        name: data.name,
        description: data.description,
        studentId: data.studentId,
        ...(data.tutorId && { tutorId: data.tutorId }),
        ...(data.teacherId && { teacherId: data.teacherId }),
        institution: data.institution,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status || PracticeStatus.PENDING,
        hours: data.hours,
      },
      include: {
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
      include: {
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
      include: {
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    });
  }

  async update(id: string, data: UpdatePracticeDto): Promise<Practice | null> {
    try {
      return (await prisma.practice.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.institution && { institution: data.institution }),
          ...(data.startDate && { startDate: data.startDate }),
          ...(data.endDate && { endDate: data.endDate }),
          ...(data.status && { status: data.status }),
          ...(data.hours && { hours: data.hours }),
        },
        include: {
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
      include: {
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
      include: {
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
      include: {
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    })) as PracticeWithRelations[];
  }
}
