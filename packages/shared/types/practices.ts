// Tipos para prácticas profesionales
export interface Practice {
  id: string;
  studentId: string;
  tutorId: string;
  teacherId: string;
  institution: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
  hoursCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeReport {
  id: string;
  practiceId: string;
  date: Date;
  activities: string;
  hours: number;
  observations: string;
}