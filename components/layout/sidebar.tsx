'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { Users, Settings, Ship, Scale, FileText, BarChart3, Home } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const roleBasedItems = {
    ADMIN: [
      { href: '/admin', title: 'Overview', icon: <Home className="mr-2 h-4 w-4" /> },
      { href: '/admin/users', title: 'Users', icon: <Users className="mr-2 h-4 w-4" /> },
      { href: '/admin/quotas', title: 'Quotas', icon: <Scale className="mr-2 h-4 w-4" /> },
      { href: '/admin/settings', title: 'Settings', icon: <Settings className="mr-2 h-4 w-4" /> },
    ],
    MONITOR: [
      { href: '/monitor', title: 'Overview', icon: <Home className="mr-2 h-4 w-4" /> },
      {
        href: '/monitor/catch-records',
        title: 'Catch Records',
        icon: <FileText className="mr-2 h-4 w-4" />,
      },
      { href: '/monitor/reports', title: 'Reports', icon: <BarChart3 className="mr-2 h-4 w-4" /> },
    ],
    SKIPPER: [
      { href: '/skipper', title: 'Overview', icon: <Home className="mr-2 h-4 w-4" /> },
      { href: '/skipper/trips', title: 'Trips', icon: <FileText className="mr-2 h-4 w-4" /> },
      { href: '/skipper/vessels', title: 'Vessels', icon: <Ship className="mr-2 h-4 w-4" /> },
    ],
    RIGHTSHOLDER: [
      { href: '/rightsholder', title: 'Overview', icon: <Home className="mr-2 h-4 w-4" /> },
      { href: '/rightsholder/quotas', title: 'Quotas', icon: <Scale className="mr-2 h-4 w-4" /> },
      { href: '/rightsholder/vessels', title: 'Vessels', icon: <Ship className="mr-2 h-4 w-4" /> },
    ],
  };

  const items = session?.user?.role
    ? roleBasedItems[session.user.role as keyof typeof roleBasedItems]
    : [];

  return (
    <nav
      className={cn('flex flex-col space-x-0 space-y-1 p-4 pt-0 w-64 border-r h-screen', className)}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">CatchTrack</span>
        </Link>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href={item.href}>
              {item.icon}
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
}
