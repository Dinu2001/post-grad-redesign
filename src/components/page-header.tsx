export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3">
        <span className="h-8 w-1.5 rounded-full bg-brand-gradient" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="mt-1.5 pl-4 text-sm text-neutral-500">{subtitle}</p>
      )}
    </header>
  );
}

export function PlaceholderCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-shadow rounded-2xl border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
      {children}
    </div>
  );
}
