import { Link } from "@tanstack/react-router";
import { Menu, Waypoints } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/careers", label: "Explore Careers" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
] as const;

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Waypoints className="size-5" aria-hidden />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">SkillBridge</span>
    </Link>
  );
}

export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0 border-b border-border/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "text-foreground bg-muted" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Button asChild>
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav aria-label="Mobile" className="mt-8 flex flex-col gap-1 px-4">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {user ? (
                  <Button asChild onClick={() => setOpen(false)}>
                    <Link to="/dashboard">Go to dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild onClick={() => setOpen(false)}>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Turn your career aspiration into a clear action plan.
          </p>
        </div>
        <FooterCol
          title="Platform"
          links={[
            { to: "/careers", label: "Explore Careers" },
            { to: "/how-it-works", label: "How It Works" },
            { to: "/discovery", label: "Career Discovery" },
          ]}
        />
        <FooterCol
          title="Account"
          links={[
            { to: "/login", label: "Login" },
            { to: "/register", label: "Create account" },
            { to: "/admin", label: "Admin" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "About" },
            { to: "/advisor", label: "AI Career Advisor" },
          ]}
        />
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        SkillBridge is an educational planning tool. Readiness scores are alignment estimates, not
        guarantees of employment or income.
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
