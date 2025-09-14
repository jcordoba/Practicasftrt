import { Router } from 'express';
import { PracticeController } from '../modules/practices/controllers/practice.controller';
import { PracticeService } from '../modules/practices/services/practice.service';
import { PracticeReportService } from '../modules/practices/services/practice-report.service';
import { jwtMiddleware } from '../modules/auth/middlewares/jwt.middleware';
import { rbacMiddleware } from '../modules/auth/middlewares/rbac.guard';
import { Request, Response } from 'express';

const router = Router();
const practiceService = new PracticeService();
const practiceReportService = new PracticeReportService();
const practiceController = new PracticeController(practiceService);

// Aplicar middleware de autenticación a todas las rutas
router.use(jwtMiddleware);

// Rutas para prácticas
router.post('/', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req: Request, res: Response) => {
  practiceController.create(req, res);
});

router.get('/', rbacMiddleware(['ESTUDIANTE', 'DOCENTE', 'PASTOR', 'COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req: Request, res: Response) => {
  practiceController.findAll(req, res);
});

router.get('/:id', rbacMiddleware(['ESTUDIANTE', 'DOCENTE', 'PASTOR', 'COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req: Request, res: Response) => {
  practiceController.findOne(req, res);
});

router.put('/:id', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req: Request, res: Response) => {
  practiceController.update(req, res);
});

router.delete('/:id', rbacMiddleware(['COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), (req: Request, res: Response) => {
  practiceController.remove(req, res);
});

// Rutas para reportes de prácticas
router.post('/:practiceId/reports', rbacMiddleware(['ESTUDIANTE', 'DOCENTE', 'PASTOR']), async (req: Request, res: Response) => {
  try {
    const { practiceId } = req.params;
    const userId = (req as any).user.id;
    const reportData = {
      practiceId,
      userId,
      ...req.body,
    };
    const report = await practiceReportService.create(reportData);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error creating practice report', error });
  }
});

router.get('/:practiceId/reports', rbacMiddleware(['ESTUDIANTE', 'DOCENTE', 'PASTOR', 'COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), async (req: Request, res: Response) => {
  try {
    const { practiceId } = req.params;
    const reports = await practiceReportService.findByPractice(practiceId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching practice reports', error });
  }
});

router.get('/reports/:id', rbacMiddleware(['ESTUDIANTE', 'DOCENTE', 'PASTOR', 'COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await practiceReportService.findOne(id);
    if (!report) {
      return res.status(404).json({ message: 'Practice report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching practice report', error });
  }
});

router.put('/reports/:id', rbacMiddleware(['ESTUDIANTE', 'DOCENTE', 'PASTOR']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await practiceReportService.update(id, req.body);
    if (!report) {
      return res.status(404).json({ message: 'Practice report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error updating practice report', error });
  }
});

router.delete('/reports/:id', rbacMiddleware(['ESTUDIANTE', 'DOCENTE', 'PASTOR', 'COORDINADOR_PRACTICAS', 'ADMINISTRADOR_TECNICO']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await practiceReportService.remove(id);
    if (!success) {
      return res.status(404).json({ message: 'Practice report not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting practice report', error });
  }
});

export default router;