'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { DashboardShell } from '@/components/dashboard-shell';
import { ApplicationStatusBadge, DeviceStatusBadge } from '@/components/status-badges';
import { useRole } from '@/lib/role-context';
import {
  supabase,
  type ApplicationWithRelations,
  type Device,
  type Establishment,
} from '@/lib/supabase';

export default function OwnerDashboard() {
  const router = useRouter();
  const { actor } = useRole();
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (actor === null) return;
    if (actor && actor.role !== 'owner') {
      router.push(`/dashboard/${actor.role}`);
      return;
    }
    if (!actor) {
      router.push('/login/owner');
      return;
    }
    const estId = actor.establishmentId;

    (async () => {
      const [{ data: est }, { data: devs }, { data: apps }] = await Promise.all([
        supabase.from('establishments').select('*').eq('id', estId).maybeSingle(),
        supabase.from('devices').select('*').eq('establishment_id', estId).order('created_at', { ascending: false }),
        supabase
          .from('applications')
          .select(`
            *,
            establishments ( * ),
            devices ( * ),
            officers ( * ),
            inspections ( * ),
            certificates ( * )
          `)
          .eq('establishment_id', estId)
          .order('created_at', { ascending: false }),
      ]);

      setEstablishment(est as Establishment | null);
      setDevices((devs as Device[]) || []);
      setApplications((apps as ApplicationWithRelations[]) || []);
      setLoading(false);
    })();
  }, [actor, router]);

  if (!actor || actor.role !== 'owner') {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Redirecting...
        </div>
      </DashboardShell>
    );
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </DashboardShell>
    );
  }

  const pendingApps = applications.filter(
    (a) => !['CERTIFICATE_ISSUED', 'REJECTED'].includes(a.status)
  );
  const verifiedDevices = devices.filter((d) => d.status === 'VERIFIED');
  const expiringDevices = devices.filter((d) => {
    if (!d.next_renewal_at) return false;
    const days = Math.ceil(
      (new Date(d.next_renewal_at).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days <= 60 && days >= 0;
  });
  const expiredDevices = devices.filter((d) => d.status === 'EXPIRED');

  const stats = [
    {
      label: 'Total Instruments',
      value: devices.length,
      icon: Building2,
      color: 'text-primary',
    },
    {
      label: 'Pending Applications',
      value: pendingApps.length,
      icon: Clock,
      color: 'text-warning',
    },
    {
      label: 'Verified',
      value: verifiedDevices.length,
      icon: ShieldCheck,
      color: 'text-success',
    },
    {
      label: 'Expiring Soon',
      value: expiringDevices.length + expiredDevices.length,
      icon: AlertTriangle,
      color: 'text-destructive',
    },
  ];

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {establishment?.owner_name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {establishment?.name} · {establishment?.district}, {establishment?.state}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expiry alerts */}
      {(expiringDevices.length > 0 || expiredDevices.length > 0) && (
        <Card className="mb-8 border-warning/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle className="text-base">Renewal Alerts</CardTitle>
            </div>
            <CardDescription>
              The following instruments require attention — verification is
              expiring soon or has already expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...expiringDevices, ...expiredDevices].map((dev) => {
              const days = dev.next_renewal_at
                ? Math.ceil(
                    (new Date(dev.next_renewal_at).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0;
              return (
                <div
                  key={dev.id}
                  className="flex items-center justify-between rounded-md border border-border/60 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {dev.device_type} · {dev.serial_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dev.next_renewal_at
                        ? days < 0
                          ? `Expired ${Math.abs(days)} days ago`
                          : `Expires in ${days} days`
                        : 'Never verified'}
                    </p>
                  </div>
                  <Link href={`/dashboard/owner/applications/new?device=${dev.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Apply for Re-verification
                    </Button>
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent applications */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Applications
        </h2>
        <Link href="/dashboard/owner/applications/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>
      <Card>
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  No applications yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Submit your first verification application to get started.
                </p>
              </div>
              <Link href="/dashboard/owner/applications/new">
                <Button size="sm" className="mt-2 gap-1.5">
                  <Plus className="h-4 w-4" />
                  Create Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {applications.slice(0, 6).map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {app.application_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {app.devices?.device_type} · {app.devices?.serial_number}{' '}
                        · {app.application_type === 'NEW_VERIFICATION' ? 'New Verification' : 'Re-verification'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ApplicationStatusBadge status={app.status} />
                    {app.status === 'CERTIFICATE_ISSUED' && app.certificates && (
                      <Link href={`/dashboard/owner/certificates/${app.certificates.id}`}>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Download className="h-3.5 w-3.5" />
                          Certificate
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/owner/applications/${app.id}`}>
                      <Button size="sm" variant="ghost" className="gap-1">
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
