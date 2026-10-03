import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** High-contrast light panel for readability over the 3D scene. */
export const popupPanelClass =
  "rounded-2xl border-2 border-slate-900 bg-[#FFFBF5] text-slate-900 shadow-[0_12px_40px_rgba(0,0,0,0.35)]";

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function InfoPopup({ title, subtitle, onClose, children, footer, className = "" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`${popupPanelClass} ${className}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-300 px-5 py-4">
        <div>
          {subtitle && (
            <p className="text-xs font-bold uppercase tracking-widest text-teal-800">{subtitle}</p>
          )}
          <h2 className="font-display text-2xl font-semibold text-slate-950">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-600 hover:bg-slate-200 hover:text-slate-950"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="px-5 py-4 text-base leading-relaxed text-slate-800">{children}</div>
      {footer && <div className="border-t border-slate-300 px-5 py-4">{footer}</div>}
    </motion.div>
  );
}
