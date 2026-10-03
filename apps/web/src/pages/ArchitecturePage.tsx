import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MermaidDiagram from "../components/MermaidDiagram";
import SiteHeader from "../components/SiteHeader";
import modelMeta from "../data/model-metadata.json";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "how-it-works", title: "How it works" },
  { id: "system", title: "System architecture" },
  { id: "runtime", title: "Runtime flow" },
  { id: "pipeline", title: "Training pipeline" },
  { id: "dataset", title: "Dataset" },
  { id: "training", title: "Training & evaluation" },
  { id: "stack", title: "Tech stack" },
  { id: "deploy", title: "Deployment" },
];

const SYSTEM_ARCH = `
flowchart TB
  subgraph Client["Browser (Vercel / local)"]
    UI["React UI\\nLanding · Create · Palace"]
    R3F["React Three Fiber\\n3D memory palace"]
    Store["Zustand session store"]
    UI --> R3F
    UI --> Store
  end

  subgraph API["FastAPI (Railway / local :8000)"]
    Routes["/rank-concepts\\n/predict-forgetting\\n/events"]
    Svc["MLService loader"]
    Routes --> Svc
  end

  subgraph ML["Offline ML (ml/train.py)"]
    NB["Notebook / train script"]
    Art["forget_model.joblib\\nmetadata.json"]
    NB --> Art
  end

  Store -->|"POST quiz features"| Routes
  Svc -->|"predict_proba"| Routes
  Art -.->|"load at startup"| Svc
`;

const RUNTIME_FLOW = `
sequenceDiagram
  participant U as User
  participant W as Web app
  participant A as FastAPI
  participant M as Random Forest

  U->>W: Walk palace / take quiz
  W->>W: Update streaks, timing, layout index
  W->>A: POST /api/v1/rank-concepts
  A->>M: Feature vector per concept
  M-->>A: P(forget)
  A-->>W: Ordered IDs + explanations
  W->>W: Reposition high-risk objects on path
  W->>A: POST /api/v1/events (telemetry)
  U->>U: Sees glow + path reorder
`;

const TRAINING_PIPELINE = `
flowchart LR
  D["SRS-style review logs\\n(synthetic cohort v1)"] --> EDA["EDA\\ndistributions · correlations"]
  EDA --> PP["Preprocessing\\nStandardScaler · imputation"]
  PP --> FE["Features\\n8 numeric signals"]
  FE --> CV["5-fold stratified CV\\nLogReg vs Random Forest"]
  CV --> GS["GridSearchCV\\nAUC on best family"]
  GS --> EV["Hold-out test\\nAUC · F1 · accuracy"]
  EV --> OUT["Artifacts\\n.joblib + metadata.json"]
  OUT --> API["FastAPI inference"]
`;

const cvResults = modelMeta.cv_results as {
  model: string;
  cv_auc_mean: number;
  cv_auc_std: number;
  cv_f1_mean: number;
  cv_acc_mean: number;
}[];

const holdout = modelMeta.holdout as {
  model: string;
  test_auc: number;
  test_f1: number;
  test_accuracy: number;
  best_params: Record<string, unknown>;
};

export default function ArchitecturePage() {
  return (
    <div className="min-h-full bg-ink pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,_rgba(99,102,241,0.08),_transparent_50%)]" />

      <SiteHeader />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[220px_1fr]">
        <nav className="hidden md:block">
          <div className="sticky top-8 space-y-1 border-l border-white/10 pl-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">On this page</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block py-1 text-sm text-slate-400 transition hover:text-amber-glow"
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-w-0 space-y-16"
        >
          <header>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-glow">Case study reference</p>
            <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">How Remind works</h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-400">
              End-to-end view of the spatial memory product, forgetting-prediction ML, and full-stack integration
              for demos and presentation.
            </p>
          </header>

          <Section id="overview" title="Overview">
            <p className="text-slate-300 leading-relaxed">
              Remind turns a list of concepts into a <strong className="text-white">3D memory palace</strong>.
              Each concept is a positioned object with a keyword-mapped prop and mnemonic. After quizzes, the
              system estimates <strong className="text-white">probability of forgetting</strong> and moves
              fragile items forward on the walk path so reinforcement is spatially obvious.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <Card title="Product loop" body="Encode (walk) → recall (quiz) → predict (ML) → reorder (palace)." />
              <Card title="ML task" body="Binary classification: will the learner fail the next recall within the SRS horizon?" />
              <Card title="FSD proof" body="Live API scores drive UI glow, sort order, and explanation strings." />
              <Card title="Fallback" body="Client-side heuristic if API is unreachable (e.g. frontend-only Vercel)." />
            </ul>
          </Section>

          <Section id="how-it-works" title="How it works (plain English)">
            <p className="text-slate-300 leading-relaxed">
              Remind is a study app that wraps your topics in a <strong className="text-white">walkable memory palace</strong>.
              Instead of scrolling flashcards, you move through a hall and corridor, enter colourful rooms, read notes on the
              walls, and take short quizzes. A small machine-learning model watches how you perform and guesses which ideas you
              are most likely to forget next—then the palace <strong className="text-white">physically reorders itself</strong> so
              those topics are harder to ignore.
            </p>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
              What you do as a learner
            </h3>
            <ol className="mt-4 list-decimal space-y-4 pl-5 text-slate-300 leading-relaxed">
              <li>
                <strong className="text-white">Start a session.</strong> Pick the built-in ML concepts demo or paste your own list
                (each line becomes one topic). The app saves progress in the browser—no account required for the demo.
              </li>
              <li>
                <strong className="text-white">Walk the palace.</strong> Use WASD or arrow keys to move and drag on the canvas to
                look around. You begin in a front hall, walk into the corridor, and approach doors on the left
                and right. Press <strong className="text-white">E</strong> (or follow the on-screen hints) to enter a topic room.
              </li>
              <li>
                <strong className="text-white">Encode each topic.</strong> Inside a room you see a 3D prop (shape and colour tied to
                keywords), a portrait on the back wall, and clickable wall objects (plaque, scroll, gem) with quick facts. Click the
                portrait for a richer panel: definition, mnemonic, and extra study notes, then start a quiz from there if you want.
              </li>
              <li>
                <strong className="text-white">Recall checkpoint.</strong> Each quiz asks <strong className="text-white">five</strong>{" "}
                multiple-choice questions about that topic (definition, mnemonic, title match, true/false, and a keyword). You get
                immediate right/wrong feedback per question, then an overall score. Passing roughly means getting at least three out
                of five correct.
              </li>
              <li>
                <strong className="text-white">Leave and repeat.</strong> Use the <strong className="text-white">Leave room</strong>{" "}
                button or press E when you are not at the portrait to return to the corridor. Visit other doors; high-risk topics
                should appear closer to the hall after weak quiz scores.
              </li>
            </ol>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
              What the software does behind the scenes
            </h3>
            <div className="mt-4 space-y-4 text-slate-300 leading-relaxed">
              <p>
                The <strong className="text-white">web app</strong> (React) owns everything you see: 3D scene, session state, quiz UI,
                and door positions. For each concept it tracks review count, success and fail streaks, how long you took on quizzes,
                when you last studied, and where that topic sits on the corridor path (its <em>path index</em>).
              </p>
              <p>
                After ranking is requested—when you open the palace and again after each quiz—the client sends those stats to the{" "}
                <strong className="text-white">FastAPI backend</strong>. The API loads a trained{" "}
                <strong className="text-white">Random Forest</strong> (exported as{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">forget_model.joblib</code>) and outputs a{" "}
                <strong className="text-white">forget probability</strong> per concept plus a short human-readable explanation.
              </p>
              <p>
                Concepts are sorted by that score. The palace layout maps rank to position: items predicted to be fragile move{" "}
                <strong className="text-white">toward the front of the corridor</strong> (closer to the hall), so your next walk
                naturally hits weak material first. Doors and highlights also reflect risk so you can see focus areas without opening
                the analytics page.
              </p>
              <p>
                Quiz outcomes are also sent as <strong className="text-white">telemetry events</strong> for logging and future
                retraining. The model itself is trained offline on spaced-repetition-style synthetic logs that mimic intervals,
                streaks, and response times—see the dataset and training sections below for metrics and reproduction steps.
              </p>
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
              If the API is not running
            </h3>
            <p className="mt-4 text-slate-300 leading-relaxed">
              The frontend can still run on Vercel without a live backend. In that case it falls back to a{" "}
              <strong className="text-white">simple client-side heuristic</strong> (same feature idea, rule-based scores) so door
              order and glow still change after quizzes. The header shows whether scoring comes from the{" "}
              <strong className="text-white">ML model</strong> or <strong className="text-white">offline heuristic</strong>. For
              demos with full rubric integration, run the API locally or deploy it and point{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">VITE_API_URL</code> at that host.
            </p>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
              End-to-end loop (one sentence)
            </h3>
            <p className="mt-4 rounded-xl border border-amber-glow/30 bg-amber-glow/5 px-5 py-4 text-slate-200 leading-relaxed">
              You walk and quiz in 3D → the app records learning signals → ML estimates what you might forget → the palace reorders
              and labels high-risk topics → you walk again with better spatial cues for what to review next.
            </p>
          </Section>

          <Section id="system" title="System architecture">
            <MermaidDiagram chart={SYSTEM_ARCH} caption="High-level components and artifact flow" />
            <p className="mt-4 text-sm text-slate-400">
              The web client owns palace layout and session state. The API is stateless for predictions; quiz
              events may be logged for analytics and future retraining. Trained weights live in{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">ml/artifacts/</code> and are loaded
              when the API process starts.
            </p>
          </Section>

          <Section id="runtime" title="Runtime flow">
            <MermaidDiagram chart={RUNTIME_FLOW} caption="Quiz → rank → spatial reorder" />
          </Section>

          <Section id="pipeline" title="Training pipeline">
            <MermaidDiagram chart={TRAINING_PIPELINE} caption="Offline ML pipeline (mirrors case-study rubric steps)" />
            <p className="mt-4 text-sm text-slate-400">
              Reproduce with{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">python ml/train.py</code> from the
              repo root. Swap synthetic data for Open Spaced Repetition exports when available.
            </p>
          </Section>

          <Section id="dataset" title="Dataset">
            <div className="rounded-2xl border border-white/10 bg-ink-soft p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Source" value={modelMeta.dataset as string} />
                <Detail label="Samples" value={String(modelMeta.n_samples)} />
                <Detail label="Label" value={modelMeta.label as string} />
                <Detail label="Unit of observation" value="One review event per user × concept" />
              </dl>
              <p className="mt-6 text-sm leading-relaxed text-slate-400">
                The current cohort simulates spaced-repetition dynamics: intervals, streaks, response time, and
                layout position. It is calibrated to FSRS-style forgetting curves so models learn realistic
                retention structure. For production research, replace with licensed Anki/OSR export logs while
                keeping the same feature schema.
              </p>
            </div>
            <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-slate-400">Input features</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {(modelMeta.features as string[]).map((f) => (
                <li
                  key={f}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-300"
                >
                  {f}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="training" title="Training & evaluation">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-soft">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                    <th className="p-4 font-medium">Model</th>
                    <th className="p-4 font-medium">CV AUC (mean ± std)</th>
                    <th className="p-4 font-medium">CV F1</th>
                    <th className="p-4 font-medium">CV accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {cvResults.map((row) => (
                    <tr key={row.model} className="border-b border-white/5 text-slate-300">
                      <td className="p-4 font-medium text-white">{formatModel(row.model)}</td>
                      <td className="p-4">
                        {row.cv_auc_mean.toFixed(3)} ± {row.cv_auc_std.toFixed(3)}
                      </td>
                      <td className="p-4">{row.cv_f1_mean.toFixed(3)}</td>
                      <td className="p-4">{row.cv_acc_mean.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Selected model" value={formatModel(holdout.model)} />
              <Stat label="Hold-out AUC" value={holdout.test_auc.toFixed(3)} />
              <Stat label="Hold-out F1" value={holdout.test_f1.toFixed(3)} />
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Best hyperparameters:{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">
                {JSON.stringify(holdout.best_params)}
              </code>
              . Metrics above are baked into{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">apps/web/src/data/model-metadata.json</code>{" "}
              for this page; re-sync after retraining.
            </p>
          </Section>

          <Section id="stack" title="Tech stack choices">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-soft">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-slate-500">
                    <th className="p-4 font-medium">Layer</th>
                    <th className="p-4 font-medium">Choice</th>
                    <th className="p-4 font-medium">Why</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {stackRows.map((row) => (
                    <tr key={row.layer} className="border-b border-white/5">
                      <td className="p-4 font-medium text-white">{row.layer}</td>
                      <td className="p-4">{row.choice}</td>
                      <td className="p-4 text-slate-400">{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="deploy" title="Deployment">
            <ol className="list-decimal space-y-3 pl-5 text-slate-300">
              <li>
                <strong className="text-white">Frontend:</strong> Vercel, root{" "}
                <code className="text-xs">apps/web</code>, optional{" "}
                <code className="text-xs">VITE_API_URL</code> pointing to the API.
              </li>
              <li>
                <strong className="text-white">API:</strong> Railway/Render/Fly or local{" "}
                <code className="text-xs">uvicorn</code>; mount{" "}
                <code className="text-xs">ml/artifacts/</code> after training.
              </li>
              <li>
                <strong className="text-white">Local:</strong>{" "}
                <code className="text-xs">npm run dev</code> proxies{" "}
                <code className="text-xs">/api</code> to port 8000.
              </li>
            </ol>
            <Link
              to="/"
              className="mt-8 inline-flex rounded-xl bg-amber-glow px-5 py-2.5 text-sm font-semibold text-ink hover:bg-amber-400"
            >
              Back to demo
            </Link>
          </Section>
        </motion.main>
      </div>
    </div>
  );
}

const stackRows = [
  { layer: "3D UI", choice: "React Three Fiber + drei", why: "Hall, corridor, and topic rooms; WASD walk + quiz overlays." },
  { layer: "App shell", choice: "React 18 + Vite + Tailwind", why: "Fast dev, mobile-friendly layout, custom dark theme." },
  { layer: "State", choice: "Zustand (+ persist)", why: "Session survives refresh without auth." },
  { layer: "API", choice: "FastAPI + Pydantic v2", why: "Rubric-aligned Python serving; typed request bodies match features." },
  { layer: "ML", choice: "scikit-learn pipelines", why: "CV, grid search, joblib export; easy to explain in slides." },
  { layer: "Concept KB", choice: "JSON keyword → prop map", why: "Deterministic demo objects; no LLM keys for presentation." },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-2xl text-white md:text-3xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-xl border border-white/10 bg-ink-soft p-4">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{body}</p>
    </li>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-200">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-soft p-4">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 font-display text-2xl text-amber-glow">{value}</p>
    </div>
  );
}

function formatModel(name: string) {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
