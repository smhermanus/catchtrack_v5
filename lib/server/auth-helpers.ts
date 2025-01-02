// lib/server/auth-helpers.ts
'use server';

import { cookies } from 'next/headers';
import { lucia } from '../lucia';
import { redirect } from 'next/navigation';
import { AccessCheckResult } from '../auth-helpers';

export async function getServerSession() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;

  if (!sessionId) {
    return {
      session: null,
      user: null,
    };
  }

  try {
    const result = await lucia.validateSession(sessionId);

    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    return result;
  } catch {
    return {
      session: null,
      user: null,
    };
  }
}

export async function checkMonitorAccess(): Promise<AccessCheckResult> {
  const { session, user } = await getServerSession();

  if (!session || user?.role !== 'MONITOR') {
    redirect('/login');
  }

  return {
    authorized: true,
    session,
    user,
  };
}
