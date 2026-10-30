import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  Lock,
  Crosshair,
  Eye,
  Gauge,
  Settings,
  Github,
  Code2,
} from 'lucide-react';
import {
  CoreConfigState,
  DEFAULT_CORE_CONFIG,
  DEFAULT_GITHUB_CONFIG,
  GithubRepoConfig,
  LIVE_LOADSTRING_SNIPPET,
  LIVE_RAW_SCRIPT_URL,
  REQUIRED_ACCESS_KEY,
  buildGithubRawUrl,
  buildLoadstringSnippet,
  generateCoreLuaScript,
} from '../utils/coreAuth';

interface CoreWorkspaceProps {
  onReplayIntro: () => void;
  onLockSession: () => void;
}

type ActiveSection = 'simulator' | 'github' | 'improvements';
type RobloxTab = 'Combat' | 'Visuals' | 'Movement' | 'Misc';

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
  onReplayIntro,
  onLockSession,
}) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('simulator');
  const [robloxTab, setRobloxTab] = useState<RobloxTab>('Combat');
  const [config, setConfig] = useState<CoreConfigState>(DEFAULT_CORE_CONFIG);
  const [githubConfig, setGithubConfig] = useState<GithubRepoConfig>(DEFAULT_GITHUB_CONFIG);
  const [useLiveHost, setUseLiveHost] = useState(true);
  const [copiedLoadstring, setCopiedLoadstring] = useState(false);
  const [copiedLua, setCopiedLua] = useState(false);
  const [fullLuaFile, setFullLuaFile] = useState<string | null>(null);

  React.useEffect(() => {
    fetch('/loader.lua')
      .then((r) => (r.ok ? r.text() : null))
      .then((txt) => {
        if (txt) setFullLuaFile(txt);
      })
      .catch(() => {});
  }, []);

  const rawUrl = useMemo(
    () => (useLiveHost ? LIVE_RAW_SCRIPT_URL : buildGithubRawUrl(githubConfig)),
    [useLiveHost, githubConfig]
  );
  const loadstringSnippet = useMemo(
    () =>
      useLiveHost
        ? LIVE_LOADSTRING_SNIPPET
        : buildLoadstringSnippet(githubConfig, false),
    [useLiveHost, githubConfig]
  );
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
                <span>Authorized Key: {REQUIRED_ACCESS_KEY}</span>
                <span aria-hidden="true">·</span>
                <span>HTTP 200 Live Hosted</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Working 1-Line Loadstring (Fixed HTTP 404 for Delta Executor)
              </h2>
              <p className="text-sm text-neutral-400 max-w-2xl">
                Paste this directly into Delta Executor—it points to the live hosted{' '}
                <code className="text-white">Core.xyz.lua</code> script so it will not return HTTP 404.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 p-1 bg-[#141414] border border-white/10 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUseLiveHost(true)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    useLiveHost
                      ? 'bg-white text-black'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Instant Live URL (No 404)
                </button>
                <button
                  type="button"
                  onClick={() => setUseLiveHost(false)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    !useLiveHost
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

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#060606] border border-white/10 rounded-lg p-3">
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
            {/* Left Column: Simulated Core.xyz Monochrome In-Game Window */}
            <div className="lg:col-span-7 rounded-xl bg-[#0A0A0A] border border-white/15 overflow-hidden flex flex-col">
              {/* Simulated Roblox Window Title Bar */}
              <div className="px-5 py-3.5 bg-[#121212] border-b border-white/10 flex items-center justify-between">
                <span className="font-mono text-sm font-bold tracking-tight text-white">
                  CORE.XYZ
                </span>
                <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono">
                  <span>Key: {REQUIRED_ACCESS_KEY}</span>
                  <span>·</span>
                  <span>[R-SHIFT] Toggle</span>
                </div>
              </div>

              {/* Window Body: Sidebar + Active Tab Controls */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 min-h-[420px]">
                {/* Sidebar Tabs */}
                <div className="sm:col-span-4 bg-[#0E0E0E] border-b sm:border-b-0 sm:border-r border-white/10 p-3 flex sm:flex-col gap-1.5 overflow-x-auto">
                  {(
                    [
                      { id: 'Combat', icon: Crosshair },
                      { id: 'Visuals', icon: Eye },
                      { id: 'Movement', icon: Gauge },
                      { id: 'Misc', icon: Settings },
                    ] as const
                  ).map(({ id, icon: Icon }) => {
                    const isActive = robloxTab === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setRobloxTab(id)}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-white text-black'
                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{id}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Controls Pane */}
                <div className="sm:col-span-8 p-5 space-y-4 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={robloxTab}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                      className="space-y-4"
                    >
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
                              <span>Test Key Gate ({REQUIRED_ACCESS_KEY})</span>
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
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
                  01. FEYKSECURED Key Gate & Loader
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Added a native TweenService monochrome loading sequence that transitions into an
                  interactive key verification prompt requiring <code className="text-white">FEYKSECURED</code>.
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
  <div className="flex items-center justify-between gap-4 py-1.5">
    <span className="text-xs font-medium text-neutral-200">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
        checked ? 'bg-white' : 'bg-[#1F1F1F] border border-white/15'
      }`}
    >
      <span
        className={`block w-3.5 h-3.5 rounded-full transition-transform ${
          checked
            ? 'translate-x-5 bg-black'
            : 'translate-x-1 bg-neutral-400'
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
}) => (
  <div className="space-y-1.5 py-1">
    <div className="flex items-center justify-between text-xs">
      <label className="font-medium text-neutral-300">{label}</label>
      <span className="font-mono text-white tabular-nums">
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-white bg-[#1A1A1A] h-1.5 rounded-lg cursor-pointer"
    />
  </div>
);
