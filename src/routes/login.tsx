import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicPage } from "@/components/public-page";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — SkillBridge" },
      { name: "description", content: "Sign in to your SkillBridge account to continue your career readiness plan." },
      { property: "og:title", content: "Login — SkillBridge" },
      { property: "og:description", content: "Sign in to continue your SkillBridge plan." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}`);
      void navigate({ to: user.role === "admin" ? "/admin" : "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const demo = async (role: "student" | "admin") => {
    setBusy(true);
    try {
      await loginDemo(role);
      void navigate({ to: role === "admin" ? "/admin" : "/dashboard" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublicPage>
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to continue your plan.</p>

        <form onSubmit={submit} className="surface mt-8 space-y-4 p-6" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox id="remember" defaultChecked /> Remember me
            </label>
            <Link to="/login" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="surface mt-6 space-y-3 p-5">
          <p className="text-sm font-semibold">Demo access</p>
          <p className="text-xs text-muted-foreground">
            Explore the full journey with pre-filled demo data.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={() => void demo("student")}>
              Demo Student
            </Button>
            <Button variant="outline" size="sm" disabled={busy} onClick={() => void demo("admin")}>
              Demo Admin
            </Button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </PublicPage>
  );
}
