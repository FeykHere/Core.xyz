export const PLATOBOOST_SERVICE_ID = 36271;
export const PLATOBOOST_GATEWAY_URL = `https://gateway.platoboost.com/a/${PLATOBOOST_SERVICE_ID}`;
export const PLATOBOOST_DEFAULT_KEY_TTL_MS = 24 * 60 * 60 * 1000;

export const DISCORD_INVITE_CODE = 'TVyFdDwDkn';
export const DISCORD_INVITE_URL = `https://discord.gg/${DISCORD_INVITE_CODE}`;
export const DISCORD_API_INVITE_URL = `https://discord.com/api/v9/invites/${DISCORD_INVITE_CODE}?with_counts=true&with_expiration=true`;
export const DISCORD_SERVER_NAME = 'Core | Beta';
export const DISCORD_DEFAULT_GUILD_ID = '1565870578613752008';
export const DISCORD_DEFAULT_ICON_HASH = '241614e0c238a40ff43e061065d35f5a';
export const DISCORD_SERVER_ICON_URL = `https://cdn.discordapp.com/icons/${DISCORD_DEFAULT_GUILD_ID}/${DISCORD_DEFAULT_ICON_HASH}.png?size=256`;

export interface DiscordServerStats {
  serverName: string;
  onlineCount: number;
  memberCount: number;
  iconUrl: string;
  inviteUrl: string;
  inviteCode: string;
}

export function parseDiscordInviteCounts(payload: unknown): DiscordServerStats {
  const data = (payload && typeof payload === 'object' ? payload : {}) as Record<string, any>;
  const guild = (data.guild && typeof data.guild === 'object' ? data.guild : {}) as Record<string, any>;
  const profile = (data.profile && typeof data.profile === 'object' ? data.profile : {}) as Record<string, any>;

  const rawMembers =
    typeof data.approximate_member_count === 'number'
      ? data.approximate_member_count
      : typeof profile.member_count === 'number'
      ? profile.member_count
      : 2;

  const rawOnline =
    typeof data.approximate_presence_count === 'number'
      ? data.approximate_presence_count
      : typeof profile.online_count === 'number'
      ? profile.online_count
      : 1;

  const guildId = typeof guild.id === 'string' && guild.id ? guild.id : DISCORD_DEFAULT_GUILD_ID;
  const iconHash =
    typeof guild.icon === 'string' && guild.icon
      ? guild.icon
      : typeof profile.icon_hash === 'string' && profile.icon_hash
      ? profile.icon_hash
      : DISCORD_DEFAULT_ICON_HASH;

  return {
    serverName: DISCORD_SERVER_NAME,
    onlineCount: Math.max(0, Math.floor(rawOnline)),
    memberCount: Math.max(0, Math.floor(rawMembers)),
    iconUrl: `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png?size=256`,
    inviteUrl: DISCORD_INVITE_URL,
    inviteCode: DISCORD_INVITE_CODE,
  };
}

export const BOOT_STAGE_SEQUENCE = [
  { threshold: 0, progress: 15, label: 'Starting Core.xyz...' },
  { threshold: 16, progress: 34, label: 'Preparing graphics & overlay engine...' },
  { threshold: 34, progress: 52, label: 'Optimizing frame pacing & memory pool...' },
  { threshold: 52, progress: 72, label: 'Loading saved profile & preferences...' },
  { threshold: 72, progress: 90, label: 'Verifying license status...' },
  { threshold: 90, progress: 100, label: 'Finalizing workspace...' },
] as const;

export type WeatherPresetType = 'Default' | 'Rain' | 'Thunderstorm' | 'Snow' | 'Sunny';

export const WEATHER_PRESETS: readonly WeatherPresetType[] = [
  'Default',
  'Rain',
  'Thunderstorm',
  'Snow',
  'Sunny',
] as const;

export interface CoreConfigState {
  aimbotEnabled: boolean;
  showFOV: boolean;
  fovRadius: number;
  smoothness: number;
  teamCheck: boolean;
  targetPart: 'Head' | 'HumanoidRootPart' | 'UpperTorso' | 'LowerTorso';
  espEnabled: boolean;
  tracersEnabled: boolean;
  tracerOrigin: 'Bottom' | 'Center' | 'Top';
  espAccent: 'White' | 'Silver' | 'Crimson' | 'Cyan';
  crosshairEnabled: boolean;
  crosshairSize: number;
  weatherPreset: WeatherPresetType;
  weatherSoundEnabled: boolean;
  weatherVolume: number;
  walkSpeedEnabled: boolean;
  walkSpeed: number;
  jumpPowerEnabled: boolean;
  jumpPower: number;
  infJumpEnabled: boolean;
  noClipEnabled: boolean;
  antiAFKEnabled: boolean;
}

export interface GithubRepoConfig {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
}

export const DEFAULT_CORE_CONFIG: CoreConfigState = {
  aimbotEnabled: true,
  showFOV: true,
  fovRadius: 95,
  smoothness: 0.25,
  teamCheck: true,
  targetPart: 'Head',
  espEnabled: true,
  tracersEnabled: true,
  tracerOrigin: 'Bottom',
  espAccent: 'White',
  crosshairEnabled: true,
  crosshairSize: 12,
  weatherPreset: 'Default',
  weatherSoundEnabled: true,
  weatherVolume: 50,
  walkSpeedEnabled: false,
  walkSpeed: 24,
  jumpPowerEnabled: false,
  jumpPower: 65,
  infJumpEnabled: false,
  noClipEnabled: false,
  antiAFKEnabled: true,
};

export const DEFAULT_GITHUB_CONFIG: GithubRepoConfig = {
  owner: 'FeykHere',
  repo: 'Core.xyz',
  branch: 'main',
  filePath: 'Core.xyz.lua',
};

export interface KeyValidationResult {
  valid: boolean;
  normalizedKey: string;
  error: string | null;
  expiresAtMs?: number;
}

export function formatRemainingKeyTime(expiresAtMs: number, nowMs: number = Date.now()): string {
  const remainingSec = Math.max(0, Math.floor((expiresAtMs - nowMs) / 1000));
  if (remainingSec <= 0) {
    return 'EXPIRED';
  }
  const days = Math.floor(remainingSec / 86400);
  const hours = Math.floor((remainingSec % 86400) / 3600);
  const mins = Math.floor((remainingSec % 3600) / 60);
  const secs = remainingSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
  }
  return `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
}

export function validateAccessKey(input: string, nowMs: number = Date.now()): KeyValidationResult {
  const normalized = input.trim();
  if (!normalized) {
    return {
      valid: false,
      normalizedKey: '',
      error: 'Please enter a key first.',
    };
  }

  // Platoboost keys start with KEY_ (e.g. KEY_...) or valid alphanumeric key format (>= 8 chars, no spaces)
  const isValidPlatoFormat =
    /^KEY_[A-Za-z0-9_-]{4,}$/i.test(normalized) ||
    /^[A-Za-z0-9]{4,}(?:-[A-Za-z0-9]{4,})+$/i.test(normalized);

  if (!isValidPlatoFormat) {
    return {
      valid: false,
      normalizedKey: normalized,
      error: 'Key is invalid or expired. Click "Get Key" to generate a valid Platoboost key.',
    };
  }

  return {
    valid: true,
    normalizedKey: normalized,
    error: null,
    expiresAtMs: nowMs + PLATOBOOST_DEFAULT_KEY_TTL_MS,
  };
}

export const LIVE_RAW_SCRIPT_URL = 'https://dpaste.com/52EQ6RXLR.txt';
export const LIVE_LOADSTRING_SNIPPET = `loadstring(game:HttpGet("${LIVE_RAW_SCRIPT_URL}"))()`;
export const GITHUB_CACHE_BUST_LOADSTRING =
  'loadstring(game:HttpGet("https://raw.githubusercontent.com/FeykHere/Core.xyz/main/Core.xyz.lua?t=" .. tostring(os.time())))()';

export function buildGithubRawUrl(config: GithubRepoConfig): string {
  const owner = (config.owner || 'FeykHere').trim().replace(/^\/+|\/+$/g, '');
  const repo = (config.repo || 'Core.xyz').trim().replace(/^\/+|\/+$/g, '');
  const branch = (config.branch || 'main').trim().replace(/^\/+|\/+$/g, '');
  const filePath = (config.filePath || 'Core.xyz.lua').trim().replace(/^\/+/, '');
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

export function buildLoadstringSnippet(config: GithubRepoConfig, useLiveHosted = false): string {
  if (useLiveHosted) {
    return LIVE_LOADSTRING_SNIPPET;
  }
  const rawUrl = buildGithubRawUrl(config);
  return `loadstring(game:HttpGet("${rawUrl}"))()`;
}

export function generateCoreLuaScript(config: CoreConfigState): string {
  return `--[=[
    CORE.XYZ | UNIVERSAL ROBLOX LUA SCRIPT
    Theme: Pure Black & White Monochrome (Live Animated)
    Key System: Platoboost Service #${PLATOBOOST_SERVICE_ID} (Submit + Get Key)
    Upload to GitHub as 'Core.xyz.lua' and execute with 1-line loadstring!
]=]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Teams = game:GetService("Teams")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local VirtualUser = game:GetService("VirtualUser")
local CoreGui = game:GetService("CoreGui")

local LocalPlayer = Players.LocalPlayer
local setclipboard = setclipboard or toclipboard
local PLATOBOOST_SERVICE = ${PLATOBOOST_SERVICE_ID}
local PLATOBOOST_LINK = "${PLATOBOOST_GATEWAY_URL}"

local function getSafeGuiParent()
    local ok, res = pcall(function()
        return (gethui and gethui()) or CoreGui
    end)
    return (ok and res) or LocalPlayer:WaitForChild("PlayerGui")
end

local guiParent = getSafeGuiParent()
if guiParent:FindFirstChild("CoreXYZ_Universal") then
    guiParent.CoreXYZ_Universal:Destroy()
end

-- Core State (Configured Defaults)
local enabled = ${config.aimbotEnabled}
local showFOV = ${config.showFOV}
local espEnabled = ${config.espEnabled}
local tracersEnabled = ${config.tracersEnabled}
local noClipEnabled = ${config.noClipEnabled}
local infJumpEnabled = ${config.infJumpEnabled}
local walkSpeedEnabled = ${config.walkSpeedEnabled}
local jumpPowerEnabled = ${config.jumpPowerEnabled}
local crosshairEnabled = ${config.crosshairEnabled}
local teamCheckEnabled = ${config.teamCheck}

local selectedTeams, allTeams, espObjects, noclipCollideCache = { ["All"] = true }, { "All" }, {}, {}
local activeHighlightCount, MAX_HIGHLIGHTS = 0, 30
local fovRadius = ${config.fovRadius}
local smoothness = ${config.smoothness}
local walkSpeed = ${config.walkSpeed}
local jumpPower = ${config.jumpPower}
local defaultWalkSpeed, defaultJumpPower = 16, 50
local espColor = Color3.fromRGB(255, 255, 255)
local crosshairColor = Color3.fromRGB(255, 255, 255)
local crosshairSize = ${config.crosshairSize}
local tracerOrigin = "${config.tracerOrigin}"
local targetPart = "${config.targetPart}"
local antiAFKConnection, isAuthorized, uiVisible = nil, false, true

local rayParams = RaycastParams.new()
rayParams.FilterType = Enum.RaycastFilterType.Exclude
rayParams.IgnoreWater = true

local Theme = {
    Black = Color3.fromRGB(6, 6, 6),
    Surface = Color3.fromRGB(14, 14, 14),
    Elevated = Color3.fromRGB(22, 22, 22),
    White = Color3.fromRGB(255, 255, 255),
    Silver = Color3.fromRGB(185, 185, 185),
    Muted = Color3.fromRGB(130, 130, 130),
    Border = Color3.fromRGB(42, 42, 42),
    Error = Color3.fromRGB(235, 65, 65),
}

local FastTween = TweenInfo.new(0.18, Enum.EasingStyle.Quart, Enum.EasingDirection.Out)
local SmoothTween = TweenInfo.new(0.35, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
local SlowTween = TweenInfo.new(0.55, Enum.EasingStyle.Exponential, Enum.EasingDirection.Out)

local function tween(obj, info, goals)
    local t = TweenService:Create(obj, info, goals)
    t:Play()
    return t
end

local function addCorner(parent, radius)
    local c = Instance.new("UICorner")
    c.CornerRadius = UDim.new(0, radius or 6)
    c.Parent = parent
    return c
end

local function addStroke(parent, color, thickness, transparency)
    local s = Instance.new("UIStroke")
    s.Color = color or Theme.Border
    s.Thickness = thickness or 1
    s.Transparency = transparency or 0
    s.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
    s.Parent = parent
    return s
end

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "CoreXYZ_Universal"
ScreenGui.IgnoreGuiInset = true
ScreenGui.ResetOnSpawn = false
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
ScreenGui.Parent = guiParent

local OverlayContainer = Instance.new("Folder", ScreenGui)
OverlayContainer.Name = "Overlays"
local HighlightContainer = Instance.new("Folder", ScreenGui)
HighlightContainer.Name = "Highlights"

local FovCircle = Instance.new("Frame", OverlayContainer)
FovCircle.AnchorPoint = Vector2.new(0.5, 0.5)
FovCircle.Position = UDim2.fromScale(0.5, 0.5)
FovCircle.Size = UDim2.fromOffset(fovRadius * 2, fovRadius * 2)
FovCircle.BackgroundTransparency = 1
FovCircle.Visible = false
addCorner(FovCircle, 999)
addStroke(FovCircle, Theme.White, 1.5, 0.1)

local CrosshairV = Instance.new("Frame", OverlayContainer)
CrosshairV.AnchorPoint = Vector2.new(0.5, 0.5)
CrosshairV.Position = UDim2.fromScale(0.5, 0.5)
CrosshairV.Size = UDim2.fromOffset(1, crosshairSize * 2)
CrosshairV.BackgroundColor3 = crosshairColor
CrosshairV.BorderSizePixel = 0
CrosshairV.Visible = false

local CrosshairH = Instance.new("Frame", OverlayContainer)
CrosshairH.AnchorPoint = Vector2.new(0.5, 0.5)
CrosshairH.Position = UDim2.fromScale(0.5, 0.5)
CrosshairH.Size = UDim2.fromOffset(crosshairSize * 2, 1)
CrosshairH.BackgroundColor3 = crosshairColor
CrosshairH.BorderSizePixel = 0
CrosshairH.Visible = false

-- 1. ANIMATED LOADING SCREEN ("Core.xyz")
local LoaderCard = Instance.new("Frame", ScreenGui)
LoaderCard.AnchorPoint = Vector2.new(0.5, 0.5)
LoaderCard.Position = UDim2.fromScale(0.5, 0.5)
LoaderCard.Size = UDim2.fromOffset(370, 195)
LoaderCard.BackgroundColor3 = Theme.Black
LoaderCard.BackgroundTransparency = 1
addCorner(LoaderCard, 10)
local LoaderStroke = addStroke(LoaderCard, Theme.White, 1, 1)
local LoaderScale = Instance.new("UIScale", LoaderCard)
LoaderScale.Scale = 0.9

local EmblemRingOuter = Instance.new("Frame", LoaderCard)
EmblemRingOuter.AnchorPoint = Vector2.new(0.5, 0.5)
EmblemRingOuter.Position = UDim2.new(0.5, 0, 0, 48)
EmblemRingOuter.Size = UDim2.fromOffset(42, 42)
EmblemRingOuter.BackgroundTransparency = 1
addCorner(EmblemRingOuter, 8)
local EmblemOuterStroke = addStroke(EmblemRingOuter, Theme.White, 1.5, 1)

local EmblemRingInner = Instance.new("Frame", LoaderCard)
EmblemRingInner.AnchorPoint = Vector2.new(0.5, 0.5)
EmblemRingInner.Position = UDim2.new(0.5, 0, 0, 48)
EmblemRingInner.Size = UDim2.fromOffset(22, 22)
EmblemRingInner.BackgroundTransparency = 1
addCorner(EmblemRingInner, 4)
local EmblemInnerStroke = addStroke(EmblemRingInner, Theme.White, 1.2, 1)

local LoaderTitle = Instance.new("TextLabel", LoaderCard)
LoaderTitle.Position = UDim2.fromOffset(0, 80)
LoaderTitle.Size = UDim2.new(1, 0, 0, 26)
LoaderTitle.BackgroundTransparency = 1
LoaderTitle.Font = Enum.Font.GothamBlack
LoaderTitle.Text = "Core.xyz"
LoaderTitle.TextColor3 = Theme.White
LoaderTitle.TextTransparency = 1
LoaderTitle.TextSize = 22

local LoaderStatus = Instance.new("TextLabel", LoaderCard)
LoaderStatus.Position = UDim2.fromOffset(24, 110)
LoaderStatus.Size = UDim2.new(1, -48, 0, 18)
LoaderStatus.BackgroundTransparency = 1
LoaderStatus.Font = Enum.Font.GothamMedium
LoaderStatus.Text = "Starting Core.xyz..."
LoaderStatus.TextColor3 = Theme.Muted
LoaderStatus.TextTransparency = 1
LoaderStatus.TextSize = 11

local LoaderBarBg = Instance.new("Frame", LoaderCard)
LoaderBarBg.AnchorPoint = Vector2.new(0.5, 0)
LoaderBarBg.Position = UDim2.new(0.5, 0, 0, 142)
LoaderBarBg.Size = UDim2.fromOffset(300, 5)
LoaderBarBg.BackgroundColor3 = Theme.Elevated
LoaderBarBg.BackgroundTransparency = 1
LoaderBarBg.BorderSizePixel = 0
addCorner(LoaderBarBg, 99)

local LoaderBarFill = Instance.new("Frame", LoaderBarBg)
LoaderBarFill.Size = UDim2.fromScale(0, 1)
LoaderBarFill.BackgroundColor3 = Theme.White
LoaderBarFill.BorderSizePixel = 0
addCorner(LoaderBarFill, 99)

local LoaderPercent = Instance.new("TextLabel", LoaderCard)
LoaderPercent.Position = UDim2.fromOffset(0, 156)
LoaderPercent.Size = UDim2.new(1, 0, 0, 18)
LoaderPercent.BackgroundTransparency = 1
LoaderPercent.Font = Enum.Font.Code
LoaderPercent.Text = "0%"
LoaderPercent.TextColor3 = Theme.Silver
LoaderPercent.TextTransparency = 1
LoaderPercent.TextSize = 11

-- 2. PLATOBOOST KEY SYSTEM GATE (Submit + Get Key)
local KeyCard = Instance.new("Frame", ScreenGui)
KeyCard.AnchorPoint = Vector2.new(0.5, 0.5)
KeyCard.Position = UDim2.fromScale(0.5, 0.5)
KeyCard.Size = UDim2.fromOffset(400, 232)
KeyCard.BackgroundColor3 = Theme.Black
KeyCard.BackgroundTransparency = 1
KeyCard.Visible = false
addCorner(KeyCard, 10)
local KeyCardStroke = addStroke(KeyCard, Theme.White, 1, 1)
local KeyScale = Instance.new("UIScale", KeyCard)
KeyScale.Scale = 0.92

local KeyHeaderTitle = Instance.new("TextLabel", KeyCard)
KeyHeaderTitle.Position = UDim2.fromOffset(24, 20)
KeyHeaderTitle.Size = UDim2.new(1, -48, 0, 22)
KeyHeaderTitle.BackgroundTransparency = 1
KeyHeaderTitle.Font = Enum.Font.GothamBlack
KeyHeaderTitle.Text = "Core.xyz  |  Key System"
KeyHeaderTitle.TextColor3 = Theme.White
KeyHeaderTitle.TextSize = 18
KeyHeaderTitle.TextXAlignment = Enum.TextXAlignment.Left

local KeyInputBox = Instance.new("TextBox", KeyCard)
KeyInputBox.Position = UDim2.fromOffset(24, 72)
KeyInputBox.Size = UDim2.new(1, -48, 0, 42)
KeyInputBox.BackgroundColor3 = Theme.Surface
KeyInputBox.Font = Enum.Font.Code
KeyInputBox.PlaceholderText = "Paste your Platoboost key here..."
KeyInputBox.PlaceholderColor3 = Theme.Muted
KeyInputBox.Text = ""
KeyInputBox.TextColor3 = Theme.White
KeyInputBox.TextSize = 13
KeyInputBox.ClearTextOnFocus = false
addCorner(KeyInputBox, 6)
addStroke(KeyInputBox, Theme.Border, 1, 0)

local KeyFeedback = Instance.new("TextLabel", KeyCard)
KeyFeedback.Position = UDim2.fromOffset(24, 122)
KeyFeedback.Size = UDim2.new(1, -48, 0, 18)
KeyFeedback.BackgroundTransparency = 1
KeyFeedback.Font = Enum.Font.GothamMedium
KeyFeedback.Text = "Status: Enter your key or click Get Key to continue."
KeyFeedback.TextColor3 = Theme.Muted
KeyFeedback.TextSize = 11
KeyFeedback.TextXAlignment = Enum.TextXAlignment.Left

local UnlockButton = Instance.new("TextButton", KeyCard)
UnlockButton.Position = UDim2.fromOffset(24, 152)
UnlockButton.Size = UDim2.new(0.52, -29, 0, 40)
UnlockButton.BackgroundColor3 = Theme.White
UnlockButton.Font = Enum.Font.GothamBold
UnlockButton.Text = "Submit"
UnlockButton.TextColor3 = Theme.Black
UnlockButton.TextSize = 12
addCorner(UnlockButton, 6)

local CopyKeyButton = Instance.new("TextButton", KeyCard)
CopyKeyButton.Position = UDim2.new(0.52, 5, 0, 152)
CopyKeyButton.Size = UDim2.new(0.48, -29, 0, 40)
CopyKeyButton.BackgroundColor3 = Theme.Surface
CopyKeyButton.Font = Enum.Font.GothamBold
CopyKeyButton.Text = "Get Key"
CopyKeyButton.TextColor3 = Theme.White
CopyKeyButton.TextSize = 12
addCorner(CopyKeyButton, 6)
addStroke(CopyKeyButton, Theme.Border, 1, 0)

-- 3. MAIN HUB WINDOW (HOME, COMBAT, VISUALS, MOVEMENT, MISC)
local MainWindow = Instance.new("Frame", ScreenGui)
MainWindow.AnchorPoint = Vector2.new(0.5, 0.5)
MainWindow.Position = UDim2.fromScale(0.5, 0.5)
MainWindow.Size = UDim2.fromOffset(580, 390)
MainWindow.BackgroundColor3 = Theme.Black
MainWindow.BackgroundTransparency = 1
MainWindow.Visible = false
addCorner(MainWindow, 10)
local MainStroke = addStroke(MainWindow, Theme.White, 1, 1)
local MainScale = Instance.new("UIScale", MainWindow)
MainScale.Scale = 0.92

-- Full Core.xyz script with Platoboost SHA-256 verification saved in /Core.xyz.lua and /public/loader.lua
CopyKeyButton.MouseButton1Click:Connect(function()
    if setclipboard then setclipboard(PLATOBOOST_LINK) end
    KeyFeedback.Text = "Status: Key link copied to clipboard! Paste in browser."
    KeyFeedback.TextColor3 = Theme.White
end)
`;
}

