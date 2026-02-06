import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SessionData, PasscodeEntry } from '@/types/content';
import { getSession, clearSession, createSession, validatePasscode } from '@/lib/auth';

interface AuthContextType {
  session: SessionData | null;
  isLoading: boolean;
  login: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [passcodes, setPasscodes] = useState<PasscodeEntry[]>([]);

  // Load session and passcodes on mount
  useEffect(() => {
    const init = async () => {
      // Check for existing session
      const existingSession = getSession();
      if (existingSession) {
        setSession(existingSession);
      }

      // Load passcodes
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}passcodes.json`);
        const data = await response.json();
        setPasscodes(data.passcodes || []);
      } catch (error) {
        console.error('Failed to load passcodes:', error);
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const login = useCallback(async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    if (!passcode.trim()) {
      return { success: false, error: 'Please enter a passcode' };
    }

    const entry = await validatePasscode(passcode, passcodes);
    if (!entry) {
      return { success: false, error: 'Invalid passcode. Please try again.' };
    }

    const newSession = createSession(entry);
    setSession(newSession);
    return { success: true };
  }, [passcodes]);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
