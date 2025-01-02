import { cookies } from 'next/headers';
import { lucia } from './lucia';

export async function getServerSession() {
  const sessionId = cookies().get('auth_session')?.value;
  if (!sessionId) return null;

  try {
    const { user } = await lucia.validateSession(sessionId);
    return user;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}
