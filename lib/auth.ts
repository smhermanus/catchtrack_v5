import { db } from './db';
import { UserRole } from '@prisma/client';
import { lucia } from './lucia';
import { hash, verify } from '@node-rs/argon2';
import { cookies } from 'next/headers';

export async function signup(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  username?: string;
  userCode?: string;
  companyname?: string;
  rsaId?: string;
}) {
  try {
    const hashedPassword = await hash(userData.password);
    const username = userData.username || `user_${Math.random().toString(36).substring(7)}`;
    const userCode =
      userData.userCode || `UC-${Math.random().toString(36).toUpperCase().substring(7)}`;

    const user = await db.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        passwordHash: hashedPassword,
        username: username,
        userCode: userCode,
        companyname: userData.companyname || 'Unknown',
        rsaId: userData.rsaId || 'N/A',
        cellNumber: 'N/A',
        physicalAddress: 'N/A',
        keys: {
          create: {
            id: `email:${userData.email}`,
            hashedPassword: hashedPassword,
          },
        },
      },
    });

    return { user };
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function login(email: string, password: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
      include: {
        keys: true,
      },
    });

    if (!user?.passwordHash) {
      return { error: 'Invalid credentials' };
    }

    const isValidPassword = await verify(user.passwordHash, password);
    if (!isValidPassword) {
      return { error: 'Invalid credentials' };
    }

    return { user };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

// Logout function
export async function logout() {
  try {
    const sessionId = cookies().get('auth_session')?.value;

    if (sessionId) {
      await lucia.invalidateSession(sessionId);

      // Remove session cookie
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

// Get current user (already implemented in a previous conversation)
export async function getCurrentUser() {
  const sessionId = cookies().get('auth_session')?.value;

  if (!sessionId) {
    throw new Error('Unauthorized');
  }

  try {
    const { user, session } = await lucia.validateSession(sessionId);

    if (!user) {
      throw new Error('Unauthorized');
    }

    // Convert user.id to a number if it's a string
    const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;

    // Fetch full user details from the database to get all fields
    const fullUserDetails = await db.user.findUnique({
      where: { id: userId }, // Use the numeric id
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        username: true,
        userCode: true,
        companyname: true,
        rsaId: true,
        cellNumber: true,
        physicalAddress: true,
      },
    });

    if (!fullUserDetails) {
      throw new Error('User not found');
    }

    return {
      ...fullUserDetails,
      id: fullUserDetails.id.toString(), // Convert to string for frontend use
    };
  } catch (error) {
    console.error('Session validation error:', error);
    throw new Error('Unauthorized');
  }
}
