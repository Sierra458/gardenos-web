import Link from "next/link";

export interface Section {
  href: string;
  emoji: string;
  label: string;
  count: number;
  unit: string;        // plural, e.g. "items"
  unitSingular: string; // singular, e.g. "item"
  description?: string;
}

export function SectionGrid({ sections }: { sections: Section[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sections.map(s => (
        <Link
          key={s.href}
          href={s.href}
          className="group border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg p-4 hover:border-[var(--color-accent)] hover:bg-[#141414] transition-colors flex items-start gap-3"
        >
          <div className="text-[28px] leading-none shrink-0 mt-0.5" aria-hidden="true">{s.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-semibold text-[var(--color-text-primary)] text-[15px]">{s.label}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] shrink-0">
                {s.count} {s.count === 1 ? s.unitSingular : s.unit}
              </div>
            </div>
            {s.description && (
              <div className="text-[12px] text-[var(--color-text-secondary)] mt-1 line-clamp-2">{s.description}</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
