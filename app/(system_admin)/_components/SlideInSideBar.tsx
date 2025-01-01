'use client';

import React, { useState } from 'react';
import {
  ChevronRight,
  Mail,
  MessageCircle,
  Calendar,
  Layout,
  Settings,
  Users,
  ClipboardList,
  Truck,
  Building2,
  Shield,
  UserCog,
  ChevronLeft,
  Menu,
  BarChart3,
  History,
  Fish,
  AlertCircle,
  FileText,
  Ship,
  FileBarChart,
  MapPin,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface DropdownItem {
  title: string;
  href: string;
}

interface NavigationItem {
  title: string;
  icon: React.ElementType;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

const SidebarContent = ({
  items,
  isCollapsed,
  onToggleCollapse,
}: {
  items: NavigationSection[];
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
}) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <div className="relative h-full">
      <ScrollArea className="h-full">
        <div className="pt-4">
          {items.map((section, index) => (
            <div key={index} className="mb-4">
              {!isCollapsed && (
                <div className="mb-2 px-4 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  {section.section}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {item.hasDropdown ? (
                      <Collapsible
                        open={expandedItem === item.title}
                        onOpenChange={(open) => setExpandedItem(open ? item.title : null)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              'w-full relative h-10',
                              isCollapsed ? 'px-0' : 'px-4',
                              pathname?.startsWith(item.href) && 'bg-accent text-accent-foreground'
                            )}
                          >
                            {isCollapsed ? (
                              <item.icon className="h-4 w-4" />
                            ) : (
                              <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                <item.icon className="h-4 w-4" />
                                <span className="text-left px-3">{item.title}</span>
                                <ChevronRight
                                  className={cn(
                                    'h-4 w-4 transition-transform duration-200',
                                    expandedItem === item.title && 'rotate-90'
                                  )}
                                />
                              </div>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        {!isCollapsed && (
                          <CollapsibleContent>
                            {item.dropdownItems?.map((dropdownItem, dropdownIndex) => (
                              <Link key={dropdownIndex} href={dropdownItem.href}>
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    'w-full h-10 justify-start pl-[52px]',
                                    pathname === dropdownItem.href &&
                                      'bg-accent text-accent-foreground'
                                  )}
                                >
                                  {dropdownItem.title}
                                </Button>
                              </Link>
                            ))}
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ) : (
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            'w-full h-10',
                            isCollapsed ? 'px-0' : 'px-4',
                            pathname === item.href && 'bg-accent text-accent-foreground'
                          )}
                        >
                          {isCollapsed ? (
                            <item.icon className="h-4 w-4" />
                          ) : (
                            <div className="grid grid-cols-[24px_1fr] items-center w-full">
                              <item.icon className="h-4 w-4" />
                              <span className="text-left px-3">{item.title}</span>
                            </div>
                          )}
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        className={cn(
          'absolute -right-3 top-3 h-6 w-6 rounded-full border bg-background shadow-md',
          'hover:bg-accent hover:text-accent-foreground'
        )}
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </div>
  );
};

const SidebarNavigation = () => {
  const [isOpen, setIsOpen] = useState(true);

  const navigationItems: NavigationSection[] = [
    {
      section: 'Overview',
      items: [
        {
          title: 'DASHBOARD',
          icon: BarChart3,
          href: '/system_admin',
        },
      ],
    },
    {
      section: 'QUOTAS & PERMITS',
      items: [
        {
          title: 'MANAGE QUOTAS',
          icon: Fish,
          href: '/quotas',
          hasDropdown: true,
          dropdownItems: [
            { title: 'Overview', href: '/quotas' },
            { title: 'Active Quotas', href: '/quotas/active' },
            { title: 'Reports', href: '/quotas/reports' },
            { title: 'Quota History', href: '/quotas/history' },
          ],
        },
        {
          title: 'MANAGE PERMITS',
          icon: ClipboardList,
          href: '/permits',
          hasDropdown: true,
          dropdownItems: [
            { title: 'Apply', href: '/apply' },
            { title: 'List Applications', href: '/applications' },
          ],
        },
      ],
    },
    {
      section: 'USERS',
      items: [
        {
          title: 'USER MANAGEMENT',
          icon: Users,
          href: '/users',
          hasDropdown: true,
          dropdownItems: [
            { title: 'All Users', href: '/users' },
            { title: 'Rightsholders', href: '/users/rightsholders' },
            { title: 'Monitors', href: '/users/monitors' },
            { title: 'Inspectors', href: '/users/inspectors' },
            { title: 'Roles & Permissions', href: '/users/roles' },
          ],
        },
      ],
    },
    {
      section: 'TOOLS',
      items: [
        {
          title: 'APPS & PAGES',
          icon: Layout,
          href: '/apps',
          hasDropdown: true,
          dropdownItems: [
            { title: 'Email', href: '/email' },
            { title: 'Chat', href: '/chat' },
            { title: 'Calendar', href: '/calendar' },
            { title: 'Kanban', href: '/kanban' },
          ],
        },
      ],
    },
    {
      section: 'System',
      items: [
        { title: 'Activity Log', icon: History, href: '/activity' },
        { title: 'Trip Notifications', icon: AlertCircle, href: '/tripnotifications' },
        { title: 'Catch Records', icon: FileText, href: '/catchrecords' },
        { title: 'Vessels', icon: Ship, href: '/vessels' },
        { title: 'Factories', icon: Truck, href: '/factories' },
        { title: 'Landing Sites', icon: MapPin, href: '/landingsites' },
        { title: 'System Data', icon: Database, href: '/systemdata' },
        { title: 'Settings', icon: Settings, href: '/settings' },
      ],
    },
  ];

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed top-16 left-4 z-40 lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent items={navigationItems} onToggleCollapse={() => {}} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          'fixed top-[88px] left-0 z-30 hidden h-[calc(100vh-88px)] border-r bg-background lg:block transition-all duration-300',
          isOpen ? 'w-64' : 'w-16'
        )}
      >
        <SidebarContent
          items={navigationItems}
          isCollapsed={!isOpen}
          onToggleCollapse={() => setIsOpen(!isOpen)}
        />
      </div>

      <div
        className={cn('pl-0 lg:pl-16 pt-[88px] transition-all duration-300', isOpen && 'lg:pl-64')}
      />
    </>
  );
};

export default SidebarNavigation;
