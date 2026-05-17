import { SidebarLink } from "./SidebarLink";
import { SearchTriggerButton } from "./SearchModal";

interface SidebarProps {
  stats?: { hardwareCount: number; lastUpdate: string };
}

export function Sidebar({ stats }: SidebarProps) {
  return (
    <aside className="w-[260px] md:w-[220px] h-full md:h-auto bg-[var(--color-canvas)] shrink-0 border-r border-[var(--color-border)] p-5 pt-6 text-sm overflow-y-auto">
      <div className="mb-4 flex items-center gap-2 text-[var(--color-text-primary)] font-semibold">
        <span className="text-[10px] text-[var(--color-accent)]">●</span>
        <span>GardenOS</span>
      </div>

      <div className="mb-5">
        <SearchTriggerButton />
      </div>

      <nav className="space-y-1">
        <SidebarLink href="/">Home</SidebarLink>
        <SidebarLink href="/architecture">Architecture</SidebarLink>
        <SidebarLink href="/hardware">Hardware</SidebarLink>
        <SidebarLink href="/software">Software</SidebarLink>
        <SidebarLink href="/log">Daily Log</SidebarLink>
        <SidebarLink href="/photos">Photos</SidebarLink>
        <SidebarLink href="/plants">Plants</SidebarLink>
        <SidebarLink href="/plant-logs">Plant Logs</SidebarLink>
      </nav>

      {/* Phase 2 placeholder — Live sensor section. Hidden until populated. */}
      <div className="mt-6 hidden" data-section="live" aria-hidden="true">
        <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Live</div>
        <div className="text-[var(--color-text-muted)]">Coming in Phase 2.</div>
      </div>

      {stats && (
        <div className="mt-6 pt-4 border-t border-[var(--color-border)] text-[11px] leading-relaxed text-[var(--color-text-muted)]">
          <div>{stats.hardwareCount} hardware item{stats.hardwareCount === 1 ? "" : "s"}</div>
          <div>Last update: {stats.lastUpdate}</div>
        </div>
      )}
    </aside>
  );
}
