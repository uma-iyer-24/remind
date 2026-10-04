import mermaid from "mermaid";
import { useEffect, useId, useRef } from "react";

function initMermaid() {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      darkMode: false,
      background: "#F6F1E8",
      primaryColor: "#E7E1D6",
      primaryTextColor: "#1C1917",
      primaryBorderColor: "#8A7355",
      secondaryColor: "#F6F1E8",
      tertiaryColor: "#E7F0EE",
      lineColor: "#6B5E52",
      textColor: "#1C1917",
      mainBkg: "#FFFBF5",
      nodeBorder: "#8A7355",
      clusterBkg: "#F6F1E8",
      titleColor: "#1C1917",
      edgeLabelBackground: "#F6F1E8",
    },
    flowchart: { curve: "basis", padding: 16 },
  });
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
        className="rounded-xl border border-stone-300 bg-white p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
        aria-label={caption ?? "Architecture diagram"}
      />
      {caption && <figcaption className="text-center text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  );
}
