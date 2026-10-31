import { WeatherPresetType } from './coreAuth';

export interface WeatherParticle {
  id: number;
  x: number; // 0..1 normalized viewport width
  y: number; // 0..1 normalized viewport height
  z: number; // 0.2..1.0 depth factor (scales speed, size, opacity)
  vx: number;
  vy: number;
  length: number;
  radius: number;
  opacity: number;
  phase: number;
  swayAmp: number;
  swayFreq: number;
}

export interface WeatherSplash {
  x: number; // 0..1 normalized width
  y: number; // 0.82..0.98 normalized ground plane
  radius: number;
  maxRadius: number;
  opacity: number;
}

export interface LightningSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  isBranch: boolean;
}

export interface LightningBolt {
  strikeX: number; // 0.08..0.92 normalized horizontal position
  stereoPan: number; // -0.9..+0.9 for Web Audio StereoPannerNode
  distanceMeters: number; // 35..180m for acoustic delay & rumble shaping
  intensity: number; // 0..1 decaying flash & bolt brightness
  segments: LightningSegment[];
}

export interface SunMote {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  opacity: number;
  phase: number;
}

export function getTargetParticleCount(preset: WeatherPresetType): number {
  switch (preset) {
    case 'Rain':
      return 150;
    case 'Thunderstorm':
      return 240;
    case 'Snow':
      return 190;
    case 'Sunny':
      return 42;
    case 'Default':
    default:
      return 0;
  }
}

export function createWeatherParticles(
  preset: WeatherPresetType,
  seedOffset = 0
): WeatherParticle[] {
  const count = getTargetParticleCount(preset);
  const particles: WeatherParticle[] = [];

  for (let i = 0; i < count; i++) {
    const pseudo = ((i * 73 + seedOffset * 31) % 1000) / 1000;
    const depth = 0.3 + ((i * 19) % 70) / 100; // 0.30 .. 1.00

    if (preset === 'Rain') {
      particles.push({
        id: i,
        x: ((i * 37) % 100) / 100,
        y: pseudo,
        z: depth,
        vx: -0.09 * depth,
        vy: (1.25 + (i % 7) * 0.12) * depth,
        length: (16 + (i % 5) * 3.5) * depth,
        radius: 1.15 * depth,
        opacity: 0.32 + 0.48 * depth,
        phase: (i * 0.7) % (Math.PI * 2),
        swayAmp: 0,
        swayFreq: 0,
      });
    } else if (preset === 'Thunderstorm') {
      particles.push({
        id: i,
        x: ((i * 41) % 100) / 100,
        y: pseudo,
        z: depth,
        vx: -0.34 * depth,
        vy: (1.75 + (i % 8) * 0.14) * depth,
        length: (22 + (i % 6) * 4.2) * depth,
        radius: 1.35 * depth,
        opacity: 0.42 + 0.52 * depth,
        phase: (i * 0.9) % (Math.PI * 2),
        swayAmp: 0,
        swayFreq: 0,
      });
    } else if (preset === 'Snow') {
      particles.push({
        id: i,
        x: ((i * 29) % 100) / 100,
        y: pseudo,
        z: depth,
        vx: (0.04 + ((i % 5) - 2) * 0.015) * depth,
        vy: (0.22 + (i % 6) * 0.045) * depth,
        length: 0,
        radius: (2.2 + (i % 5) * 1.1) * depth,
        opacity: 0.48 + 0.48 * depth,
        phase: (i * 1.13) % (Math.PI * 2),
        swayAmp: 0.055 + (i % 4) * 0.018,
        swayFreq: 1.6 + (i % 5) * 0.35,
      });
    } else if (preset === 'Sunny') {
      particles.push({
        id: i,
        x: ((i * 53) % 100) / 100,
        y: pseudo,
        z: depth,
        vx: 0.018 * depth,
        vy: -0.025 * depth,
        length: 0,
        radius: (1.4 + (i % 4) * 0.7) * depth,
        opacity: 0.22 + 0.35 * depth,
        phase: (i * 0.85) % (Math.PI * 2),
        swayAmp: 0.02,
        swayFreq: 1.1,
      });
    }
  }

  return particles;
}

export function stepWeatherParticles(
  particles: WeatherParticle[],
  splashes: WeatherSplash[],
  preset: WeatherPresetType,
  dt: number,
  elapsedSec: number
): void {
  const safeDt = Math.min(Math.max(dt, 0.001), 0.1);

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (preset === 'Snow' || preset === 'Sunny') {
      const sway = Math.sin(elapsedSec * p.swayFreq + p.phase) * p.swayAmp;
      p.x += (p.vx + sway) * safeDt;
      p.y += p.vy * safeDt;
    } else {
      p.x += p.vx * safeDt;
      p.y += p.vy * safeDt;
    }

    if (p.y > 1.04) {
      if (
        (preset === 'Rain' || preset === 'Thunderstorm') &&
        splashes.length < 36 &&
        p.z > 0.55 &&
        i % 3 === 0
      ) {
        splashes.push({
          x: ((p.x % 1) + 1) % 1,
          y: 0.86 + (p.z - 0.55) * 0.28,
          radius: 1,
          maxRadius: preset === 'Thunderstorm' ? 9 * p.z : 6.5 * p.z,
          opacity: preset === 'Thunderstorm' ? 0.65 : 0.48,
        });
      }
      p.y = -0.04 - (p.id % 7) * 0.01;
      p.x = (((p.x + 0.17 * ((p.id % 5) + 1)) % 1) + 1) % 1;
    } else if (p.y < -0.06 && preset === 'Sunny') {
      p.y = 1.03;
    }

    if (p.x < -0.05) {
      p.x += 1.1;
    } else if (p.x > 1.05) {
      p.x -= 1.1;
    }
  }

  for (let s = splashes.length - 1; s >= 0; s--) {
    const sp = splashes[s];
    sp.radius += safeDt * 34;
    sp.opacity -= safeDt * 2.1;
    if (sp.opacity <= 0.02 || sp.radius >= sp.maxRadius) {
      splashes.splice(s, 1);
    }
  }
}

export function generateLightningBolt(
  strikeX = 0.15 + Math.random() * 0.7,
  distanceMeters = 45 + Math.random() * 120
): LightningBolt {
  const clampedX = Math.max(0.08, Math.min(0.92, strikeX));
  const stereoPan = Math.max(-0.92, Math.min(0.92, (clampedX - 0.5) * 1.8));
  const segments: LightningSegment[] = [];

  const mainSteps = 8;
  let curX = clampedX;
  let curY = 0.0;
  const targetGroundY = 0.78 + Math.min(0.18, (180 - distanceMeters) / 900);

  for (let i = 0; i < mainSteps; i++) {
    const nextY = ((i + 1) / mainSteps) * targetGroundY;
    const jitter = (Math.sin(i * 2.7 + strikeX * 19) * 0.045) + (Math.cos(i * 4.1) * 0.025);
    const nextX = Math.max(0.04, Math.min(0.96, curX + jitter));

    segments.push({
      x1: curX,
      y1: curY,
      x2: nextX,
      y2: nextY,
      width: Math.max(1.4, 3.6 - i * 0.25),
      isBranch: false,
    });

    // Spawn realistic forked side-branches on upper/mid segments
    if (i === 2 || i === 4 || i === 5) {
      const branchDir = i % 2 === 0 ? 1 : -1;
      const bMidX = Math.max(0.02, Math.min(0.98, nextX + branchDir * 0.065));
      const bMidY = nextY + 0.08;
      segments.push({
        x1: nextX,
        y1: nextY,
        x2: bMidX,
        y2: bMidY,
        width: 1.5,
        isBranch: true,
      });

      const bTipX = Math.max(0.02, Math.min(0.98, bMidX + branchDir * 0.045));
      const bTipY = bMidY + 0.07;
      segments.push({
        x1: bMidX,
        y1: bMidY,
        x2: bTipX,
        y2: bTipY,
        width: 0.9,
        isBranch: true,
      });
    }

    curX = nextX;
    curY = nextY;
  }

  return {
    strikeX: clampedX,
    stereoPan,
    distanceMeters,
    intensity: 1.0,
    segments,
  };
}
