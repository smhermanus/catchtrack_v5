import { UserRole } from '@prisma/client';

export interface DatabaseUserAttributes {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  username: string;
  userCode: string;
  companyname: string;
  rsaId: string;
  cellNumber: string;
  physicalAddress: string;
  isVerified: boolean;
  isActive: boolean;
  status: string;
  profilePictureUrl?: string | null;
  avatarUrl?: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  username: string;
  userCode: string;
}
