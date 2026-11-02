import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { BOOT_STAGE_SEQUENCE } from '../utils/coreAuth';

interface CoreLoadingScreenProps {
  onComplete: () => void;
}

const STAGE_DETAILS: Record<number, { tag: string; sub: string }> = {
  0: {
    tag: 'STAGE 1 / 6  ·  CORE',
    sub: 'Mounting spatial object pools & memory buffers...',
  },
  18: {
    tag: 'STAGE 2 / 6  ·  MODULES',
    sub: 'Binding combat, movement & environmental hooks...',
  },
  38: {
    tag: 'STAGE 3 / 6  ·  VIEWPORT',
    sub: 'Allocating 2D ESP canvas & target indicators...',
  },
  60: {
    tag: 'STAGE 4 / 6  ·  INTERFACE',
    sub: 'Compiling theme engine, color picker & keybinds...',
  },
  82: {
    tag: 'STAGE 5 / 6  ·  SECURITY',
    sub: 'Establishing encrypted Platoboost session bridge...',
  },
  96: {
    tag: 'STAGE 6 / 6  ·  READY',
    sub: 'All systems nominal · Preparing key gateway...',
  },
};

export const CoreLoadingScreen: React.FC<CoreLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + 1);
      });
    }, 45);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = window.setTimeout(() => {
        onComplete();
      }, 650);
      return () => window.clearTimeout(timer);
    }
  }, [progress, onComplete]);

  const currentStage =
    [...BOOT_STAGE_SEQUENCE].reverse().find((s) => progress >= s.threshold) ||
    BOOT_STAGE_SEQUENCE[0];

  const detail = STAGE_DETAILS[currentStage.threshold] || STAGE_DETAILS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white px-6 select-none overflow-hidden"
      data-testid="core-loading-screen"
    >
      {/* Subtle monochrome animated radial rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.04, 1] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          className="w-[540px] h-[540px] rounded-full border border-white/[0.04]"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 0.97, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[380px] h-[380px] rounded-full border border-white/[0.07]"
        />
        <motion.div
          animate={{ opacity: [0.06, 0.16, 0.06] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-[240px] h-[240px] rounded-full border border-white/15"
        />
      </div>

      {/* Central Monochrome Loader Card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md rounded-xl bg-[#0A0A0A] border border-white/15 p-8 shadow-2xl overflow-hidden"
      >
        {/* Top Shimmer Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-white/10 via-white/90 to-white/10" />

        {/* Animated Geometric Core Emblem */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/20">
              <motion.div
                animate={{ rotate: 180 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-4 h-4 border-2 border-white"
              />
              <motion.div
                animate={{ scale: [0.8, 1.25, 0.8], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-1.5 h-1.5 bg-white"
              />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Core.xyz
              </h1>
              <p className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">
                Universal Edition · V4.5
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums block"
              aria-live="polite"
            >
              {progress}%
            </span>
            <span className="font-mono text-[10px] tracking-widest text-neutral-400 uppercase">
              {detail.tag}
            </span>
          </div>
        </div>

        {/* Animated Progress Track */}
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10 mb-5">
          <motion.div
            className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          />
        </div>

        {/* Stage Label & Sub-Detail Telemetry */}
        <div className="space-y-1 min-h-[38px]">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold text-white">
            <motion.span
              key={currentStage.label}
              initial={{ opacity: 0.4, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.14 }}
              className="truncate"
              data-testid="boot-stage-label"
            >
              {currentStage.label}
            </motion.span>

            <span className="font-mono text-[11px] text-neutral-400 shrink-0 tabular-nums">
              {progress < 100 ? 'Loading' : 'Complete'}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 truncate font-mono">
            {detail.sub}
          </p>
        </div>

        {/* Skip Intro Action for Instant Access */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            License Gate: <strong className="text-white font-mono">PLATOBOOST</strong>
          </span>
          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};


