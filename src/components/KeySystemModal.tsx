import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Eye, EyeOff, Check, Copy, ArrowRight, RotateCcw } from 'lucide-react';
import {
  PLATOBOOST_GATEWAY_URL,
  PLATOBOOST_SERVICE_ID,
  validateAccessKey,
} from '../utils/coreAuth';

interface KeySystemModalProps {
  onAuthorized: (verifiedKey?: string, expiresAtMs?: number) => void;
  onReplayIntro: () => void;
}

export const KeySystemModal: React.FC<KeySystemModalProps> = ({
  onAuthorized,
  onReplayIntro,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string>(
    'Status: Enter your key or click Get Key to continue.'
  );
  const [isError, setIsError] = useState(false);
  const [cardFlashState, setCardFlashState] = useState<'neutral' | 'error' | 'success'>('neutral');
  const [copiedLink, setCopiedLink] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const handleSubmitKey = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAccessKey(keyInput);
    if (!validation.valid) {
      setIsError(true);
      setCardFlashState('error');
      setStatusMsg(`Status: ${validation.error}`);
      setShakeTrigger((prev) => prev + 1);
      window.setTimeout(() => {
        setCardFlashState((prev) => (prev === 'error' ? 'neutral' : prev));
      }, 1400);
      return;
    }
    setIsError(false);
    setCardFlashState('success');
    setStatusMsg('Status: Key verified! Launching Core.xyz...');
    window.setTimeout(() => {
      onAuthorized(validation.normalizedKey, validation.expiresAtMs);
    }, 340);
  };

  const handleGetKey = async () => {
    setIsError(false);
    setCardFlashState('neutral');
    try {
      await navigator.clipboard.writeText(PLATOBOOST_GATEWAY_URL);
    } catch {
      // Fallback if clipboard permission is restricted in iframe
    }
    setCopiedLink(true);
    setStatusMsg(
      `Status: Key link copied (${PLATOBOOST_GATEWAY_URL})! Paste in your browser to get your 24h key.`
    );
    window.setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleClearKey = () => {
    setKeyInput('');
    setIsError(false);
    setCardFlashState('neutral');
    setStatusMsg('Status: Input cleared. Paste your key or click Get Key.');
  };

  const cardGradientClasses =
    cardFlashState === 'error'
      ? 'bg-gradient-to-br from-red-950/90 via-red-900/55 to-[#0A0A0A] border-red-500/80 shadow-[0_0_45px_rgba(239,68,68,0.28)]'
      : cardFlashState === 'success'
      ? 'bg-gradient-to-br from-emerald-950/90 via-emerald-900/55 to-[#0A0A0A] border-emerald-400/80 shadow-[0_0_45px_rgba(16,185,129,0.28)]'
      : 'bg-[#0A0A0A] border-white/15 shadow-2xl';

  const topAccentClasses =
    cardFlashState === 'error'
      ? 'from-red-500/30 via-red-400 to-red-500/30'
      : cardFlashState === 'success'
      ? 'from-emerald-500/30 via-emerald-400 to-emerald-500/30'
      : 'from-white/10 via-white/90 to-white/10';

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

      {/* Center Polished 2-Button Platoboost Key Card */}
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
          data-testid="key-system-card"
          data-flash-state={cardFlashState}
          className={`relative w-full max-w-md rounded-xl border p-8 overflow-hidden transition-all duration-300 ${cardGradientClasses}`}
        >
          {/* Top Accent Line */}
          <div
            className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r transition-colors duration-300 ${topAccentClasses}`}
          />

          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Core.xyz &nbsp;|&nbsp; Key System
                </h1>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mt-1">
                License Verification Gateway
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md bg-[#141414] border border-white/15 font-mono text-[10px] font-bold tracking-wider text-white">
                ● PLATOBOOST
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/15 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/10 mb-5" />

          <form onSubmit={handleSubmitKey} className="space-y-4" noValidate>
            <div>
              <div className="relative flex items-center">
                <input
                  id="access-key-input"
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => {
                    setKeyInput(e.target.value);
                    if (isError) {
                      setIsError(false);
                      setCardFlashState('neutral');
                      setStatusMsg('Status: Enter your key or click Get Key to continue.');
                    }
                  }}
                  placeholder="Paste your Platoboost key here..."
                  aria-label="Platoboost Key"
                  autoComplete="off"
                  className={`w-full rounded-lg bg-[#121216]/90 border px-4 py-3 pr-20 text-sm font-mono text-white placeholder:text-neutral-500 focus:outline-none transition-colors ${
                    cardFlashState === 'error'
                      ? 'border-red-400 focus:border-red-300'
                      : cardFlashState === 'success'
                      ? 'border-emerald-400 focus:border-emerald-300'
                      : 'border-white/15 focus:border-white'
                  }`}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {keyInput.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      aria-label="Clear key input"
                      className="px-1.5 py-1 rounded bg-white/[0.06] hover:bg-white/15 text-[10px] font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowKey((prev) => !prev)}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                    className="p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={statusMsg}
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -2 }}
                  role={isError ? 'alert' : 'status'}
                  data-testid="key-feedback-status"
                  className="mt-2.5 flex items-center gap-2"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isError
                        ? 'bg-red-400'
                        : cardFlashState === 'success' || copiedLink
                        ? 'bg-emerald-400'
                        : 'bg-neutral-400'
                    }`}
                  />
                  <p
                    className={`text-xs font-medium ${
                      isError
                        ? 'text-red-300'
                        : cardFlashState === 'success'
                        ? 'text-emerald-300'
                        : 'text-neutral-300'
                    }`}
                  >
                    {statusMsg}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Strictly 2 Buttons: 1. Submit  2. Get Key */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="submit"
                data-testid="key-submit-button"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Submit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleGetKey}
                data-testid="key-get-button"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold bg-[#141418] text-white hover:bg-[#1F1F26] border border-white/15 transition-colors whitespace-nowrap cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-300" />
                    <span>Get Key</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>Service #{PLATOBOOST_SERVICE_ID}</span>
            <span>·</span>
            <span>SHA-256 Nonce Auth</span>
            <span>·</span>
            <span>Live Session Key Tracking</span>
          </div>
        </motion.div>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto py-2 flex items-center justify-between text-xs text-neutral-500">
        <span>Core.xyz Universal Suite</span>
        <span>Black &amp; White Animated UI</span>
      </footer>
    </div>
  );
};



