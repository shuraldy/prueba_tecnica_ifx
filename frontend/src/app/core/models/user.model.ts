export type UserRole = 'Administrador' | 'Cliente';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
