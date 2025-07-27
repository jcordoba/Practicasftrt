import { User } from '../../users/entities/user.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

export class Group {
  id: string = '';
  name: string = '';
  semester: string = '';
  teacher?: User;
  students: User[] = [];
  assignments: Assignment[] = [];
  practiceCenter: string = '';
  active: boolean = true;
  createdAt?: Date;
  updatedAt?: Date;
}