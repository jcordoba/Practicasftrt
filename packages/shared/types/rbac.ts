// Tipos para Role-Based Access Control (RBAC)
export type Role = 
  | 'student'
  | 'tutor'
  | 'practice_teacher'
  | 'coordinator'
  | 'dean'
  | 'technical_admin';

export interface Permission {
  resource: string;
  action: string[];
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}