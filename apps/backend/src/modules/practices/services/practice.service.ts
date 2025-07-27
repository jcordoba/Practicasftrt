import { Practice } from '../entities/practice.entity';
import { CreatePracticeDto, UpdatePracticeDto } from '../dtos/practice.dto';

export class PracticeService {
  private practices: Practice[] = [];

  async create(data: CreatePracticeDto): Promise<Practice> {
    const practice: Practice = {
      id: (Math.random() * 100000).toFixed(0),
      name: data.name,
      description: data.description,
      programId: data.programId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.practices.push(practice);
    return practice;
  }

  async findAll(filter?: { programId?: string }): Promise<Practice[]> {
    if (filter?.programId) {
      return this.practices.filter(p => p.programId === filter.programId);
    }
    return this.practices;
  }

  async findOne(id: string): Promise<Practice | undefined> {
    return this.practices.find(p => p.id === id);
  }

  async update(id: string, data: UpdatePracticeDto): Promise<Practice | undefined> {
    const practice = await this.findOne(id);
    if (!practice) return undefined;
    Object.assign(practice, data, { updatedAt: new Date() });
    return practice;
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.practices.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.practices.splice(idx, 1);
    return true;
  }

  async exists(id: string): Promise<boolean> {
    return this.practices.some(p => p.id === id);
  }
}