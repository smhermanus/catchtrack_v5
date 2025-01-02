// lib/server/actions.ts
'use server';

import { getServerSession } from './auth-helpers';
import { SessionData } from '../auth-helpers';

export async function getSessionAction(): Promise<SessionData> {
  return getServerSession();
}
