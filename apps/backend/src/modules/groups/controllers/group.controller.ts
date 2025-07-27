import { Request, Response } from 'express';
import { GroupService } from '../services/group.service';
import { CreateGroupDto, UpdateGroupDto } from '../dtos/group.dto';

function requireRole(roles: string[], userRole: string) {
  if (!roles.includes(userRole)) throw new Error('No autorizado');
}

export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  async create(req: Request, res: Response) {
    try {
      requireRole(['coordinator'], (req as any).user?.role || '');
      const dto: CreateGroupDto = req.body;
      const result = await this.groupService.create(dto);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getGroupsByTeacher(req: Request, res: Response) {
    try {
      requireRole(['teacher'], (req as any).user?.role || '');
      const teacherId = req.params.teacherId;
      const semester = req.query.semester as string;
      const result = await this.groupService.getGroupsByTeacher(teacherId, semester);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async getGroup(req: Request, res: Response) {
    try {
      requireRole(['teacher', 'coordinator', 'dean'], (req as any).user?.role || '');
      const id = req.params.id;
      const result = await this.groupService.findById(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      requireRole(['coordinator'], (req as any).user?.role || '');
      const id = req.params.id;
      const dto: UpdateGroupDto = req.body;
      const result = await this.groupService.update(id, dto);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async consolidateGrades(req: Request, res: Response) {
    try {
      requireRole(['teacher', 'coordinator'], (req as any).user?.role || '');
      const id = req.params.id;
      const result = await this.groupService.consolidateGrades(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  }

  async exportReport(req: Request, res: Response) {
    try {
      requireRole(['teacher', 'coordinator', 'dean'], (req as any).user?.role || '');
      const id = req.params.id;
      const format = req.query.format as 'pdf' | 'excel' | 'snies';
      const filters = req.query;
      
      const buffer = await this.groupService.exportReport(id, format, filters);
      const filename = `reporte-${id}.${format === 'excel' ? 'xlsx' : format}`;
      
      res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: 'Error al generar el reporte' });
    }
  }
}