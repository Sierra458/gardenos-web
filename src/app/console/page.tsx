import { ChatPanel } from "@/components/console/ChatPanel";

export const dynamic = "force-dynamic"; // auth-gated; never prerender

export const metadata = { title: "Console · GardenOS" };

export default function ConsolePage() {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)]">
      <header className="border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-2 sticky top-0 bg-[var(--color-canvas)] z-10">
        <span className="text-xs text-[var(--color-accent)]">●</span>
        <span className="font-semibold text-sm">GardenOS Console</span>
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] ml-2">admin</span>
        <a href="/" className="ml-auto text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]">Site →</a>
      </header>
      <ChatPanel />
    </div>
  );
}
