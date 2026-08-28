'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { DashboardShell } from '@/components/dashboard-shell';
import { ApplicationStatusBadge } from '@/components/status-badges';
import { useRole } from '@/lib/role-context';
import { supabase, type ApplicationWithRelations } from '@/lib/supabase';

export default function OwnerApplicationsPage() {
  const router = useRouter();
  const { actor } = useRole();
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || actor.role !== 'owner') {
      router.push('/login/owner');
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('applications')
        .select(`
          *,
          establishments ( * ),
          devices ( * ),
          officers ( * ),
          inspections ( * ),
          certificates ( * )
        `)
        .eq('establishment_id', actor.establishmentId)
        .order('created_at', { ascending: false });
      setApplications((data as ApplicationWithRelations[]) || []);
      setLoading(false);
    })();
  }, [actor, router]);

  if (!actor || actor.role !== 'owner') {
    return (
      <DashboardShell>
        <div className="py-20 text-center text-muted-foreground">Redirecting...</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track all your verification and re-verification applications.
          </p>
        </div>
        <Link href="/dashboard/owner/applications/new">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-foreground">No applications yet</p>
                <p className="text-xs text-muted-foreground">
                  Create your first verification application to get started.
                </p>
              </div>
              <Link href="/dashboard/owner/applications/new">
                <Button size="sm" className="mt-2 gap-1.5">
                  <Plus className="h-4 w-4" />
                  New Application
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {applications.map((app) => (
                <Link
                  key={app.id}
                  href={`/dashboard/owner/applications/${app.id}`}
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
                        · {app.application_type === 'NEW_VERIFICATION' ? 'New' : 'Re-verification'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Submitted: {app.submitted_at
                          ? new Date(app.submitted_at).toLocaleDateString('en-IN')
                          : 'Not submitted'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ApplicationStatusBadge status={app.status} />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
