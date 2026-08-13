import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "skillbridge.theme";

interface ThemeContextValue {
  /** The user's stored preference. */
  theme: Theme;
  /** The theme actually applied to the document right now. */
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Inline script injected into <head> so the correct theme class is present
 * before first paint. Without this the app flashes light before hydration.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem("${STORAGE_KEY}")||"system";var d=s==="dark"||(s==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

function systemPrefersDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function apply(theme: Theme): "light" | "dark" {
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  return dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Read the stored preference after hydration so SSR markup stays stable.
  useEffect(() => {
    const stored = (window.localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
    setThemeState(stored);
    setResolvedTheme(apply(stored));
  }, []);

  // Follow the OS when the user hasn't pinned a theme.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(apply("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
    setResolvedTheme(apply(next));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
