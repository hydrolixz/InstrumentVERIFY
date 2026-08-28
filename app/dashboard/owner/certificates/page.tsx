'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardShell } from '@/components/dashboard-shell';
import { CertificateStatusBadge } from '@/components/status-badges';
import { useRole } from '@/lib/role-context';
import { supabase } from '@/lib/supabase';

type CertWithRelations = {
  id: string;
  certificate_number: string;
  issued_date: string;
  valid_until: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  devices: { device_type: string; serial_number: string } | null;
};

export default function OwnerCertificatesPage() {
  const router = useRouter();
  const { actor } = useRole();
  const [certs, setCerts] = useState<CertWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor || actor.role !== 'owner') {
      router.push('/login/owner');
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('certificates')
        .select(`
          id,
          certificate_number,
          issued_date,
          valid_until,
          status,
          devices ( device_type, serial_number )
        `)
        .eq('establishment_id', actor.establishmentId)
        .order('issued_date', { ascending: false });
      setCerts((data as CertWithRelations[]) || []);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Digital Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and download your verification certificates with embedded QR codes.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-muted" />
              ))}
            </div>
          ) : certs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-medium text-foreground">No certificates yet</p>
                <p className="text-xs text-muted-foreground">
                  Certificates are issued automatically after a successful inspection.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {certs.map((cert) => (
                <Link
                  key={cert.id}
                  href={`/dashboard/owner/certificates/${cert.id}`}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {cert.certificate_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cert.devices?.device_type} · {cert.devices?.serial_number}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Issued: {new Date(cert.issued_date).toLocaleDateString('en-IN')}{' '}
                        · Valid until: {new Date(cert.valid_until).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CertificateStatusBadge status={cert.status} />
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      View
                    </Button>
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
