import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import type { SessionUser } from '@/types/content';

interface AuthContextType {
  session: SessionUser | null;
  rawSession: Session | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function loadSessionUser(user: User): Promise<SessionUser> {
  // profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', user.id)
    .maybeSingle();
  // role
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle();
  return {
    id: user.id,
    email: profile?.email || user.email || '',
    fullName: profile?.full_name || null,
    phone: profile?.phone || null,
    isAdmin: !!role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [rawSession, setRawSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrate = useCallback(async (s: Session | null) => {
    setRawSession(s);
    setUser(s?.user ?? null);
    if (s?.user) {
      const su = await loadSessionUser(s.user);
      setSession(su);
    } else {
      setSession(null);
    }
  }, []);

  useEffect(() => {
    // Listener first
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      // Defer Supabase calls to avoid deadlocks
      setRawSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => {
          loadSessionUser(s.user!).then(setSession);
        }, 0);
      } else {
        setSession(null);
      }
    });
    // Then initial
    supabase.auth.getSession().then(({ data }) => {
      hydrate(data.session).finally(() => setIsLoading(false));
    });
    return () => sub.subscription.unsubscribe();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRawSession(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const su = await loadSessionUser(user);
      setSession(su);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ session, rawSession, user, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
