"use client";
import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        const { redirect } = await res.json();
        const safe = typeof redirect === "string" && redirect.startsWith("/") && !redirect.startsWith("//") && !redirect.startsWith("/\\")
          ? redirect : "/console";
        window.location.href = safe;
      } else {
        const { error } = await res.json().catch(() => ({ error: "Login failed" }));
        setError(error || "Login failed");
      }
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)]">
      <form onSubmit={submit} className="w-[320px] border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-[var(--color-accent)]">●</span>
          <span className="font-semibold">GardenOS Console</span>
        </div>
        <label htmlFor="pw" className="block text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Admin password</label>
        <input id="pw" name="password" type="password" autoComplete="current-password" autoFocus
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-3 py-2 text-sm focus:border-[var(--color-accent)] outline-none" />
        {error && <div className="mt-3 text-[12px] text-red-400">{error}</div>}
        <button type="submit" disabled={busy}
          className="mt-4 w-full bg-[var(--color-accent)] text-black font-medium py-2 rounded text-sm disabled:opacity-50">
          {busy ? "..." : "Enter Console"}
        </button>
      </form>
    </div>
  );
}
