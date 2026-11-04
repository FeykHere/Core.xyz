import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette } from 'lucide-react';
import { hexToHsv, hsvToHex } from '../utils/coreAuth';

interface InteractiveColorPickerModalProps {
  open: boolean;
  label: string;
  color: string;
  onChange: (nextColor: string) => void;
  onClose: () => void;
}

const PRESET_SWATCHES = [
  '#FFFFFF',
  '#EF4444',
  '#10B981',
  '#3B82F6',
  '#A855F7',
  '#EC4899',
  '#F59E0B',
  '#06B6D4',
  '#6E5AFF',
  '#A3A3A3',
];

export const InteractiveColorPickerModal: React.FC<InteractiveColorPickerModalProps> = ({
  open,
  label,
  color,
  onChange,
  onClose,
}) => {
  const [hsv, setHsv] = useState<{ h: number; s: number; v: number }>(() => hexToHsv(color));
  const [alpha, setAlpha] = useState<number>(100);
  const [hexInput, setHexInput] = useState<string>(() => color.toUpperCase());
  const [activeDrag, setActiveDrag] = useState<'sv' | 'hue' | 'alpha' | null>(null);

  const hsvRef = useRef<{ h: number; s: number; v: number }>(hexToHsv(color));
  const alphaRef = useRef<number>(100);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const svCanvasRef = useRef<HTMLDivElement | null>(null);
  const hueBarRef = useRef<HTMLDivElement | null>(null);
  const alphaBarRef = useRef<HTMLDivElement | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingEmitHexRef = useRef<string | null>(null);

  useEffect(() => {
    if (open) {
      const next = hexToHsv(color);
      hsvRef.current = next;
      setHsv(next);
      setHexInput(hsvToHex(next.h, next.s, next.v));
    }
  }, [open, color]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const scheduleParentColorSync = useCallback((nextHex: string) => {
    pendingEmitHexRef.current = nextHex;
    if (rafIdRef.current !== null) return;
    rafIdRef.current = window.requestAnimationFrame(() => {
      rafIdRef.current = null;
      if (pendingEmitHexRef.current) {
        onChangeRef.current(pendingEmitHexRef.current);
        pendingEmitHexRef.current = null;
      }
    });
  }, []);

  const commitHsvUpdate = useCallback(
    (next: { h: number; s: number; v: number }, immediate = false) => {
      hsvRef.current = next;
      setHsv(next);
      const nextHex = hsvToHex(next.h, next.s, next.v);
      setHexInput(nextHex);
      if (immediate) {
        onChangeRef.current(nextHex);
      } else {
        scheduleParentColorSync(nextHex);
      }
    },
    [scheduleParentColorSync]
  );

  const updateSvFromClientXY = useCallback(
    (clientX: number, clientY: number, immediate = false) => {
      const el = svCanvasRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const s = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
      const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / Math.max(1, rect.height)));
      commitHsvUpdate({ h: hsvRef.current.h, s, v }, immediate);
    },
    [commitHsvUpdate]
  );

  const updateHueFromClientX = useCallback(
    (clientX: number, immediate = false) => {
      const el = hueBarRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const h = Math.max(0, Math.min(0.999, (clientX - rect.left) / Math.max(1, rect.width)));
      commitHsvUpdate({ h, s: hsvRef.current.s, v: hsvRef.current.v }, immediate);
    },
    [commitHsvUpdate]
  );

  const updateAlphaFromClientX = useCallback((clientX: number) => {
    const el = alphaBarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nextAlpha = Math.round(
      Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width))) * 100
    );
    alphaRef.current = nextAlpha;
    setAlpha(nextAlpha);
  }, []);

  // Global fallback pointer listeners during active drag for 60fps response outside bounds
  useEffect(() => {
    if (!activeDrag) return;
    const handlePointerMove = (e: PointerEvent) => {
      if (activeDrag === 'sv') {
        updateSvFromClientXY(e.clientX, e.clientY, false);
      } else if (activeDrag === 'hue') {
        updateHueFromClientX(e.clientX, false);
      } else if (activeDrag === 'alpha') {
        updateAlphaFromClientX(e.clientX);
      }
    };
    const handlePointerUp = () => {
      setActiveDrag(null);
      if (pendingEmitHexRef.current) {
        onChangeRef.current(pendingEmitHexRef.current);
        pendingEmitHexRef.current = null;
      }
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [activeDrag, updateSvFromClientXY, updateHueFromClientX, updateAlphaFromClientX]);

  const pureHueHex = hsvToHex(hsv.h, 1, 1);
  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

  const handleHexInputCommit = (raw: string) => {
    const cleaned = raw.trim().replace(/^#/, '');
    if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
      const formatted = `#${cleaned.toUpperCase()}`;
      const next = hexToHsv(formatted);
      commitHsvUpdate(next, true);
    } else {
      setHexInput(currentHex);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          data-testid="color-picker-backdrop"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Color Picker - ${label}`}
            data-testid="interactive-color-picker-modal"
            initial={{ opacity: 0, scale: 0.95, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.6 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage:
                'linear-gradient(145deg, rgba(24,25,34,0.99) 0%, rgba(13,14,20,0.99) 58%, rgba(8,9,13,1) 100%)',
            }}
            className="relative w-full max-w-xs rounded-2xl border border-white/20 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.12)] space-y-3.5 select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Palette className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs font-bold text-white truncate">{label}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 border border-white/10">
                  60FPS
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Color Picker"
                data-testid="color-picker-close-btn"
                className="w-6 h-6 rounded-lg bg-[#1A1B22] hover:bg-red-500/90 border border-white/15 text-neutral-200 hover:text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* 60FPS Touchable & Draggable 2D Saturation / Value Canvas */}
            <div
              ref={svCanvasRef}
              data-testid="color-picker-sv-canvas"
              onPointerDown={(e) => {
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  // Ignore synthetic pointer events without active pointerId
                }
                setActiveDrag('sv');
                updateSvFromClientXY(e.clientX, e.clientY, true);
              }}
              style={{ backgroundColor: pureHueHex }}
              className="relative w-full h-40 rounded-xl border border-white/20 overflow-hidden cursor-crosshair touch-none shadow-inner"
            >
              {/* White horizontal saturation gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
                }}
              />
              {/* Black vertical value gradient */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)',
                }}
              />
              {/* GPU-Accelerated 60FPS Dual-Ring Live Color Cursor */}
              <div
                style={{
                  left: `${(hsv.s * 100).toFixed(2)}%`,
                  top: `${((1 - hsv.v) * 100).toFixed(2)}%`,
                  backgroundColor: currentHex,
                  transform: `translate3d(-50%, -50%, 0) scale(${activeDrag === 'sv' ? 1.18 : 1})`,
                  willChange: 'left, top, transform',
                }}
                className="pointer-events-none absolute w-4 h-4 rounded-full border-2 border-white ring-2 ring-black/85 shadow-[0_0_12px_rgba(0,0,0,0.85)] transition-transform duration-75"
              />
            </div>

            {/* 60FPS Touchable & Draggable Hue Spectrum Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>HUE SPECTRUM</span>
                <span>{Math.round(hsv.h * 360)}°</span>
              </div>
              <div
                ref={hueBarRef}
                data-testid="color-picker-hue-bar"
                onPointerDown={(e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                    // Ignore synthetic pointer events
                  }
                  setActiveDrag('hue');
                  updateHueFromClientX(e.clientX, true);
                }}
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
                className="relative h-4 w-full rounded-full border border-white/20 cursor-pointer touch-none shadow-inner"
              >
                <div
                  style={{
                    left: `${(hsv.h * 100).toFixed(2)}%`,
                    backgroundColor: pureHueHex,
                    transform: `translate3d(-50%, -50%, 0) scale(${activeDrag === 'hue' ? 1.15 : 1})`,
                    willChange: 'left, transform',
                  }}
                  className="pointer-events-none absolute top-1/2 w-4 h-4 rounded-full border-2 border-white ring-1 ring-black shadow-md transition-transform duration-75"
                />
              </div>
            </div>

            {/* 60FPS Custom Touchable & Draggable Alpha / Opacity Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>OPACITY / ALPHA</span>
                <span>{alpha}%</span>
              </div>
              <div
                ref={alphaBarRef}
                data-testid="color-picker-alpha-bar"
                onPointerDown={(e) => {
                  try {
                    e.currentTarget.setPointerCapture(e.pointerId);
                  } catch {
                    // Ignore synthetic pointer events
                  }
                  setActiveDrag('alpha');
                  updateAlphaFromClientX(e.clientX);
                }}
                style={{
                  background: `linear-gradient(to right, rgba(20,20,28,0.95) 0%, ${currentHex} 100%)`,
                }}
                className="relative h-4 w-full rounded-full border border-white/20 cursor-pointer touch-none shadow-inner"
              >
                <div
                  style={{
                    left: `${alpha}%`,
                    backgroundColor: currentHex,
                    transform: `translate3d(-50%, -50%, 0) scale(${activeDrag === 'alpha' ? 1.15 : 1})`,
                    willChange: 'left, transform',
                  }}
                  className="pointer-events-none absolute top-1/2 w-4 h-4 rounded-full border-2 border-white ring-1 ring-black shadow-md transition-transform duration-75"
                />
              </div>
            </div>

            {/* 10 Quick Preset Swatches */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-neutral-400 block">
                QUICK PRESETS
              </span>
              <div className="grid grid-cols-10 gap-1.5">
                {PRESET_SWATCHES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    aria-label={`Select preset color ${preset}`}
                    data-testid={`color-preset-${preset.replace('#', '')}`}
                    onClick={() => {
                      const next = hexToHsv(preset);
                      commitHsvUpdate(next, true);
                    }}
                    style={{ backgroundColor: preset }}
                    className={`h-5 rounded border transition-transform duration-100 hover:scale-110 cursor-pointer ${
                      currentHex.toUpperCase() === preset
                        ? 'border-white ring-1 ring-white scale-105'
                        : 'border-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Live Preview, Editable Hex Input & Apply Button */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: currentHex, opacity: alpha / 100 }}
                  className="w-7 h-7 rounded-lg border border-white/30 shadow-inner shrink-0"
                />
                <div className="flex flex-col">
                  <input
                    type="text"
                    aria-label="Hex Color Code"
                    value={hexInput}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setHexInput(val);
                      const cleaned = val.trim().replace(/^#/, '');
                      if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
                        commitHsvUpdate(hexToHsv(`#${cleaned}`), true);
                      }
                    }}
                    onBlur={(e) => handleHexInputCommit(e.target.value)}
                    className="w-20 px-1.5 py-0.5 rounded bg-[#14151C] border border-white/15 font-mono text-xs font-bold text-white focus:outline-none focus:border-white"
                  />
                  <span
                    data-testid="color-picker-hex-value"
                    className="sr-only"
                  >
                    {currentHex}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Apply Color
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

