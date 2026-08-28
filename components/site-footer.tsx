import Link from 'next/link';
import { Scale, Mail, Phone, Globe } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">
                  Department of Consumer Affairs
                </p>
                <p className="text-xs text-muted-foreground">
                  Ministry of Consumer Affairs, Food &amp; Public Distribution
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              The Online Verification System enables digital verification and
              certification of weighing and measuring instruments under the
              Legal Metrology Act, 2009, ensuring fairness, accuracy, and
              consumer protection in trade and commerce.
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">
              Quick Links
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/verify" className="hover:text-accent">
                  Verify a Certificate
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-accent">
                  About the Portal
                </Link>
              </li>
              <li>
                <Link href="/login/owner" className="hover:text-accent">
                  Establishment Login
                </Link>
              </li>
              <li>
                <Link href="/login/officer" className="hover:text-accent">
                  Officer Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">
              Contact
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                consumeraffairs.gov.in
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                legalmetrology@ca.gov.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                1800-11-4000 (Toll Free)
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Department of Consumer Affairs,
            Government of India. All rights reserved. This is a demonstration
            portal for illustrative purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
