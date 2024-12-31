'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Users, 
  Ship, 
  Fish, 
  AlertCircle, 
  FileText, 
  Truck, 
  MapPin, 
  Database, 
  Shield,
  ChevronRight
} from 'lucide-react';

const items = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Activity,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Vessels',
    href: '/admin/vessels',
    icon: Ship,
  },
  {
    title: 'Quotas',
    href: '/admin/quotas',
    icon: Fish,
  },
  {
    title: 'Trip Notifications',
    href: '/admin/notifications',
    icon: AlertCircle,
  },
  {
    title: 'Catch Records',
    href: '/admin/catch-records',
    icon: FileText,
  },
  {
    title: 'Factories',
    href: '/admin/factories',
    icon: Truck,
  },
  {
    title: 'Landing Sites',
    href: '/admin/landing-sites',
    icon: MapPin,
  },
  {
    title: 'System Data',
    href: '/admin/system',
    icon: Database,
  },
  {
    title: 'Access Control',
    href: '/admin/access',
    icon: Shield,
  },
];

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('flex flex-col space-y-1', className)}>
      <div className="px-4 py-2">
        <h2 className="px-2 text-lg font-semibold tracking-tight">
          CatchTrack
        </h2>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === item.href
                ? 'bg-accent text-accent-foreground'
                : 'transparent',
              'rounded-md mx-2'
            )}
          >
            <span className="flex items-center">
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </span>
            <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
          </Link>
        ))}
      </div>
    </nav>
  );
}
