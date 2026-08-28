'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Scale,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Search,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRole } from '@/lib/role-context';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/verify', label: 'Verify Certificate' },
  { href: '/about', label: 'About' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { role, setActor } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref =
    role === 'owner'
      ? '/dashboard/owner'
      : role === 'officer'
      ? '/dashboard/officer'
      : role === 'admin'
      ? '/dashboard/admin'
      : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top utility bar */}
      <div className="gov-gradient text-primary-foreground text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span className="hidden sm:inline">
            Government of India · Department of Consumer Affairs · Legal Metrology
          </span>
          <span className="sm:hidden">Dept. of Consumer Affairs</span>
          <span className="hidden items-center gap-3 md:flex">
            <span>National Portal of India</span>
            <span className="opacity-50">|</span>
            <span>Skip to Main Content</span>
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Scale className="h-6 w-6" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-primary sm:text-base">
              Online Verification System
            </span>
            <span className="text-xs text-muted-foreground">
              Weighing &amp; Measuring Instruments · Legal Metrology Act, 2009
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/10 hover:text-accent',
                pathname === link.href
                  ? 'text-accent'
                  : 'text-foreground/70'
              )}
            >
              {link.label}
            </Link>
          ))}
          {dashboardHref && (
            <Link href={dashboardHref}>
              <Button size="sm" className="ml-2 gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          )}
          {!role && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="ml-2 gap-1.5">
                  Sign In
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Select your role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login/owner">Establishment / Device Owner</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login/officer">
                    Legal Metrology / GATC Officer
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login/admin">State Department Administrator</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {role && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  {role === 'owner'
                    ? 'Owner'
                    : role === 'officer'
                    ? 'Officer'
                    : 'Admin'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {dashboardHref && (
                  <DropdownMenuItem asChild>
                    <Link href={dashboardHref}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/verify">
                    <Search className="mr-2 h-4 w-4" />
                    Verify Certificate
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setActor(null)}
                  className="text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-2 text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border/60 bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent/10"
              >
                {link.label}
              </Link>
            ))}
            {!role && (
              <div className="mt-2 flex flex-col gap-1 border-t border-border/60 pt-2">
                <Link
                  href="/login/owner"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent/10"
                >
                  Establishment / Owner Sign In
                </Link>
                <Link
                  href="/login/officer"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent/10"
                >
                  Officer Sign In
                </Link>
                <Link
                  href="/login/admin"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-accent/10"
                >
                  Admin Sign In
                </Link>
              </div>
            )}
            {dashboardHref && (
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>
                <Button size="sm" className="mt-2 w-full gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
