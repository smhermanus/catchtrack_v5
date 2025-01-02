import { Session, User } from 'lucia';

// Client-side safe type definitions
export type SessionData = {
  session: Session | null;
  user: User | null;
};

export type AccessCheckResult = {
  authorized: boolean;
  session?: Session | null;
  user?: User | null;
};
