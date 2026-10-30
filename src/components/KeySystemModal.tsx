import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Eye, EyeOff, Check, Copy, ArrowRight, RotateCcw } from 'lucide-react';
import { REQUIRED_ACCESS_KEY, validateAccessKey } from '../utils/coreAuth';

interface KeySystemModalProps {
  onAuthorized: () => void;
  onReplayIntro: () => void;
}

export const KeySystemModal: React.FC<KeySystemModalProps> = ({
  onAuthorized,
  onReplayIntro,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAccessKey(keyInput);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      setShakeTrigger((prev) => prev + 1);
      return;
    }
    setErrorMsg(null);
    onAuthorized();
  };

  const handleCopyAndFillKey = async () => {
    setKeyInput(REQUIRED_ACCESS_KEY);
    setErrorMsg(null);
    try {
      await navigator.clipboard.writeText(REQUIRED_ACCESS_KEY);
    } catch {
      // Fallback if clipboard permission is restricted in iframe
    }
    setCopiedKey(true);
    window.setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div
      className="min-h-screen w-full bg-[#050505] text-white flex flex-col justify-between p-6 relative overflow-hidden"
      data-testid="key-system-screen"
    >
      {/* Subtle monochrome animated background geometry */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="w-[680px] h-[680px] rounded-full border border-white/[0.04]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[460px] h-[460px] rounded-full border border-white/[0.06]"
        />
      </div>

      {/* Top minimal bar */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between gap-8 py-2">
        <span className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
          Core.xyz
        </span>
        <button
          type="button"
          onClick={onReplayIntro}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-neutral-300 hover:text-white bg-white/[0.05] hover:bg-white/10 border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay Loading Screen</span>
        </button>
      </header>

      {/* Center Authorization Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-8">
        <motion.div
          key={shakeTrigger}
          initial={{ opacity: 0, y: 14 }}
          animate={{
            opacity: 1,
            y: 0,
            x: shakeTrigger > 0 ? [0, -8, 8, -6, 6, 0] : 0,
          }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md rounded-xl bg-[#0A0A0A] border border-white/15 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Key Authorization
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Enter your access key to unlock the Core.xyz workspace and GitHub loader.
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
          </div>

          <form onSubmit={handleAuthorize} className="space-y-5" noValidate>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="access-key-input"
                  className="block text-xs font-medium text-neutral-300"
                >
                  Authorization Key
                </label>
                <span className="text-xs text-neutral-400 font-mono">
                  Required: {REQUIRED_ACCESS_KEY}
                </span>
              </div>

              <div className="relative">
                <input
                  id="access-key-input"
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Enter FEYKSECURED"
                  autoComplete="off"
                  className="w-full rounded-lg bg-[#121212] border border-white/15 px-4 py-3 pr-11 text-sm font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  aria-label={showKey ? 'Hide authorization key' : 'Show authorization key'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    role="alert"
                    className="mt-2.5 text-xs font-medium text-red-400"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-white text-black hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Authorize Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleCopyAndFillKey}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-semibold bg-[#141414] text-white hover:bg-[#1F1F1F] border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Key Filled</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Fill Key (FEYKSECURED)</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
            <span>Monochrome Edition</span>
            <span>·</span>
            <span>DeltaTime Smoothing</span>
            <span>·</span>
            <span>GitHub Raw Loader</span>
          </div>
        </motion.div>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto py-2 flex items-center justify-between text-xs text-neutral-500">
        <span>Core.xyz Universal Suite</span>
        <span>Black & White Animated UI</span>
      </footer>
    </div>
  );
};
