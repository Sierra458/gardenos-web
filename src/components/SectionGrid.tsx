import Link from "next/link";

interface Section {
  href: string;
  emoji: string;
  label: string;
  count: number;
  unit: string;
}

export function SectionGrid({ sections }: { sections: Section[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {sections.map(s => (
        <Link
          key={s.href}
          href={s.href}
          className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg px-4 py-3 text-sm hover:border-[var(--color-text-muted)] transition-colors"
        >
          <span>{s.emoji} {s.label}</span>
          <span className="text-[var(--color-text-muted)] text-[11px] ml-2">· {s.count} {s.unit}</span>
        </Link>
      ))}
    </div>
  );
}
