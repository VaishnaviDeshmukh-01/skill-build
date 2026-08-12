import { SiteFooter, SiteHeader } from "@/components/site-header";

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="hero-mesh border-b border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
        )}
      </div>
    </section>
  );
}
