// Mock data - replace with actual service calls
const assignments: any[] = [];
const students: any[] = [];
const practices: any[] = [];

export class PublicService {
  async getAssignments(programId?: string) {
    if (programId) {
      return assignments.filter(a => a.programId === programId);
    }
    return assignments;
  }

  async getStudents(programId?: string) {
    if (programId) {
      return students.filter(s => s.programId === programId);
    }
    return students;
  }

  async getPractices(programId?: string) {
    if (programId) {
      return practices.filter(p => p.programId === programId);
    }
    return practices;
  }
}