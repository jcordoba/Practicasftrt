import prisma from '../../../prisma';
import { CreatePracticeDto, UpdatePracticeDto } from '../dtos/practice.dto';
import { Practice, PracticeStatus } from '@prisma/client';

export class PracticeService {
  async create(data: CreatePracticeDto): Promise<any> {
    return await prisma.practice.create({
      data: {
        studentId: data.studentId,
        tutorId: data.tutorId,
        teacherId: data.teacherId,
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

  async findAll(filter?: { studentId?: string; tutorId?: string; teacherId?: string; status?: PracticeStatus }): Promise<any[]> {
    return await prisma.practice.findMany({
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
    }) as any;
  }

  async findOne(id: string): Promise<any> {
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
      return await prisma.practice.update({
        where: { id },
        data: {
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
      }) as any;
    } catch (error) {
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await prisma.practice.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    const practice = await prisma.practice.findUnique({
      where: { id },
    });
    return !!practice;
  }

  async findByStudent(studentId: string): Promise<Practice[]> {
    return await prisma.practice.findMany({
      where: { studentId },
      include: {
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    }) as any;
  }

  async findByTutor(tutorId: string): Promise<Practice[]> {
    return await prisma.practice.findMany({
      where: { tutorId },
      include: {
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    }) as any;
  }

  async findByTeacher(teacherId: string): Promise<Practice[]> {
    return await prisma.practice.findMany({
      where: { teacherId },
      include: {
        student: true,
        tutor: true,
        teacher: true,
        reports: true,
      },
    }) as any;
  }
}