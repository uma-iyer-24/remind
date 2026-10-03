import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { conceptsFromLines } from "../lib/layout";
import { useSessionStore } from "../store/session";

const PLACEHOLDER = `Cross-validation
Gradient descent
Regularization`;

export default function CreatePage() {
  const navigate = useNavigate();
  const startCustom = useSessionStore((s) => s.startCustom);
  const startFromDeck = useSessionStore((s) => s.startFromDeck);
  const [title, setTitle] = useState("My palace");
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 3) {
      setError("Add at least 3 concepts (one per line).");
      return;
    }
    if (lines.length > 30) {
      setError("Maximum 30 concepts for this MVP.");
      return;
    }
    startCustom(title, conceptsFromLines(lines));
    navigate("/palace");
  };

  return (
    <div className="mx-auto min-h-full max-w-2xl px-6 py-10">
      <Link to="/" className="text-sm text-slate-400 hover:text-white">
        ← Back
      </Link>
      <h1 className="mt-6 font-display text-3xl text-white">Create a palace</h1>
      <p className="mt-2 text-slate-400">One concept per line. We&apos;ll assign objects from the keyword map.</p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm text-slate-300">Palace title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 outline-none ring-amber-glow/30 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Concepts</span>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            rows={12}
            placeholder={PLACEHOLDER}
            className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm outline-none ring-amber-glow/30 focus:ring-2"
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={submit}
            className="rounded-xl bg-amber-glow px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-400"
          >
            Build palace
          </button>
          <button
            type="button"
            onClick={() => {
              startFromDeck();
              navigate("/palace");
            }}
            className="rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white hover:bg-white/5"
          >
            Use ML demo deck
          </button>
        </div>
      </div>
    </div>
  );
}
