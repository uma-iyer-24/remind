import InfoPopup from "./InfoPopup";
import type { ConceptState } from "../types";

interface Props {
  concept: ConceptState;
  onQuiz: () => void;
  onClose: () => void;
}

export default function ConceptDetail({ concept, onQuiz, onClose }: Props) {
  return (
    <div className="absolute left-4 top-20 z-20 w-full max-w-sm md:left-6">
      <InfoPopup
        title={concept.title}
        subtitle="Memory object"
        onClose={onClose}
        footer={
          <button
            type="button"
            onClick={onQuiz}
            className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Start 5-question quiz
          </button>
        }
      >
        <p className="font-medium text-slate-950">{concept.definition}</p>
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
          <span className="font-semibold">Memory hook: </span>
          {concept.mnemonic}
        </div>
        <div className="mt-3 rounded-xl border border-teal-300 bg-teal-50 p-3 text-sm text-teal-950">
          <span className="font-semibold">ML note: </span>
          {concept.explanation}
        </div>
      </InfoPopup>
    </div>
  );
}
