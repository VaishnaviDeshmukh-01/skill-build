import { Link } from "@tanstack/react-router";
import { AlertTriangle, Inbox, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface space-y-3 p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({
  message = "We couldn't load this right now. Please try again.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="surface flex flex-col items-center gap-3 p-10 text-center">
      <AlertTriangle className="size-8 text-warning" aria-hidden />
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface flex flex-col items-center gap-3 p-10 text-center">
      <Inbox className="size-8 text-muted-foreground" aria-hidden />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function UnauthorizedState({
  title = "Please sign in",
  description = "This page uses your assessment data, so you need an account to view it.",
  showAuthActions = true,
}: {
  title?: string;
  description?: string;
  showAuthActions?: boolean;
}) {
  return (
    <div className="surface mx-auto flex max-w-md flex-col items-center gap-3 p-10 text-center">
      <Lock className="size-8 text-muted-foreground" aria-hidden />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {showAuthActions ? (
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/register">Create account</Link>
          </Button>
        </div>
      ) : (
        <Button asChild variant="outline">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      )}
    </div>
  );
}

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-warning/40 bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning-foreground ${className}`}
    >
      Demo data
    </span>
  );
}
