'use client';

import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import React from 'react';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
}

export function AdminLayoutClient({ children, user }: AdminLayoutClientProps) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <Header user={user} />
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <MainNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
