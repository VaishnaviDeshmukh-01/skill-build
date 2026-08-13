import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

/**
 * Light/dark switch. Renders a stable icon during SSR and swaps after
 * hydration once the resolved theme is known.
 */
export function ThemeToggle({ className }: { className?: string | undefined }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      {...(className ? { className } : {})}
    >
      {isDark ? <Sun className="size-[1.15rem]" /> : <Moon className="size-[1.15rem]" />}
    </Button>
  );
}
