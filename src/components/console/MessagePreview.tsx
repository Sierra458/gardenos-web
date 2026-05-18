"use client";

interface ToolResult {
  toolName: string;
  result?: { url?: string; number?: number; message?: string };
  args?: unknown;
}

export function MessagePreview({ tool }: { tool: ToolResult }) {
  if (tool.toolName === "commit_to_github" && tool.result?.url) {
    return (
      <div className="mt-3 border border-[var(--color-accent)] bg-[var(--color-surface)] rounded-lg p-3">
        <div className="text-[11px] uppercase tracking-wider text-[var(--color-accent)] mb-1">PR opened</div>
        <a href={tool.result.url} target="_blank" rel="noopener"
          className="text-[14px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] block">
          #{tool.result.number} — Review & merge →
        </a>
        <div className="text-[11px] text-[var(--color-text-muted)] mt-1">Site updates after merge.</div>
      </div>
    );
  }
  return null;
}
