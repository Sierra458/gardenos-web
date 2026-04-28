"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function LayoutShell({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    setOpen(isDesktop);
  }, []);

  // Close drawer on navigation when on mobile
  useEffect(() => {
    if (!mounted) return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop) setOpen(false);
  }, [pathname, mounted]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!mounted) return;
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (open && !isDesktop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open, mounted]);

  return (
    <>
      {/* Hamburger button — visible on mobile when sidebar closed */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className={`md:hidden fixed top-3 left-3 z-50 w-11 h-11 flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] shadow-lg transition-opacity ${mounted && !open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ marginTop: "env(safe-area-inset-top, 0px)", marginLeft: "env(safe-area-inset-left, 0px)" }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M3 5h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2z" />
        </svg>
      </button>

      <div className="flex min-h-screen">
        {/* Backdrop — mobile only, when drawer open */}
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className={`md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity ${mounted && open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />

        {/* Sidebar wrapper: fixed slide-in on mobile, static column on desktop */}
        <div
          className={`fixed md:static inset-y-0 left-0 z-40 transform md:transform-none transition-transform duration-200 ease-out ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          {/* Close button — mobile only, inside drawer */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
          {sidebar}
        </div>

        <main
          className="flex-1 w-full max-w-[72ch] mx-auto md:mx-0"
          style={{
            paddingTop: "max(env(safe-area-inset-top, 0px), 4rem)",
            paddingLeft: "max(env(safe-area-inset-left, 0px), 1.25rem)",
            paddingRight: "max(env(safe-area-inset-right, 0px), 1.25rem)",
            paddingBottom: "max(env(safe-area-inset-bottom, 0px), 2rem)",
          }}
        >
          <div className="md:px-4 md:pt-3">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
