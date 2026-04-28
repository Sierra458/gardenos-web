import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { loadAllNotes } from "@/lib/content";
import path from "node:path";

export const metadata: Metadata = {
  title: "GardenOS",
  description: "Garden Monitor — project artifacts",
};

const CONTENT_DIR = path.resolve(process.cwd(), "content");

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let stats: { hardwareCount: number; lastUpdate: string } | undefined;
  try {
    const notes = await loadAllNotes(CONTENT_DIR);
    const hardwareCount = notes.filter(n => n.slug.startsWith("/hardware/")).length;
    const lastUpdate = notes[0]?.date ?? "—";
    stats = { hardwareCount, lastUpdate };
  } catch {
    // content/ may not exist on first run; sidebar still renders without stats
  }

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar stats={stats} />
          <main className="flex-1 px-9 py-7 max-w-[72ch]">{children}</main>
        </div>
      </body>
    </html>
  );
}
