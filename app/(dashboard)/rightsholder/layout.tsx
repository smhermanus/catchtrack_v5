'use client';

import { SidebarContainer } from '@/components/layout/sidebar-container';
import { UserNav } from '@/components/layout/user-nav';
import { useSession } from '@/lib/hooks/use-session';
import { redirect } from 'next/navigation';
import React from 'react';
export default function RightsholderLayout({ children }: { children: React.ReactNode }) {
  const { session, user, loading } = useSession();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    redirect('/login');
  }

  if (user?.role !== 'RIGHTSHOLDER') {
    redirect('/login');
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
