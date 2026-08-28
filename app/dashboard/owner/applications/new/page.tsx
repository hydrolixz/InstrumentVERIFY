'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  Wrench,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DashboardShell } from '@/components/dashboard-shell';
import { useRole } from '@/lib/role-context';
import {
  supabase,
  type Device,
  type Establishment,
} from '@/lib/supabase';
import { cn } from '@/lib/utils';

const deviceTypes = [
  'Electronic Weighing Balance',
  'Platform Scale',
  'Digital Weighbridge',
  'Counter Scale',
  'Beam Scale',
  'Spring Scale',
  'Fuel Dispenser (Petrol)',
  'Fuel Dispenser (Diesel)',
  'Tape Measure',
  'Length Measure (Counter Machine)',
  'Capacity Measure',
  'Bulk Flow Meter',
  'Other',
];

const accuracyClasses = ['Class I', 'Class II', 'Class III', 'Class IIII', 'Class A', 'Class B'];

function NewApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { actor } = useRole();
  const [step, setStep] = useState(1);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    // Step 1: Device selection or new device
    mode: 'existing' as 'existing' | 'new',
    deviceId: '',
    // Step 2: New device details (if mode === 'new')
    deviceType: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    nominalCapacity: '',
    accuracyClass: '',
    // Step 3: Application type
    applicationType: 'NEW_VERIFICATION' as 'NEW_VERIFICATION' | 'RE_VERIFICATION',
    remarks: '',
  });

  useEffect(() => {
    if (!actor || actor.role !== 'owner') {
      router.push('/login/owner');
      return;
    }
    const estId = actor.establishmentId;

    (async () => {
      const [{ data: est }, { data: devs }] = await Promise.all([
        supabase.from('establishments').select('*').eq('id', estId).maybeSingle(),
        supabase.from('devices').select('*').eq('establishment_id', estId).order('created_at', { ascending: false }),
      ]);
      setEstablishment(est as Establishment | null);
      const devList = (devs as Device[]) || [];
      setDevices(devList);

      const preselect = searchParams.get('device');
      if (preselect && devList.some((d) => d.id === preselect)) {
        setForm((f) => ({ ...f, deviceId: preselect, mode: 'existing', applicationType: 'RE_VERIFICATION' }));
      } else if (devList.length > 0) {
        setForm((f) => ({ ...f, deviceId: devList[0].id, mode: 'existing' }));
      } else {
        setForm((f) => ({ ...f, mode: 'new' }));
      }
      setLoading(false);
    })();
  }, [actor, router, searchParams]);

  const steps = [
    { num: 1, label: 'Select Instrument', icon: Building2 },
    { num: 2, label: 'Instrument Details', icon: Wrench },
    { num: 3, label: 'Application Type', icon: FileCheck },
    { num: 4, label: 'Review & Submit', icon: CheckCircle2 },
  ];

  const canProceed = () => {
    if (step === 1) {
      return form.mode === 'existing' ? !!form.deviceId : true;
    }
    if (step === 2 && form.mode === 'new') {
      return (
        form.deviceType && form.serialNumber && form.manufacturer && form.nominalCapacity
      );
    }
    if (step === 2 && form.mode === 'existing') return true;
    if (step === 3) return true;
    return true;
  };

  const handleSubmit = async () => {
    if (!actor || actor.role !== 'owner') return;
    setSubmitting(true);
    const estId = actor.establishmentId;

    try {
      let deviceId = form.deviceId;

      // Create new device if needed
      if (form.mode === 'new') {
        const { data: newDevice, error: devErr } = await supabase
          .from('devices')
          .insert({
            establishment_id: estId,
            device_type: form.deviceType,
            serial_number: form.serialNumber,
            manufacturer: form.manufacturer,
            model: form.model || null,
            nominal_capacity: form.nominalCapacity,
            accuracy_class: form.accuracyClass || null,
            status: 'PENDING_VERIFICATION',
          })
          .select()
          .single();

        if (devErr || !newDevice) {
          alert('Failed to register instrument. Please try again.');
          setSubmitting(false);
          return;
        }
        deviceId = (newDevice as Device).id;
      }

      // Generate application number
      const prefix = establishment?.state?.substring(0, 2).toUpperCase() || 'IN';
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      const applicationNumber = `APP-${prefix}-${year}-${random}`;

      const { data: app, error: appErr } = await supabase
        .from('applications')
        .insert({
          application_number: applicationNumber,
          establishment_id: estId,
          device_id: deviceId,
          application_type: form.applicationType,
          status: 'SUBMITTED',
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (appErr || !app) {
        alert('Failed to submit application. Please try again.');
        setSubmitting(false);
        return;
      }

      router.push(`/dashboard/owner/applications/${(app as { id: string }).id}`);
    } catch {
      alert('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

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

  return (
    <DashboardShell>
      <div className="mb-6">
        <Link
          href="/dashboard/owner/applications"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <h1 className="text-2xl font-bold text-foreground">
          New Verification Application
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit a weighing or measuring instrument for verification or
          re-verification.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center justify-between gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                step >= s.num
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground'
              )}
            >
              {step > s.num ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                s.num
              )}
            </div>
            <div className="hidden sm:block">
              <p
                className={cn(
                  'text-xs font-medium',
                  step >= s.num ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {s.label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'ml-2 h-0.5 flex-1 rounded-full transition-colors',
                  step > s.num ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {/* Step 1: Select instrument */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Select an Instrument
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose an existing registered instrument or register a new one
                  for verification.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setForm((f) => ({ ...f, mode: 'existing' }))}
                  className={cn(
                    'rounded-lg border-2 p-4 text-left transition-colors',
                    form.mode === 'existing'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-accent/40'
                  )}
                >
                  <Building2 className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Existing Instrument
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select from your registered devices
                  </p>
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, mode: 'new' }))}
                  className={cn(
                    'rounded-lg border-2 p-4 text-left transition-colors',
                    form.mode === 'new'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-accent/40'
                  )}
                >
                  <Wrench className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Register New Instrument
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add a device not yet in the system
                  </p>
                </button>
              </div>

              {form.mode === 'existing' && (
                <div className="space-y-2">
                  <Label htmlFor="device">Registered Instrument</Label>
                  {devices.length === 0 ? (
                    <p className="rounded-md border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                      No instruments registered yet. Switch to &ldquo;Register
                      New Instrument&rdquo; to add one.
                    </p>
                  ) : (
                    <select
                      id="device"
                      value={form.deviceId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, deviceId: e.target.value }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select an instrument...</option>
                      {devices.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.device_type} · {d.serial_number} · {d.nominal_capacity}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Device details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Instrument Details
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {form.mode === 'new'
                    ? 'Enter the details of the new instrument to register.'
                    : 'Review the selected instrument details.'}
                </p>
              </div>

              {form.mode === 'existing' && form.deviceId ? (
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                  {(() => {
                    const dev = devices.find((d) => d.id === form.deviceId);
                    if (!dev) return null;
                    return (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Detail label="Device Type" value={dev.device_type} />
                        <Detail label="Serial Number" value={dev.serial_number} />
                        <Detail label="Manufacturer" value={dev.manufacturer} />
                        <Detail label="Model" value={dev.model || '—'} />
                        <Detail label="Nominal Capacity" value={dev.nominal_capacity} />
                        <Detail label="Accuracy Class" value={dev.accuracy_class || '—'} />
                        <Detail
                          label="Last Verified"
                          value={dev.last_verified_at
                            ? new Date(dev.last_verified_at).toLocaleDateString('en-IN')
                            : 'Never'}
                        />
                        <Detail
                          label="Next Renewal"
                          value={dev.next_renewal_at
                            ? new Date(dev.next_renewal_at).toLocaleDateString('en-IN')
                            : '—'}
                        />
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dtype">Device Type *</Label>
                    <select
                      id="dtype"
                      value={form.deviceType}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, deviceType: e.target.value }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select type...</option>
                      {deviceTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serial">Serial Number *</Label>
                    <Input
                      id="serial"
                      value={form.serialNumber}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, serialNumber: e.target.value }))
                      }
                      placeholder="e.g. EB-SAN-2025-0042"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mfr">Manufacturer *</Label>
                    <Input
                      id="mfr"
                      value={form.manufacturer}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, manufacturer: e.target.value }))
                      }
                      placeholder="e.g. Sansha Electronics"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={form.model}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, model: e.target.value }))
                      }
                      placeholder="e.g. S-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cap">Nominal Capacity *</Label>
                    <Input
                      id="cap"
                      value={form.nominalCapacity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, nominalCapacity: e.target.value }))
                      }
                      placeholder="e.g. 30 kg, 500 kg, 60 tonne"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acc">Accuracy Class</Label>
                    <select
                      id="acc"
                      value={form.accuracyClass}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, accuracyClass: e.target.value }))
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select class...</option>
                      {accuracyClasses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Application type */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Application Type
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select the type of verification you are requesting.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() =>
                    setForm((f) => ({ ...f, applicationType: 'NEW_VERIFICATION' }))
                  }
                  className={cn(
                    'rounded-lg border-2 p-4 text-left transition-colors',
                    form.applicationType === 'NEW_VERIFICATION'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-accent/40'
                  )}
                >
                  <FileCheck className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    New Verification
                  </p>
                  <p className="text-xs text-muted-foreground">
                    First-time verification of a new or unverified instrument
                  </p>
                </button>
                <button
                  onClick={() =>
                    setForm((f) => ({ ...f, applicationType: 'RE_VERIFICATION' }))
                  }
                  className={cn(
                    'rounded-lg border-2 p-4 text-left transition-colors',
                    form.applicationType === 'RE_VERIFICATION'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-accent/40'
                  )}
                >
                  <CheckCircle2 className="mb-2 h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Re-verification
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Periodic renewal of an expired or expiring certificate
                  </p>
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Additional Remarks (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={form.remarks}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                  placeholder="Any additional information about the instrument or verification request..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Review &amp; Submit
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Please review the details below before submitting your
                  application.
                </p>
              </div>

              <div className="space-y-4">
                <ReviewSection title="Establishment">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Detail label="Name" value={establishment?.name || '—'} />
                    <Detail label="Owner" value={establishment?.owner_name || '—'} />
                    <Detail label="License No." value={establishment?.license_number || '—'} />
                    <Detail label="State" value={`${establishment?.district || ''}, ${establishment?.state || ''}`} />
                  </div>
                </ReviewSection>

                <ReviewSection title="Instrument">
                  {form.mode === 'existing' && form.deviceId ? (
                    (() => {
                      const dev = devices.find((d) => d.id === form.deviceId);
                      return dev ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Detail label="Device Type" value={dev.device_type} />
                          <Detail label="Serial Number" value={dev.serial_number} />
                          <Detail label="Manufacturer" value={dev.manufacturer} />
                          <Detail label="Capacity" value={dev.nominal_capacity} />
                        </div>
                      ) : null;
                    })()
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Detail label="Device Type" value={form.deviceType || '—'} />
                      <Detail label="Serial Number" value={form.serialNumber || '—'} />
                      <Detail label="Manufacturer" value={form.manufacturer || '—'} />
                      <Detail label="Capacity" value={form.nominalCapacity || '—'} />
                    </div>
                  )}
                </ReviewSection>

                <ReviewSection title="Application">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Detail
                      label="Type"
                      value={form.applicationType === 'NEW_VERIFICATION'
                        ? 'New Verification'
                        : 'Re-verification'}
                    />
                    <Detail label="Status" value="Ready to submit" />
                  </div>
                </ReviewSection>
              </div>

              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">
                  By submitting this application, you confirm that the
                  information provided is accurate and that the instrument is
                  available for inspection at the registered premises. You will
                  receive a notification once an officer is assigned.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {step < 4 ? (
              <Button
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={!canProceed()}
                className="gap-1.5"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-1.5"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ReviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-primary">{title}</h3>
      {children}
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell>
          <div className="h-96 animate-pulse rounded-lg bg-muted" />
        </DashboardShell>
      }
    >
      <NewApplicationForm />
    </Suspense>
  );
}
