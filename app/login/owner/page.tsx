'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRole } from '@/lib/role-context';
import { supabase, type Establishment } from '@/lib/supabase';

export default function OwnerLoginPage() {
  const router = useRouter();
  const { setActor } = useRole();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('establishments')
        .select('*')
        .order('name');
      if (data) setEstablishments(data as Establishment[]);
      setLoading(false);
    })();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setActor({ role: 'owner', establishmentId: selected });
    router.push('/dashboard/owner');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Establishment Sign In</CardTitle>
          <CardDescription>
            Select your establishment to access the device owner portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="est">Registered Establishment</Label>
              <select
                id="est"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">
                  {loading ? 'Loading...' : 'Select your establishment'}
                </option>
                {establishments.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name} — {est.district}, {est.state}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="owner@establishment.in"
                defaultValue=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Password</Label>
              <Input
                id="pass"
                type="password"
                placeholder="••••••••"
                defaultValue="demo"
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={!selected}
            >
              <CheckCircle2 className="h-4 w-4" />
              Sign In to Portal
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Demo portal — select any establishment to continue. No real
            credentials are required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
