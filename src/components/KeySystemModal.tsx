import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Copy,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  PLATOBOOST_GATEWAY_URL,
  PLATOBOOST_SERVICE_ID,
  validateAccessKey,
} from '../utils/coreAuth';

interface KeySystemModalProps {
  onAuthorized: (verifiedKey?: string, expiresAtMs?: number, rememberKey?: boolean) => void;
  onReplayIntro: () => void;
  rememberKey?: boolean;
  onToggleRememberKey?: (next: boolean) => void;
  expiredNotificationMessage?: string | null;
}

export const KeySystemModal: React.FC<KeySystemModalProps> = ({
  onAuthorized,
  onReplayIntro,
  rememberKey = true,
  onToggleRememberKey,
  expiredNotificationMessage = null,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(true);
  const [localRememberKey, setLocalRememberKey] = useState(rememberKey);
  const [statusMsg, setStatusMsg] = useState<string>(
    expiredNotificationMessage
      ? `Status: ${expiredNotificationMessage}`
      : 'Status: Enter your key or click Get Key to continue.'
  );
  const [isError, setIsError] = useState(Boolean(expiredNotificationMessage));
  const [cardFlashState, setCardFlashState] = useState<'neutral' | 'error' | 'success'>(
    expiredNotificationMessage ? 'error' : 'neutral'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  useEffect(() => {
    setLocalRememberKey(rememberKey);
  }, [rememberKey]);

  useEffect(() => {
    if (expiredNotificationMessage) {
      setIsError(true);
      setCardFlashState('error');
      setStatusMsg(`Status: ${expiredNotificationMessage}`);
      setShakeTrigger((prev) => prev + 1);
    }
  }, [expiredNotificationMessage]);

  const handleToggleRemember = () => {
    const next = !localRememberKey;
    setLocalRememberKey(next);
    onToggleRememberKey?.(next);
  };

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
      }, 1500);
      return;
    }
    setIsError(false);
    setCardFlashState('success');
    setStatusMsg('Status: Key verified! Launching Core.xyz...');
    window.setTimeout(() => {
      onAuthorized(validation.normalizedKey, validation.expiresAtMs, localRememberKey);
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

  const cardGradientStyle: React.CSSProperties =
    cardFlashState === 'error'
      ? {
          backgroundImage:
            'linear-gradient(132deg, rgba(168,24,42,0.96) 0%, rgba(118,16,30,0.95) 28%, rgba(68,12,22,0.96) 62%, rgba(28,10,16,0.98) 85%, rgba(14,10,14,0.99) 100%)',
        }
      : cardFlashState === 'success'
      ? {
          backgroundImage:
            'linear-gradient(132deg, rgba(16,150,92,0.96) 0%, rgba(12,108,68,0.95) 28%, rgba(10,64,42,0.96) 62%, rgba(10,28,22,0.98) 85%, rgba(10,14,14,0.99) 100%)',
        }
      : {
          backgroundImage:
            'linear-gradient(132deg, rgba(24,25,32,0.98) 0%, rgba(16,17,22,0.98) 45%, rgba(11,12,16,0.99) 80%, rgba(8,8,12,1) 100%)',
        };

  const cardBorderClasses =
    cardFlashState === 'error'
      ? 'border-red-400/90 shadow-[0_0_55px_rgba(244,63,94,0.38)]'
      : cardFlashState === 'success'
      ? 'border-emerald-400/90 shadow-[0_0_55px_rgba(16,185,129,0.38)]'
      : 'border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.9)]';

  const topAccentClasses =
    cardFlashState === 'error'
      ? 'from-transparent via-red-400 to-transparent'
      : cardFlashState === 'success'
      ? 'from-transparent via-emerald-300 to-transparent'
      : 'from-transparent via-white/90 to-transparent';

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

      {/* Center Polished Platoboost Key Card */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-8 gap-4">
        {expiredNotificationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            data-testid="expired-key-notification"
            className="w-full max-w-md rounded-xl bg-gradient-to-r from-red-950/95 via-red-900/80 to-red-950/95 border border-red-400/60 px-4 py-3 flex items-center gap-3 shadow-[0_12px_35px_rgba(239,68,68,0.28)]"
          >
            <AlertTriangle className="w-4 h-4 text-red-300 shrink-0" />
            <div className="text-xs font-medium text-red-100">
              {expiredNotificationMessage}
            </div>
          </motion.div>
        )}

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
          style={cardGradientStyle}
          className={`relative w-full max-w-md rounded-2xl border p-8 overflow-hidden transition-all duration-300 ${cardBorderClasses}`}
        >
          {/* Inner Bevel Specular Highlight */}
          <div className="pointer-events-none absolute inset-[1px] rounded-[15px] border border-white/10" />

          {/* Top Tapered Accent Line */}
          <div
            className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r transition-colors duration-300 ${topAccentClasses}`}
          />

          <div className="relative z-10 flex items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold tracking-tight text-white">
                  Core.xyz &nbsp;|&nbsp; Key System
                </h1>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-300/80 mt-1">
                License Verification Gateway
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md bg-black/50 border border-white/15 font-mono text-[10px] font-bold tracking-wider text-white">
                ● PLATOBOOST
              </span>
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/15 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Tapered Gradient Divider */}
          <div className="relative z-10 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent mb-5" />

          <form onSubmit={handleSubmitKey} className="relative z-10 space-y-4" noValidate>
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
                  className={`w-full rounded-xl bg-[#0B0C10]/90 border px-4 py-3 pr-20 text-sm font-mono text-white placeholder:text-neutral-500 focus:outline-none transition-colors ${
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
                      className="px-1.5 py-1 rounded bg-white/[0.08] hover:bg-white/15 text-[10px] font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
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
                        ? 'bg-red-300 shadow-[0_0_8px_#fca5a5]'
                        : cardFlashState === 'success' || copiedLink
                        ? 'bg-emerald-300 shadow-[0_0_8px_#6ee7b7]'
                        : 'bg-neutral-400'
                    }`}
                  />
                  <p
                    className={`text-xs font-medium ${
                      isError
                        ? 'text-red-200'
                        : cardFlashState === 'success'
                        ? 'text-emerald-200'
                        : 'text-neutral-300'
                    }`}
                  >
                    {statusMsg}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Save-Key Toggle Row */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/12">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
                <span className="text-xs font-medium text-neutral-200">
                  Save Key (Auto-Login Until Expired)
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={localRememberKey}
                aria-label="Save Key (Auto-Login Until Expired)"
                data-testid="key-save-toggle"
                onClick={handleToggleRemember}
                className={`relative w-10 h-5 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                  localRememberKey
                    ? 'bg-white justify-end shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'bg-[#1D1D22] border border-white/15 justify-start'
                }`}
              >
                <span
                  className={`block w-3.5 h-3.5 rounded-full transition-colors ${
                    localRememberKey ? 'bg-black' : 'bg-neutral-400'
                  }`}
                />
              </button>
            </div>

            {/* Strictly 2 Primary Action Buttons: 1. Submit  2. Get Key */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="submit"
                data-testid="key-submit-button"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-colors whitespace-nowrap cursor-pointer shadow-[0_6px_20px_rgba(255,255,255,0.2)]"
              >
                <span>Submit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleGetKey}
                data-testid="key-get-button"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-[#14151C]/90 text-white hover:bg-[#1F212B] border border-white/15 transition-colors whitespace-nowrap cursor-pointer"
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

          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-300/80 font-mono">
            <span>Service #{PLATOBOOST_SERVICE_ID}</span>
            <span>·</span>
            <span>SHA-256 Nonce Auth</span>
            <span>·</span>
            <span>Auto-Expiry Check</span>
          </div>
        </motion.div>
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto py-2 flex items-center justify-between text-xs text-neutral-500">
        <span>Core.xyz Universal Suite v4.4</span>
        <span>Luxury Multi-Stop Gradient UI</span>
      </footer>
    </div>
  );
};




