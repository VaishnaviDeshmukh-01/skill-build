import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService, type RegisterInput } from "@/services/auth";
import type { User } from "@/services/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginDemo: (role?: "student" | "admin") => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await authService.me();
    setUser(me);
  }, []);

  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((me) => active && setUser(me))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      setUser,
      refresh,
      login: async (email, password) => {
        const u = await authService.login(email, password);
        setUser(u);
        return u;
      },
      loginDemo: async (role = "student") => {
        const u = await authService.loginDemo(role);
        setUser(u);
        return u;
      },
      register: async (input) => {
        const u = await authService.register(input);
        setUser(u);
        return u;
      },
      logout: async () => {
        await authService.logout();
        setUser(null);
      },
    }),
    [user, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
