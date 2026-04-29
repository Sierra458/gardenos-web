export interface Zone {
  name: string;
  status: "thriving" | "healthy" | "watch" | "stressed" | "failed" | "ready" | "dormant";
  note?: string;
}

const STATUS_META: Record<Zone["status"], { emoji: string; label: string; color: string }> = {
  thriving: { emoji: "🌱", label: "Thriving", color: "var(--color-accent)" },
  healthy:  { emoji: "✅", label: "Healthy",  color: "var(--color-accent)" },
  ready:    { emoji: "🟢", label: "Ready",    color: "var(--color-accent)" },
  watch:    { emoji: "👀", label: "Watching", color: "#eab308" },
  stressed: { emoji: "⚠️",  label: "Stressed", color: "#f97316" },
  failed:   { emoji: "❌", label: "Failed",   color: "#ef4444" },
  dormant:  { emoji: "💤", label: "Dormant",  color: "#71717a" },
};

export function GardenStatus({ zones }: { zones: Zone[] }) {
  if (zones.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Garden status</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {zones.map(z => {
          const m = STATUS_META[z.status] ?? STATUS_META.healthy;
          return (
            <div
              key={z.name}
              className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg px-3 py-2.5 flex items-start gap-3"
            >
              <div className="text-[18px] shrink-0 mt-0.5" aria-hidden="true">{m.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-semibold text-[14px] text-[var(--color-text-primary)] truncate">{z.name}</div>
                  <div className="text-[10px] uppercase tracking-wider shrink-0" style={{ color: m.color }}>{m.label}</div>
                </div>
                {z.note && (
                  <div className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 leading-snug">{z.note}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
