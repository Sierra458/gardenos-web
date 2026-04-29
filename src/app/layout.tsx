import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { LayoutShell } from "@/components/LayoutShell";
import { MermaidRenderer } from "@/components/MermaidRenderer";
import { loadAllNotes } from "@/lib/content";
import path from "node:path";

export const metadata: Metadata = {
  title: "GardenOS",
  description: "Garden Monitor — project artifacts",
  applicationName: "GardenOS",
  appleWebApp: {
    capable: true,
    title: "GardenOS",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let stats: { hardwareCount: number; lastUpdate: string } | undefined;
  try {
    const notes = await loadAllNotes(CONTENT_DIR);
    const hardwareCount = notes.filter(n => n.slug.startsWith("/hardware/")).length;
    const lastUpdate = notes[0]?.date ?? "—";
    stats = { hardwareCount, lastUpdate };
  } catch (err) {
    console.error("[layout] failed to load notes for sidebar stats:", err);
  }

  return (
    <html lang="en">
      <body>
        <LayoutShell sidebar={<Sidebar stats={stats} />}>
          {children}
        </LayoutShell>
        <MermaidRenderer />
      </body>
    </html>
  );
}
