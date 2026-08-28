import { Scale, ShieldCheck, FileCheck, QrCode, BarChart3 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Scale className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          About the Verification System
        </h1>
        <p className="mt-3 text-muted-foreground">
          The Online Verification System is a Government of India initiative
          under the Department of Consumer Affairs to digitise the verification
          and certification of weighing and measuring instruments used in
          trade and commerce.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <ShieldCheck className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Legal Metrology Act, 2009</CardTitle>
            <CardDescription>
              The Act mandates that every weighing and measuring instrument
              used in trade must be verified and stamped by a notified
              authority before being put to use, and re-verified periodically.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <QrCode className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Tamper-Evident Certificates</CardTitle>
            <CardDescription>
              Each digital certificate carries an embedded QR code containing
              certificate metadata and an HMAC-SHA256 signature, enabling
              instant public authentication and fraud detection.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <FileCheck className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Accuracy Testing</CardTitle>
            <CardDescription>
              Field officers record accuracy test calculations — nominal
              value, observed value, error, and Maximum Permissible Error
              (MPE) — with automatic PASS / FAIL evaluation against Legal
              Metrology MPE limits.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <BarChart3 className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>Enforcement Monitoring</CardTitle>
            <CardDescription>
              State administrators monitor enforcement metrics, regional
              compliance rates, pendency statistics, and officer assignments
              through a comprehensive dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-10 rounded-lg border border-border/60 bg-muted/30 p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Stakeholders
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">
              Establishments / Device Owners:
            </strong>{' '}
            Commercial entities that own and operate weighing or measuring
            instruments and are responsible for submitting them for
            verification.
          </li>
          <li>
            <strong className="text-foreground">
              Legal Metrology Officers (LMOs):
            </strong>{' '}
            Government officials responsible for reviewing applications,
            conducting field inspections, and issuing verification
            certificates.
          </li>
          <li>
            <strong className="text-foreground">
              GATC Field Officers:
            </strong>{' '}
            Government Approved Test Centre personnel who assist in field
            testing and calibration of instruments.
          </li>
          <li>
            <strong className="text-foreground">
              State Department Administrators:
            </strong>{' '}
            Senior officials who oversee enforcement, compliance, and
            operational efficiency across their jurisdiction.
          </li>
        </ul>
      </div>
    </div>
  );
}
