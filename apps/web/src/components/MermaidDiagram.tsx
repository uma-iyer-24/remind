import mermaid from "mermaid";
import { useEffect, useId, useRef } from "react";

let initialized = false;

function initMermaid() {
  if (initialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      darkMode: true,
      background: "#121829",
      primaryColor: "#1a2238",
      primaryTextColor: "#f1f5f9",
      primaryBorderColor: "#475569",
      secondaryColor: "#0f172a",
      tertiaryColor: "#0B1020",
      lineColor: "#94a3b8",
      textColor: "#e2e8f0",
      mainBkg: "#1a2238",
      nodeBorder: "#64748b",
      clusterBkg: "#121829",
      titleColor: "#f8fafc",
      edgeLabelBackground: "#121829",
    },
    flowchart: { curve: "basis", padding: 16 },
  });
  initialized = true;
}

interface Props {
  chart: string;
  caption?: string;
}

export default function MermaidDiagram({ chart, caption }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");

  useEffect(() => {
    initMermaid();
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    mermaid
      .render(`remind-${reactId}`, chart.trim())
      .then(({ svg }) => {
        if (!cancelled) el.innerHTML = svg;
      })
      .catch(() => {
        if (!cancelled) el.textContent = "Diagram failed to render.";
      });

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <figure className="space-y-3">
      <div
        ref={containerRef}
        className="rounded-xl border border-white/10 bg-ink-muted/80 p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
        aria-label={caption ?? "Architecture diagram"}
      />
      {caption && <figcaption className="text-center text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  );
}
