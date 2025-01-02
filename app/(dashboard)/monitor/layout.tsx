'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarContainer } from '@/components/layout/sidebar-container';
import { UserNav } from '@/components/layout/user-nav';
import { Session, User } from 'lucia';
import { SessionData } from '@/lib/auth-helpers';

// Server action import
import { checkMonitorAccess } from '@/lib/server/auth-helpers';

export default function MonitorLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const result = await checkMonitorAccess();

        if (result.authorized) {
          setSession(result.session ?? null);
          setUser(result.user ?? null);
        }
      } catch (error) {
        console.error('Access verification failed:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [router]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex min-h-screen">
      <SidebarContainer />
      <div className="flex-1">
        <header className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
        </header>
        <main className="flex-1 space-y-4 p-8 pt-6">{children}</main>
      </div>
    </div>
  );
}
