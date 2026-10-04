import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { extractDocumentText } from "../lib/extractDocumentText";
import { conceptsFromLines } from "../lib/layout";
import { parseTopicLines } from "../lib/parseTopics";
import { useSessionStore } from "../store/session";

const PLACEHOLDER = `Hierarchical Clustering
K-Means Clustering
Decision Trees
Gradient Descent`;

export default function CreatePage() {
  const navigate = useNavigate();
  const startCustom = useSessionStore((s) => s.startCustom);
  const startFromDeck = useSessionStore((s) => s.startFromDeck);
  const [title, setTitle] = useState("My palace");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [uploadNote, setUploadNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const topics = useMemo(() => parseTopicLines(text), [text]);

  const onUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError("");
    setUploadNote("");
    try {
      const extracted = await extractDocumentText(file);
      setText(extracted);
      if (title.trim() === "" || title.trim() === "My palace") {
        setTitle(file.name.replace(/\.[^.]+$/, ""));
      }
      const count = parseTopicLines(extracted).length;
      setUploadNote(
        count
          ? `Loaded ${count} ${count === 1 ? "line" : "lines"} from ${file.name}. Edit them before building.`
          : `No topics found in ${file.name}.`,
      );
      if (!count) setError("No topics found in that file. Add one topic per line.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that file.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = () => {
    if (topics.length === 0) {
      setError("Add at least one topic. Each line is one topic.");
      return;
    }
    startCustom(title.trim() || "My palace", conceptsFromLines(topics));
    navigate("/palace");
  };

  return (
    <div className="min-h-full bg-[#F6F1E8]">
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex gap-4 text-sm">
        <Link to="/" className="text-slate-500 hover:text-slate-900">
          ← Back
        </Link>
        <Link to="/architecture" className="text-slate-500 hover:text-slate-900">
          Architecture
        </Link>
      </div>
      <h1 className="mt-6 font-display text-3xl text-slate-900">Create a palace</h1>
      <p className="mt-2 text-slate-600">Enter one topic per line. Blank lines are ignored.</p>

      <div className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm text-slate-700">Palace title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-slate-900 outline-none ring-teal-800/30 focus:ring-2"
          />
        </label>

        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-3">
          <p className="text-sm text-slate-700">Or upload a file</p>
          <p className="mt-1 text-xs text-slate-500">PDF, Word (.docx), or PowerPoint (.pptx). Each line or bullet becomes a topic you can edit.</p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            disabled={uploading}
            onChange={(e) => void onUpload(e.target.files?.[0])}
            className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-50 hover:file:bg-stone-800 disabled:opacity-50"
          />
          {uploading && <p className="mt-2 text-xs text-slate-500">Reading file…</p>}
          {uploadNote && <p className="mt-2 text-xs text-teal-900">{uploadNote}</p>}
        </div>

        <label className="block">
          <span className="text-sm text-slate-700">Topics</span>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            rows={12}
            placeholder={PLACEHOLDER}
            className="mt-1 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none ring-teal-800/30 focus:ring-2"
          />
        </label>

        <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Enter one topic per line</p>
          <p className="mt-2 text-slate-600">Example:</p>
          <pre className="mt-1 font-mono text-xs leading-relaxed text-slate-800">{`Decision Trees
Gradient Descent
K-Means Clustering
Neural Networks`}</pre>
          <p className="mt-2 text-xs text-slate-500">
            Numbers and bullets are removed (`1.` or `-`). Commas can stay inside a topic name.
          </p>
          <p className="mt-3 font-medium text-teal-900">
            {topics.length} {topics.length === 1 ? "topic" : "topics"} detected
          </p>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={topics.length === 0}
            className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-stone-50 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Build palace
          </button>
          <button
            type="button"
            onClick={() => {
              startFromDeck();
              navigate("/palace");
            }}
            className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm text-slate-800 hover:bg-stone-100"
          >
            Use ML demo deck
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
