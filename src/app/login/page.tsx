"use client";
import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from") || "/";
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password, from }),
    });
    if (res.ok) {
      const { redirect } = await res.json();
      window.location.href = redirect;
    } else {
      const { error } = await res.json().catch(() => ({ error: "Login failed" }));
      setError(error || "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-canvas)]">
      <form onSubmit={submit} className="w-[320px] border border-[var(--color-border)] bg-[var(--color-surface)] rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-[var(--color-accent)]">●</span>
          <span className="font-semibold">GardenOS</span>
        </div>
        <label htmlFor="pw" className="block text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Password</label>
        <input
          id="pw"
          type="password"
          autoFocus
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full bg-[var(--color-canvas)] border border-[var(--color-border)] rounded px-3 py-2 text-sm focus:border-[var(--color-accent)] outline-none"
        />
        {error && <div className="mt-3 text-[12px] text-red-400">{error}</div>}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full bg-[var(--color-accent)] text-black font-medium py-2 rounded text-sm disabled:opacity-50"
        >
          {busy ? "..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
