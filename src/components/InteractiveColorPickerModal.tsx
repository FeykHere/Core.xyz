import React, { useState, useEffect, useRef } from 'react';
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
  const initialHsv = hexToHsv(color);
  const [hsv, setHsv] = useState<{ h: number; s: number; v: number }>(initialHsv);
  const [alpha, setAlpha] = useState<number>(100);
  const svCanvasRef = useRef<HTMLDivElement | null>(null);
  const hueBarRef = useRef<HTMLDivElement | null>(null);
  const [draggingTarget, setDraggingTarget] = useState<'sv' | 'hue' | null>(null);

  useEffect(() => {
    if (open) {
      setHsv(hexToHsv(color));
    }
  }, [open, color]);

  const updateSvFromClientXY = (clientX: number, clientY: number) => {
    const el = svCanvasRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / Math.max(1, rect.height)));
    const next = { h: hsv.h, s, v };
    setHsv(next);
    onChange(hsvToHex(next.h, next.s, next.v));
  };

  const updateHueFromClientX = (clientX: number) => {
    const el = hueBarRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const h = Math.max(0, Math.min(0.999, (clientX - rect.left) / Math.max(1, rect.width)));
    const next = { h, s: hsv.s, v: hsv.v };
    setHsv(next);
    onChange(hsvToHex(next.h, next.s, next.v));
  };

  useEffect(() => {
    if (!draggingTarget) return;
    const handleMove = (e: PointerEvent) => {
      if (draggingTarget === 'sv') {
        updateSvFromClientXY(e.clientX, e.clientY);
      } else if (draggingTarget === 'hue') {
        updateHueFromClientX(e.clientX);
      }
    };
    const handleUp = () => setDraggingTarget(null);
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  });

  const pureHueHex = hsvToHex(hsv.h, 1, 1);
  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

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
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(24,25,34,0.99) 0%, rgba(14,15,21,0.99) 60%, rgba(9,10,14,1) 100%)',
            }}
            className="relative w-full max-w-xs rounded-2xl border border-white/20 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.92)] space-y-3.5 select-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Palette className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs font-bold text-white truncate">{label}</span>
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

            {/* Touchable & Draggable 2D Saturation / Value Canvas */}
            <div
              ref={svCanvasRef}
              data-testid="color-picker-sv-canvas"
              onPointerDown={(e) => {
                setDraggingTarget('sv');
                updateSvFromClientXY(e.clientX, e.clientY);
              }}
              style={{ backgroundColor: pureHueHex }}
              className="relative w-full h-40 rounded-xl border border-white/20 overflow-hidden cursor-crosshair touch-none"
            >
              {/* White horizontal saturation gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0) 100%)',
                }}
              />
              {/* Black vertical value gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000000 100%)',
                }}
              />
              {/* Dual-Ring Live Color Cursor */}
              <div
                style={{
                  left: `${hsv.s * 100}%`,
                  top: `${(1 - hsv.v) * 100}%`,
                  backgroundColor: currentHex,
                }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white ring-2 ring-black/80 shadow-md"
              />
            </div>

            {/* Touchable & Draggable Hue Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>HUE SPECTRUM</span>
                <span>{Math.round(hsv.h * 360)}°</span>
              </div>
              <div
                ref={hueBarRef}
                data-testid="color-picker-hue-bar"
                onPointerDown={(e) => {
                  setDraggingTarget('hue');
                  updateHueFromClientX(e.clientX);
                }}
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
                className="relative h-3.5 w-full rounded-full border border-white/20 cursor-pointer touch-none"
              >
                <div
                  style={{ left: `${hsv.h * 100}%`, backgroundColor: pureHueHex }}
                  className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white ring-1 ring-black shadow"
                />
              </div>
            </div>

            {/* Alpha / Opacity Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>OPACITY / ALPHA</span>
                <span>{alpha}%</span>
              </div>
              <input
                type="range"
                aria-label="Color Opacity"
                min={0}
                max={100}
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full accent-white h-2 rounded-lg cursor-pointer"
              />
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
                      setHsv(hexToHsv(preset));
                      onChange(preset);
                    }}
                    style={{ backgroundColor: preset }}
                    className={`h-5 rounded border transition-transform hover:scale-110 cursor-pointer ${
                      currentHex.toUpperCase() === preset
                        ? 'border-white ring-1 ring-white scale-105'
                        : 'border-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Live Preview & Hex Readout */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: currentHex, opacity: alpha / 100 }}
                  className="w-6 h-6 rounded-lg border border-white/30 shadow-inner"
                />
                <span
                  data-testid="color-picker-hex-value"
                  className="font-mono text-xs font-bold text-white"
                >
                  {currentHex}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold cursor-pointer"
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
