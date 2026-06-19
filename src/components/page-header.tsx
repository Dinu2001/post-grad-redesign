export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-6 border-b border-border pb-4">
      <h1 className="text-2xl font-bold tracking-tight text-black">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
    </header>
  );
}

export function PlaceholderCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white p-8 text-center text-sm text-neutral-500">
      {children}
    </div>
  );
}
