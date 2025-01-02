'use server';

import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { db } from '@/lib/db';
import { hash, compare } from 'bcrypt';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { lucia } from '@/lib/lucia';
import { cookies } from 'next/headers';

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

const mapRole = (role: string): UserRole => {
  switch (role) {
    case 'SKIPPER':
      return UserRole.SKIPPER;
    case 'RIGHTSHOLDER':
      return UserRole.RIGHTSHOLDER;
    case 'SYSTEMADMINISTRATOR':
      return UserRole.SYSTEMADMINISTRATOR;
    case 'MONITOR':
      return UserRole.MONITOR;
    default:
      throw new Error(`Invalid role: ${role}`);
  }
};

export async function authenticate(credentials: LoginData) {
  try {
    await loginSchema.parseAsync(credentials);

    const user = await db.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user?.passwordHash) {
      return { error: 'Invalid credentials' };
    }

    const isValidPassword = await compare(credentials.password, user.passwordHash);
    if (!isValidPassword) {
      return { error: 'Invalid credentials' };
    }

    // Create Lucia session
    const session = await lucia.createSession(user.id.toString(), {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Something went wrong during authentication' };
  }
}

export async function register(credentials: Omit<RegisterData, 'confirmPassword'>) {
  console.log('Received registration credentials:', credentials);
  try {
    const existingUser = await db.user.findUnique({
      where: { email: credentials.email },
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return { error: 'User already exists' };
    }

    const hashedPassword = await hash(credentials.password, 10);
    console.log('Password hashed successfully');

    const userData = {
      username: credentials.username,
      email: credentials.email,
      passwordHash: hashedPassword,
      role: mapRole(credentials.role),
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      rsaId: credentials.rsaId,
      cellNumber: credentials.cellNumber,
      physicalAddress: credentials.physicalAddress,
      userCode: credentials.userCode || ' ',
      companyname: credentials.companyname || 'Default Company',
      keys: {
        create: {
          id: `email:${credentials.email}`,
          hashedPassword: hashedPassword,
        },
      },
    };

    console.log('Attempting to create user with data:', {
      ...userData,
      passwordHash: '[REDACTED]',
    });

    const user = await db.user.create({
      data: userData,
    });

    if (!user) {
      console.error('Failed to create user - user is null');
      return { error: 'Failed to create user' };
    }

    // Create Lucia session for the new user
    const session = await lucia.createSession(user.id.toString(), {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    console.log('User created successfully:', { id: user.id, email: user.email });
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      error: error instanceof Error ? error.message : 'Something went wrong during registration',
    };
  }
}

export async function logout() {
  try {
    const sessionId = cookies().get('auth_session')?.value;
    if (sessionId) {
      await lucia.invalidateSession(sessionId);
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: 'An unexpected error occurred during logout' };
  }
}

export async function getUserSession() {
  const sessionId = cookies().get('auth_session')?.value;
  if (!sessionId) return null;

  try {
    const { user } = await lucia.validateSession(sessionId);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}
