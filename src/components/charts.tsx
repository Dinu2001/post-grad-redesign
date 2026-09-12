import type { ReactNode } from "react";

/* ------------------------------------------------------------------ *
 * Dependency-free SVG charts + dashboard widgets.
 * All components are pure (no client hooks) so they render inside
 * React Server Components without a charting library.
 * ------------------------------------------------------------------ */

export const CHART_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#06b6d4", // cyan
];

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  /** tailwind gradient stops, e.g. "from-indigo-500 to-violet-500" */
  accent?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "from-indigo-500 to-violet-500",
}: StatCardProps) {
  return (
    <div className="card-shadow relative overflow-hidden rounded-2xl border border-border bg-white p-5">
      <div
        className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-10`}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        {icon && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-sm`}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`card-shadow rounded-2xl border border-border bg-white p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

type Slice = { label: string; value: number; color?: string };

/** Donut chart with a centered total and a legend. */
export function DonutChart({
  data,
  size = 180,
  thickness = 26,
  centerLabel = "Total",
}: {
  data: Slice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={thickness}
          />
          {total > 0 &&
            data.map((d, i) => {
              const frac = d.value / total;
              const len = frac * circ;
              const seg = (
                <circle
                  key={d.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={d.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${circ - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return seg;
            })}
        </g>
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontSize: 28, fontWeight: 700 }}
        >
          {total}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          className="fill-neutral-400"
          style={{ fontSize: 12 }}
        >
          {centerLabel}
        </text>
      </svg>
      <ul className="space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-full"
              style={{
                background: d.color ?? CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
            <span className="text-neutral-600">{d.label}</span>
            <span className="ml-auto font-semibold text-foreground">
              {d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Vertical bar chart. */
export function BarChart({
  data,
  height = 200,
}: {
  data: Slice[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 28);
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-semibold text-foreground">
              {d.value}
            </span>
            <div
              className="w-full rounded-t-lg transition-all"
              style={{
                height: Math.max(4, h),
                background: `linear-gradient(180deg, ${
                  d.color ?? CHART_COLORS[i % CHART_COLORS.length]
                }, ${d.color ?? CHART_COLORS[i % CHART_COLORS.length]}bb)`,
              }}
            />
            <span className="max-w-full truncate text-[11px] text-neutral-500">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Circular progress ring for a single percentage. */
export function ProgressRing({
  value,
  total,
  size = 140,
  thickness = 14,
  color = "#4f46e5",
  label = "complete",
}: {
  value: number;
  total: number;
  size?: number;
  thickness?: number;
  color?: string;
  label?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </g>
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        className="fill-foreground"
        style={{ fontSize: 26, fontWeight: 700 }}
      >
        {pct}%
      </text>
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        className="fill-neutral-400"
        style={{ fontSize: 11 }}
      >
        {label}
      </text>
    </svg>
  );
}

/** Horizontal progress/segmented bar. */
export function ProgressBar({
  value,
  total,
  color = "#4f46e5",
}: {
  value: number;
  total: number;
  color?: string;
}) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
