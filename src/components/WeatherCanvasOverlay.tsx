import React, { useEffect, useRef } from 'react';
import { WeatherPresetType } from '../utils/coreAuth';
import {
  LightningBolt,
  WeatherParticle,
  WeatherSplash,
  createWeatherParticles,
  generateLightningBolt,
  stepWeatherParticles,
} from '../utils/weatherEngine';

interface WeatherCanvasOverlayProps {
  preset: WeatherPresetType;
  soundEnabled: boolean;
  volume: number; // 0..100
}

export const WeatherCanvasOverlay: React.FC<WeatherCanvasOverlayProps> = ({
  preset,
  soundEnabled,
  volume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const volumeRef = useRef(volume);
  const triggerThunderSoundRef = useRef<((pan: number, distanceMeters: number) => void) | null>(
    null
  );

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    volumeRef.current = volume;
  }, [soundEnabled, volume]);

  // Ambient Audio Loop & Synchronized 3D Spatial Thunder Synthesizer
  useEffect(() => {
    if (typeof window === 'undefined' || !soundEnabled || preset === 'Default') {
      triggerThunderSoundRef.current = null;
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    let ctx: AudioContext | null = null;
    let windLfoTimer: number | null = null;

    try {
      ctx = new AudioCtx();
      const normVol = Math.max(0, Math.min(1, volume / 100));
      const masterGain = ctx.createGain();
      masterGain.gain.value = normVol * 0.22;
      masterGain.connect(ctx.destination);

      if (preset === 'Rain' || preset === 'Thunderstorm' || preset === 'Snow') {
        // 1. Pink/Brownian Noise Buffer for Continuous Surrounding Rain / Wind Bed
        const bufferLen = ctx.sampleRate * 3;
        const rainBuffer = ctx.createBuffer(2, bufferLen, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = rainBuffer.getChannelData(ch);
          let b0 = 0;
          let b1 = 0;
          let b2 = 0;
          for (let i = 0; i < bufferLen; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.997 * b0 + white * 0.029;
            b1 = 0.985 * b1 + white * 0.032;
            b2 = 0.95 * b2 + white * 0.048;
            data[i] = (b0 + b1 + b2 + white * 0.018) * 2.4;
          }
        }

        const bedSource = ctx.createBufferSource();
        bedSource.buffer = rainBuffer;
        bedSource.loop = true;

        const bedFilter = ctx.createBiquadFilter();
        bedFilter.type = preset === 'Snow' ? 'bandpass' : 'lowpass';
        bedFilter.frequency.value =
          preset === 'Thunderstorm' ? 1350 : preset === 'Rain' ? 1150 : 460;
        bedFilter.Q.value = preset === 'Snow' ? 1.8 : 0.7;

        bedSource.connect(bedFilter);
        bedFilter.connect(masterGain);
        bedSource.start(0);

        // 2. High-Frequency Droplet Patter Layer for Rain & Thunderstorm
        if (preset === 'Rain' || preset === 'Thunderstorm') {
          const patterBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
          const pData = patterBuffer.getChannelData(0);
          for (let i = 0; i < pData.length; i++) {
            const burst = Math.random() > 0.985 ? (Math.random() * 2 - 1) * 0.9 : 0;
            pData[i] = (Math.random() * 2 - 1) * 0.12 + burst;
          }
          const patterSource = ctx.createBufferSource();
          patterSource.buffer = patterBuffer;
          patterSource.loop = true;

          const patterFilter = ctx.createBiquadFilter();
          patterFilter.type = 'bandpass';
          patterFilter.frequency.value = preset === 'Thunderstorm' ? 2850 : 2400;
          patterFilter.Q.value = 1.2;

          const patterGain = ctx.createGain();
          patterGain.gain.value = preset === 'Thunderstorm' ? 0.55 : 0.42;

          patterSource.connect(patterFilter);
          patterFilter.connect(patterGain);
          patterGain.connect(masterGain);
          patterSource.start(0);
        }

        // Dynamic Wind Swell Modulation
        windLfoTimer = window.setInterval(() => {
          if (!ctx || ctx.state !== 'running') return;
          const now = ctx.currentTime;
          const targetFreq =
            preset === 'Snow'
              ? 360 + Math.random() * 280
              : preset === 'Thunderstorm'
              ? 1100 + Math.random() * 550
              : 980 + Math.random() * 320;
          bedFilter.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.8);
        }, 900);

        // 3. Synchronized 3D Spatial Thunder Strike Audio Trigger
        triggerThunderSoundRef.current = (pan: number, distanceMeters: number) => {
          if (!ctx || ctx.state !== 'running' || !soundEnabledRef.current) return;
          try {
            const curVol = Math.max(0, Math.min(1, volumeRef.current / 100));
            if (curVol <= 0.01) return;

            const delaySec = Math.min(0.45, Math.max(0.02, (distanceMeters - 35) / 340));
            const startAt = ctx.currentTime + delaySec;
            const distAtten = Math.max(0.35, Math.min(1.0, 1.15 - distanceMeters / 220));

            const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
            if (panner) {
              panner.pan.setValueAtTime(Math.max(-0.95, Math.min(0.95, pan)), startAt);
              panner.connect(ctx.destination);
            }
            const targetNode = panner || ctx.destination;

            // Thunder Noise Burst + Rolling Sub-Bass Rumble
            const tLen = Math.floor(ctx.sampleRate * 2.4);
            const tBuf = ctx.createBuffer(1, tLen, ctx.sampleRate);
            const tOut = tBuf.getChannelData(0);
            let last = 0;
            for (let i = 0; i < tLen; i++) {
              const env = Math.exp(-i / (ctx.sampleRate * 0.68));
              const rumbleMod = 0.65 + 0.35 * Math.sin(i / 420);
              const w = Math.random() * 2 - 1;
              last = (last + 0.06 * w) / 1.06;
              tOut[i] = last * env * rumbleMod * 3.2;
            }

            const tNoise = ctx.createBufferSource();
            tNoise.buffer = tBuf;

            const tFilter = ctx.createBiquadFilter();
            tFilter.type = 'lowpass';
            tFilter.frequency.setValueAtTime(distanceMeters < 95 ? 820 : 420, startAt);
            tFilter.frequency.exponentialRampToValueAtTime(95, startAt + 2.1);

            const tGain = ctx.createGain();
            tGain.gain.setValueAtTime(curVol * 0.42 * distAtten, startAt);
            tGain.gain.exponentialRampToValueAtTime(0.001, startAt + 2.3);

            tNoise.connect(tFilter);
            tFilter.connect(tGain);
            tGain.connect(targetNode);
            tNoise.start(startAt);

            // Low Sub-Bass Thunder Punch Oscillator
            const subOsc = ctx.createOscillator();
            const subGain = ctx.createGain();
            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(distanceMeters < 90 ? 105 : 68, startAt);
            subOsc.frequency.exponentialRampToValueAtTime(24, startAt + 1.45);
            subGain.gain.setValueAtTime(curVol * 0.28 * distAtten, startAt);
            subGain.gain.exponentialRampToValueAtTime(0.001, startAt + 1.55);

            subOsc.connect(subGain);
            subGain.connect(targetNode);
            subOsc.start(startAt);
            subOsc.stop(startAt + 1.6);
          } catch {
            // Ignore audio scheduling errors
          }
        };
      } else if (preset === 'Sunny') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const sunnyGain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.value = 432;
        osc2.frequency.value = 648;
        sunnyGain.gain.value = normVol * 0.03;
        osc1.connect(sunnyGain);
        osc2.connect(sunnyGain);
        sunnyGain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        triggerThunderSoundRef.current = null;
      }
    } catch {
      // Ignore AudioContext autoplay restrictions until user interaction
    }

    return () => {
      triggerThunderSoundRef.current = null;
      if (windLfoTimer) window.clearInterval(windLfoTimer);
      if (ctx) {
        ctx.close().catch(() => {});
      }
    };
  }, [preset, soundEnabled, volume]);

  // Canvas Particle & Lightning Bolt Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || preset === 'Default') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: WeatherParticle[] = createWeatherParticles(preset);
    const splashes: WeatherSplash[] = [];
    let activeBolt: LightningBolt | null = null;
    let nextBoltTimer = preset === 'Thunderstorm' ? 0.65 : 999;
    let elapsedSec = 0;
    let lastTime = performance.now();
    let rafId = 0;

    // Trigger an initial visible lightning bolt immediately when switching to Thunderstorm
    if (preset === 'Thunderstorm') {
      activeBolt = generateLightningBolt(0.68, 65);
    }

    const renderFrame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.004, (now - lastTime) / 1000));
      lastTime = now;
      elapsedSec += dt;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // 1. Atmospheric Background Grading
      if (preset === 'Rain') {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(30, 48, 78, 0.42)');
        grad.addColorStop(0.65, 'rgba(15, 25, 45, 0.22)');
        grad.addColorStop(1, 'rgba(10, 18, 32, 0.08)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (preset === 'Thunderstorm') {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(18, 24, 48, 0.62)');
        grad.addColorStop(0.6, 'rgba(26, 28, 58, 0.36)');
        grad.addColorStop(1, 'rgba(12, 16, 32, 0.18)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (preset === 'Snow') {
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, 'rgba(205, 222, 245, 0.26)');
        grad.addColorStop(0.7, 'rgba(165, 190, 220, 0.12)');
        grad.addColorStop(1, 'rgba(225, 238, 255, 0.06)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (preset === 'Sunny') {
        const sunGrad = ctx.createRadialGradient(
          width * 0.16,
          height * 0.08,
          8,
          width * 0.16,
          height * 0.08,
          width * 0.75
        );
        sunGrad.addColorStop(0, 'rgba(255, 236, 170, 0.42)');
        sunGrad.addColorStop(0.35, 'rgba(255, 200, 110, 0.16)');
        sunGrad.addColorStop(1, 'rgba(255, 180, 90, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, width, height);

        // Volumetric Sun Rays
        ctx.save();
        for (let r = 0; r < 5; r++) {
          const rayAngle = 0.28 + r * 0.14 + Math.sin(elapsedSec * 0.7 + r) * 0.02;
          ctx.save();
          ctx.translate(width * 0.14, -10);
          ctx.rotate(rayAngle);
          const beamGrad = ctx.createLinearGradient(0, 0, 0, height * 1.3);
          beamGrad.addColorStop(0, 'rgba(255, 245, 200, 0.18)');
          beamGrad.addColorStop(0.6, 'rgba(255, 225, 155, 0.06)');
          beamGrad.addColorStop(1, 'rgba(255, 210, 120, 0)');
          ctx.fillStyle = beamGrad;
          ctx.fillRect(-24 - r * 6, 0, 48 + r * 12, height * 1.3);
          ctx.restore();
        }
        ctx.restore();
      }

      // 2. Step Particle Physics
      stepWeatherParticles(particles, splashes, preset, dt, elapsedSec);

      // 3. Render Rain / Thunderstorm Droplets & Ground Splashes
      if (preset === 'Rain' || preset === 'Thunderstorm') {
        ctx.lineCap = 'round';
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const px = p.x * width;
          const py = p.y * height;
          const dx = (preset === 'Thunderstorm' ? -0.22 : -0.06) * p.length;
          const dy = p.length;

          ctx.strokeStyle =
            preset === 'Thunderstorm'
              ? `rgba(195, 226, 255, ${p.opacity.toFixed(2)})`
              : `rgba(175, 215, 255, ${p.opacity.toFixed(2)})`;
          ctx.lineWidth = p.radius;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + dx, py + dy);
          ctx.stroke();
        }

        // Ground Splash Ripples
        for (let s = 0; s < splashes.length; s++) {
          const sp = splashes[s];
          ctx.strokeStyle = `rgba(200, 230, 255, ${Math.max(0, sp.opacity).toFixed(2)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(
            sp.x * width,
            sp.y * height,
            sp.radius,
            sp.radius * 0.35,
            0,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
      }

      // 4. Render Dense Multi-Depth Snowfall (No laggy ground layer)
      if (preset === 'Snow') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const px = p.x * width;
          const py = p.y * height;

          ctx.fillStyle = `rgba(245, 250, 255, ${p.opacity.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Render Sunny Warm Dust Motes
      if (preset === 'Sunny') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const px = p.x * width;
          const py = p.y * height;
          ctx.fillStyle = `rgba(255, 238, 175, ${p.opacity.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(px, py, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Render 3D-Perspective Surrounding Lightning Bolts & Sky Flash
      if (preset === 'Thunderstorm') {
        nextBoltTimer -= dt;
        if (nextBoltTimer <= 0) {
          nextBoltTimer = 2.6 + Math.random() * 2.8;
          const strikeX = 0.12 + Math.random() * 0.76;
          const dist = 42 + Math.random() * 125;
          activeBolt = generateLightningBolt(strikeX, dist);
          if (triggerThunderSoundRef.current) {
            triggerThunderSoundRef.current(activeBolt.stereoPan, activeBolt.distanceMeters);
          }
        }

        if (activeBolt && activeBolt.intensity > 0) {
          // Multi-return-stroke flicker
          const flicker =
            activeBolt.intensity > 0.65 && activeBolt.intensity < 0.78 ? 0.35 : 1.0;
          const alpha = Math.max(0, Math.min(1, activeBolt.intensity * flicker));

          // Sky & Ground Illumination Flash centered around strikeX
          const flashGrad = ctx.createRadialGradient(
            activeBolt.strikeX * width,
            height * 0.2,
            10,
            activeBolt.strikeX * width,
            height * 0.4,
            width * 0.85
          );
          flashGrad.addColorStop(0, `rgba(220, 238, 255, ${(alpha * 0.52).toFixed(2)})`);
          flashGrad.addColorStop(0.5, `rgba(175, 210, 255, ${(alpha * 0.24).toFixed(2)})`);
          flashGrad.addColorStop(1, 'rgba(140, 180, 255, 0)');
          ctx.fillStyle = flashGrad;
          ctx.fillRect(0, 0, width, height);

          // Render Jagged Lightning Bolt & Forked Branches
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'bevel';
          ctx.shadowColor = 'rgba(145, 205, 255, 0.95)';
          ctx.shadowBlur = 14;

          for (let i = 0; i < activeBolt.segments.length; i++) {
            const seg = activeBolt.segments[i];
            ctx.strokeStyle = seg.isBranch
              ? `rgba(185, 222, 255, ${(alpha * 0.78).toFixed(2)})`
              : `rgba(245, 252, 255, ${alpha.toFixed(2)})`;
            ctx.lineWidth = seg.width;
            ctx.beginPath();
            ctx.moveTo(seg.x1 * width, seg.y1 * height);
            ctx.lineTo(seg.x2 * width, seg.y2 * height);
            ctx.stroke();
          }
          ctx.restore();

          activeBolt.intensity -= dt * 2.25;
          if (activeBolt.intensity <= 0) {
            activeBolt = null;
          }
        }
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    rafId = window.requestAnimationFrame(renderFrame);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [preset]);

  if (preset === 'Default') {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-testid={`viewport-weather-${preset.toLowerCase()}`}
    >
      <canvas
        ref={canvasRef}
        width={520}
        height={320}
        data-testid="weather-canvas-overlay"
        data-weather-preset={preset}
        className="w-full h-full block"
      />
    </div>
  );
};
