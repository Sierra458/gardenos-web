"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MermaidRenderer() {
  const pathname = usePathname();

  useEffect(() => {
    const blocks = document.querySelectorAll<HTMLElement>("pre.mermaid:not([data-rendered])");
    if (blocks.length === 0) return;

    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          // Match the GardenOS dark palette
          background: "#0a0a0a",
          primaryColor: "#0f0f0f",
          primaryTextColor: "#fafafa",
          primaryBorderColor: "#1f1f1f",
          lineColor: "#a1a1aa",
          secondaryColor: "#16241a",
          tertiaryColor: "#0f0f0f",
          mainBkg: "#0f0f0f",
          nodeBorder: "#22c55e",
          clusterBkg: "#0a0a0a",
          clusterBorder: "#1f1f1f",
          fontSize: "14px",
        },
        flowchart: { curve: "basis", padding: 16 },
      });
      if (cancelled) return;
      try {
        await mermaid.run({ nodes: Array.from(blocks) });
        blocks.forEach(b => b.setAttribute("data-rendered", "true"));
      } catch (err) {
        console.error("[mermaid] render failed:", err);
      }
    })();

    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
