import { buildPortraitDataUrl } from "../lib/portraitArt";
import { getPortraitMeta } from "../lib/portraitInfo";
import type { ConceptState } from "../types";
import InfoPopup from "./InfoPopup";

interface Props {
  concept: ConceptState;
  onClose: () => void;
  onQuiz: () => void;
}

export default function PortraitPopup({ concept, onClose, onQuiz }: Props) {
  const meta = getPortraitMeta(concept.id, concept.title);
  const imgSrc = buildPortraitDataUrl(concept.id, concept.title, concept.prop.color);

  return (
    <div className="absolute inset-0 z-[9000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg">
        <InfoPopup
          title={concept.title}
          subtitle={meta.subtitle}
          onClose={onClose}
          footer={
            <button
              type="button"
              onClick={onQuiz}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start 5-question quiz
            </button>
          }
        >
          <img
            src={imgSrc}
            alt=""
            className="mx-auto mb-4 w-full max-w-xs rounded-xl border-2 border-slate-800 shadow-md"
          />
          <p className="font-medium text-slate-950">{concept.definition}</p>
          <p className="mt-3 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-800">
            <span className="font-semibold">Memory hook: </span>
            {concept.mnemonic}
          </p>
          {concept.encountered && (
            <p className="mt-3 text-sm font-medium text-teal-900">
              Topic reviewed · recall {Math.round((concept.mastery ?? 0) * 100)}%
            </p>
          )}
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-800">
            {meta.facts.map((f) => (
              <li key={f.slice(0, 24)}>{f}</li>
            ))}
          </ul>
        </InfoPopup>
      </div>
    </div>
  );
}
