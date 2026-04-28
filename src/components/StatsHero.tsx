interface Stat {
  label: string;
  value: string | number;
  detail?: string;
}

export function StatsHero({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
      {stats.map(s => (
        <div
          key={s.label}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg px-4 py-3"
        >
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{s.label}</div>
          <div className="text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)] mt-0.5 leading-none">{s.value}</div>
          {s.detail && (
            <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">{s.detail}</div>
          )}
        </div>
      ))}
    </div>
  );
}
