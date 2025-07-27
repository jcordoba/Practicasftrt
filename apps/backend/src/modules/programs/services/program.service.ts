import { Program } from '../entities/program.entity';
import { CreateProgramDto, UpdateProgramDto } from '../dtos/program.dto';

export class ProgramService {
  private programs: Program[] = [];

  async create(data: CreateProgramDto): Promise<Program> {
    const program: Program = {
      id: (Math.random() * 100000).toFixed(0),
      name: data.name,
      code: data.code,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.programs.push(program);
    return program;
  }

  async findAll(filter?: { programId?: string }): Promise<Program[]> {
    if (filter?.programId) {
      return this.programs.filter(p => p.id === filter.programId);
    }
    return this.programs;
  }

  async findOne(id: string): Promise<Program | undefined> {
    return this.programs.find(p => p.id === id);
  }

  async update(id: string, data: UpdateProgramDto): Promise<Program | undefined> {
    const program = await this.findOne(id);
    if (!program) return undefined;
    Object.assign(program, data, { updatedAt: new Date() });
    return program;
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.programs.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.programs.splice(idx, 1);
    return true;
  }

  async exists(id: string): Promise<boolean> {
    return this.programs.some(p => p.id === id);
  }
}