import { UserRole } from '@prisma/client';

export interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date | null;
  isActive?: boolean;
}

export interface Session {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
  };
  expires: string;
}
