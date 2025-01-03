import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { Google } from 'arctic';
import { Lucia, Session, User } from 'lucia';
import { cookies } from 'next/headers';
import { cache } from 'react';
import prisma from './lib/prisma';

const adapter = new PrismaAdapter(prisma.session, prisma.user);

interface DatabaseUserAttributes {
  id: number;
  username: string;
  passwordHash: string;
  role:
    | 'USER'
    | 'SYSTEMADMINISTRATOR'
    | 'SECURITYADMINISTRATOR'
    | 'PERMITADMINISTRATOR'
    | 'PERMITHOLDER'
    | 'RIGHTSHOLDER'
    | 'SKIPPER'
    | 'INSPECTOR'
    | 'MONITOR'
    | 'DRIVER'
    | 'FACTORYSTOCKCONTROLLER'
    | 'LOCALOUTLETCONTROLLER'
    | 'EXPORTCONTROLLER';
  userCode: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  rsaId: string;
  cellNumber: string;
  physicalAddress: string;
  profilePictureUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  displayName?: string;
  avatarUrl?: string | null;
}

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      username: attributes.username,
      email: attributes.email,
      firstName: attributes.firstName,
      lastName: attributes.lastName,
      role: attributes.role,
      displayName:
        attributes.firstName && attributes.lastName
          ? `${attributes.firstName} ${attributes.lastName}`
          : attributes.firstName || attributes.lastName || attributes.username,
      avatarUrl: attributes.profilePictureUrl || null,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }

  interface DatabaseUserAttributes {
    id: number;
    username: string;
    passwordHash: string;
    role:
      | 'USER'
      | 'SYSTEMADMINISTRATOR'
      | 'SECURITYADMINISTRATOR'
      | 'PERMITADMINISTRATOR'
      | 'PERMITHOLDER'
      | 'RIGHTSHOLDER'
      | 'SKIPPER'
      | 'INSPECTOR'
      | 'MONITOR'
      | 'DRIVER'
      | 'FACTORYSTOCKCONTROLLER'
      | 'LOCALOUTLETCONTROLLER'
      | 'EXPORTCONTROLLER';
    userCode: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    rsaId: string;
    cellNumber: string;
    physicalAddress: string;
    profilePictureUrl: string | null;
    isVerified: boolean;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    twoFactorEnabled: boolean;
    twoFactorSecret: string | null;
    displayName?: string;
    avatarUrl?: string | null;
  }

  interface DatabaseSessionAttributes {
    // Add any session-specific attributes if needed
    id?: string;
    ipAddress: string;
    userAgent: string;
  }
}

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`
);

export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
    } catch {}

    return result;
  }
);

export const hasRole = (user: User, requiredRole: DatabaseUserAttributes['role']) => {
  const roleHierarchy = [
    'USER',
    'SYSTEMADMINISTRATOR',
    'SECURITYADMINISTRATOR',
    'PERMITADMINISTRATOR',
    'PERMITHOLDER',
    'RIGHTSHOLDER',
    'SKIPPER',
    'INSPECTOR',
    'MONITOR',
    'DRIVER',
    'FACTORYSTOCKCONTROLLER',
    'LOCALOUTLETCONTROLLER',
    'EXPORTCONTROLLER',
  ];
  return roleHierarchy.indexOf(user.role) >= roleHierarchy.indexOf(requiredRole);
};

export type { DatabaseUserAttributes };
