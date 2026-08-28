'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  ClipboardCheck,
  ShieldCheck,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
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
import { ApplicationStatusBadge } from '@/components/status-badges';
import { useRole } from '@/lib/role-context';
import { supabase, type ApplicationWithRelations } from '@/lib/supabase';

const statusTimeline = [
  { status: 'SUBMITTED', label: 'Application Submitted', icon: FileText },
  { status: 'UNDER_REVIEW', label: 'Under Review', icon: Clock },
  { status: 'SCHEDULED', label: 'Inspection Scheduled', icon: Calendar },
  { status: 'INSPECTION', label: 'Field Inspection', icon: ClipboardCheck },
  { status: 'CERTIFICATE_ISSUED', label: 'Certificate Issued', icon: ShieldCheck },
] as const;

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appId = params.id as string;
  const { actor } = useRole();
  const [app, setApp] = useState<ApplicationWithRelations | null>(null);
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
        .eq('id', appId)
        .maybeSingle();
      setApp(data as ApplicationWithRelations | null);
      setLoading(false);
    })();
  }, [actor, router, appId]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </div>
      </DashboardShell>
    );
  }

  if (!app) {
    return (
      <DashboardShell>
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">Application not found.</p>
          <Link href="/dashboard/owner/applications" className="mt-4 inline-block">
            <Button variant="outline" size="sm">Back to Applications</Button>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const currentStepIndex = statusTimeline.findIndex(
    (s) => s.status === app.status
  );
  const isRejected = app.status === 'REJECTED';
  const isApproved = app.status === 'CERTIFICATE_ISSUED';

  return (
    <DashboardShell>
      <Link
        href="/dashboard/owner/applications"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {app.application_number}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {app.application_type === 'NEW_VERIFICATION' ? 'New Verification' : 'Re-verification'}{' '}
            · Submitted on{' '}
            {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-IN') : '—'}
          </p>
        </div>
        <ApplicationStatusBadge status={app.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {statusTimeline.map((step, i) => {
                  const isComplete = currentStepIndex > i || isApproved;
                  const isCurrent = currentStepIndex === i && !isApproved;
                  const isFuture = currentStepIndex < i && !isApproved;
                  return (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                            isComplete
                              ? 'border-success bg-success text-success-foreground'
                              : isCurrent
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-card text-muted-foreground'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        {i < statusTimeline.length - 1 && (
                          <div
                            className={`my-1 w-0.5 flex-1 ${
                              isComplete ? 'bg-success' : 'bg-border'
                            }`}
                            style={{ minHeight: '2rem' }}
                          />
                        )}
                      </div>
                      <div className="pb-6 pt-2">
                        <p
                          className={`text-sm font-medium ${
                            isFuture ? 'text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="mt-0.5 text-xs text-primary">
                            Currently in progress
                          </p>
                        )}
                        {isComplete && (
                          <p className="mt-0.5 text-xs text-success">
                            Completed
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {isRejected && (
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-destructive bg-destructive text-destructive-foreground">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-medium text-destructive">
                        Application Rejected
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Please contact the assigned officer for details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Inspection results */}
          {app.inspections && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Inspection Results</CardTitle>
                <CardDescription>
                  Field test conducted by {app.officers?.name || '—'} on{' '}
                  {new Date(app.inspections.inspection_date).toLocaleDateString('en-IN')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-md border border-border/60">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Parameter</th>
                        <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      <tr>
                        <td className="px-4 py-2.5">Nominal Value</td>
                        <td className="px-4 py-2.5 text-right font-medium">{app.inspections.nominal_value}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5">Observed Value</td>
                        <td className="px-4 py-2.5 text-right font-medium">{app.inspections.observed_value}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5">Error</td>
                        <td className="px-4 py-2.5 text-right font-medium">{app.inspections.error_value}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5">MPE Allowed</td>
                        <td className="px-4 py-2.5 text-right font-medium">{app.inspections.mpe_allowed}</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="px-4 py-2.5 font-semibold">Result</td>
                        <td className={`px-4 py-2.5 text-right font-bold ${app.inspections.result === 'PASSED' ? 'text-success' : 'text-destructive'}`}>
                          {app.inspections.result}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {app.inspections.remarks && (
                  <div className="mt-4 rounded-md border border-border/60 bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Officer Remarks</p>
                    <p className="mt-1 text-sm text-foreground">{app.inspections.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instrument details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instrument Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Device Type" value={app.devices?.device_type || '—'} />
              <InfoRow label="Serial Number" value={app.devices?.serial_number || '—'} />
              <InfoRow label="Manufacturer" value={app.devices?.manufacturer || '—'} />
              <InfoRow label="Model" value={app.devices?.model || '—'} />
              <InfoRow label="Nominal Capacity" value={app.devices?.nominal_capacity || '—'} />
              <InfoRow label="Accuracy Class" value={app.devices?.accuracy_class || '—'} />
            </CardContent>
          </Card>

          {/* Assigned officer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Officer</CardTitle>
            </CardHeader>
            <CardContent>
              {app.officers ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{app.officers.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {app.officers.designation === 'LMO' ? 'Legal Metrology Officer' : 'GATC Field Officer'}
                    </p>
                    <p className="text-xs text-muted-foreground">{app.officers.region}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No officer assigned yet. You will be notified once an officer is
                  allocated to your application.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Certificate */}
          {isApproved && app.certificates && (
            <Card className="border-success/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  <CardTitle className="text-base">Digital Certificate</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Certificate No." value={app.certificates.certificate_number} />
                <InfoRow
                  label="Issued On"
                  value={new Date(app.certificates.issued_date).toLocaleDateString('en-IN')}
                />
                <InfoRow
                  label="Valid Until"
                  value={new Date(app.certificates.valid_until).toLocaleDateString('en-IN')}
                />
                <Link href={`/dashboard/owner/certificates/${app.certificates.id}`}>
                  <Button className="mt-2 w-full gap-1.5">
                    <Download className="h-4 w-4" />
                    View Certificate
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
