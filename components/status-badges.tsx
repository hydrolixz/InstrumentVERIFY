import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  ApplicationStatus,
  Device,
  Certificate,
} from '@/lib/supabase';

const statusConfig: Record<
  ApplicationStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground border-border' },
  SUBMITTED: { label: 'Submitted', className: 'bg-secondary text-secondary-foreground border-transparent' },
  UNDER_REVIEW: { label: 'Under Review', className: 'bg-accent/15 text-accent border-accent/20' },
  SCHEDULED: { label: 'Scheduled', className: 'bg-warning/15 text-warning border-warning/20' },
  INSPECTION: { label: 'Inspection', className: 'bg-warning/15 text-warning border-warning/20' },
  APPROVED: { label: 'Approved', className: 'bg-success/15 text-success border-success/20' },
  REJECTED: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/20' },
  CERTIFICATE_ISSUED: { label: 'Certified', className: 'bg-success text-success-foreground border-transparent' },
};

export function ApplicationStatusBadge({
  status,
}: {
  status: ApplicationStatus;
}) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn('whitespace-nowrap', config.className)}>
      {config.label}
    </Badge>
  );
}

const deviceStatusConfig: Record<Device['status'], { label: string; className: string }> = {
  PENDING_VERIFICATION: { label: 'Pending Verification', className: 'bg-warning/15 text-warning border-warning/20' },
  VERIFIED: { label: 'Verified', className: 'bg-success/15 text-success border-success/20' },
  EXPIRED: { label: 'Expired', className: 'bg-destructive/15 text-destructive border-destructive/20' },
  REJECTED: { label: 'Rejected', className: 'bg-destructive/15 text-destructive border-destructive/20' },
};

export function DeviceStatusBadge({ status }: { status: Device['status'] }) {
  const config = deviceStatusConfig[status];
  return (
    <Badge variant="outline" className={cn('whitespace-nowrap', config.className)}>
      {config.label}
    </Badge>
  );
}

const certStatusConfig: Record<Certificate['status'], { label: string; className: string }> = {
  ACTIVE: { label: 'Active', className: 'bg-success/15 text-success border-success/20' },
  EXPIRED: { label: 'Expired', className: 'bg-destructive/15 text-destructive border-destructive/20' },
  REVOKED: { label: 'Revoked', className: 'bg-destructive text-destructive-foreground border-transparent' },
};

export function CertificateStatusBadge({ status }: { status: Certificate['status'] }) {
  const config = certStatusConfig[status];
  return (
    <Badge variant="outline" className={cn('whitespace-nowrap', config.className)}>
      {config.label}
    </Badge>
  );
}
