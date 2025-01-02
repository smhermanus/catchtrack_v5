'use server';

import { lucia } from '../../../auth';
import prisma from '@/lib/prisma';
import { verify } from '@node-rs/argon2';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { cookies, headers } from 'next/headers';
import { LoginFormValues } from './validation';

enum UserRole {
  USER = 'USER',
  SYSTEMADMINISTRATOR = 'SYSTEMADMINISTRATOR',
  SECURITYADMINISTRATOR = 'SECURITYADMINISTRATOR',
  PERMITADMINISTRATOR = 'PERMITADMINISTRATOR',
  PERMITHOLDER = 'PERMITHOLDER',
  RIGHTSHOLDER = 'RIGHTSHOLDER',
  SKIPPER = 'SKIPPER',
  INSPECTOR = 'INSPECTOR',
  MONITOR = 'MONITOR',
  DRIVER = 'DRIVER',
  FACTORYSTOCKCONTROLLER = 'FACTORYSTOCKCONTROLLER',
  LOCALOUTLETCONTROLLER = 'LOCALOUTLETCONTROLLER',
  EXPORTCONTROLLER = 'EXPORTCONTROLLER',
}

const roleRoutes: Record<UserRole, string> = {
  [UserRole.USER]: '/register-pending-message',
  [UserRole.SYSTEMADMINISTRATOR]: '/admin',
  [UserRole.SECURITYADMINISTRATOR]: '/admin_security',
  [UserRole.PERMITADMINISTRATOR]: '/admin_permits',
  [UserRole.PERMITHOLDER]: '/permits',
  [UserRole.RIGHTSHOLDER]: '/rights_holder',
  [UserRole.SKIPPER]: '/skipper',
  [UserRole.INSPECTOR]: '/inspector',
  [UserRole.MONITOR]: '/monitor',
  [UserRole.DRIVER]: '/driver',
  [UserRole.FACTORYSTOCKCONTROLLER]: '/factory',
  [UserRole.LOCALOUTLETCONTROLLER]: '/outlet',
  [UserRole.EXPORTCONTROLLER]: '/export',
};

export async function login(
  credentials: LoginFormValues
): Promise<{ error?: string; redirectPath?: string } | void> {
  try {
    const { email, password } = credentials;
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return {
        error: 'Invalid email or password',
      };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return {
        error: 'Invalid email or password',
      };
    }

    const userRole = existingUser.role as UserRole;

    if (userRole === UserRole.USER) {
      return {
        error: 'Your account is pending approval. Please wait for administrator review.',
      };
    }

    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const ipAddress =
      headersList.get('x-forwarded-for')?.split(',')[0] ||
      headersList.get('x-real-ip') ||
      'unknown';

    const session = await lucia.createSession(
      existingUser.id.toString(), // Convert numeric ID to string
      {
        ipAddress,
        userAgent,
      }
    );

    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    const redirectPath = roleRoutes[userRole];

    if (!redirectPath) {
      console.error('No route defined for role:', userRole);
      return {
        error: 'Unable to determine user access. Please contact support.',
      };
    }

    return { redirectPath };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error('Login error:', error);
    return {
      error: 'Something went wrong. Please try again.',
    };
  }
}

export type LoginResponse = {
  error?: string;
  success?: boolean;
  redirectTo?: string;
};
