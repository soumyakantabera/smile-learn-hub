import { appConfig } from '@/config/app.config';
import type { PasscodeEntry, SessionData } from '@/types/content';

// SHA-256 hash function using Web Crypto API
export async function hashPasscode(passcode: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Validate passcode against stored hashes
export async function validatePasscode(
  passcode: string,
  passcodes: PasscodeEntry[]
): Promise<PasscodeEntry | null> {
  const hash = await hashPasscode(passcode);
  return passcodes.find(p => p.hash === hash) || null;
}

// Session management
export function createSession(entry: PasscodeEntry): SessionData {
  const expiresAt = Date.now() + appConfig.session.expiryHours * 60 * 60 * 1000;
  const session: SessionData = {
    batchKey: entry.batchKey,
    batchLabel: entry.label,
    expiresAt,
  };
  localStorage.setItem(appConfig.session.storageKey, JSON.stringify(session));
  return session;
}

export function getSession(): SessionData | null {
  try {
    const stored = localStorage.getItem(appConfig.session.storageKey);
    if (!stored) return null;
    
    const session: SessionData = JSON.parse(stored);
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(appConfig.session.storageKey);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
