// Tipos para autenticación
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface GoogleAuthProfile {
  id: string;
  emails: { value: string; verified: boolean }[];
  name: { givenName: string; familyName: string };
}