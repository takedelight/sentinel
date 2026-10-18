"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { randomDelay } from "@/shared/lib/delay";

export interface Session {
  email: string;
  name: string;
}

interface AuthContextValue {
  session: Session | null;
  ready: boolean;
  login: (email: string) => Promise<Session>;
  logout: () => void;
}

const STORAGE_KEY = "sentinel.session.v1";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Session>;
    if (typeof parsed.email !== "string" || typeof parsed.name !== "string") {
      return null;
    }

    return { email: parsed.email, name: parsed.name };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readStoredSession());
    setReady(true);
  }, []);

  const login = useCallback(async (email: string): Promise<Session> => {
    await randomDelay(700, 1200);

    const localPart = email.split("@")[0]?.trim() || "admin";
    const name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
    const next: Session = { email, name };

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors (private mode, quota, ...)
    }

    setSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }

    setSession(null);
  }, []);

  const value = useMemo(() => ({ session, ready, login, logout }), [session, ready, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }

  return context;
}
