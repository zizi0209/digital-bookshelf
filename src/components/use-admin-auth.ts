"use client";
import { useEffect, useState } from "react";

const SESSION_KEY = "admin_session";

export type AdminSession = { email: string; expiresAt: number } | null;

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed: AdminSession = JSON.parse(raw);
      if (parsed && parsed.expiresAt > Date.now()) {
        setSession(parsed);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  function login(email: string) {
    const data: AdminSession = { email, expiresAt: Date.now() + 8 * 60 * 60 * 1000 }; // 8h
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setSession(data);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  return { session, loading, login, logout };
}
