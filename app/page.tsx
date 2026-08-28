import Link from 'next/link';
import {
  Scale,
  ShieldCheck,
  FileCheck,
  QrCode,
  Users,
  ClipboardCheck,
  BarChart3,
  ArrowRight,
  Building2,
  UserCog,
  Crown,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="gov-gradient relative overflow-hidden">
        <div className="gov-pattern absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
            >
              Legal Metrology Act, 2009
            </Badge>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl md:text-5xl">
              Online Verification System for Weighing &amp; Measuring Instruments
            </h1>
            <p className="mt-4 text-balance text-base text-primary-foreground/80 sm:text-lg">
              A unified digital platform for the submission, inspection, and
              certification of commercial weighing and measuring instruments —
              ensuring accuracy, transparency, and consumer trust in every
              transaction.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login/owner">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Building2 className="h-5 w-5" />
                  Submit for Verification
                </Button>
              </Link>
              <Link href="/verify">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  <QrCode className="h-5 w-5" />
                  Verify a Certificate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                icon: FileCheck,
                label: 'Instruments Verified',
                value: '12,847',
                color: 'text-success',
              },
              {
                icon: Clock,
                label: 'Pending Applications',
                value: '326',
                color: 'text-warning',
              },
              {
                icon: AlertTriangle,
                label: 'Expiring Soon',
                value: '84',
                color: 'text-destructive',
              },
              {
                icon: ShieldCheck,
                label: 'Active Certificates',
                value: '11,219',
                color: 'text-accent',
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon
                  className={`mx-auto mb-2 h-7 w-7 ${stat.color}`}
                />
                <p className="text-2xl font-bold text-foreground sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role cards */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Access Your Portal
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three role-based dashboards designed for every stakeholder in the
            verification lifecycle.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Building2,
              role: 'Establishment / Device Owner',
              desc: 'Submit verification applications for your instruments, track status, and download digital certificates.',
              href: '/login/owner',
              cta: 'Owner Portal',
              features: [
                'Multi-step application submission',
                'Track application status',
                'Download digital certificates',
                'Renewal expiry alerts',
              ],
            },
            {
              icon: UserCog,
              role: 'Legal Metrology / GATC Officer',
              desc: 'Review applications, conduct field inspections, record calibration calculations, and issue certificates.',
              href: '/login/officer',
              cta: 'Officer Portal',
              features: [
                'Review & assign applications',
                'Record accuracy test calculations',
                'Auto-evaluate PASS / FAIL status',
                'Issue QR-enabled certificates',
              ],
            },
            {
              icon: Crown,
              role: 'State Department Administrator',
              desc: 'Monitor enforcement metrics, regional compliance, pendency statistics, and officer assignments.',
              href: '/login/admin',
              cta: 'Admin Portal',
              features: [
                'Enforcement metrics dashboard',
                'Regional compliance overview',
                'Pendency & backlog statistics',
                'Officer assignment tracking',
              ],
            },
          ].map((card) => (
            <Card
              key={card.role}
              className="group flex flex-col transition-all hover:shadow-lg"
            >
              <CardHeader>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <card.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{card.role}</CardTitle>
                <CardDescription>{card.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-2">
                  {card.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={card.href}>
                  <Button className="w-full gap-2">
                    {card.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              How Verification Works
            </h2>
            <p className="mt-2 text-muted-foreground">
              A streamlined digital workflow from application to certified
              instrument.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                step: 1,
                icon: Users,
                title: 'Application Submission',
                desc: 'Establishment owners submit instrument details through a guided multi-step form.',
              },
              {
                step: 2,
                icon: ClipboardCheck,
                title: 'Field Inspection',
                desc: 'Officers conduct on-site accuracy tests and record calibration calculations.',
              },
              {
                step: 3,
                icon: FileCheck,
                title: 'Certificate Issuance',
                desc: 'Upon passing, a digital certificate with an embedded QR code is generated.',
              },
              {
                step: 4,
                icon: BarChart3,
                title: 'Monitoring &amp; Renewal',
                desc: 'Administrators monitor compliance; owners receive renewal alerts before expiry.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="mb-1 text-sm font-semibold text-primary">
                  Step {item.step}
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p
                  className="text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: item.desc }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-10 text-center md:flex-row md:justify-between md:text-left">
            <div className="flex items-center gap-4">
              <Scale className="hidden h-12 w-12 shrink-0 sm:block" />
              <div>
                <h3 className="text-xl font-bold sm:text-2xl">
                  Ready to verify your instruments?
                </h3>
                <p className="mt-1 text-primary-foreground/80">
                  Get started with a digital verification application today.
                </p>
              </div>
            </div>
            <Link href="/login/owner">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 whitespace-nowrap"
              >
                Start Application
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
