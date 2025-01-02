// Lucia Authentication Type Declarations
import type { User, Session, Auth } from 'lucia';
import type { DatabaseUser } from 'lucia';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Extend the default Lucia types to match your application's user structure
declare namespace Lucia {
  interface Register {
    User: {
      role: string;
      id: string;
      email: string;
    };
    Lucia: typeof import('lucia');
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }

  interface DatabaseUserAttributes {
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
    companyName: string | null;
    isActive: boolean;
    lastLogin: Date | null;
    profileImageUrl: string | null;
  }

  interface DatabaseSessionAttributes {
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
    expiresAt: Date;
  }
}

// Authentication Utilities
export interface LuciaAuth {
  // Standard Lucia methods
  createUser(userData: {
    key: {
      providerId: string;
      providerUserId: string;
      password?: string | null;
    };
    attributes: DatabaseUserAttributes;
  }): Promise<User>;

  createSession(userId: string): Promise<Session>;

  // Validate request method
  validateRequest(request: NextRequest | Request): Promise<{
    user: User | null;
    session: Session | null;
  }>;

  // Server-side validation
  validateRequestWithCookies(cookieStore: ReturnType<typeof cookies>): Promise<{
    user: User | null;
    session: Session | null;
  }>;

  // Additional authentication methods
  invalidateSession(sessionId: string): Promise<void>;
  invalidateUserSessions(userId: string): Promise<void>;

  // Key management
  createKey(
    userId: string,
    key: {
      providerId: string;
      providerUserId: string;
      password?: string | null;
    }
  ): Promise<void>;

  deleteKey(providerId: string, providerUserId: string): Promise<void>;
}

// Enhanced User Type
export interface ExtendedUser extends User {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  permissions: string[];
}

// Authentication Context Type
export interface AuthContext {
  user: ExtendedUser | null;
  session: Session | null;
  isAuthenticated: boolean;
}

// Error Handling
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(message: string, code: AuthErrorCode) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

// Export the type for direct import
export type { User, Session, Auth } from 'lucia';
