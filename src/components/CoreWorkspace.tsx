import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crosshair,
  Eye,
  Zap,
  Shield,
  Copy,
  Check,
  Download,
  RefreshCw,
  Lock,
  Terminal,
  Github,
  Sliders,
  Code2,
  ExternalLink,
  KeyRound,
  Home,
  CloudRain,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Repeat,
  Radio,
  Sparkles,
  Sun,
  Palette,
  Compass,
} from 'lucide-react';
import {
  CoreConfigState,
  DEFAULT_CORE_CONFIG,
  GithubRepoConfig,
  DEFAULT_GITHUB_CONFIG,
  PLATOBOOST_SERVICE_ID,
  PLATOBOOST_GATEWAY_URL,
  DISCORD_INVITE_URL,
  DISCORD_INVITE_CODE,
  DISCORD_API_INVITE_URL,
  DISCORD_SERVER_NAME,
  DISCORD_SERVER_ICON_URL,
  DiscordServerStats,
  parseDiscordInviteCounts,
  WEATHER_PRESETS,
  WeatherPresetType,
  COMMUNITY_MUSIC_NOTE,
  COMMUNITY_MUSIC_TRACKS,
  formatTrackTimestamp,
  computeOceanWaveCrestMetrics,
  buildOceanWaveSvgPath,
  formatRemainingKeyTime,
  buildGithubRawUrl,
  buildLoadstringSnippet,
  buildCloudflareLoadstringSnippet,
  CLOUDFLARE_WORKER_DEFAULT_URL,
  GITHUB_CACHE_BUST_LOADSTRING,
  generateCoreLuaScript,
} from '../utils/coreAuth';
import { WeatherCanvasOverlay } from './WeatherCanvasOverlay';

interface CoreWorkspaceProps {
  keyExpiresAtMs: number;
  onReplayIntro: () => void;
  onLockSession: () => void;
}

type ActiveTab = 'home' | 'combat' | 'visuals' | 'movement' | 'music' | 'misc';

const CHAMS_MATERIALS = [
  'None',
  'Aura',
  'Neon',
  'Flat',
  'Chrome',
  'Liquid Metal',
  'Gold',
  'Diamond',
  'Glass',
  'Ice',
  'Obsidian',
  'Lava',
  'Plasma',
  'Toxic',
  'Ropes',
  'Rainbow',
  'Holographic',
  'Galaxy',
  'Matrix',
  'Pearl',
  'Glossy',
] as const;

const TOOL_MATERIALS = ['SmoothPlastic', 'Neon', 'Glass', 'Foil', 'ForceField'] as const;

const TOOL_SKINS = [
  'None',
  'Aurora',
  'Blue Skies, White Guns',
  'Blue Stars',
  'Blue Void',
  'Classic Blue White',
  'Epic White',
  'Green and Black',
  'Matrix',
  'Pink White',
  'Water',
  'White',
] as const;

const CHAMS_STYLES = ['Outline', 'Soft Fill', 'Solid'] as const;

const SKYBOX_PRESETS = [
  'Realistic Sky',
  'Purple Nebula',
  'Night Galaxy',
  'Sunset Horizon',
  'Cyberpunk Grid',
  'Aurora Borealis',
  'Blood Moon',
  'Deep Space',
  'Cloudy Overcast',
  'Anime Pastels',
  'Vaporwave Dusk',
  'Arctic Twilight',
  'Golden Hour',
  'Stormy Void',
  'Starlight Matrix',
  'Crimson Eclipse',
  'Oceanic Mirage',
  'Neon Metropolis',
  'Emerald Aurora',
  'Solar Flare',
  'Midnight Clear',
] as const;

export const CoreWorkspace: React.FC<CoreWorkspaceProps> = ({
  keyExpiresAtMs,
  onReplayIntro,
  onLockSession,
}) => {
  const [config, setConfig] = useState<CoreConfigState>(DEFAULT_CORE_CONFIG);
  const [githubConfig, setGithubConfig] = useState<GithubRepoConfig>(DEFAULT_GITHUB_CONFIG);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [copiedType, setCopiedType] = useState<
    'loadstring' | 'script' | 'plato' | 'discord' | 'cloudflare' | 'cachebust' | null
  >(null);
  const [cloudflareWorkerUrl, setCloudflareWorkerUrl] = useState<string>(
    CLOUDFLARE_WORKER_DEFAULT_URL
  );
  const [includeHandshakeSig, setIncludeHandshakeSig] = useState<boolean>(true);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 52, y: 44 });
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [simulatedExpiryOverride, setSimulatedExpiryOverride] = useState<number | null>(null);

  // Under Roof (Indoor Rain & Sound Occlusion) simulation state
  const [underRoof, setUnderRoof] = useState<boolean>(false);

  // Suite 1: Self Chams
  const [selfChamsEnabled, setSelfChamsEnabled] = useState<boolean>(true);
  const [selfChamsMaterial, setSelfChamsMaterial] = useState<string>('Lava');
  const [selfChamsFillTrans, setSelfChamsFillTrans] = useState<number>(0.55);
  const [selfChamsOutlineTrans, setSelfChamsOutlineTrans] = useState<number>(0);
  const [selfChamsRainbow, setSelfChamsRainbow] = useState<boolean>(false);
  const [selfChamsPulse, setSelfChamsPulse] = useState<boolean>(false);
  const [selfChamsGlowRim, setSelfChamsGlowRim] = useState<boolean>(true);

  // Suite 2: Trail
  const [legTrailEnabled, setLegTrailEnabled] = useState<boolean>(true);
  const [legTrailSameColors, setLegTrailSameColors] = useState<boolean>(false);
  const [legTrailWidth, setLegTrailWidth] = useState<number>(0.25);
  const [legTrailLength, setLegTrailLength] = useState<number>(0.5);
  const [legTrailRainbow, setLegTrailRainbow] = useState<boolean>(false);

  // Suite 3: Tool Visuals
  const [toolVisualsEnabled, setToolVisualsEnabled] = useState<boolean>(true);
  const [toolMaterial, setToolMaterial] = useState<string>('SmoothPlastic');
  const [toolTransparency, setToolTransparency] = useState<number>(0);
  const [toolRainbow, setToolRainbow] = useState<boolean>(false);
  const [toolSkinTexture, setToolSkinTexture] = useState<string>('None');
  const [toolChamsEnabled, setToolChamsEnabled] = useState<boolean>(true);
  const [toolChamsStyle, setToolChamsStyle] = useState<string>('Outline');
  const [toolGlowEnabled, setToolGlowEnabled] = useState<boolean>(true);
  const [toolGlowBrightness, setToolGlowBrightness] = useState<number>(3);

  // Suite 4: Bloom & Sun Rays
  const [bloomEnabled, setBloomEnabled] = useState<boolean>(true);
  const [bloomIntensity, setBloomIntensity] = useState<number>(0.6);
  const [bloomSize, setBloomSize] = useState<number>(26);
  const [bloomThreshold, setBloomThreshold] = useState<number>(0.4);
  const [sunRaysEnabled, setSunRaysEnabled] = useState<boolean>(true);
  const [sunRaysIntensity, setSunRaysIntensity] = useState<number>(0.25);
  const [sunRaysSpread, setSunRaysSpread] = useState<number>(1);

  // Suite 5: Color Correction
  const [colorCorrectionEnabled, setColorCorrectionEnabled] = useState<boolean>(false);
  const [ccSaturation, setCcSaturation] = useState<number>(0.2);
  const [ccContrast, setCcContrast] = useState<number>(0.15);
  const [ccBrightness, setCcBrightness] = useState<number>(0.05);

  // Suite 6: Skybox
  const [skyboxEnabled, setSkyboxEnabled] = useState<boolean>(false);
  const [skyboxPreset, setSkyboxPreset] = useState<string>('Realistic Sky');
  const [clearAtmosphere, setClearAtmosphere] = useState<boolean>(false);
  const [customSkyInput, setCustomSkyInput] = useState<string>('');
  const [skyboxSearchQuery, setSkyboxSearchQuery] = useState<string>('');
  const [skyboxSearchResults, setSkyboxSearchResults] = useState<string[]>([
    'Purple Nebula',
    'Night Galaxy',
    'Anime Pastels',
  ]);
  const [selectedSearchResult, setSelectedSearchResult] = useState<string>('Purple Nebula');

  // Suite 7: Lighting Controller
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(false);
  const [outdoorAmbientEnabled, setOutdoorAmbientEnabled] = useState<boolean>(false);
  const [colorShiftBottomEnabled, setColorShiftBottomEnabled] = useState<boolean>(false);
  const [colorShiftTopEnabled, setColorShiftTopEnabled] = useState<boolean>(false);
  const [fogColorEnabled, setFogColorEnabled] = useState<boolean>(false);
  const [fogEndEnabled, setFogEndEnabled] = useState<boolean>(false);
  const [fogEndDistance, setFogEndDistance] = useState<number>(1500);
  const [fogStartEnabled, setFogStartEnabled] = useState<boolean>(false);
  const [fogStartDistance, setFogStartDistance] = useState<number>(50);
  const [exposureEnabled, setExposureEnabled] = useState<boolean>(false);
  const [exposureValue, setExposureValue] = useState<number>(0.5);
  const [brightnessEnabled, setBrightnessEnabled] = useState<boolean>(false);
  const [brightnessLevel, setBrightnessLevel] = useState<number>(3);
  const [clockTimeEnabled, setClockTimeEnabled] = useState<boolean>(false);
  const [clockTimeHour, setClockTimeHour] = useState<number>(14);
  const [noShadowsEnabled, setNoShadowsEnabled] = useState<boolean>(false);

  // Suite 8: Atmosphere Controller
  const [atmosphereEnabled, setAtmosphereEnabled] = useState<boolean>(false);
  const [atmosphereDensity, setAtmosphereDensity] = useState<number>(0.35);
  const [atmosphereOffset, setAtmosphereOffset] = useState<number>(0.25);
  const [atmosphereHaze, setAtmosphereHaze] = useState<number>(1.5);
  const [atmosphereGlare, setAtmosphereGlare] = useState<number>(0.5);

  const [discordStats, setDiscordStats] = useState<DiscordServerStats>({
    serverName: DISCORD_SERVER_NAME,
    onlineCount: 1,
    memberCount: 2,
    iconUrl: DISCORD_SERVER_ICON_URL,
    inviteUrl: DISCORD_INVITE_URL,
    inviteCode: DISCORD_INVITE_CODE,
  });
  const [discordIconFailed, setDiscordIconFailed] = useState(false);
  const [isRefreshingDiscord, setIsRefreshingDiscord] = useState(false);

  // Audio player state for Sia - Snowman (Slowed + Reverb)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackUrlIndex, setTrackUrlIndex] = useState(0);
  const [trackProgressSec, setTrackProgressSec] = useState(0);
  const [trackDurationSec, setTrackDurationSec] = useState(
    COMMUNITY_MUSIC_TRACKS[0].durationSec
  );
  const [wavePhase, setWavePhase] = useState(0);

  const activeTrack = useMemo(() => {
    return (
      COMMUNITY_MUSIC_TRACKS.find((t) => t.label === config.selectedTrack) ||
      COMMUNITY_MUSIC_TRACKS[0]
    );
  }, [config.selectedTrack]);

  // Animate wavy ocean timeline phase smoothly
  useEffect(() => {
    if (!config.musicPlayerVisible && activeTab !== 'music') return;
    const interval = window.setInterval(() => {
      setWavePhase((prev) => prev + (config.musicPlaying ? 0.24 : 0.06));
    }, 50);
    return () => window.clearInterval(interval);
  }, [config.musicPlayerVisible, config.musicPlaying, activeTab]);

  // Sync HTMLAudioElement playback & fallback progreso
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = Math.max(0, Math.min(1, config.musicVolume / 100));
    audio.loop = config.musicLooped;
    if (config.musicPlaying) {
      audio.play().catch(() => {
        // Fallback simulated timeline advance when browser blocks autoplay or remote MP3 isn't reachable
      });
    } else {
      audio.pause();
    }
  }, [config.musicPlaying, config.musicVolume, config.musicLooped, trackUrlIndex]);

  // Simulated fallback progress timer if audio element isn't actively advancing
  useEffect(() => {
    if (!config.musicPlaying) return;
    const timer = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio && !audio.paused && audio.currentTime > 0) {
        setTrackProgressSec(audio.currentTime);
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          setTrackDurationSec(audio.duration);
        }
      } else {
        setTrackProgressSec((prev) => {
          const next = prev + 0.25;
          if (next >= trackDurationSec) {
            return config.musicLooped ? 0 : trackDurationSec;
          }
          return next;
        });
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [config.musicPlaying, config.musicLooped, trackDurationSec]);

  const fetchDiscordCounts = async () => {
    setIsRefreshingDiscord(true);
    try {
      const res = await fetch(DISCORD_API_INVITE_URL);
      if (res.ok) {
        const json = await res.json();
        setDiscordStats(parseDiscordInviteCounts(json));
      }
    } catch {
      // Keep fallback stats if offline or blocked by CORS
    } finally {
      setIsRefreshingDiscord(false);
    }
  };

  useEffect(() => {
    fetchDiscordCounts();
    const poll = window.setInterval(fetchDiscordCounts, 60000);
    return () => window.clearInterval(poll);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const effectiveKeyExpiry = simulatedExpiryOverride ?? keyExpiresAtMs;
  const remainingKeyTimeLabel = useMemo(
    () => formatRemainingKeyTime(effectiveKeyExpiry, nowMs),
    [effectiveKeyExpiry, nowMs]
  );

  // Subtle autonomous target drift in preview canvas
  useEffect(() => {
    const interval = window.setInterval(() => {
      const t = Date.now() / 1200;
      setTargetPos({
        x: 50 + Math.sin(t) * 18,
        y: 46 + Math.cos(t * 1.3) * 12,
      });
    }, 40);
    return () => window.clearInterval(interval);
  }, []);

  const rawUrl = useMemo(() => buildGithubRawUrl(githubConfig), [githubConfig]);
  const loadstringSnippet = useMemo(
    () => buildLoadstringSnippet(githubConfig, false),
    [githubConfig]
  );
  const cloudflareLoadstringSnippet = useMemo(
    () => buildCloudflareLoadstringSnippet(cloudflareWorkerUrl, includeHandshakeSig),
    [cloudflareWorkerUrl, includeHandshakeSig]
  );
  const luaScript = useMemo(() => generateCoreLuaScript(config), [config]);

  const copyText = async (
    text: string,
    type: 'loadstring' | 'script' | 'plato' | 'discord' | 'cloudflare' | 'cachebust'
  ) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedType(type);
    window.setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadLuaFile = () => {
    const blob = new Blob([luaScript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = githubConfig.filePath || 'Core.xyz.lua';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSkyboxSearch = () => {
    const q = skyboxSearchQuery.trim().toLowerCase();
    if (!q) {
      setSkyboxSearchResults([...SKYBOX_PRESETS.slice(0, 6)]);
      setSelectedSearchResult(SKYBOX_PRESETS[0]);
      return;
    }
    const matched = SKYBOX_PRESETS.filter((p) => p.toLowerCase().includes(q));
    const finalResults = matched.length > 0 ? matched : [`Custom Sky: ${skyboxSearchQuery.trim()}`, 'Purple Nebula', 'Night Galaxy'];
    setSkyboxSearchResults(finalResults);
    setSelectedSearchResult(finalResults[0]);
    setSkyboxPreset(finalResults[0]);
    setSkyboxEnabled(true);
  };

  const accentHex =
    config.espAccent === 'Crimson'
      ? '#EF4444'
      : config.espAccent === 'Cyan'
      ? '#22D3EE'
      : config.espAccent === 'Silver'
      ? '#A3A3A3'
      : '#FFFFFF';

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col selection:bg-white selection:text-black">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-black text-base tracking-tighter shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">Core.xyz</span>
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-neutral-200 border border-white/15">
                  v4.5 Visual Suite
                </span>
              </div>
              <p className="text-xs text-neutral-400 hidden sm:block">
                Universal Roblox Script Hub &bull; Realistic Weather + 8 Visual Feature Suites
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav
            aria-label="Script Hub Categories"
            className="flex items-center gap-1 p-1 rounded-xl bg-[#0D0D10] border border-white/10 overflow-x-auto"
          >
            {(
              [
                { id: 'home', label: 'Home', icon: Home },
                { id: 'combat', label: 'Combat', icon: Crosshair },
                { id: 'visuals', label: 'Visuals', icon: Eye },
                { id: 'movement', label: 'Movement', icon: Zap },
                { id: 'music', label: 'Music', icon: Music },
                { id: 'misc', label: 'Misc', icon: Shield },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-black shadow-[0_2px_10px_rgba(255,255,255,0.25)]'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => copyText(loadstringSnippet, 'loadstring')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-colors cursor-pointer"
            >
              {copiedType === 'loadstring' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied Loadstring</span>
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Loadstring Quick Bar */}
        <section
          aria-label="One-Line Roblox Executor Loadstring"
          className="rounded-2xl bg-[#0A0A0C] border border-white/15 p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-[0_16px_50px_rgba(0,0,0,0.65)]"
        >
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Terminal className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Instant Roblox Executor Loadstring
              </h2>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">
                Platoboost #{PLATOBOOST_SERVICE_ID} Ready
              </span>
              <span
                data-testid="live-key-time-left"
                className="text-[11px] font-mono text-white bg-white/10 border border-white/20 px-2.5 py-0.5 rounded"
              >
                KEY TIME LEFT: {remainingKeyTimeLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Paste this 1-line snippet into your Roblox executor (Wave, Solara, Synapse, Delta, Fluxus) to run{' '}
              <span className="text-white font-mono">Core.xyz</span> directly from your GitHub repository.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:w-auto">
            <code
              data-testid="loadstring-code"
              className="px-3.5 py-2.5 rounded-xl bg-black border border-white/15 font-mono text-xs text-neutral-200 select-all overflow-x-auto max-w-full sm:max-w-md lg:max-w-lg whitespace-nowrap"
            >
              {loadstringSnippet}
            </code>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyText(loadstringSnippet, 'loadstring')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs transition-all cursor-pointer shrink-0"
              >
                {copiedType === 'loadstring' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={downloadLuaFile}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#141418] hover:bg-[#1E1E24] text-white border border-white/15 font-semibold text-xs transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Download .lua</span>
              </button>
            </div>
          </div>
        </section>

        {/* Workspace Grid: Left Core.xyz Window + Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Core.xyz Interactive Window */}
          <section
            aria-label="Core.xyz Control Panel"
            className="lg:col-span-5 rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)]"
          >
            {/* Simulated Roblox Window Titlebar */}
            <div className="px-5 py-3.5 bg-[#0F0F12] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
                <span className="font-bold text-sm tracking-tight text-white">Core.xyz</span>
                <span className="text-[11px] font-mono text-neutral-400">
                  // {activeTab.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[11px] font-mono text-neutral-400">RightShift</span>
              </div>
            </div>

            {/* Control Panel Body */}
            <div className="p-5 space-y-4 max-h-[760px] overflow-y-auto">
              {activeTab === 'home' && (
                <div className="space-y-3.5">
                  {/* Welcome & License Status Card */}
                  <div className="p-4 rounded-xl bg-[#111115] border border-white/12 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* 3D Character Viewport Thumbnail Preview */}
                        <div className="w-12 h-14 rounded-lg bg-[#08080B] border border-white/15 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                          <div className="w-3.5 h-3.5 rounded-full bg-white/90 mb-0.5 shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                          <div className="w-6 h-5 rounded-t bg-white/75" />
                          <span className="text-[8px] font-mono text-neutral-400 mt-0.5">3D RIG</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                            ACTIVE SESSION
                          </span>
                          <h3 className="text-sm font-bold text-white mt-0.5">
                            Welcome to Core.xyz v4.5
                          </h3>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 font-mono text-[11px] text-white font-semibold">
                        {remainingKeyTimeLabel}
                      </span>
                    </div>

                    {/* 3 Key Tiers Breakdown */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="p-2 rounded-lg bg-black/50 border border-white/10">
                        <div className="text-[10px] font-bold text-white">FREE TIER</div>
                        <div className="text-[9px] text-neutral-400 mt-0.5">
                          24h Access via Linkvertise / Lootlabs
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-black/50 border border-white/15">
                        <div className="text-[10px] font-bold text-white">PREMIUM TIER</div>
                        <div className="text-[9px] text-neutral-400 mt-0.5">
                          30d / Lifetime Direct Instant Key
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-black/50 border border-white/20">
                        <div className="text-[10px] font-bold text-white">DEVELOPER TIER</div>
                        <div className="text-[9px] text-neutral-400 mt-0.5">
                          500,000h+ Extended Duration
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
                      <span className="text-[11px] text-neutral-400">
                        Test Key Duration Display:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSimulatedExpiryOverride(null)}
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                            simulatedExpiryOverride === null
                              ? 'bg-white text-black border-white font-bold'
                              : 'bg-black/60 text-neutral-300 border-white/15 hover:border-white/30'
                          }`}
                        >
                          24h Key
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSimulatedExpiryOverride(Date.now() + 500000 * 3600 * 1000)
                          }
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                            simulatedExpiryOverride !== null && simulatedExpiryOverride > 0
                              ? 'bg-white text-black border-white font-bold'
                              : 'bg-black/60 text-neutral-300 border-white/15 hover:border-white/30'
                          }`}
                        >
                          500,000h Dev Key
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimulatedExpiryOverride(-1)}
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
                            simulatedExpiryOverride === -1
                              ? 'bg-white text-black border-white font-bold'
                              : 'bg-black/60 text-neutral-300 border-white/15 hover:border-white/30'
                          }`}
                        >
                          Lifetime
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions Card */}
                  <div className="p-3.5 rounded-xl bg-[#0E0E12] border border-white/10 space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
                      QUICK NAVIGATION
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('visuals')}
                        className="px-3 py-2 rounded-lg bg-[#16161C] hover:bg-[#1E1E26] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Open 8 Visual Suites</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('music')}
                        className="px-3 py-2 rounded-lg bg-[#16161C] hover:bg-[#1E1E26] border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Music className="w-3.5 h-3.5" />
                        <span>Open Music Player</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Discord Community Card */}
                  <div
                    data-testid="home-discord-card"
                    className="rounded-xl bg-[#111214] border border-white/15 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
                  >
                    {/* Top Banner with Animated Monochrome Wave Crest */}
                    <div
                      data-testid="discord-wave-banner"
                      className="h-16 bg-gradient-to-r from-[#09090B] via-[#18181F] to-[#09090B] relative overflow-hidden border-b border-white/10"
                    >
                      <svg
                        viewBox="0 0 400 64"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full opacity-35"
                      >
                        <path
                          d="M 0 38 Q 100 14 200 38 T 400 38 L 400 64 L 0 64 Z"
                          fill="rgba(255,255,255,0.16)"
                        />
                        <path
                          d="M 0 46 Q 100 24 200 46 T 400 46 L 400 64 L 0 64 Z"
                          fill="rgba(255,255,255,0.09)"
                        />
                      </svg>
                      <div className="absolute top-2.5 right-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/60 border border-white/15 font-mono text-[10px] text-neutral-300">
                          discord.gg/{discordStats.inviteCode}
                        </span>
                        <button
                          type="button"
                          onClick={fetchDiscordCounts}
                          aria-label="Refresh Discord Server Stats"
                          className="p-1 rounded bg-black/60 hover:bg-black/80 border border-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${isRefreshingDiscord ? 'animate-spin' : ''}`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="p-4 pt-0 relative">
                      {/* Overlapping Server Avatar */}
                      <div className="flex items-end justify-between -mt-7 mb-3">
                        <div className="relative w-14 h-14 rounded-2xl bg-[#1A1A20] border-4 border-[#111214] overflow-hidden flex items-center justify-center shadow-lg">
                          {!discordIconFailed ? (
                            <img
                              src={discordStats.iconUrl}
                              alt={discordStats.serverName}
                              onError={() => setDiscordIconFailed(true)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-black text-white">C</span>
                          )}
                          <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#111214]" />
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            data-testid="discord-online-pill"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono text-emerald-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {discordStats.onlineCount} Online
                          </span>
                          <span
                            data-testid="discord-members-pill"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/15 text-[11px] font-mono text-neutral-300"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            {discordStats.memberCount} Members
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 mb-3.5">
                        <div className="flex items-center gap-2">
                          <h4
                            data-testid="discord-server-name"
                            className="text-base font-bold text-white tracking-tight"
                          >
                            {discordStats.serverName}
                          </h4>
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-neutral-200">
                            OFFICIAL
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          Official Core.xyz Discord community &bull; Script updates, configs, and community music requests.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyText(discordStats.inviteUrl, 'discord')}
                          className="flex-1 py-2.5 px-3 rounded-lg bg-white text-black hover:bg-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedType === 'discord' ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied Invite ({discordStats.inviteUrl})</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Discord Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'combat' && (
                <div className="space-y-3">
                  <SectionBox title="Silent & Camera Aimbot">
                    <ToggleRow
                      label="Enable Aimbot"
                      checked={config.aimbotEnabled}
                      onChange={(v) => setConfig({ ...config, aimbotEnabled: v })}
                      showKeybindBadge
                    />
                    <ToggleRow
                      label="Show FOV Circle"
                      checked={config.showFOV}
                      onChange={(v) => setConfig({ ...config, showFOV: v })}
                    />
                    <ToggleRow
                      label="Team Check"
                      checked={config.teamCheck}
                      onChange={(v) => setConfig({ ...config, teamCheck: v })}
                    />
                    <SliderRow
                      label="FOV Radius"
                      value={config.fovRadius}
                      min={20}
                      max={240}
                      step={5}
                      unit="px"
                      onChange={(v) => setConfig({ ...config, fovRadius: v })}
                    />
                    <SliderRow
                      label="Smoothness"
                      value={config.smoothness}
                      min={0.05}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={(v) => setConfig({ ...config, smoothness: v })}
                    />
                    <SelectRow
                      label="Target Hitbox"
                      value={config.targetPart}
                      options={['Head', 'HumanoidRootPart', 'UpperTorso', 'LowerTorso']}
                      onChange={(v) =>
                        setConfig({
                          ...config,
                          targetPart: v as CoreConfigState['targetPart'],
                        })
                      }
                    />
                  </SectionBox>
                </div>
              )}

              {activeTab === 'visuals' && (
                <div className="space-y-4">
                  {/* ESP & Crosshair */}
                  <SectionBox title="ESP & Crosshair">
                    <ToggleRow
                      label="Enable Player ESP"
                      checked={config.espEnabled}
                      onChange={(v) => setConfig({ ...config, espEnabled: v })}
                      showKeybindBadge
                      swatchColor={accentHex}
                    />
                    <ToggleRow
                      label="Enable Snapline Tracers"
                      checked={config.tracersEnabled}
                      onChange={(v) => setConfig({ ...config, tracersEnabled: v })}
                    />
                    <ToggleRow
                      label="Custom Crosshair"
                      checked={config.crosshairEnabled}
                      onChange={(v) => setConfig({ ...config, crosshairEnabled: v })}
                    />
                    <SliderRow
                      label="Crosshair Size"
                      value={config.crosshairSize}
                      min={4}
                      max={28}
                      step={1}
                      unit="px"
                      onChange={(v) => setConfig({ ...config, crosshairSize: v })}
                    />
                    <SelectRow
                      label="Snapline Origin"
                      value={config.tracerOrigin}
                      options={['Bottom', 'Center', 'Top']}
                      onChange={(v) =>
                        setConfig({
                          ...config,
                          tracerOrigin: v as CoreConfigState['tracerOrigin'],
                        })
                      }
                    />
                    <SelectRow
                      label="ESP Accent Color"
                      value={config.espAccent}
                      options={['White', 'Silver', 'Crimson', 'Cyan']}
                      onChange={(v) =>
                        setConfig({
                          ...config,
                          espAccent: v as CoreConfigState['espAccent'],
                        })
                      }
                    />
                  </SectionBox>

                  {/* Suite 1: Self Chams */}
                  <SectionBox title="Self Chams">
                    <ToggleRow
                      label="Self Chams"
                      checked={selfChamsEnabled}
                      onChange={setSelfChamsEnabled}
                      showKeybindBadge
                      swatchColor="#FFFFFF"
                      swatchColor2="#6E5AFF"
                    />
                    <SelectRow
                      label="Chams Material"
                      value={selfChamsMaterial}
                      options={[...CHAMS_MATERIALS]}
                      onChange={setSelfChamsMaterial}
                    />
                    <SliderRow
                      label="Fill Transparency"
                      value={selfChamsFillTrans}
                      min={0}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={setSelfChamsFillTrans}
                    />
                    <SliderRow
                      label="Outline Transparency"
                      value={selfChamsOutlineTrans}
                      min={0}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={setSelfChamsOutlineTrans}
                    />
                    <ToggleRow
                      label="Rainbow"
                      checked={selfChamsRainbow}
                      onChange={setSelfChamsRainbow}
                    />
                    <ToggleRow
                      label="Pulse"
                      checked={selfChamsPulse}
                      onChange={setSelfChamsPulse}
                    />
                    <ToggleRow
                      label="Glow Rim"
                      checked={selfChamsGlowRim}
                      onChange={setSelfChamsGlowRim}
                    />
                  </SectionBox>

                  {/* Suite 2: Trail */}
                  <SectionBox title="Trail">
                    <ToggleRow
                      label="Trail"
                      checked={legTrailEnabled}
                      onChange={setLegTrailEnabled}
                      showKeybindBadge
                    />
                    <ColorSwatchRow label="Left Leg Start" color="#6E5AFF" />
                    <ColorSwatchRow label="Left Leg End" color="#3CD2FF" />
                    <ToggleRow
                      label="Same Colors Both Legs"
                      checked={legTrailSameColors}
                      onChange={setLegTrailSameColors}
                    />
                    <ColorSwatchRow
                      label="Right Leg Start"
                      color={legTrailSameColors ? '#6E5AFF' : '#FF50B4'}
                    />
                    <ColorSwatchRow
                      label="Right Leg End"
                      color={legTrailSameColors ? '#3CD2FF' : '#FFB946'}
                    />
                    <SliderRow
                      label="Trail Width"
                      value={legTrailWidth}
                      min={0.05}
                      max={2}
                      step={0.05}
                      unit=""
                      onChange={setLegTrailWidth}
                    />
                    <SliderRow
                      label="Trail Length"
                      value={legTrailLength}
                      min={0.1}
                      max={3}
                      step={0.1}
                      unit="s"
                      onChange={setLegTrailLength}
                    />
                    <ToggleRow
                      label="Rainbow Trail"
                      checked={legTrailRainbow}
                      onChange={setLegTrailRainbow}
                    />
                  </SectionBox>

                  {/* Suite 3: Tool Visuals */}
                  <SectionBox title="Tool Visuals">
                    <ToggleRow
                      label="Tool Visuals"
                      checked={toolVisualsEnabled}
                      onChange={setToolVisualsEnabled}
                      showKeybindBadge
                      swatchColor="#6E5AFF"
                    />
                    <SelectRow
                      label="Tool Material"
                      value={toolMaterial}
                      options={[...TOOL_MATERIALS]}
                      onChange={setToolMaterial}
                    />
                    <SliderRow
                      label="Tool Transparency"
                      value={toolTransparency}
                      min={0}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={setToolTransparency}
                    />
                    <ToggleRow
                      label="Rainbow Tool"
                      checked={toolRainbow}
                      onChange={setToolRainbow}
                    />
                    <SelectRow
                      label="Skin Texture"
                      value={toolSkinTexture}
                      options={[...TOOL_SKINS]}
                      onChange={setToolSkinTexture}
                    />
                    <ToggleRow
                      label="Tool Chams"
                      checked={toolChamsEnabled}
                      onChange={setToolChamsEnabled}
                      swatchColor="#FFFFFF"
                    />
                    <SelectRow
                      label="Chams Style"
                      value={toolChamsStyle}
                      options={[...CHAMS_STYLES]}
                      onChange={setToolChamsStyle}
                    />
                    <ToggleRow
                      label="Tool Glow"
                      checked={toolGlowEnabled}
                      onChange={setToolGlowEnabled}
                    />
                    <SliderRow
                      label="Glow Brightness"
                      value={toolGlowBrightness}
                      min={0}
                      max={10}
                      step={0.5}
                      unit=""
                      onChange={setToolGlowBrightness}
                    />
                  </SectionBox>

                  {/* Suite 4: Bloom & Sun Rays */}
                  <SectionBox title="Bloom & Sun Rays">
                    <ToggleRow
                      label="Bloom"
                      checked={bloomEnabled}
                      onChange={setBloomEnabled}
                      showKeybindBadge
                    />
                    <SliderRow
                      label="Bloom Intensity"
                      value={bloomIntensity}
                      min={0}
                      max={3}
                      step={0.05}
                      unit=""
                      onChange={setBloomIntensity}
                    />
                    <SliderRow
                      label="Bloom Size"
                      value={bloomSize}
                      min={0}
                      max={56}
                      step={1}
                      unit=""
                      onChange={setBloomSize}
                    />
                    <SliderRow
                      label="Bloom Threshold"
                      value={bloomThreshold}
                      min={0}
                      max={4}
                      step={0.05}
                      unit=""
                      onChange={setBloomThreshold}
                    />
                    <ToggleRow
                      label="Sun Rays"
                      checked={sunRaysEnabled}
                      onChange={setSunRaysEnabled}
                      showKeybindBadge
                    />
                    <SliderRow
                      label="Rays Intensity"
                      value={sunRaysIntensity}
                      min={0}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={setSunRaysIntensity}
                    />
                    <SliderRow
                      label="Rays Spread"
                      value={sunRaysSpread}
                      min={0}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={setSunRaysSpread}
                    />
                  </SectionBox>

                  {/* Suite 5: Color Correction */}
                  <SectionBox title="Color Correction">
                    <ToggleRow
                      label="Color Correction"
                      checked={colorCorrectionEnabled}
                      onChange={setColorCorrectionEnabled}
                      swatchColor="#FFFFFF"
                    />
                    <SliderRow
                      label="Saturation"
                      value={ccSaturation}
                      min={-1}
                      max={2}
                      step={0.05}
                      unit=""
                      onChange={setCcSaturation}
                    />
                    <SliderRow
                      label="Contrast"
                      value={ccContrast}
                      min={-1}
                      max={2}
                      step={0.05}
                      unit=""
                      onChange={setCcContrast}
                    />
                    <SliderRow
                      label="Brightness"
                      value={ccBrightness}
                      min={-1}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={setCcBrightness}
                    />
                  </SectionBox>

                  {/* Suite 6: Skybox */}
                  <SectionBox title="Skybox">
                    <ToggleRow
                      label="Skybox"
                      checked={skyboxEnabled}
                      onChange={setSkyboxEnabled}
                    />
                    <SelectRow
                      label="Preset"
                      value={skyboxPreset}
                      options={[...SKYBOX_PRESETS]}
                      onChange={(val) => {
                        setSkyboxPreset(val);
                        setSkyboxEnabled(true);
                      }}
                    />
                    <ToggleRow
                      label="Clear Atmosphere"
                      checked={clearAtmosphere}
                      onChange={setClearAtmosphere}
                    />
                    <div className="px-3.5 py-2.5 rounded-lg bg-[#0E0E11] border border-white/[0.07] space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300 block">
                        Custom Sky
                      </label>
                      <input
                        type="text"
                        aria-label="Custom Sky"
                        placeholder="Sky name or asset ID..."
                        value={customSkyInput}
                        onChange={(e) => setCustomSkyInput(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#16161B] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="px-3.5 py-2.5 rounded-lg bg-[#0E0E11] border border-white/[0.07] space-y-2">
                      <label className="text-xs font-medium text-neutral-300 block">
                        Search Skyboxes
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          aria-label="Search Skyboxes"
                          placeholder="e.g. purple, night, anime..."
                          value={skyboxSearchQuery}
                          onChange={(e) => setSkyboxSearchQuery(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded bg-[#16161B] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-white/30"
                        />
                        <button
                          type="button"
                          onClick={handleSkyboxSearch}
                          className="px-3 py-1.5 rounded bg-white text-black hover:bg-neutral-200 text-xs font-bold cursor-pointer shrink-0"
                        >
                          Search
                        </button>
                      </div>
                    </div>
                    <SelectRow
                      label="Search Results"
                      value={selectedSearchResult}
                      options={skyboxSearchResults}
                      onChange={(val) => {
                        setSelectedSearchResult(val);
                        setSkyboxPreset(val);
                        setSkyboxEnabled(true);
                      }}
                    />
                  </SectionBox>

                  {/* Suite 7: Lighting */}
                  <SectionBox title="Lighting">
                    <ToggleRow
                      label="Ambient"
                      checked={ambientEnabled}
                      onChange={setAmbientEnabled}
                      swatchColor="#A08CFF"
                    />
                    <ToggleRow
                      label="Outdoor Ambient"
                      checked={outdoorAmbientEnabled}
                      onChange={setOutdoorAmbientEnabled}
                      swatchColor="#8C82B4"
                    />
                    <ToggleRow
                      label="Color Shift Bottom"
                      checked={colorShiftBottomEnabled}
                      onChange={setColorShiftBottomEnabled}
                      swatchColor="#000000"
                    />
                    <ToggleRow
                      label="Color Shift Top"
                      checked={colorShiftTopEnabled}
                      onChange={setColorShiftTopEnabled}
                      swatchColor="#000000"
                    />
                    <ToggleRow
                      label="Fog Color"
                      checked={fogColorEnabled}
                      onChange={setFogColorEnabled}
                      swatchColor="#C0C0C0"
                    />
                    <ToggleRow
                      label="Fog End"
                      checked={fogEndEnabled}
                      onChange={setFogEndEnabled}
                    />
                    <SliderRow
                      label="Fog End Distance"
                      value={fogEndDistance}
                      min={50}
                      max={10000}
                      step={50}
                      unit=""
                      onChange={setFogEndDistance}
                    />
                    <ToggleRow
                      label="Fog Start"
                      checked={fogStartEnabled}
                      onChange={setFogStartEnabled}
                    />
                    <SliderRow
                      label="Fog Start Distance"
                      value={fogStartDistance}
                      min={0}
                      max={5000}
                      step={25}
                      unit=""
                      onChange={setFogStartDistance}
                    />
                    <ToggleRow
                      label="Exposure Compensation"
                      checked={exposureEnabled}
                      onChange={setExposureEnabled}
                    />
                    <SliderRow
                      label="Exposure Value"
                      value={exposureValue}
                      min={-3}
                      max={3}
                      step={0.1}
                      unit=""
                      onChange={setExposureValue}
                    />
                    <ToggleRow
                      label="Brightness"
                      checked={brightnessEnabled}
                      onChange={setBrightnessEnabled}
                    />
                    <SliderRow
                      label="Brightness Level"
                      value={brightnessLevel}
                      min={0}
                      max={10}
                      step={0.25}
                      unit=""
                      onChange={setBrightnessLevel}
                    />
                    <ToggleRow
                      label="Clock Time"
                      checked={clockTimeEnabled}
                      onChange={setClockTimeEnabled}
                    />
                    <SliderRow
                      label="Time of Day"
                      value={clockTimeHour}
                      min={0}
                      max={24}
                      step={0.5}
                      unit="h"
                      onChange={setClockTimeHour}
                    />
                    <ToggleRow
                      label="No Shadows"
                      checked={noShadowsEnabled}
                      onChange={setNoShadowsEnabled}
                    />
                  </SectionBox>

                  {/* Suite 8: Atmosphere */}
                  <SectionBox title="Atmosphere">
                    <ToggleRow
                      label="Atmosphere"
                      checked={atmosphereEnabled}
                      onChange={setAtmosphereEnabled}
                      swatchColor="#C7D2E6"
                    />
                    <ColorSwatchRow label="Decay" color="#6A7080" />
                    <SliderRow
                      label="Density"
                      value={atmosphereDensity}
                      min={0}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={setAtmosphereDensity}
                    />
                    <SliderRow
                      label="Offset"
                      value={atmosphereOffset}
                      min={0}
                      max={1}
                      step={0.05}
                      unit=""
                      onChange={setAtmosphereOffset}
                    />
                    <SliderRow
                      label="Haze"
                      value={atmosphereHaze}
                      min={0}
                      max={10}
                      step={0.25}
                      unit=""
                      onChange={setAtmosphereHaze}
                    />
                    <SliderRow
                      label="Glare"
                      value={atmosphereGlare}
                      min={0}
                      max={10}
                      step={0.25}
                      unit=""
                      onChange={setAtmosphereGlare}
                    />
                  </SectionBox>

                  {/* 3D Weather & Roof Occlusion */}
                  <SectionBox title="Weather & Roof Occlusion">
                    <SelectRow
                      label="Weather Preset"
                      value={config.weatherPreset}
                      options={[...WEATHER_PRESETS]}
                      testId="weather-preset-select"
                      onChange={(v) =>
                        setConfig({
                          ...config,
                          weatherPreset: v as WeatherPresetType,
                        })
                      }
                    />
                    <ToggleRow
                      label="Simulate Under Roof (Indoor Raycast Occlusion)"
                      checked={underRoof}
                      onChange={setUnderRoof}
                    />
                    <ToggleRow
                      label="Weather Sound FX"
                      checked={config.weatherSoundEnabled}
                      onChange={(v) => setConfig({ ...config, weatherSoundEnabled: v })}
                    />
                    <SliderRow
                      label="Weather Volume"
                      value={config.weatherVolume}
                      min={0}
                      max={100}
                      step={5}
                      unit="%"
                      onChange={(v) => setConfig({ ...config, weatherVolume: v })}
                    />
                  </SectionBox>
                </div>
              )}

              {activeTab === 'movement' && (
                <div className="space-y-3">
                  <SectionBox title="Character Movement">
                    <ToggleRow
                      label="Custom WalkSpeed"
                      checked={config.walkSpeedEnabled}
                      onChange={(v) => setConfig({ ...config, walkSpeedEnabled: v })}
                    />
                    <SliderRow
                      label="WalkSpeed Value"
                      value={config.walkSpeed}
                      min={16}
                      max={120}
                      step={2}
                      unit="studs/s"
                      onChange={(v) => setConfig({ ...config, walkSpeed: v })}
                    />
                    <ToggleRow
                      label="Custom JumpPower"
                      checked={config.jumpPowerEnabled}
                      onChange={(v) => setConfig({ ...config, jumpPowerEnabled: v })}
                    />
                    <SliderRow
                      label="JumpPower Value"
                      value={config.jumpPower}
                      min={50}
                      max={200}
                      step={5}
                      unit="power"
                      onChange={(v) => setConfig({ ...config, jumpPower: v })}
                    />
                    <ToggleRow
                      label="Infinite Jump"
                      checked={config.infJumpEnabled}
                      onChange={(v) => setConfig({ ...config, infJumpEnabled: v })}
                    />
                    <ToggleRow
                      label="Character NoClip"
                      checked={config.noClipEnabled}
                      onChange={(v) => setConfig({ ...config, noClipEnabled: v })}
                    />
                  </SectionBox>
                </div>
              )}

              {activeTab === 'music' && (
                <div className="space-y-3.5">
                  <div
                    data-testid="music-community-note"
                    className="p-3.5 rounded-xl bg-[#111116] border border-white/15 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-white" />
                        COMMUNITY TRACK ROTATION
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">
                        Discord Handpicked
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {COMMUNITY_MUSIC_NOTE}
                    </p>
                  </div>

                  <SelectRow
                    label="Select Track"
                    value={config.selectedTrack}
                    options={COMMUNITY_MUSIC_TRACKS.map((t) => t.label)}
                    testId="music-track-select"
                    onChange={(v) => {
                      setTrackUrlIndex(0);
                      setTrackProgressSec(0);
                      setConfig({
                        ...config,
                        selectedTrack: v,
                      });
                    }}
                  />

                  <ToggleRow
                    label="Show Music Player"
                    checked={config.musicPlayerVisible}
                    onChange={(v) => setConfig({ ...config, musicPlayerVisible: v })}
                  />

                  <ToggleRow
                    label="Play Music"
                    checked={config.musicPlaying}
                    onChange={(v) => setConfig({ ...config, musicPlaying: v })}
                  />

                  <SliderRow
                    label="Music Volume"
                    value={config.musicVolume}
                    min={0}
                    max={100}
                    step={5}
                    unit="%"
                    onChange={(v) => setConfig({ ...config, musicVolume: v })}
                  />

                  <ToggleRow
                    label="Loop Track"
                    checked={config.musicLooped}
                    onChange={(v) => setConfig({ ...config, musicLooped: v })}
                  />

                  <ToggleRow
                    label="Mute Game Audio"
                    checked={config.muteGameAudio}
                    onChange={(v) => setConfig({ ...config, muteGameAudio: v })}
                  />

                  <audio
                    ref={audioRef}
                    src={activeTrack.rawUrls[trackUrlIndex]}
                    preload="metadata"
                    onTimeUpdate={(e) => {
                      const el = e.currentTarget;
                      if (el.currentTime > 0) {
                        setTrackProgressSec(el.currentTime);
                      }
                    }}
                    onLoadedMetadata={(e) => {
                      const el = e.currentTarget;
                      if (Number.isFinite(el.duration) && el.duration > 0) {
                        setTrackDurationSec(el.duration);
                      }
                    }}
                    onError={() => {
                      if (trackUrlIndex < activeTrack.rawUrls.length - 1) {
                        setTrackUrlIndex((idx) => idx + 1);
                      }
                    }}
                  />
                </div>
              )}

              {activeTab === 'misc' && (
                <div className="space-y-3">
                  <ToggleRow
                    label="Anti-AFK Protection"
                    checked={config.antiAFKEnabled}
                    onChange={(v) => setConfig({ ...config, antiAFKEnabled: v })}
                  />

                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-white" />
                        Platoboost Key Gateway
                      </span>
                      <span className="text-[11px] font-mono text-neutral-400">
                        Service #{PLATOBOOST_SERVICE_ID}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      In-game key verification uses{' '}
                      <span className="text-white font-mono">{PLATOBOOST_GATEWAY_URL}</span> with a streamlined 2-button flow (Submit Key &amp; Get Key).
                    </p>
                    <button
                      type="button"
                      onClick={() => copyText(PLATOBOOST_GATEWAY_URL, 'plato')}
                      className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedType === 'plato' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied Gateway Link</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Copy Platoboost Key Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onReplayIntro}
                      className="py-2.5 px-3 rounded-xl bg-[#141418] hover:bg-[#1C1C22] border border-white/10 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Replay Boot Intro</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLockSession}
                      className="py-2.5 px-3 rounded-xl bg-[#141418] hover:bg-[#1C1C22] border border-white/10 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock &amp; Re-Verify Key</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Column: Live Interactive Viewport Simulation + Docked Music Bar + GitHub Setup */}
          <div className="lg:col-span-7 space-y-6">
            {/* Simulated Roblox Viewport */}
            <section
              aria-label="Live Overlay Viewport Preview"
              className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)]"
            >
              <div className="px-5 py-3.5 bg-[#0F0F12] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Live Roblox Viewport Simulation
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                  <span>
                    WalkSpeed: {config.walkSpeedEnabled ? config.walkSpeed : 16}
                  </span>
                  <span>&bull;</span>
                  <span>
                    JumpPower: {config.jumpPowerEnabled ? config.jumpPower : 50}
                  </span>
                </div>
              </div>

              <div
                data-testid="viewport-preview"
                style={{
                  filter: `${
                    colorCorrectionEnabled
                      ? `saturate(${1 + ccSaturation}) contrast(${1 + ccContrast}) brightness(${1 + ccBrightness})`
                      : ''
                  } ${bloomEnabled ? `drop-shadow(0 0 ${Math.round(bloomSize / 4)}px rgba(255,255,255,${Math.min(0.6, bloomIntensity * 0.25)}))` : ''}`.trim() || undefined,
                }}
                className="relative h-80 sm:h-96 bg-[radial-gradient(circle_at_center,#14141A_0%,#060608_100%)] overflow-hidden select-none"
              >
                {/* Live Weather Canvas Engine (Rain, Thunderstorm, Snow, Sunny + Roof Occlusion) */}
                <WeatherCanvasOverlay
                  preset={config.weatherPreset}
                  soundEnabled={config.weatherSoundEnabled && !config.muteGameAudio}
                  volume={config.weatherVolume}
                  underRoof={underRoof}
                />

                {/* Overhead Roof Shelter Structure Visual Indicator when underRoof is enabled */}
                {underRoof && (
                  <div
                    data-testid="roof-shelter-indicator"
                    className="absolute top-0 inset-x-12 h-7 bg-gradient-to-b from-neutral-800/90 to-neutral-900/70 border-b-2 border-x border-white/25 rounded-b-xl z-20 flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(0,0,0,0.85)]"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-200">
                      ROOF OVERHEAD DETECTED &bull; INDOOR RAIN OCCLUDED &amp; AUDIO MUFFLED (-18dB)
                    </span>
                  </div>
                )}

                {/* Subtle perspective grid */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)',
                    backgroundSize: '36px 36px',
                  }}
                />

                {/* FOV Circle */}
                {config.aimbotEnabled && config.showFOV && (
                  <div
                    data-testid="fov-circle"
                    style={{
                      width: `${config.fovRadius * 2}px`,
                      height: `${config.fovRadius * 2}px`,
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/75 pointer-events-none transition-all duration-150"
                  />
                )}

                {/* Snapline Tracer SVG */}
                {config.espEnabled && config.tracersEnabled && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1="50%"
                      y1={
                        config.tracerOrigin === 'Bottom'
                          ? '100%'
                          : config.tracerOrigin === 'Center'
                          ? '50%'
                          : '0%'
                      }
                      x2={`${targetPos.x}%`}
                      y2={`${targetPos.y}%`}
                      stroke={accentHex}
                      strokeWidth="1.5"
                      strokeOpacity="0.75"
                    />
                  </svg>
                )}

                {/* Simulated Target Dummy + Self Chams / Trail / Tool Visuals Preview */}
                <div
                  style={{
                    left: `${targetPos.x}%`,
                    top: `${targetPos.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  {/* Leg Movement Trail Ribbons */}
                  {legTrailEnabled && (
                    <div
                      data-testid="preview-leg-trail"
                      className="absolute -bottom-2 right-full mr-1 flex flex-col gap-1.5 opacity-85"
                    >
                      <div
                        style={{
                          width: `${Math.round(28 + legTrailLength * 18)}px`,
                          height: `${Math.max(2, Math.round(legTrailWidth * 8))}px`,
                          background: legTrailRainbow
                            ? 'linear-gradient(90deg, transparent, #22d3ee, #a855f7, #ec4899)'
                            : 'linear-gradient(90deg, transparent, #3CD2FF, #6E5AFF)',
                        }}
                        className="rounded-full blur-[0.5px]"
                      />
                      <div
                        style={{
                          width: `${Math.round(28 + legTrailLength * 18)}px`,
                          height: `${Math.max(2, Math.round(legTrailWidth * 8))}px`,
                          background: legTrailRainbow
                            ? 'linear-gradient(90deg, transparent, #eab308, #22c55e, #3b82f6)'
                            : legTrailSameColors
                            ? 'linear-gradient(90deg, transparent, #3CD2FF, #6E5AFF)'
                            : 'linear-gradient(90deg, transparent, #FFB946, #FF50B4)',
                        }}
                        className="rounded-full blur-[0.5px]"
                      />
                    </div>
                  )}

                  {config.espEnabled && (
                    <div className="mb-1.5 text-center">
                      <span
                        style={{ color: accentHex }}
                        className="px-2 py-0.5 rounded bg-black/80 border border-white/20 font-mono text-[10px] font-bold whitespace-nowrap shadow"
                      >
                        TargetDummy [100 HP]
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      borderColor: config.espEnabled
                        ? accentHex
                        : selfChamsEnabled
                        ? '#6E5AFF'
                        : 'rgba(255,255,255,0.2)',
                      boxShadow: selfChamsEnabled
                        ? `0 0 ${selfChamsGlowRim ? 24 : 14}px rgba(110,90,255,0.55)`
                        : config.espEnabled
                        ? `0 0 20px ${accentHex}33`
                        : 'none',
                    }}
                    className="w-16 h-24 rounded-md border-2 bg-white/5 flex flex-col items-center justify-center relative"
                  >
                    {/* Avatar Silhouette with Self Chams Material Fill */}
                    <div
                      style={{
                        backgroundColor: selfChamsEnabled
                          ? `rgba(110, 90, 255, ${Math.max(0.15, 1 - selfChamsFillTrans)})`
                          : 'rgba(255,255,255,0.7)',
                        boxShadow: selfChamsGlowRim
                          ? '0 0 10px rgba(255,255,255,0.9)'
                          : undefined,
                      }}
                      className="w-5 h-5 rounded-full mb-1 border border-white/60"
                    />
                    <div
                      style={{
                        backgroundColor: selfChamsEnabled
                          ? `rgba(110, 90, 255, ${Math.max(0.15, 1 - selfChamsFillTrans)})`
                          : 'rgba(255,255,255,0.5)',
                      }}
                      className="w-8 h-10 rounded-sm border border-white/50"
                    />

                    {/* Equipped Tool Visuals Preview */}
                    {toolVisualsEnabled && (
                      <div
                        data-testid="preview-tool-visual"
                        style={{
                          opacity: Math.max(0.2, 1 - toolTransparency),
                          boxShadow: toolGlowEnabled
                            ? `0 0 ${Math.round(toolGlowBrightness * 3)}px rgba(110,90,255,0.95)`
                            : undefined,
                        }}
                        className="absolute -right-5 top-8 w-6 h-2 rounded-xs bg-gradient-to-r from-indigo-400 to-white border border-white -rotate-25"
                      />
                    )}

                    {/* Target Part Indicator */}
                    {config.aimbotEnabled && (
                      <div
                        title={`Target: ${config.targetPart}`}
                        className={`absolute w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#fff] ${
                          config.targetPart === 'Head'
                            ? 'top-3.5'
                            : config.targetPart === 'UpperTorso'
                            ? 'top-9'
                            : 'top-12'
                        }`}
                      />
                    )}
                  </div>
                </div>

                {/* Custom Crosshair */}
                {config.crosshairEnabled && (
                  <div
                    data-testid="custom-crosshair"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <div
                      style={{ width: `${config.crosshairSize * 2}px` }}
                      className="h-[1.5px] bg-white shadow-[0_0_6px_#fff] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                    <div
                      style={{ height: `${config.crosshairSize * 2}px` }}
                      className="w-[1.5px] bg-white shadow-[0_0_6px_#fff] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </div>
                )}

                {/* Bottom Status Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg bg-black/75 border border-white/10 backdrop-blur-md text-[11px] font-mono text-neutral-300">
                  <div className="flex flex-wrap items-center gap-3">
                    <span>
                      CHAMS:{' '}
                      <strong className="text-white">
                        {selfChamsEnabled ? selfChamsMaterial.toUpperCase() : 'OFF'}
                      </strong>
                    </span>
                    <span>
                      TRAIL:{' '}
                      <strong className="text-white">
                        {legTrailEnabled ? `${legTrailLength}s` : 'OFF'}
                      </strong>
                    </span>
                    <span>
                      TOOL:{' '}
                      <strong className="text-white">
                        {toolVisualsEnabled ? toolMaterial.toUpperCase() : 'OFF'}
                      </strong>
                    </span>
                    <span>
                      WEATHER:{' '}
                      <strong className="text-white">
                        {config.weatherPreset.toUpperCase()}
                        {underRoof ? ' (UNDER ROOF)' : ''}
                      </strong>
                    </span>
                  </div>
                  <span className="text-neutral-400">
                    Sky: {skyboxEnabled ? skyboxPreset : 'Default'}
                  </span>
                </div>
              </div>
            </section>

            {/* Separate Docked Music Player Bar (Hidden by Default, Toggled from Music Tab) */}
            <AnimatePresence>
              {config.musicPlayerVisible && (
                <motion.section
                  key="docked-music-player-bar"
                  data-testid="docked-music-player-bar"
                  initial={{ opacity: 0, y: -12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  aria-label="Docked Community Music Player Bar"
                  className="rounded-2xl bg-[#0A0A0D]/95 border border-white/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Pulsing Monochrome Disc Badge */}
                      <div className="relative w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.35)]">
                        <Music
                          className={`w-5 h-5 ${
                            config.musicPlaying ? 'animate-pulse' : ''
                          }`}
                        />
                        <span
                          className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0A0A0D] ${
                            config.musicPlaying ? 'bg-emerald-400' : 'bg-neutral-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {activeTrack.title}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 shrink-0">
                            {activeTrack.artist}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-400 truncate">
                          Discord Community Rotation &bull; {activeTrack.fileName}
                        </p>
                      </div>
                    </div>

                    {/* Transport Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        aria-label={config.musicPlaying ? 'Pause Track' : 'Play Track'}
                        onClick={() =>
                          setConfig({ ...config, musicPlaying: !config.musicPlaying })
                        }
                        className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {config.musicPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Play</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        aria-label="Toggle Loop Track"
                        onClick={() =>
                          setConfig({ ...config, musicLooped: !config.musicLooped })
                        }
                        className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                          config.musicLooped
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-[#121217] border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Repeat className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        aria-label="Toggle Mute Game Audio"
                        onClick={() =>
                          setConfig({ ...config, muteGameAudio: !config.muteGameAudio })
                        }
                        className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                          config.muteGameAudio
                            ? 'bg-white/15 border-white/30 text-white'
                            : 'bg-[#121217] border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {config.muteGameAudio ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Interactive Ocean-Wave Progress Scrubber */}
                  <div className="space-y-1.5">
                    <div
                      data-testid="ocean-wave-progress-scrubber"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(
                          0,
                          Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width))
                        );
                        const nextSec = ratio * trackDurationSec;
                        setTrackProgressSec(nextSec);
                        if (audioRef.current) {
                          try {
                            audioRef.current.currentTime = nextSec;
                          } catch {
                            // Ignore seek error if remote stream isn't loaded
                          }
                        }
                      }}
                      className="relative h-12 rounded-xl bg-[#060608] border border-white/12 overflow-hidden cursor-pointer select-none px-2 flex items-center"
                    >
                      {/* Background Multi-Harmonic SVG Ocean Swell */}
                      {(() => {
                        const primaryWave = buildOceanWaveSvgPath(
                          480,
                          44,
                          wavePhase,
                          config.musicPlaying,
                          0
                        );
                        const secondaryWave = buildOceanWaveSvgPath(
                          480,
                          44,
                          wavePhase * 1.25,
                          config.musicPlaying,
                          1.3
                        );
                        return (
                          <svg
                            viewBox="0 0 480 44"
                            preserveAspectRatio="none"
                            className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
                          >
                            <path
                              d={secondaryWave.areaPath}
                              fill="rgba(255,255,255,0.08)"
                            />
                            <path
                              d={primaryWave.areaPath}
                              fill="rgba(255,255,255,0.14)"
                            />
                            <path
                              d={primaryWave.linePath}
                              fill="none"
                              stroke="rgba(255,255,255,0.45)"
                              strokeWidth="1.5"
                            />
                          </svg>
                        );
                      })()}

                      {/* 38 Articulated Ocean-Wave Crest Nodes */}
                      <div className="relative z-10 w-full flex items-center justify-between gap-0.5 px-1">
                        {Array.from({ length: 38 }).map((_, idx) => {
                          const normX = idx / 37;
                          const progressRatio = Math.max(
                            0,
                            Math.min(1, trackProgressSec / Math.max(1, trackDurationSec))
                          );
                          const isPlayed = normX <= progressRatio;
                          const metrics = computeOceanWaveCrestMetrics(
                            normX,
                            wavePhase,
                            config.musicPlaying
                          );
                          return (
                            <span
                              key={idx}
                              style={{
                                height: `${metrics.barHeightPx}px`,
                                transform: `translateY(${metrics.displacementPx.toFixed(
                                  1
                                )}px) rotate(${metrics.tiltDeg.toFixed(1)}deg)`,
                              }}
                              className={`w-1 rounded-full transition-colors duration-75 ${
                                isPlayed
                                  ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.85)]'
                                  : 'bg-white/20'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
                      <span>{formatTrackTimestamp(trackProgressSec)}</span>
                      <span className="text-neutral-300">
                        Wavy Ocean Timeline &bull; Click anywhere to scrub
                      </span>
                      <span>{formatTrackTimestamp(trackDurationSec)}</span>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* GitHub Raw Loadstring & Generated Lua Script */}
            <section
              aria-label="GitHub Repository and Lua Script Generator"
              className="rounded-2xl bg-[#09090B] border border-white/15 overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)]"
            >
              <div className="px-5 py-3.5 bg-[#0F0F12] border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    GitHub &amp; Cloudflare Private Gateway Loaders
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400 truncate max-w-xs sm:max-w-md">
                  {rawUrl}
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* GitHub Repo Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label
                      htmlFor="gh-owner"
                      className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1"
                    >
                      GitHub Owner
                    </label>
                    <input
                      id="gh-owner"
                      type="text"
                      value={githubConfig.owner}
                      onChange={(e) =>
                        setGithubConfig({ ...githubConfig, owner: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="gh-repo"
                      className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1"
                    >
                      Repository Name
                    </label>
                    <input
                      id="gh-repo"
                      type="text"
                      value={githubConfig.repo}
                      onChange={(e) =>
                        setGithubConfig({ ...githubConfig, repo: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="gh-branch"
                      className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1"
                    >
                      Branch
                    </label>
                    <input
                      id="gh-branch"
                      type="text"
                      value={githubConfig.branch}
                      onChange={(e) =>
                        setGithubConfig({ ...githubConfig, branch: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="gh-file"
                      className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1"
                    >
                      Script Filename
                    </label>
                    <input
                      id="gh-file"
                      type="text"
                      value={githubConfig.filePath}
                      onChange={(e) =>
                        setGithubConfig({ ...githubConfig, filePath: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* Cache-Busting & Cloudflare Worker Loadstrings */}
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white">
                      GitHub Instant Cache-Busting Loadstring (Always Pulls Latest Commit)
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(GITHUB_CACHE_BUST_LOADSTRING, 'cachebust')}
                      className="px-2.5 py-1 rounded bg-white text-black hover:bg-neutral-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedType === 'cachebust' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Cache-Bust Loadstring</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block px-3 py-2 rounded-lg bg-[#050507] border border-white/10 font-mono text-[11px] text-neutral-300 overflow-x-auto whitespace-nowrap">
                    {GITHUB_CACHE_BUST_LOADSTRING}
                  </code>
                </div>

                {/* Lua Source Preview & Copy */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-neutral-400" />
                      <span className="text-xs font-semibold text-neutral-300">
                        Generated <code className="font-mono text-white">Core.xyz.lua</code> Source
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyText(luaScript, 'script')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      {copiedType === 'script' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied Full Lua Script</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Full Lua Script</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-black border border-white/10 font-mono text-[11px] text-neutral-300 max-h-56 overflow-y-auto leading-relaxed select-all">
                    {luaScript}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

interface SectionBoxProps {
  title: string;
  children: React.ReactNode;
}

const SectionBox: React.FC<SectionBoxProps> = ({ title, children }) => (
  <div
    className="relative mt-3 pt-4 pb-3 px-3 rounded-lg bg-[#0B0B0E] border border-white/15 space-y-2.5"
    data-testid={`section-box-${title}`}
  >
    <span className="absolute -top-2.5 left-3 px-1.5 bg-[#09090B] text-[11px] font-semibold text-neutral-300 tracking-tight">
      {title}
    </span>
    {children}
  </div>
);

interface ColorSwatchRowProps {
  label: string;
  color: string;
}

const ColorSwatchRow: React.FC<ColorSwatchRowProps> = ({ label, color }) => (
  <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#0E0E11] border border-white/[0.07]">
    <span className="text-xs font-medium text-neutral-300">{label}</span>
    <span
      style={{ backgroundColor: color }}
      className="w-5 h-3.5 rounded-xs border border-white/30 shadow-xs"
    />
  </div>
);

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  showKeybindBadge?: boolean;
  swatchColor?: string;
  swatchColor2?: string;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  checked,
  onChange,
  showKeybindBadge,
  swatchColor,
  swatchColor2,
}) => (
  <div
    onClick={() => onChange(!checked)}
    className={`group relative flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
      checked
        ? 'bg-[#141418] border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
        : 'bg-[#0E0E11] border-white/[0.07] hover:bg-[#131317] hover:border-white/15'
    }`}
  >
    {/* Left Active Status Accent Bar */}
    <span
      className={`w-1 rounded-full transition-all duration-200 ${
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
    <div className="flex items-center gap-1.5 shrink-0">
      {showKeybindBadge && (
        <span className="px-1.5 py-0.5 rounded bg-[#18181E] border border-white/10 font-mono text-[10px] text-neutral-400">
          [...]
        </span>
      )}
      {swatchColor && (
        <span
          style={{ backgroundColor: swatchColor }}
          className="w-4 h-3 rounded-xs border border-white/35"
        />
      )}
      {swatchColor2 && (
        <span
          style={{ backgroundColor: swatchColor2 }}
          className="w-4 h-3 rounded-xs border border-white/35"
        />
      )}
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
  const stepValue = (dir: -1 | 1) => {
    const next = Math.max(min, Math.min(max, Number((value + dir * step).toFixed(2))));
    onChange(next);
  };
  return (
    <div className="px-3.5 py-2.5 rounded-lg bg-[#0E0E11] hover:bg-[#131317] border border-white/[0.07] hover:border-white/15 transition-colors space-y-2">
      <div className="flex items-center justify-between text-xs">
        <label className="font-medium text-neutral-200">{label}</label>
        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#18181D] border border-white/10 text-white tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          data-testid="slider-minus-btn"
          onClick={() => stepValue(-1)}
          className="w-5 h-5 rounded bg-[#18181E] hover:bg-[#24242D] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
        >
          -
        </button>
        <div className="relative flex-1 flex items-center h-4">
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
        <button
          type="button"
          aria-label={`Increase ${label}`}
          data-testid="slider-plus-btn"
          onClick={() => stepValue(1)}
          className="w-5 h-5 rounded bg-[#18181E] hover:bg-[#24242D] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
        >
          +
        </button>
      </div>
    </div>
  );
};

interface SelectRowProps {
  label: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
  testId?: string;
}

const SelectRow: React.FC<SelectRowProps> = ({ label, value, options, onChange, testId }) => (
  <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#0E0E11] hover:bg-[#131317] border border-white/[0.07] hover:border-white/15 transition-colors">
    <label className="text-xs font-medium text-neutral-200">{label}</label>
    <select
      aria-label={label}
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2.5 py-1.5 rounded-md bg-[#16161B] hover:bg-[#1D1D24] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-white cursor-pointer transition-colors"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#0D0D10] text-white">
          {opt}
        </option>
      ))}
    </select>
  </div>
);