'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCog, ArrowRight, CheckCircle2 } from 'lucide-react';
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
import { supabase, type Officer } from '@/lib/supabase';

export default function OfficerLoginPage() {
  const router = useRouter();
  const { setActor } = useRole();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('officers')
        .select('*')
        .in('designation', ['LMO', 'GATC_OFFICER'])
        .order('name');
      if (data) setOfficers(data as Officer[]);
      setLoading(false);
    })();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setActor({ role: 'officer', officerId: selected });
    router.push('/dashboard/officer');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UserCog className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl">Officer Sign In</CardTitle>
          <CardDescription>
            Legal Metrology Officer or GATC Field Officer portal access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="officer">Registered Officer</Label>
              <select
                id="officer"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">
                  {loading ? 'Loading...' : 'Select your officer profile'}
                </option>
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.name} — {off.designation} ({off.region})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Official Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="officer@legalmetro.gov.in"
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
            Demo portal — select any officer to continue. No real credentials
            are required.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
