"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
                        onOpenChange={(open) =>
                          setExpandedItem(open ? item.title : null)
                        }
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full relative h-10",
                              isCollapsed ? "px-0" : "px-4",
                              pathname?.startsWith(item.href) &&
                                "bg-accent text-accent-foreground",
                            )}
                          >
                            {isCollapsed ? (
                              <item.icon className="h-4 w-4" />
                            ) : (
                              <div className="grid grid-cols-[24px_1fr_24px] items-center w-full">
                                <item.icon className="h-4 w-4" />
                                <span className="text-left px-3">
                                  {item.title}
                                </span>
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 transition-transform duration-200",
                                    expandedItem === item.title && "rotate-90",
                                  )}
                                />
                              </div>
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        {!isCollapsed && (
                          <CollapsibleContent>
                            {item.dropdownItems?.map(
                              (dropdownItem, dropdownIndex) => (
                                <Link
                                  key={dropdownIndex}
                                  href={dropdownItem.href}
                                >
                                  <Button
                                    variant="ghost"
                                    className={cn(
                                      "w-full h-10 justify-start pl-[52px]",
                                      pathname === dropdownItem.href &&
                                        "bg-accent text-accent-foreground",
                                    )}
                                  >
                                    {dropdownItem.title}
                                  </Button>
                                </Link>
                              ),
                            )}
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ) : (
                      <Link href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full h-10",
                            isCollapsed ? "px-0" : "px-4",
                            pathname === item.href &&
                              "bg-accent text-accent-foreground",
                          )}
                        >
                          {isCollapsed ? (
                            <item.icon className="h-4 w-4" />
                          ) : (
                            <div className="grid grid-cols-[24px_1fr] items-center w-full">
                              <item.icon className="h-4 w-4" />
                              <span className="text-left px-3">
                                {item.title}
                              </span>
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
          "absolute -right-3 top-3 h-6 w-6 rounded-full border bg-background shadow-md",
          "hover:bg-accent hover:text-accent-foreground",
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
};

const SidebarNavigation = () => {
  const [isOpen, setIsOpen] = useState(true);

  const navigationItems: NavigationSection[] = [
    {
      section: "PERMITS",
      items: [
        { title: "Apply", icon: ClipboardList, href: "/system-admin/apply" },
        {
          title: "List Applications",
          icon: ClipboardList,
          href: "/system-admin/applications",
        },
      ],
    },
    {
      section: "USERS",
      items: [
        { title: "List Users", icon: Users, href: "/system-admin/users" },
        { title: "View Profile", icon: Users, href: "/system-admin/profile" },
        {
          title: "Tracking",
          icon: ClipboardList,
          href: "/system-admin/tracking",
        },
      ],
    },
    {
      section: "SUBMISSIONS",
      items: [
        {
          title: "Skipper",
          icon: Users,
          hasDropdown: true,
          href: "/system-admin/skipper",
          dropdownItems: [
            { title: "History", href: "/system-admin/skipper/history" },
            {
              title: "Log Shipment",
              href: "/system-admin/skipper/log-shipment",
            },
          ],
        },
        {
          title: "Monitor/Inspector",
          icon: Users,
          hasDropdown: true,
          href: "/system-admin/monitor",
          dropdownItems: [
            { title: "History", href: "/system-admin/monitor/history" },
            { title: "Reports", href: "/system-admin/monitor/reports" },
          ],
        },
        {
          title: "Truck Driver",
          icon: Truck,
          hasDropdown: true,
          href: "/system-admin/truck-driver",
          dropdownItems: [
            { title: "History", href: "/system-admin/truck-driver/history" },
            { title: "Routes", href: "/system-admin/truck-driver/routes" },
          ],
        },
        {
          title: "Factory Controller",
          icon: Building2,
          hasDropdown: true,
          href: "/system-admin/factory",
          dropdownItems: [
            { title: "History", href: "/system-admin/factory/history" },
            {
              title: "Log Shipment",
              href: "/system-admin/factory/log-shipment",
            },
          ],
        },
        {
          title: "Permit Holder",
          icon: Shield,
          href: "/system-admin/permit-holder",
        },
        {
          title: "Systems Administrator",
          icon: UserCog,
          href: "/system-admin/admin",
        },
      ],
    },
    {
      section: "APPS & PAGES",
      items: [
        { title: "Email", icon: Mail, href: "/system-admin/email" },
        { title: "Chat", icon: MessageCircle, href: "/system-admin/chat" },
        { title: "Calendar", icon: Calendar, href: "/system-admin/calendar" },
        { title: "Kanban", icon: Layout, href: "/system-admin/kanban" },
        {
          title: "Factory POS",
          icon: Building2,
          hasDropdown: true,
          href: "/system-admin/pos",
          dropdownItems: [
            { title: "Dashboard", href: "/system-admin/pos/dashboard" },
            { title: "Transactions", href: "/system-admin/pos/transactions" },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-16 left-4 z-40 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent items={navigationItems} onToggleCollapse={() => {}} />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "fixed top-[88px] left-0 z-30 hidden h-[calc(100vh-88px)] border-r bg-background lg:block transition-all duration-300",
          isOpen ? "w-64" : "w-16",
        )}
      >
        <SidebarContent
          items={navigationItems}
          isCollapsed={!isOpen}
          onToggleCollapse={() => setIsOpen(!isOpen)}
        />
      </div>

      <div
        className={cn(
          "pl-0 lg:pl-16 pt-[88px] transition-all duration-300",
          isOpen && "lg:pl-64",
        )}
      />
    </>
  );
};

export default SidebarNavigation;
