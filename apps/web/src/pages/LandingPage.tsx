import { motion } from "framer-motion";
import { ArrowRight, Box, Brain, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import { useSessionStore } from "../store/session";

export default function LandingPage() {
  const navigate = useNavigate();
  const startFromDeck = useSessionStore((s) => s.startFromDeck);

  const tryDemo = () => {
    startFromDeck();
    navigate("/palace");
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-[#F6F1E8]">

      <div className="relative z-10">
        <SiteHeader />
      </div>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 md:grid-cols-2 md:items-center md:pt-16">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-medium uppercase tracking-[0.2em] text-teal-900"
          >
            Spatial memory, personalized
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-display text-4xl leading-tight text-stone-950 md:text-5xl"
          >
            Turn anything into a memory palace you can walk through.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-lg text-lg text-slate-600"
          >
            Each concept becomes an object in a 3D room. Quiz yourself, and ML predicts what
            you&apos;ll forget—then repositions those objects on your path.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={tryDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-stone-50 transition hover:bg-stone-800"
            >
              Try ML concepts demo
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              to="/create"
              className="inline-flex items-center rounded-xl border border-stone-300 px-5 py-3 text-sm font-medium text-stone-900 transition hover:bg-white"
            >
              Paste your own list
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass relative aspect-square overflow-hidden rounded-3xl p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-teal-50" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="space-y-3">
              <Feature icon={Box} title="Objects, not flashcards" text="Keywords map to props in a shared knowledge base." />
              <Feature icon={Brain} title="Forgetting prediction" text="Cross-validated model ranks what to reinforce next." />
              <Feature icon={Sparkles} title="Room that adapts" text="High-risk concepts move closer on the walk path." />
            </div>
            <p className="text-xs text-slate-500">15 ML fundamentals · ready in one click</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Box;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
        <Icon className="h-4 w-4 text-teal-900" />
      </div>
      <div>
        <p className="text-sm font-medium text-stone-950">{title}</p>
        <p className="text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}
