"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  const path = usePathname();
  const isActive = href === "/" ? path === "/" : path.startsWith(href);
  return (
    <Link
      href={href}
      className={
        "block py-1 text-sm transition-colors " +
        (isActive ? "text-[var(--color-accent)] font-medium" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]")
      }
    >
      {children}
    </Link>
  );
}
