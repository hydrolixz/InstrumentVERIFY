'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  UserCog,
  Crown,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  BarChart3,
  Users,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { useRole } from '@/lib/role-context';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navByRole: Record<string, NavItem[]> = {
  owner: [
    { href: '/dashboard/owner', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/owner/applications', label: 'Applications', icon: FileText },
    { href: '/dashboard/owner/certificates', label: 'Certificates', icon: ShieldCheck },
    { href: '/dashboard/owner/devices', label: 'My Instruments', icon: Building2 },
  ],
  officer: [
    { href: '/dashboard/officer', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/officer/queue', label: 'Review Queue', icon: ClipboardCheck },
    { href: '/dashboard/officer/inspections', label: 'Inspections', icon: FileText },
    { href: '/dashboard/officer/certificates', label: 'Certificates', icon: ShieldCheck },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/admin/enforcement', label: 'Enforcement', icon: BarChart3 },
    { href: '/dashboard/admin/officers', label: 'Officers', icon: Users },
    { href: '/dashboard/admin/establishments', label: 'Establishments', icon: Building2 },
  ],
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { role } = useRole();

  if (!role) return null;

  const items = navByRole[role] || [];
  const roleLabel =
    role === 'owner'
      ? 'Establishment Portal'
      : role === 'officer'
      ? 'Officer Portal'
      : 'Administrator Portal';
  const RoleIcon =
    role === 'owner' ? Building2 : role === 'officer' ? UserCog : Crown;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border/60 bg-card md:block">
      <div className="flex h-full flex-col">
        <div className="border-b border-border/60 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <RoleIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {roleLabel}
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/dashboard/${role}` &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:bg-accent/10 hover:text-accent'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/60 p-3">
          <Link
            href="/verify"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent/10 hover:text-accent"
          >
            <QrCode className="h-4 w-4" />
            Verify Certificate
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <DashboardSidebar />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </div>
    </div>
  );
}
