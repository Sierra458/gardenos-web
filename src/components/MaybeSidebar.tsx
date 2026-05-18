"use client";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { LayoutShell } from "@/components/LayoutShell";

export function MaybeSidebar({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = pathname?.startsWith("/console") || pathname?.startsWith("/login");
  if (hideSidebar) return <>{children}</>;
  return <LayoutShell sidebar={sidebar}>{children}</LayoutShell>;
}
