export const REQUIRED_ACCESS_KEY = 'FEYKSECURED';

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
}

export function validateAccessKey(input: string): KeyValidationResult {
  const normalized = input.trim();
  if (!normalized) {
    return {
      valid: false,
      normalizedKey: '',
      error: 'Please enter an authorization key to unlock Core.xyz.',
    };
  }

  if (normalized !== REQUIRED_ACCESS_KEY) {
    return {
      valid: false,
      normalizedKey: normalized,
      error: `Invalid authorization key. Required key: ${REQUIRED_ACCESS_KEY}`,
    };
  }

  return {
    valid: true,
    normalizedKey: normalized,
    error: null,
  };
}

export const LIVE_RAW_SCRIPT_URL = 'https://dpaste.com/2KSR3DBX2.txt';
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
    Key System: ${REQUIRED_ACCESS_KEY}
    Upload to GitHub as 'loader.lua' and execute with 1-line loadstring!
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
local REQUIRED_KEY = "${REQUIRED_ACCESS_KEY}"

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
LoaderStatus.Text = "Initializing Core.xyz Monochrome Environment..."
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

-- 2. KEY SYSTEM GATE (KEY: ${REQUIRED_ACCESS_KEY})
local KeyCard = Instance.new("Frame", ScreenGui)
KeyCard.AnchorPoint = Vector2.new(0.5, 0.5)
KeyCard.Position = UDim2.fromScale(0.5, 0.5)
KeyCard.Size = UDim2.fromOffset(390, 235)
KeyCard.BackgroundColor3 = Theme.Black
KeyCard.BackgroundTransparency = 1
KeyCard.Visible = false
addCorner(KeyCard, 10)
local KeyCardStroke = addStroke(KeyCard, Theme.White, 1, 1)
local KeyScale = Instance.new("UIScale", KeyCard)
KeyScale.Scale = 0.92

local KeyHeaderTitle = Instance.new("TextLabel", KeyCard)
KeyHeaderTitle.Position = UDim2.fromOffset(24, 22)
KeyHeaderTitle.Size = UDim2.new(1, -48, 0, 24)
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
KeyInputBox.PlaceholderText = "Enter Key (${REQUIRED_ACCESS_KEY})..."
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
KeyFeedback.Text = "Status: Awaiting Authorization..."
KeyFeedback.TextColor3 = Theme.Muted
KeyFeedback.TextSize = 11
KeyFeedback.TextXAlignment = Enum.TextXAlignment.Left

local UnlockButton = Instance.new("TextButton", KeyCard)
UnlockButton.Position = UDim2.fromOffset(24, 154)
UnlockButton.Size = UDim2.new(0.62, -28, 0, 40)
UnlockButton.BackgroundColor3 = Theme.White
UnlockButton.Font = Enum.Font.GothamBold
UnlockButton.Text = "AUTHORIZE KEY"
UnlockButton.TextColor3 = Theme.Black
UnlockButton.TextSize = 12
addCorner(UnlockButton, 6)

local CopyKeyButton = Instance.new("TextButton", KeyCard)
CopyKeyButton.Position = UDim2.new(0.62, 4, 0, 154)
CopyKeyButton.Size = UDim2.new(0.38, -28, 0, 40)
CopyKeyButton.BackgroundColor3 = Theme.Surface
CopyKeyButton.Font = Enum.Font.GothamBold
CopyKeyButton.Text = "GET KEY"
CopyKeyButton.TextColor3 = Theme.White
CopyKeyButton.TextSize = 11
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

-- Full Core.xyz script saved in /Core.xyz.lua and /public/loader.lua
CopyKeyButton.MouseButton1Click:Connect(function()
    if setclipboard then setclipboard(REQUIRED_KEY) end
    KeyInputBox.Text = REQUIRED_KEY
    KeyFeedback.Text = "Key copied & filled: " .. REQUIRED_KEY
    KeyFeedback.TextColor3 = Theme.White
end)

UnlockButton.MouseButton1Click:Connect(function()
    local entered = string.upper((KeyInputBox.Text or ""):gsub("%s+", ""))
    if entered == REQUIRED_KEY then
        isAuthorized = true
        KeyCard.Visible = false
        MainWindow.Visible = true
        tween(MainWindow, SmoothTween, { BackgroundTransparency = 0 })
        tween(MainStroke, SmoothTween, { Transparency = 0.15 })
        tween(MainScale, SmoothTween, { Scale = 1 })
    else
        KeyFeedback.Text = "INVALID KEY! Required Key: " .. REQUIRED_KEY
        KeyFeedback.TextColor3 = Theme.Error
    end
end)
`;
}
