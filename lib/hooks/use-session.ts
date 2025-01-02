// lib/hooks/use-session.ts
'use client';

import { useEffect, useState } from 'react';
import { getSessionAction } from '../server/actions';
import type { SessionData } from '../auth-helpers';

export function useSession() {
  const [sessionData, setSessionData] = useState<SessionData>({
    session: null,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const data = await getSessionAction();
        setSessionData(data);
      } catch (error) {
        console.error('Failed to fetch session:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  return { ...sessionData, loading };
}
