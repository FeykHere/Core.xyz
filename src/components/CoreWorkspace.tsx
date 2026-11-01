import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  Lock,
  Home,
  Crosshair,
  Eye,
  Gauge,
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Code2,
  RefreshCw,
} from 'lucide-react';
import {
  CLOUDFLARE_WORKER_DEFAULT_URL,
  COMMUNITY_MUSIC_NOTE,
  COMMUNITY_MUSIC_TRACKS,
  CoreConfigState,
  DEFAULT_CORE_CONFIG,
  DEFAULT_GITHUB_CONFIG,
  DISCORD_API_INVITE_URL,
  DISCORD_INVITE_CODE,
  DISCORD_INVITE_URL,
  DISCORD_SERVER_ICON_URL,
  DISCORD_SERVER_NAME,
  DiscordServerStats,
  GithubRepoConfig,
  LIVE_LOADSTRING_SNIPPET,
  LIVE_RAW_SCRIPT_URL,
  PLATOBOOST_DEFAULT_KEY_TTL_MS,
  PLATOBOOST_SERVICE_ID,
  WEATHER_PRESETS,
  WeatherPresetType,
  buildCloudflareLoadstringSnippet,
  buildGithubRawUrl,
  buildLoadstringSnippet,
  buildOceanWaveSvgPath,
  computeOceanWaveCrestMetrics,
  computeOceanWaveDisplacement,
  formatRemainingKeyTime,
  formatTrackTimestamp,
  generateCoreLuaScript,
  parseDiscordInviteCounts,
} from '../utils/coreAuth';
import { WeatherCanvasOverlay } from './WeatherCanvasOverlay';

interface CoreWorkspaceProps {
  keyExpiresAtMs?: number;
  onReplayIntro: () => void;
  onLockSession: () => void;
}

type ActiveSection = 'simulator' | 'github' | 'improvements';
type RobloxTab = 'Home' | 'Combat' | 'Visuals' | 'Movement' | 'Music' | 'Misc';

const OCEAN_SEGMENT_INDICES = Array.from({ length: 28 }, (_, i) => i);

const ACCENT_HEX: Record<CoreConfigState['espAccent'], string> = {
  White: '#FFFFFF',
  Silver: '#B8B8B8',
  Crimson: '#EF4444',
  Cyan: '#38BDF8',
};

const SIMULATED_PLAYERS = [
  { id: 'p1', name: 'Vortex_R15', dist: 42, hp: 100, x: 22, y: 42, team: 'Alpha' },
  { id: 'p2', name: 'Nyx_Shadow', dist: 18, hp: 76, x: 50, y: 52, team: 'Bravo' },
  { id: 'p3', name: 'Kairo_R6', dist: 67, hp: 45, x: 78, y: 36, team: 'Bravo' },
];

export const CoreWorkspace: React.FC<CoreWorkspaceProps> = ({
  keyExpiresAtMs,
  onReplayIntro,
  onLockSession,
}) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('simulator');
  const [robloxTab, setRobloxTab] = useState<RobloxTab>('Home');
  const [config, setConfig] = useState<CoreConfigState>(DEFAULT_CORE_CONFIG);
  const [githubConfig, setGithubConfig] = useState<GithubRepoConfig>(DEFAULT_GITHUB_CONFIG);
  const [loaderSourceMode, setLoaderSourceMode] = useState<'cloudflare' | 'live' | 'github'>('cloudflare');
  const [cloudflareWorkerUrl, setCloudflareWorkerUrl] = useState<string>(CLOUDFLARE_WORKER_DEFAULT_URL);
  const [copiedLoadstring, setCopiedLoadstring] = useState(false);
  const [copiedLua, setCopiedLua] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [cameraResetMsg, setCameraResetMsg] = useState<string | null>(null);
  const [discordStats, setDiscordStats] = useState<DiscordServerStats>(() =>
    parseDiscordInviteCounts({})
  );
  const [discordIconError, setDiscordIconError] = useState(false);
  const [refreshingDiscord, setRefreshingDiscord] = useState(false);
  const [fullLuaFile, setFullLuaFile] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [trackTimeSec, setTrackTimeSec] = useState<number>(38);
  const [wavePhase, setWavePhase] = useState<number>(0);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const scrubberTrackRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeTrack = useMemo(
    () =>
      COMMUNITY_MUSIC_TRACKS.find((t) => t.label === config.selectedTrack) ??
      COMMUNITY_MUSIC_TRACKS[0],
    [config.selectedTrack]
  );

  // Sync HTML5 Audio element with playback state, volume, and loop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, config.musicVolume / 100));
    audio.loop = config.musicLooped;
  }, [config.musicVolume, config.musicLooped]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (config.musicPlaying) {
      if (Math.abs(audio.currentTime - trackTimeSec) > 1.5) {
        try {
          audio.currentTime = trackTimeSec;
        } catch {
          // ignore on unbuffered stream
        }
      }
      audio.play().catch(() => {
        // Fallback to simulated timeline progression when external audio stream is blocked
      });
    } else {
      audio.pause();
    }
  }, [config.musicPlaying, activeTrack]);

  // Continuous 20 FPS Wavy Ocean Phase & Playback Time Ticker
  useEffect(() => {
    const id = window.setInterval(() => {
      setWavePhase((prev) => prev + (config.musicPlaying ? 0.16 : 0.055));
      if (config.musicPlaying && !isScrubbing) {
        const audio = audioRef.current;
        if (audio && !audio.paused && audio.currentTime > 0) {
          setTrackTimeSec(audio.currentTime);
        } else {
          setTrackTimeSec((prev) => {
            const next = prev + 0.05;
            if (next >= activeTrack.durationSec) {
              return config.musicLooped ? 0 : activeTrack.durationSec;
            }
            return next;
          });
        }
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [config.musicPlaying, config.musicLooped, isScrubbing, activeTrack.durationSec]);

  const seekToRatio = (ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    const targetSec = clamped * activeTrack.durationSec;
    setTrackTimeSec(targetSec);
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = targetSec;
      } catch {
        // ignore seek error on unloaded stream
      }
    }
  };

  const handleScrubberPointer = (clientX: number) => {
    const el = scrubberTrackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    seekToRatio((clientX - rect.left) / rect.width);
  };

  const effectiveExpiresAt = useMemo(
    () => keyExpiresAtMs ?? Date.now() + PLATOBOOST_DEFAULT_KEY_TTL_MS,
    [keyExpiresAtMs]
  );

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const liveKeyTimeLeft = useMemo(
    () => formatRemainingKeyTime(effectiveExpiresAt, nowMs),
    [effectiveExpiresAt, nowMs]
  );

  const fetchLiveDiscordStats = React.useCallback(async () => {
    setRefreshingDiscord(true);
    try {
      const res = await fetch(DISCORD_API_INVITE_URL);
      if (res.ok) {
        const json = await res.json();
        setDiscordStats(parseDiscordInviteCounts(json));
      }
    } catch {
      // Keep current stats on network error
    } finally {
      setRefreshingDiscord(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLiveDiscordStats();
  }, [fetchLiveDiscordStats]);

  React.useEffect(() => {
    fetch('/loader.lua')
      .then((r) => (r.ok ? r.text() : null))
      .then((txt) => {
        if (txt) setFullLuaFile(txt);
      })
      .catch(() => {});
  }, []);

  const rawUrl = useMemo(() => {
    if (loaderSourceMode === 'cloudflare') {
      return cloudflareWorkerUrl.trim() || CLOUDFLARE_WORKER_DEFAULT_URL;
    }
    if (loaderSourceMode === 'live') {
      return LIVE_RAW_SCRIPT_URL;
    }
    return buildGithubRawUrl(githubConfig);
  }, [loaderSourceMode, cloudflareWorkerUrl, githubConfig]);

  const loadstringSnippet = useMemo(() => {
    if (loaderSourceMode === 'cloudflare') {
      return buildCloudflareLoadstringSnippet(cloudflareWorkerUrl, false);
    }
    if (loaderSourceMode === 'live') {
      return LIVE_LOADSTRING_SNIPPET;
    }
    return buildLoadstringSnippet(githubConfig, false);
  }, [loaderSourceMode, cloudflareWorkerUrl, githubConfig]);
  const generatedLua = useMemo(
    () => fullLuaFile || generateCoreLuaScript(config),
    [fullLuaFile, config]
  );

  const handleCopyLoadstring = async () => {
    try {
      await navigator.clipboard.writeText(loadstringSnippet);
    } catch {
      // Fallback
    }
    setCopiedLoadstring(true);
    window.setTimeout(() => setCopiedLoadstring(false), 2000);
  };

  const handleCopyFullLua = async () => {
    try {
      await navigator.clipboard.writeText(generatedLua);
    } catch {
      // Fallback
    }
    setCopiedLua(true);
    window.setTimeout(() => setCopiedLua(false), 2000);
  };

  const handleDownloadLuaFile = () => {
    const blob = new Blob([generatedLua], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = githubConfig.filePath || 'Core.xyz.lua';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateConfig = <K extends keyof CoreConfigState>(
    key: K,
    value: CoreConfigState[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const espColorHex = ACCENT_HEX[config.espAccent];

  return (
    <div
      className="min-h-screen bg-[#050505] text-white flex flex-col"
      data-testid="core-workspace"
    >
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="border-b border-white/10 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('simulator');
            }}
            className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            Core.xyz
          </a>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-neutral-400 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('simulator')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'simulator'
                  ? 'text-white underline underline-offset-8 decoration-white'
                  : ''
              }`}
            >
              Interactive UI
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('github')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'github'
                  ? 'text-white underline underline-offset-8 decoration-white'
                  : ''
              }`}
            >
              GitHub & Raw Loader
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('improvements')}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === 'improvements'
                  ? 'text-white underline underline-offset-8 decoration-white'
                  : ''
              }`}
            >
              Engine Upgrades
            </button>
            <button
              type="button"
              onClick={onReplayIntro}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Replay Intro
            </button>
            <button
              type="button"
              onClick={onLockSession}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Key Gate
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleCopyLoadstring}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedLoadstring ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Working Loadstring</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Loadstring</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-10">
        {/* Top Working 1-Line Loadstring Quick Bar */}
        <section className="rounded-xl bg-[#0C0C0C] border border-white/15 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span>Delta Executor Compatible</span>
                <span aria-hidden="true">·</span>
                <span>Platoboost Service #{PLATOBOOST_SERVICE_ID}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-white" data-testid="live-key-time-left">
                  Key Time Left: {liveKeyTimeLeft}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Protected 1-Line Loadstring (Cloudflare Private Gateway + 3-Layer Anti-Crack)
              </h2>
              <p className="text-sm text-neutral-400 max-w-2xl">
                Serves <code className="text-white">Core.xyz.lua</code> from your private GitHub repository via your{' '}
                <code className="text-white">core-xyz-gateway</code> Cloudflare Worker while blocking browser &amp; scraper inspection (403 Access Denied).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 p-1 bg-[#141414] border border-white/10 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLoaderSourceMode('cloudflare')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    loaderSourceMode === 'cloudflare'
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Cloudflare Gateway (Private Repo)
                </button>
                <button
                  type="button"
                  onClick={() => setLoaderSourceMode('live')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    loaderSourceMode === 'live'
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Instant Live URL (No 404)
                </button>
                <button
                  type="button"
                  onClick={() => setLoaderSourceMode('github')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    loaderSourceMode === 'github'
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Custom GitHub URL
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadLuaFile}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#161616] text-white hover:bg-[#222222] border border-white/15 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Core.xyz.lua</span>
              </button>
            </div>
          </div>

          {loaderSourceMode === 'cloudflare' && (
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 bg-[#09090C] border border-white/10 rounded-lg px-3.5 py-2.5">
              <label
                htmlFor="cf-worker-url"
                className="text-xs font-semibold text-neutral-300 whitespace-nowrap"
              >
                Your Cloudflare Worker URL:
              </label>
              <input
                id="cf-worker-url"
                type="url"
                value={cloudflareWorkerUrl}
                onChange={(e) => setCloudflareWorkerUrl(e.target.value)}
                placeholder="https://core-xyz-gateway.<your-subdomain>.workers.dev"
                className="flex-1 bg-[#121216] border border-white/15 rounded-md px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-white"
              />
              <span className="text-[11px] font-mono text-emerald-400 whitespace-nowrap">
                ● 403 Browser Shield Active
              </span>
            </div>
          )}

          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#060606] border border-white/10 rounded-lg p-3">
            <code
              className="flex-1 text-xs sm:text-sm font-mono text-white overflow-x-auto whitespace-nowrap py-1 px-2"
              data-testid="loadstring-code"
            >
              {loadstringSnippet}
            </code>
            <button
              type="button"
              onClick={handleCopyLoadstring}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-white/10 text-white hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedLoadstring ? 'Copied!' : 'Copy Line'}
            </button>
          </div>
        </section>

        {/* SECTION 1: INTERACTIVE CORE.XYZ ROBLOX UI & LIVE VIEWPORT */}
        {activeSection === 'simulator' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Simulated Core.xyz Monochrome In-Game Window + Docked Music Player Bar */}
            <div className="lg:col-span-7 flex flex-col gap-2.5">
              <audio
                ref={audioRef}
                src={activeTrack.rawUrls[0]}
                preload="none"
                onEnded={() => {
                  if (config.musicLooped) {
                    setTrackTimeSec(0);
                    audioRef.current?.play().catch(() => {});
                  } else {
                    updateConfig('musicPlaying', false);
                  }
                }}
              />
              <div className="rounded-xl bg-[#09090B] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col">
                {/* Simulated Roblox Window Title Bar */}
                <div className="relative px-5 py-3.5 bg-gradient-to-r from-[#111114] via-[#151519] to-[#111114] border-b border-white/10 flex items-center justify-between">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                    <span className="font-mono text-sm font-extrabold tracking-tight text-white">
                      CORE.XYZ
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.07] border border-white/10 text-neutral-300">
                      v4.4 PRO
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono tabular-nums">
                    <span>Key Time Left: {liveKeyTimeLeft}</span>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-[11px] text-neutral-300">
                      [R-SHIFT]
                    </span>
                  </div>
                </div>

                {/* Window Body: Sidebar + Active Tab Controls */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 min-h-[420px]">
                  {/* Sidebar Tabs */}
                  <div className="sm:col-span-4 bg-[#0C0C0E] border-b sm:border-b-0 sm:border-r border-white/10 p-3 flex sm:flex-col gap-1.5 overflow-x-auto">
                    {(
                      [
                        { id: 'Home', icon: Home },
                        { id: 'Combat', icon: Crosshair },
                        { id: 'Visuals', icon: Eye },
                        { id: 'Movement', icon: Gauge },
                        { id: 'Music', icon: Music },
                        { id: 'Misc', icon: Settings },
                      ] as const
                    ).map(({ id, icon: Icon }) => {
                    const isActive = robloxTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setRobloxTab(id)}
                        className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer overflow-hidden ${
                          isActive
                            ? 'text-black'
                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="core-sidebar-active-pill"
                            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                            className="absolute inset-0 bg-white rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.28)]"
                          />
                        )}
                        <Icon className="relative z-10 w-4 h-4 shrink-0" />
                        <span className="relative z-10">{id}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Controls Pane */}
                <div className="sm:col-span-8 p-5 space-y-3.5 overflow-y-auto bg-[#09090B]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={robloxTab}
                      initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="space-y-3"
                    >
                      {robloxTab === 'Home' && (
                        <>
                          <div className="text-xs font-semibold text-neutral-400 pb-1 border-b border-white/10">
                            Operator Showcase &amp; License Status
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="rounded-lg bg-[#141414] border border-white/10 px-3 py-2">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Executor
                              </div>
                              <div className="text-xs font-mono text-white mt-0.5">
                                Delta / Universal
                              </div>
                            </div>
                            <div className="rounded-lg bg-[#141414] border border-white/10 px-3 py-2">
                              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                Key Time Left
                              </div>
                              <div className="text-xs font-mono text-white mt-0.5 tabular-nums">
                                {liveKeyTimeLeft}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs font-semibold text-neutral-400 pt-1 pb-1 border-b border-white/10">
                            Official Discord Community
                          </div>

                          {/* Discord-Themed Community Section ("Core | Beta") */}
                          <div
                            className="rounded-xl bg-[#1E1F22] border border-[#5865F2]/50 overflow-hidden shadow-lg"
                            data-testid="home-discord-card"
                          >
                            {/* Top Discord Light-Blue / Blurple Animated Slow Wave Banner */}
                            <div
                              className="relative h-10 bg-gradient-to-r from-[#4752C4] via-[#5865F2] to-[#78AFFF] px-3.5 flex items-center justify-between overflow-hidden"
                              data-testid="discord-wave-banner"
                            >
                              {/* Slow Wave Crest Layer 1 */}
                              <motion.div
                                aria-hidden="true"
                                animate={{
                                  x: ['-12%', '12%', '-12%'],
                                  y: [0, 2, 0],
                                  rotate: [-2, 2, -2],
                                }}
                                transition={{
                                  duration: 7.5,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                                className="pointer-events-none absolute -bottom-3 -left-1/4 w-[150%] h-7 rounded-[100%] bg-[#78AFFF]/35 blur-[1px]"
                              />
                              {/* Slow Wave Crest Layer 2 */}
                              <motion.div
                                aria-hidden="true"
                                animate={{
                                  x: ['10%', '-14%', '10%'],
                                  y: [1, -2, 1],
                                  rotate: [1.5, -2, 1.5],
                                }}
                                transition={{
                                  duration: 9.2,
                                  repeat: Infinity,
                                  ease: 'easeInOut',
                                }}
                                className="pointer-events-none absolute -bottom-4 -left-1/4 w-[155%] h-7 rounded-[100%] bg-[#A5D4FF]/30"
                              />

                              <span className="relative z-10 text-[10px] font-bold tracking-wider uppercase text-[#E8F0FF] pl-16 drop-shadow-xs">
                                Discord Server · Live Status
                              </span>
                              <span className="relative z-10 px-2 py-0.5 rounded bg-[#111214]/65 text-[10px] font-mono text-white">
                                gg/{DISCORD_INVITE_CODE}
                              </span>
                            </div>

                            {/* Card Body */}
                            <div className="px-3.5 pb-3.5 pt-2 relative">
                              {/* Overlapping Server Logo Squircle */}
                              <div className="relative -mt-6 mb-2 flex items-end justify-between">
                                <div className="relative w-14 h-14 rounded-2xl bg-[#111214] p-0.5 ring-3 ring-[#1E1F22] shrink-0">
                                  {!discordIconError ? (
                                    <img
                                      src={discordStats.iconUrl || DISCORD_SERVER_ICON_URL}
                                      alt={`${DISCORD_SERVER_NAME} Server Logo`}
                                      onError={() => setDiscordIconError(true)}
                                      className="w-full h-full rounded-[14px] object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full rounded-[14px] bg-[#5865F2] flex flex-col items-center justify-center leading-none">
                                      <span className="text-[11px] font-black text-white">
                                        CORE
                                      </span>
                                      <span className="text-[8px] font-mono text-[#E0E3FF] mt-0.5">
                                        BETA
                                      </span>
                                    </div>
                                  )}
                                  <span
                                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#23A55A] ring-2 ring-[#1E1F22]"
                                    aria-hidden="true"
                                  />
                                </div>

                                <span className="px-2 py-0.5 rounded bg-[#2B2D31] border border-[#5865F2]/40 text-[10px] font-bold tracking-wide text-[#949CF7]">
                                  COMMUNITY
                                </span>
                              </div>

                              {/* Server Name & Description */}
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4
                                    className="text-base font-extrabold text-[#F2F3F5] tracking-tight"
                                    data-testid="discord-server-name"
                                  >
                                    {DISCORD_SERVER_NAME}
                                  </h4>
                                </div>
                                <p className="text-xs text-[#B5BAC1]">
                                  Official Core.xyz Community · Script Updates, Configs &amp; Support
                                </p>
                              </div>

                              {/* Live Member & Active Counters */}
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <div
                                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#2B2D31] border border-[#23A55A]/40 text-xs font-mono text-[#F2F3F5]"
                                  data-testid="discord-online-pill"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#23A55A]" />
                                  <span>{discordStats.onlineCount} Active</span>
                                </div>

                                <div
                                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#2B2D31] border border-[#5865F2]/35 text-xs font-mono text-[#F2F3F5]"
                                  data-testid="discord-members-pill"
                                >
                                  <span className="w-2 h-2 rounded-full bg-[#B5BAC1]" />
                                  <span>{discordStats.memberCount} Members</span>
                                </div>
                              </div>

                              {/* Join / Copy Invite & Refresh Buttons */}
                              <div className="mt-3.5 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(DISCORD_INVITE_URL);
                                    } catch {
                                      // fallback
                                    }
                                    setCopiedDiscord(true);
                                    window.setTimeout(() => setCopiedDiscord(false), 2200);
                                  }}
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white transition-colors cursor-pointer"
                                >
                                  {copiedDiscord ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Copied! (discord.gg/{DISCORD_INVITE_CODE})</span>
                                    </>
                                  ) : (
                                    <span>Join Core | Beta (Copy Invite)</span>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={fetchLiveDiscordStats}
                                  aria-label="Refresh Discord Server Stats"
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#2B2D31] hover:bg-[#35373C] text-[#F2F3F5] border border-[#5865F2]/40 transition-colors cursor-pointer"
                                >
                                  <RefreshCw
                                    className={`w-3.5 h-3.5 ${
                                      refreshingDiscord ? 'animate-spin' : ''
                                    }`}
                                  />
                                  <span>Refresh</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {robloxTab === 'Combat' && (
                        <>
                          <div className="text-xs font-semibold text-neutral-400 pb-1 border-b border-white/10">
                            Combat & DeltaTime Camera Lock
                          </div>

                          <ToggleRow
                            label="Enable Aimbot"
                            checked={config.aimbotEnabled}
                            onChange={(v) => updateConfig('aimbotEnabled', v)}
                          />
                          <ToggleRow
                            label="Show FOV Circle"
                            checked={config.showFOV}
                            onChange={(v) => updateConfig('showFOV', v)}
                          />
                          <SliderRow
                            label="FOV Radius"
                            value={config.fovRadius}
                            min={30}
                            max={200}
                            unit=" px"
                            onChange={(v) => updateConfig('fovRadius', v)}
                          />
                          <SliderRow
                            label="DeltaTime Smoothness"
                            value={config.smoothness}
                            min={0.05}
                            max={1}
                            step={0.05}
                            unit=""
                            onChange={(v) => updateConfig('smoothness', v)}
                          />
                          <ToggleRow
                            label="Team Check"
                            checked={config.teamCheck}
                            onChange={(v) => updateConfig('teamCheck', v)}
                          />

                          <div className="pt-1">
                            <label
                              htmlFor="target-bone-select"
                              className="block text-xs font-medium text-neutral-300 mb-1.5"
                            >
                              Target Bone (R6 / R15 Auto-Fallback)
                            </label>
                            <select
                              id="target-bone-select"
                              value={config.targetPart}
                              onChange={(e) =>
                                updateConfig(
                                  'targetPart',
                                  e.target.value as CoreConfigState['targetPart']
                                )
                              }
                              className="w-full rounded-lg bg-[#141414] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                            >
                              <option value="Head">Head</option>
                              <option value="HumanoidRootPart">HumanoidRootPart</option>
                              <option value="UpperTorso">UpperTorso (R6 Torso Fallback)</option>
                              <option value="LowerTorso">LowerTorso (R6 Torso Fallback)</option>
                            </select>
                          </div>
                        </>
                      )}

                      {robloxTab === 'Visuals' && (
                        <>
                          <div className="text-xs font-semibold text-neutral-400 pb-1 border-b border-white/10">
                            ESP, Highlights & Custom Crosshair
                          </div>

                          <ToggleRow
                            label="Player ESP (31-Highlight Cap Safe)"
                            checked={config.espEnabled}
                            onChange={(v) => updateConfig('espEnabled', v)}
                          />
                          <ToggleRow
                            label="Snapline Tracers"
                            checked={config.tracersEnabled}
                            onChange={(v) => updateConfig('tracersEnabled', v)}
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor="tracer-origin-select"
                                className="block text-xs font-medium text-neutral-300 mb-1.5"
                              >
                                Tracer Origin
                              </label>
                              <select
                                id="tracer-origin-select"
                                value={config.tracerOrigin}
                                onChange={(e) =>
                                  updateConfig(
                                    'tracerOrigin',
                                    e.target.value as CoreConfigState['tracerOrigin']
                                  )
                                }
                                className="w-full rounded-lg bg-[#141414] border border-white/15 px-3 py-2 text-xs font-mono text-white"
                              >
                                <option value="Bottom">Bottom</option>
                                <option value="Center">Center</option>
                                <option value="Top">Top</option>
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor="esp-accent-select"
                                className="block text-xs font-medium text-neutral-300 mb-1.5"
                              >
                                ESP Color
                              </label>
                              <select
                                id="esp-accent-select"
                                value={config.espAccent}
                                onChange={(e) =>
                                  updateConfig(
                                    'espAccent',
                                    e.target.value as CoreConfigState['espAccent']
                                  )
                                }
                                className="w-full rounded-lg bg-[#141414] border border-white/15 px-3 py-2 text-xs font-mono text-white"
                              >
                                <option value="White">White (#FFFFFF)</option>
                                <option value="Silver">Silver (#B8B8B8)</option>
                                <option value="Crimson">Crimson (#EF4444)</option>
                                <option value="Cyan">Cyan (#38BDF8)</option>
                              </select>
                            </div>
                          </div>

                          <ToggleRow
                            label="Custom Crosshair"
                            checked={config.crosshairEnabled}
                            onChange={(v) => updateConfig('crosshairEnabled', v)}
                          />
                          <SliderRow
                            label="Crosshair Size"
                            value={config.crosshairSize}
                            min={4}
                            max={32}
                            unit=" px"
                            onChange={(v) => updateConfig('crosshairSize', v)}
                          />

                          {/* Weather Preset & Sound Effects Section */}
                          <div className="pt-2 border-t border-white/10 space-y-3">
                            <div className="text-xs font-semibold text-neutral-400">
                              Weather &amp; World Atmosphere (With Sound Effects)
                            </div>

                            <div>
                              <label
                                htmlFor="weather-preset-select"
                                className="block text-xs font-medium text-neutral-300 mb-1.5"
                              >
                                Weather Preset
                              </label>
                              <select
                                id="weather-preset-select"
                                data-testid="weather-preset-select"
                                value={config.weatherPreset}
                                onChange={(e) =>
                                  updateConfig(
                                    'weatherPreset',
                                    e.target.value as WeatherPresetType
                                  )
                                }
                                className="w-full rounded-lg bg-[#141414] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                              >
                                {WEATHER_PRESETS.map((preset) => (
                                  <option key={preset} value={preset}>
                                    {preset === 'Sunny'
                                      ? 'Sunny (Sun Rays & Golden Sky)'
                                      : preset === 'Thunderstorm'
                                      ? 'Thunderstorm (Heavy Rain + Lightning & Thunder)'
                                      : preset}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <ToggleRow
                              label="Weather Sound Effects"
                              checked={config.weatherSoundEnabled}
                              onChange={(v) => updateConfig('weatherSoundEnabled', v)}
                            />
                            <SliderRow
                              label="Weather Sound Volume"
                              value={config.weatherVolume}
                              min={0}
                              max={100}
                              step={5}
                              unit="%"
                              onChange={(v) => updateConfig('weatherVolume', v)}
                            />
                          </div>

                          <div className="pt-2 border-t border-white/10 space-y-2">
                            <div className="text-xs font-semibold text-neutral-400">
                              Freecam &amp; Camera Enhancements
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCameraResetMsg('Camera subject reset to your character.');
                                window.setTimeout(() => setCameraResetMsg(null), 2500);
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#161616] text-white hover:bg-[#222222] border border-white/15 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset Character Camera</span>
                            </button>
                            {cameraResetMsg && (
                              <p className="text-[11px] font-mono text-emerald-400">
                                {cameraResetMsg}
                              </p>
                            )}
                          </div>
                        </>
                      )}

                      {robloxTab === 'Movement' && (
                        <>
                          <div className="text-xs font-semibold text-neutral-400 pb-1 border-b border-white/10">
                            Movement & Stepped Collision Physics
                          </div>

                          <ToggleRow
                            label="Custom WalkSpeed"
                            checked={config.walkSpeedEnabled}
                            onChange={(v) => updateConfig('walkSpeedEnabled', v)}
                          />
                          <SliderRow
                            label="WalkSpeed Value"
                            value={config.walkSpeed}
                            min={16}
                            max={120}
                            unit=" studs/s"
                            onChange={(v) => updateConfig('walkSpeed', v)}
                          />

                          <ToggleRow
                            label="Custom JumpPower (UseJumpPower = true)"
                            checked={config.jumpPowerEnabled}
                            onChange={(v) => updateConfig('jumpPowerEnabled', v)}
                          />
                          <SliderRow
                            label="JumpPower Value"
                            value={config.jumpPower}
                            min={50}
                            max={200}
                            unit=" power"
                            onChange={(v) => updateConfig('jumpPower', v)}
                          />

                          <ToggleRow
                            label="Infinite Jump"
                            checked={config.infJumpEnabled}
                            onChange={(v) => updateConfig('infJumpEnabled', v)}
                          />
                          <ToggleRow
                            label="NoClip (RunService.Stepped + Restore)"
                            checked={config.noClipEnabled}
                            onChange={(v) => updateConfig('noClipEnabled', v)}
                          />
                        </>
                      )}

                       {robloxTab === 'Music' && (
                        <>
                          <div className="text-xs font-semibold text-neutral-400 pb-1 border-b border-white/10">
                            Community Music Player &amp; Audio Engine
                          </div>

                          {/* Community Music Note Card */}
                          <div
                            className="rounded-xl bg-[#141519] border border-[#5865F2]/45 p-3.5 space-y-2.5"
                            data-testid="music-community-note-card"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold tracking-wider uppercase text-[#949CF7]">
                                COMMUNITY TRACK SUBMISSIONS
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                CoreXyz_Music/
                              </span>
                            </div>
                            <p className="text-xs text-neutral-300 leading-relaxed">
                              {COMMUNITY_MUSIC_NOTE}
                            </p>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(DISCORD_INVITE_URL);
                                } catch {
                                  // fallback
                                }
                                setCopiedDiscord(true);
                                window.setTimeout(() => setCopiedDiscord(false), 2200);
                              }}
                              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white transition-colors cursor-pointer"
                            >
                              {copiedDiscord ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied Discord Invite (discord.gg/{DISCORD_INVITE_CODE})</span>
                                </>
                              ) : (
                                <span>Join Discord to Submit a Song (Copy Invite)</span>
                              )}
                            </button>
                          </div>

                          {/* Tracks Dropdown */}
                          <div>
                            <label
                              htmlFor="music-track-select"
                              className="block text-xs font-medium text-neutral-300 mb-1.5"
                            >
                              Select Track (Auto-Downloads &amp; Caches via getcustomasset)
                            </label>
                            <select
                              id="music-track-select"
                              data-testid="music-track-select"
                              value={config.selectedTrack}
                              onChange={(e) => {
                                updateConfig('selectedTrack', e.target.value);
                                setTrackTimeSec(0);
                              }}
                              className="w-full rounded-lg bg-[#141414] border border-white/15 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-white"
                            >
                              {COMMUNITY_MUSIC_TRACKS.map((track) => (
                                <option key={track.id} value={track.label}>
                                  {track.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <ToggleRow
                            label="Toggle Player UI (Docked Below Hub)"
                            checked={config.musicPlayerVisible}
                            onChange={(v) => updateConfig('musicPlayerVisible', v)}
                          />
                          <ToggleRow
                            label="Mute Game Audio (Silences Non-Core Sounds)"
                            checked={config.muteGameAudio}
                            onChange={(v) => updateConfig('muteGameAudio', v)}
                          />
                          <SliderRow
                            label="Music Volume"
                            value={config.musicVolume}
                            min={0}
                            max={100}
                            step={5}
                            unit="%"
                            onChange={(v) => updateConfig('musicVolume', v)}
                          />
                          <ToggleRow
                            label="Loop Track"
                            checked={config.musicLooped}
                            onChange={(v) => updateConfig('musicLooped', v)}
                          />
                        </>
                      )}

                      {robloxTab === 'Misc' && (
                        <>
                          <div className="text-xs font-semibold text-neutral-400 pb-1 border-b border-white/10">
                            Session & Quick Actions
                          </div>

                          <ToggleRow
                            label="Anti-AFK (Scoped Local Connection)"
                            checked={config.antiAFKEnabled}
                            onChange={(v) => updateConfig('antiAFKEnabled', v)}
                          />

                          <div className="pt-2 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={onReplayIntro}
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#161616] text-white hover:bg-[#222222] border border-white/15 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Replay Loading Animation</span>
                            </button>
                            <button
                              type="button"
                              onClick={onLockSession}
                              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#161616] text-white hover:bg-[#222222] border border-white/15 transition-colors cursor-pointer"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Open Key System</span>
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              </div>

              {/* CONNECTED MINI MUSIC PLAYER UI (Docked Directly Below CORE.XYZ Window — Off by Default) */}
              <AnimatePresence>
                {config.musicPlayerVisible && (
                  <motion.div
                    key="connected-music-player-dock"
                    initial={{ opacity: 0, y: -12, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                    className="relative rounded-xl bg-gradient-to-b from-[#101218] to-[#090A0E] border border-white/20 px-4 py-3.5 shadow-[0_18px_42px_rgba(0,0,0,0.8)] space-y-3 overflow-hidden"
                    data-testid="connected-music-player"
                  >
                    {/* Top Specular Edge Highlight */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#78AFFF]/60 to-transparent" />

                    {/* Top Row: Track Metadata + Transport Controls + Time Counter */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="relative w-9 h-9 rounded-lg bg-[#141720] border border-[#78AFFF]/35 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(120,175,255,0.18)]">
                          <Music className="w-4 h-4 text-white" />
                          {config.musicPlaying && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#38BDF8] ring-2 ring-[#090A0E] animate-pulse" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-xs font-bold text-white truncate"
                              data-testid="player-track-title"
                            >
                              {activeTrack.title}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#78AFFF]/15 border border-[#78AFFF]/30 text-[#BAE0FF] shrink-0">
                              {activeTrack.artist}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-neutral-400 truncate mt-0.5">
                            {config.musicPlaying ? 'Playing' : 'Paused'} · CoreXyz_Music/
                            {activeTrack.fileName}
                            {config.muteGameAudio ? ' · Game Muted' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Transport Buttons + Live Time Counter */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          aria-label="Previous or Rewind Track"
                          onClick={() => seekToRatio(0)}
                          className="w-8 h-8 rounded-lg bg-[#151821] hover:bg-[#1E2230] border border-white/12 flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                          <SkipBack className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          aria-label={config.musicPlaying ? 'Pause Track' : 'Play Track'}
                          data-testid="player-play-pause-btn"
                          onClick={() => updateConfig('musicPlaying', !config.musicPlaying)}
                          className="w-9 h-8 rounded-lg bg-white hover:bg-neutral-100 text-black flex items-center justify-center shadow-[0_0_16px_rgba(255,255,255,0.35)] transition-colors cursor-pointer"
                        >
                          {config.musicPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          aria-label="Next Track"
                          onClick={() => seekToRatio(0)}
                          className="w-8 h-8 rounded-lg bg-[#151821] hover:bg-[#1E2230] border border-white/12 flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                          <SkipForward className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          aria-label={
                            config.muteGameAudio ? 'Unmute Game Audio' : 'Mute Game Audio'
                          }
                          onClick={() => updateConfig('muteGameAudio', !config.muteGameAudio)}
                          className={`px-2 h-8 rounded-lg border text-[10px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer ${
                            config.muteGameAudio
                              ? 'bg-white text-black border-white font-bold shadow-[0_0_14px_rgba(255,255,255,0.28)]'
                              : 'bg-[#151821] text-neutral-300 border-white/12 hover:text-white hover:bg-[#1E2230]'
                          }`}
                        >
                          {config.muteGameAudio ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {config.muteGameAudio ? 'Muted' : 'Game'}
                          </span>
                        </motion.button>
                        <div
                          className="text-[11px] font-mono text-neutral-200 bg-[#141720] border border-white/10 px-2 py-1.5 rounded-lg tabular-nums shrink-0"
                          data-testid="player-time-counter"
                        >
                          {formatTrackTimestamp(trackTimeSec)} /{' '}
                          {formatTrackTimestamp(activeTrack.durationSec)}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Multi-Harmonic Wavy Ocean Timeline Slider / Scrubber */}
                    <div className="space-y-1">
                      {(() => {
                        const progressRatio = Math.max(
                          0,
                          Math.min(1, trackTimeSec / activeTrack.durationSec)
                        );
                        const progressPercent = progressRatio * 100;
                        const primaryWaveSvg = buildOceanWaveSvgPath(
                          560,
                          36,
                          wavePhase,
                          config.musicPlaying,
                          0
                        );
                        const secondaryWaveSvg = buildOceanWaveSvgPath(
                          560,
                          36,
                          wavePhase * 0.82,
                          config.musicPlaying,
                          1.35
                        );
                        const thumbWaveY = computeOceanWaveDisplacement(
                          progressRatio,
                          wavePhase,
                          config.musicPlaying
                        );

                        return (
                          <div
                            ref={scrubberTrackRef}
                            role="slider"
                            tabIndex={0}
                            aria-label="Wavy Ocean Music Timeline Scrubber"
                            aria-valuemin={0}
                            aria-valuemax={activeTrack.durationSec}
                            aria-valuenow={Math.floor(trackTimeSec)}
                            data-testid="wavy-ocean-scrubber"
                            onPointerDown={(e) => {
                              setIsScrubbing(true);
                              handleScrubberPointer(e.clientX);
                            }}
                            onPointerMove={(e) => {
                              if (isScrubbing) {
                                handleScrubberPointer(e.clientX);
                              }
                            }}
                            onPointerUp={() => setIsScrubbing(false)}
                            onPointerLeave={() => setIsScrubbing(false)}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowRight') {
                                seekToRatio((trackTimeSec + 5) / activeTrack.durationSec);
                              } else if (e.key === 'ArrowLeft') {
                                seekToRatio((trackTimeSec - 5) / activeTrack.durationSec);
                              }
                            }}
                            className="group relative h-9 rounded-lg bg-[#0B0E14] border border-[#78AFFF]/25 hover:border-[#78AFFF]/55 px-2 flex items-center cursor-pointer select-none overflow-hidden transition-colors"
                          >
                            {/* Continuous Dual-Layer SVG Ocean Swell Ribbon (Clipped to Active Progress) */}
                            <div
                              style={{
                                width: `${Math.max(2, Math.min(100, progressPercent))}%`,
                              }}
                              className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-75"
                            >
                              <svg
                                viewBox="0 0 560 36"
                                preserveAspectRatio="none"
                                className="w-[560px] h-full opacity-85"
                              >
                                <defs>
                                  <linearGradient
                                    id="coreOceanSwellGrad"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="0%"
                                  >
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
                                    <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.42" />
                                    <stop offset="100%" stopColor="#E0F7FF" stopOpacity="0.58" />
                                  </linearGradient>
                                </defs>
                                <path
                                  d={secondaryWaveSvg.areaPath}
                                  fill="rgba(88, 101, 242, 0.24)"
                                />
                                <path
                                  d={primaryWaveSvg.areaPath}
                                  fill="url(#coreOceanSwellGrad)"
                                />
                                <path
                                  d={primaryWaveSvg.linePath}
                                  fill="none"
                                  stroke="#BAE6FD"
                                  strokeWidth="1.5"
                                  strokeOpacity="0.85"
                                />
                              </svg>
                            </div>

                            {/* 28 Pre-Allocated Tangential Wavy Ocean Harmonic Segments (Mirrors OceanWaveSegment_1..28 in Core.xyz.lua) */}
                            <div className="relative z-10 w-full flex items-center justify-between gap-1 px-1">
                              {OCEAN_SEGMENT_INDICES.map((idx) => {
                                const normX = idx / (OCEAN_SEGMENT_INDICES.length - 1);
                                const isPassed = normX <= progressRatio;
                                const metrics = computeOceanWaveCrestMetrics(
                                  normX,
                                  wavePhase,
                                  config.musicPlaying
                                );
                                const heightPx = isPassed
                                  ? Math.max(
                                      7,
                                      Math.min(
                                        23,
                                        metrics.barHeightPx +
                                          Math.round(Math.abs(metrics.displacementPx) * 1.25)
                                      )
                                    )
                                  : Math.max(
                                      5,
                                      Math.min(
                                        12,
                                        5 + Math.round(Math.abs(metrics.displacementPx) * 0.65)
                                      )
                                    );
                                const yOffset = isPassed
                                  ? metrics.displacementPx * 0.82
                                  : metrics.displacementPx * 0.48;
                                const tiltDeg = isPassed ? metrics.tiltDeg : metrics.tiltDeg * 0.55;

                                return (
                                  <div
                                    key={idx}
                                    data-testid={`ocean-wave-segment-${idx + 1}`}
                                    style={{
                                      height: `${heightPx}px`,
                                      transform: `translateY(${yOffset.toFixed(
                                        2
                                      )}px) rotate(${tiltDeg.toFixed(1)}deg)`,
                                    }}
                                    className={`flex-1 rounded-full transition-colors duration-75 ${
                                      isPassed
                                        ? 'bg-gradient-to-t from-[#38BDF8] via-[#93C5FD] to-white shadow-[0_0_10px_rgba(165,230,255,0.75)]'
                                        : 'bg-[#78AFFF]/25 group-hover:bg-[#78AFFF]/40'
                                    }`}
                                  />
                                );
                              })}
                            </div>

                            {/* Bioluminescent Wave-Rider Playhead Thumb & Halo */}
                            <div
                              data-testid="ocean-scrubber-thumb"
                              style={{
                                left: `calc(${progressPercent.toFixed(2)}% - 8px)`,
                                transform: `translateY(${(thumbWaveY * 0.58).toFixed(2)}px)`,
                              }}
                              className="pointer-events-none absolute z-20 w-4 h-4 rounded-full bg-white ring-2 ring-[#78AFFF] shadow-[0_0_16px_rgba(165,230,255,0.95)] flex items-center justify-center"
                            >
                              <span
                                className={`absolute -inset-1.5 rounded-full bg-[#78AFFF]/35 blur-[2px] ${
                                  config.musicPlaying ? 'animate-ping' : ''
                                }`}
                              />
                              <span className="w-1.5 h-1.5 rounded-full bg-[#090A0E]" />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Live Interactive Viewport Preview */}
            <div className="lg:col-span-5 rounded-xl bg-[#0A0A0A] border border-white/15 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Live Overlay Simulation Viewport
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Real-time preview of FOV, Crosshair, ESP & Snaplines
                  </p>
                </div>
                <span className="font-mono text-xs text-neutral-400 tabular-nums">
                  Target: {config.targetPart}
                </span>
              </div>

              {/* Simulated 3D Arena Canvas */}
              <div
                className="relative w-full h-[320px] rounded-lg bg-[#050505] border border-white/10 overflow-hidden flex items-center justify-center"
                data-testid="live-overlay-viewport"
              >
                {/* Perspective grid lines */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                />

                {/* Weather Atmosphere & Canvas Particle Overlay */}
                <WeatherCanvasOverlay
                  preset={config.weatherPreset}
                  soundEnabled={config.weatherSoundEnabled}
                  volume={config.weatherVolume}
                  muteGameAudio={config.muteGameAudio}
                />

                {/* SVG Snapline Tracers */}
                {config.espEnabled && config.tracersEnabled && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {SIMULATED_PLAYERS.filter(
                      (p) => !config.teamCheck || p.team !== 'Alpha'
                    ).map((p) => {
                      const startY =
                        config.tracerOrigin === 'Bottom'
                          ? '100%'
                          : config.tracerOrigin === 'Top'
                          ? '0%'
                          : '50%';
                      return (
                        <line
                          key={p.id}
                          x1="50%"
                          y1={startY}
                          x2={`${p.x}%`}
                          y2={`${p.y}%`}
                          stroke={espColorHex}
                          strokeWidth="1.25"
                          strokeOpacity="0.75"
                        />
                      );
                    })}
                  </svg>
                )}

                {/* Simulated Players */}
                {SIMULATED_PLAYERS.map((player) => {
                  const filteredByTeam = config.teamCheck && player.team === 'Alpha';
                  const showEsp = config.espEnabled && !filteredByTeam;
                  const isLockedTarget = config.aimbotEnabled && player.id === 'p2';

                  return (
                    <div
                      key={player.id}
                      style={{ left: `${player.x}%`, top: `${player.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                    >
                      {showEsp && (
                        <span
                          style={{ color: espColorHex }}
                          className="mb-1 font-mono text-[10px] font-semibold whitespace-nowrap drop-shadow"
                        >
                          {player.name} [{player.dist}m] | {player.hp} HP
                        </span>
                      )}

                      <div
                        style={{
                          borderColor: showEsp ? espColorHex : 'rgba(255,255,255,0.2)',
                          backgroundColor: showEsp
                            ? `${espColorHex}22`
                            : 'rgba(255,255,255,0.05)',
                        }}
                        className="w-8 h-14 rounded border flex flex-col items-center justify-start pt-1.5 relative transition-colors"
                      >
                        {/* Head */}
                        <div className="w-3 h-3 rounded-full bg-white/80" />
                        {/* Torso */}
                        <div className="w-4 h-5 rounded-xs bg-white/50 mt-1" />

                        {isLockedTarget && (
                          <div className="absolute -inset-1.5 border border-white rounded animate-pulse pointer-events-none" />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* FOV Circle */}
                {config.showFOV && (
                  <div
                    style={{
                      width: `${config.fovRadius * 1.4}px`,
                      height: `${config.fovRadius * 1.4}px`,
                    }}
                    className="rounded-full border border-white/80 pointer-events-none transition-all duration-75"
                  />
                )}

                {/* Custom Crosshair */}
                {config.crosshairEnabled && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div
                      style={{ height: `${config.crosshairSize * 2}px` }}
                      className="w-[1.5px] bg-white absolute"
                    />
                    <div
                      style={{ width: `${config.crosshairSize * 2}px` }}
                      className="h-[1.5px] bg-white absolute"
                    />
                  </div>
                )}
              </div>

              {/* Active Telemetry Readout */}
              <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 font-mono tabular-nums">
                <span>Weather: {config.weatherPreset}</span>
                <span>·</span>
                <span>WalkSpeed: {config.walkSpeedEnabled ? config.walkSpeed : 16}</span>
                <span>·</span>
                <span>JumpPower: {config.jumpPowerEnabled ? config.jumpPower : 50}</span>
                <span>·</span>
                <span>NoClip: {config.noClipEnabled ? 'Stepped' : 'Off'}</span>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: GITHUB REPOSITORY & RAW LOADSTRING BUILDER */}
        {activeSection === 'github' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 rounded-xl bg-[#0A0A0A] border border-white/15 p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white">
                  GitHub Repository Configuration
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Set your GitHub details to generate your 1-line raw loader URL.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="gh-owner"
                    className="block text-xs font-medium text-neutral-300 mb-1.5"
                  >
                    GitHub Username
                  </label>
                  <input
                    id="gh-owner"
                    type="text"
                    value={githubConfig.owner}
                    onChange={(e) =>
                      setGithubConfig((prev) => ({ ...prev, owner: e.target.value }))
                    }
                    className="w-full rounded-lg bg-[#121212] border border-white/15 px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="gh-repo"
                    className="block text-xs font-medium text-neutral-300 mb-1.5"
                  >
                    Repository Name
                  </label>
                  <input
                    id="gh-repo"
                    type="text"
                    value={githubConfig.repo}
                    onChange={(e) =>
                      setGithubConfig((prev) => ({ ...prev, repo: e.target.value }))
                    }
                    className="w-full rounded-lg bg-[#121212] border border-white/15 px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="gh-branch"
                      className="block text-xs font-medium text-neutral-300 mb-1.5"
                    >
                      Branch
                    </label>
                    <input
                      id="gh-branch"
                      type="text"
                      value={githubConfig.branch}
                      onChange={(e) =>
                        setGithubConfig((prev) => ({ ...prev, branch: e.target.value }))
                      }
                      className="w-full rounded-lg bg-[#121212] border border-white/15 px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-white"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gh-filepath"
                      className="block text-xs font-medium text-neutral-300 mb-1.5"
                    >
                      Script Filename
                    </label>
                    <input
                      id="gh-filepath"
                      type="text"
                      value={githubConfig.filePath}
                      onChange={(e) =>
                        setGithubConfig((prev) => ({ ...prev, filePath: e.target.value }))
                      }
                      className="w-full rounded-lg bg-[#121212] border border-white/15 px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-neutral-400">
                <div className="font-semibold text-white">3-Step GitHub Workflow:</div>
                <p>1. Click &ldquo;Download loader.lua&rdquo; to save your configured Luau file.</p>
                <p>
                  2. Upload <code className="text-white">{githubConfig.filePath}</code> to{' '}
                  <code className="text-white">
                    github.com/{githubConfig.owner}/{githubConfig.repo}
                  </code>
                  .
                </p>
                <p>3. Execute using the 1-line loadstring above.</p>
              </div>
            </div>

            <div className="lg:col-span-7 rounded-xl bg-[#0A0A0A] border border-white/15 p-6 flex flex-col justify-between space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Generated {githubConfig.filePath} (Ready for GitHub)
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono truncate max-w-md">
                    {rawUrl}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyFullLua}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#161616] text-white hover:bg-[#222222] border border-white/15 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{copiedLua ? 'Copied Luau Code' : 'Copy Full Luau'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadLuaFile}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {githubConfig.filePath}</span>
                  </button>
                </div>
              </div>

              <pre className="w-full h-[340px] overflow-auto rounded-lg bg-[#050505] border border-white/10 p-4 text-xs font-mono text-neutral-300 leading-relaxed">
                <code>{generatedLua}</code>
              </pre>
            </div>
          </section>
        )}

        {/* SECTION 3: ARCHITECTURAL IMPROVEMENTS SUMMARY */}
        {activeSection === 'improvements' && (
          <section className="rounded-xl bg-[#0A0A0A] border border-white/15 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                Applied Code Review Upgrades in Core.xyz
              </h3>
              <p className="text-sm text-neutral-400 mt-1">
                Every fix from the Luau architecture review is baked into the generated GitHub script.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-lg bg-[#101010] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white">
                  01. Platoboost Key System &amp; 6-Step Loader
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Sleek 6-step SaaS boot sequence transitioning into a 2-button Platoboost Key System (
                  <code className="text-white">Submit</code> + <code className="text-white">Get Key</code>)
                  with SHA-256 nonce verification and live countdown timer.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-[#101010] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white">
                  02. DeltaTime Frame-Independent Lerp
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Replaced fixed-frame CFrame Lerp with exponential <code className="text-white">deltaTime</code>{' '}
                  smoothing so camera lock speed stays identical at 60 FPS and 240 FPS.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-[#101010] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white">
                  03. R6 & R15 Rig Target Fallback
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Automatically falls back from <code className="text-white">UpperTorso</code> /{' '}
                  <code className="text-white">LowerTorso</code> to <code className="text-white">Torso</code> or{' '}
                  <code className="text-white">HumanoidRootPart</code> in R6 games.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-[#101010] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white">
                  04. 31-Highlight Engine Limit Guard
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Tracks active Highlight instances in a dedicated folder and caps allocation at 30
                  while keeping BillboardGui name/health tags active for all players.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-[#101010] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white">
                  05. RunService.Stepped NoClip & Restore
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Moved collision suppression to <code className="text-white">RunService.Stepped</code> and caches
                  original <code className="text-white">CanCollide</code> states so disabling NoClip restores collisions.
                </p>
              </div>

              <div className="p-5 rounded-lg bg-[#101010] border border-white/10 space-y-2">
                <h4 className="text-sm font-bold text-white">
                  06. Scoped Locals & Modern Raycast API
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Uses <code className="text-white">Enum.RaycastFilterType.Exclude</code>, reuses a single{' '}
                  <code className="text-white">RaycastParams</code> object, sets <code className="text-white">UseJumpPower = true</code>, and cleans up on <code className="text-white">PlayerRemoving</code>.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    className={`group relative flex items-center justify-between gap-4 px-3.5 py-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
      checked
        ? 'bg-[#141418] border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
        : 'bg-[#0E0E11] border-white/[0.07] hover:bg-[#131317] hover:border-white/15'
    }`}
  >
    {/* Left Active Status Accent Bar */}
    <span
      className={` w-1 rounded-full transition-all duration-200 ${
        checked
          ? 'h-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.85)]'
          : 'h-2.5 bg-white/15 group-hover:bg-white/30'
      }`}
    />
    <span
      className={`flex-1 text-xs font-medium transition-colors ${
        checked ? 'text-white font-semibold' : 'text-neutral-300 group-hover:text-white'
      }`}
    >
      {label}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative w-10 h-5 rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
        checked
          ? 'bg-white justify-end shadow-[0_0_14px_rgba(255,255,255,0.35)]'
          : 'bg-[#1D1D22] border border-white/15 justify-start'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 540, damping: 32 }}
        className={`block w-3.5 h-3.5 rounded-full ${
          checked ? 'bg-black' : 'bg-neutral-400 group-hover:bg-neutral-200'
        }`}
      />
    </button>
  </div>
);

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (next: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}) => {
  const ratio = Math.max(0, Math.min(100, ((value - min) / Math.max(0.0001, max - min)) * 100));
  return (
    <div className="px-3.5 py-2.5 rounded-lg bg-[#0E0E11] hover:bg-[#131317] border border-white/[0.07] hover:border-white/15 transition-colors space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-medium text-neutral-200">{label}</label>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#18181D] border border-white/10 text-white tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <div className="relative flex items-center h-4">
        <div className="pointer-events-none absolute inset-x-0 h-1.5 rounded-full bg-[#1C1C22] overflow-hidden">
          <div
            style={{ width: `${ratio}%` }}
            className="h-full rounded-full bg-gradient-to-r from-neutral-300 to-white shadow-[0_0_10px_rgba(255,255,255,0.6)]"
          />
        </div>
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 w-full accent-white bg-transparent h-4 cursor-pointer"
        />
      </div>
    </div>
  );
};
