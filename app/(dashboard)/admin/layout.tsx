import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/layout/admin-layout-client';
import { validateRequest } from '@/auth';

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard | CatchTrack',
    template: '%s | CatchTrack',
  },
  description: 'CatchTrack administration and monitoring system',
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = await validateRequest();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SYSTEMADMINISTRATOR') {
    redirect('/');
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}
