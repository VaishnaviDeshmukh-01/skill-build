import { Link, useNavigate } from "@tanstack/react-router";
import {
  BotMessageSquare,
  Compass,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  Menu,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/site-header";
import { UnauthorizedState } from "@/components/state-views";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/assessment", label: "Skill Assessment", icon: ListChecks },
  { to: "/results", label: "Skill Gaps", icon: TrendingUp },
  { to: "/roadmap", label: "Roadmap", icon: Map },
  { to: "/progress", label: "Progress", icon: Compass },
  { to: "/advisor", label: "AI Advisor", icon: BotMessageSquare },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Student" className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          activeProps={{ className: "bg-sidebar-accent text-foreground" }}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
  requireAuth = true,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: React.ReactNode | undefined;
  children: React.ReactNode;
  requireAuth?: boolean | undefined;
}) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    void navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Logo className="mb-6 px-1" />
        <NavList />
        <div className="mt-auto space-y-2 border-t border-sidebar-border pt-4">
          {user && (
            <div className="px-3">
              <p className="truncate text-sm font-medium">{user.full_name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="glass sticky top-0 z-30 flex items-center gap-3 border-x-0 border-t-0 border-b border-border px-4 py-4 sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Logo className="mb-6 px-1" />
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-bold sm:text-2xl">{title}</h1>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <ThemeToggle />
          {actions}
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : requireAuth && !user ? (
            <UnauthorizedState />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
