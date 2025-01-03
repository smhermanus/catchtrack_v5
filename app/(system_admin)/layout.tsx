import { validateRequest } from '../../auth';
import { redirect } from 'next/navigation';
import SessionProvider from './SessionProvider';
import Navbar from './_components/Navbar';
import { Toaster } from 'sonner';
import SidebarNavigation from './_components/SlideInSideBar';
import QueryProvider from './QueryProvider';
import React from 'react';

export const dynamic = 'force-dynamic';

export default async function SystemAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await validateRequest();

  if (!session.user || session.user.role !== 'SYSTEMADMINISTRATOR') {
    redirect('/login');
  }

  return (
    <SessionProvider value={session}>
      <QueryProvider>
        <Toaster />
        <div className="min-h-screen">
          <Navbar />
          <div className="flex">
            <SidebarNavigation />
            <main className="flex-1 transition-all duration-300 p-6 min-h-[calc(100vh-64px)]">
              {children}
            </main>
          </div>
        </div>
      </QueryProvider>
    </SessionProvider>
  );
}
