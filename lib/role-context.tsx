'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'owner' | 'officer' | 'admin';

export type Actor =
  | { role: 'owner'; establishmentId: string }
  | { role: 'officer'; officerId: string }
  | { role: 'admin'; officerId: string };

type RoleContextValue = {
  actor: Actor | null;
  setActor: (actor: Actor | null) => void;
  role: Role | null;
  setRole: (role: Role | null) => void;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

const STORAGE_KEY = 'dca-role-context';

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [actor, setActorState] = useState<Actor | null>(null);
  const [role, setRoleState] = useState<Role | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { actor: Actor };
        setActorState(parsed.actor);
        setRoleState(parsed.actor.role);
      }
    } catch {
      // ignore
    }
  }, []);

  const setActor = (a: Actor | null) => {
    setActorState(a);
    setRoleState(a?.role ?? null);
    if (a) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ actor: a }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const setRole = (r: Role | null) => {
    setRoleState(r);
    if (!r) {
      setActor(null);
    }
  };

  return (
    <RoleContext.Provider value={{ actor, setActor, role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
