import type { NextRequest } from 'next/server';
import { lucia } from './lucia';

export async function validateRequestMiddleware(request: NextRequest) {
  const sessionId = request.cookies.get('auth_session')?.value;

  if (!sessionId) {
    return { user: null };
  }

  try {
    const { user } = await lucia.validateSession(sessionId);
    if (!user) {
      return { user: null };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return { user: null };
  }
}
