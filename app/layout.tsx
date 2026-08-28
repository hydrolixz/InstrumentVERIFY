import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { RoleProvider } from '@/lib/role-context';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Online Verification System | Department of Consumer Affairs',
  description:
    'Digital verification and certification of weighing and measuring instruments under the Legal Metrology Act, 2009.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RoleProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
