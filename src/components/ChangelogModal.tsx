import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { CHANGELOG_V44_DATA } from '../utils/coreAuth';

interface ChangelogModalProps {
  open: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ open, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          data-testid="changelog-modal-backdrop"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={CHANGELOG_V44_DATA.title}
            data-testid="changelog-modal"
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.22 }}
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(24,25,32,0.99) 0%, rgba(15,16,22,0.99) 55%, rgba(9,10,14,1) 100%)',
            }}
            className="relative w-full max-w-lg rounded-2xl border border-white/20 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.92)] overflow-hidden"
          >
            {/* Top Tapered Specular Accent Line */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white/90 to-transparent" />

            {/* Header Row with Top-Right '×' Close Button */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <h2
                    data-testid="changelog-title"
                    className="text-base font-extrabold tracking-tight text-white"
                  >
                    {CHANGELOG_V44_DATA.title}
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  One-time release note &bull; Only shown once per version update
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close Changelog"
                data-testid="changelog-close-btn"
                className="w-7 h-7 rounded-lg bg-[#1A1B22] hover:bg-red-500/90 border border-white/15 hover:border-red-400 text-neutral-200 hover:text-white font-bold text-sm flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                ×
              </button>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />

            {/* Changelog Sections */}
            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
              {/* [-] Removed Features */}
              <div
                data-testid="changelog-group-removed"
                className="rounded-xl bg-[#0D0E13] border border-red-500/25 p-3 space-y-1.5"
              >
                <div className="text-xs font-bold tracking-wide text-red-400 font-mono">
                  [-] Removed Features
                </div>
                <ul className="space-y-1">
                  {CHANGELOG_V44_DATA.removed.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-[11px] text-neutral-300 font-mono leading-snug"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* [+] Added Features */}
              <div
                data-testid="changelog-group-added"
                className="rounded-xl bg-[#0D0E13] border border-emerald-500/25 p-3 space-y-1.5"
              >
                <div className="text-xs font-bold tracking-wide text-emerald-400 font-mono">
                  [+] Added Features
                </div>
                <ul className="space-y-1">
                  {CHANGELOG_V44_DATA.added.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-[11px] text-neutral-200 font-mono leading-snug"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* [*] Fixed */}
              <div
                data-testid="changelog-group-fixed"
                className="rounded-xl bg-[#0D0E13] border border-sky-400/25 p-3 space-y-1.5"
              >
                <div className="text-xs font-bold tracking-wide text-sky-300 font-mono">
                  [*] Fixed
                </div>
                <ul className="space-y-1">
                  {CHANGELOG_V44_DATA.fixed.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-[11px] text-neutral-300 font-mono leading-snug"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
              <span>CoreXYZ_Data/SeenChangelogVersion.txt = {CHANGELOG_V44_DATA.version}</span>
              <span>Release {CHANGELOG_V44_DATA.date}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
