import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function validateRequestMiddleware(request: NextRequest) {
  const sessionId = request.cookies.get('auth_session')?.value;
  
  if (!sessionId) {
    return { user: null };
  }

  // Just check if the session cookie exists for middleware
  // Detailed validation will happen in the actual routes
  return { 
    user: { 
      // Return minimal user info needed for middleware
      sessionId 
    } 
  };
}
