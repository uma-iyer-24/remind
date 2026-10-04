import { motion, AnimatePresence } from "framer-motion";

export type PalaceZone = "hall" | "corridor" | "room";

export interface PalaceHudState {
  zone: PalaceZone;
  contextMessage: string;
  emphasis: "normal" | "action";
}

export default function PalaceHud({ state }: { state: PalaceHudState | null }) {
  if (!state) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-3 pb-4 pt-2 md:px-6 md:pb-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-stone-300/80 bg-[#F6F1E8]/95 px-5 py-4 shadow-lg md:px-8 md:py-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={state.contextMessage}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`text-center font-display leading-snug ${
              state.emphasis === "action"
                ? "text-xl text-stone-900 md:text-2xl"
                : "text-lg text-stone-700 md:text-xl"
            }`}
          >
            {state.contextMessage}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
