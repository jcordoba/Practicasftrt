import prisma from '../../../prisma';
import { PracticeReport } from '@prisma/client';

export interface CreatePracticeReportDto {
  practiceId: string;
  userId: string;
  date: Date;
  activities: string;
  hours: number;
  observations: string;
}

export interface UpdatePracticeReportDto {
  date?: Date;
  activities?: string;
  hours?: number;
  observations?: string;
}

export class PracticeReportService {
  async create(data: CreatePracticeReportDto): Promise<PracticeReport> {
    return await prisma.practiceReport.create({
      data: {
        practiceId: data.practiceId,
        userId: data.userId,
        date: data.date,
        activities: data.activities,
        hours: data.hours,
        observations: data.observations,
      },
      include: {
        practice: {
          include: {
            student: true,
            tutor: true,
            teacher: true,
          },
        },
        user: true,
      },
    });
  }

  async findAll(filter?: { practiceId?: string; userId?: string }): Promise<PracticeReport[]> {
    return await prisma.practiceReport.findMany({
      where: {
        ...(filter?.practiceId && { practiceId: filter.practiceId }),
        ...(filter?.userId && { userId: filter.userId }),
      },
      include: {
        practice: {
          include: {
            student: true,
            tutor: true,
            teacher: true,
          },
        },
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<PracticeReport | null> {
    return await prisma.practiceReport.findUnique({
      where: { id },
      include: {
        practice: {
          include: {
            student: true,
            tutor: true,
            teacher: true,
          },
        },
        user: true,
      },
    });
  }

  async update(id: string, data: UpdatePracticeReportDto): Promise<PracticeReport | null> {
    try {
      return await prisma.practiceReport.update({
        where: { id },
        data: {
          ...(data.date && { date: data.date }),
          ...(data.activities && { activities: data.activities }),
          ...(data.hours && { hours: data.hours }),
          ...(data.observations && { observations: data.observations }),
        },
        include: {
          practice: {
            include: {
              student: true,
              tutor: true,
              teacher: true,
            },
          },
          user: true,
        },
      });
    } catch (error) {
      return null;
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      await prisma.practiceReport.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async findByPractice(practiceId: string): Promise<PracticeReport[]> {
    return await prisma.practiceReport.findMany({
      where: { practiceId },
      include: {
        practice: {
          include: {
            student: true,
            tutor: true,
            teacher: true,
          },
        },
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findByUser(userId: string): Promise<PracticeReport[]> {
    return await prisma.practiceReport.findMany({
      where: { userId },
      include: {
        practice: {
          include: {
            student: true,
            tutor: true,
            teacher: true,
          },
        },
        user: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}