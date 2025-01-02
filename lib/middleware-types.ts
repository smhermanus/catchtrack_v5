import { UserRole } from '@prisma/client';

export interface MiddlewareUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface ValidateRequestResult {
  user: MiddlewareUser | null;
}
