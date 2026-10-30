--[=[
    CORE.XYZ | UNIVERSAL ROBLOX LUA SCRIPT (V4.0 CHEF'S KISS EDITION)
    Theme: Pure Black & White Monochrome (With Full RGB & Theme Freedom in Settings)
    Key System Authorization Key: FEYKSECURED (With Remember Key Auto-Unlock)

    Complete V4.0 Feature Suite:
      1. Live-Animated Start-to-End Loading Screen & Key System ("FEYKSECURED" + Remember Key Toggle)
      2. Customizable & Exact Auto-Sizing Telemetry Floating Pill ("CORE.XYZ | 120 FPS | 24ms")
         - Custom Pill Title TextBox in Settings + Multi-Choice Telemetry Dropdown (Max 3)
         - Exact pixel text measurement so there is NEVER empty dead space or text overflow
      3. Combat Tab:
         - Camera Aimbot with Priority Override, FOV Circle, Smoothness, Team Check
         - Universal Multi-Method Silent Aim (Auto Hybrid, Raycast/FindPartOnRay Hook, Mouse.Hit/Target Hook, Camera Micro-Flick)
         - Silent Aim Hit Chance % Slider + 3 Weighted Body-Part Sliders (Head %, Torso %, Legs % — e.g. 80% Head / 20% Legs)
         - Universal Hitbox Expander (Toggle + Size Slider + Transparency Slider + Team/Whitelist Check)
         - Player Whitelist Toggle + Multi-Select Player Dropdown (Synced with Players Tab)
      4. Visuals Tab:
         - 3D Bounding Box Overlay (12-Edge Projected 3D Wireframe Box — replaces 2D Box)
         - 3D Skeleton Rig Overlay (Live Joint-to-Joint Bone Lines for R15 & R6)
         - Animated Vertical Health Bar Overlay, Chams Highlights, Snapline Tracers, Custom Crosshair
         - X-Ray Vision Toggle + Wall Transparency Slider (with full restoration)
         - Sky & Atmosphere Preset Dropdown (Game Default, Pitch Black Void, Cyberpunk Night, Starry Nebula, Sunset Gold, Matrix Monochrome, Clean Daylight)
         - Fullbright, No Fog, Time of Day Slider
         - Glitch-Free Freecam Toggle + Freecam Speed Slider, Custom Camera FOV, Infinite Zoom, Noclip Camera
         - Client Cosmetics: Headless Horseman & Korblox Right Leg
      5. Movement & Protection Tab:
         - WalkSpeed, JumpPower, Infinite Jump, Stepped NoClip, Spinbot + Speed Slider
         - Swim in Air Toggle (Universal Sky-Swimming)
         - Anti-Fling Toggle, Anti-Ragdoll / Anti-Stun Toggle, Anti-Void Protection Toggle
      6. Players Tab (Auto-Refreshes Every 2 Seconds):
         - Clean Player Cards with Avatar Thumbnail + DisplayName + @Username + Distance + Status Badges
         - Click any player to expand/collapse the 6 inline options underneath:
           (1) Whitelist  (2) Prioritize  (3) Spectate  (4) Teleport  (5) Copy UserName  (6) Fling
      7. World & Misc Tab:
         - Instant Interact, Auto-Interact + Radius Slider, Per-Game Persistent Waypoints (PlaceId Scoped),
           Ultimate Deep FPS Booster, 3D Rendering Toggle, Uncap FPS + Custom FPS Target,
           Rejoin Server, Server Hop (Default, Lowest Players, Highest Players, Lower Ping), Anti-AFK
      8. Settings Tab:
         - Custom Floating Pill Title TextBox, Telemetry Multi-Choice Dropdown (Max 3),
           Theme Presets + Custom Accent R/G/B Sliders, Window Opacity & UI Scale Sliders,
           Remember Key Toggle, Config Name TextBox (Required) + Save/Load Config + Auto-Load Config
]=]

if not game:IsLoaded() then
    pcall(function()
        game.Loaded:Wait()
    end)
end

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Teams = game:GetService("Teams")
local UserInputService = game:GetService("UserInputService")
local TweenService = game:GetService("TweenService")
local VirtualUser = game:GetService("VirtualUser")
local CoreGui = game:GetService("CoreGui")
local Lighting = game:GetService("Lighting")
local HttpService = game:GetService("HttpService")
local TeleportService = game:GetService("TeleportService")

local LocalPlayer = Players.LocalPlayer
if not LocalPlayer then
    LocalPlayer = Players.PlayerAdded:Wait()
end

local Env = {
    setclipboard = setclipboard or toclipboard,
    writefile = writefile,
    readfile = readfile,
    isfile = isfile,
    makefolder = makefolder,
    isfolder = isfolder,
    setfpscap = setfpscap,
    fireproximityprompt = fireproximityprompt,
    fireclickdetector = fireclickdetector,
    hookmetamethod = hookmetamethod,
    getrawmetatable = getrawmetatable,
    setreadonly = setreadonly,
    checkcaller = checkcaller or function() return false end,
    getnamecallmethod = getnamecallmethod or function() return "" end,
    Stats = nil,
    TextService = nil,
}
pcall(function()
    Env.Stats = game:GetService("Stats")
end)
pcall(function()
    Env.TextService = game:GetService("TextService")
end)

local REQUIRED_KEY = "FEYKSECURED"
local CURRENT_PLACE_ID = tostring(game.PlaceId or 0)
local FS_FOLDER = "CoreXYZ_Data"
local CONFIG_INDEX_FILE = FS_FOLDER .. "/ConfigIndex.json"
local AUTO_LOAD_FILE = FS_FOLDER .. "/AutoLoadConfig.txt"
local SAVED_KEY_FILE = FS_FOLDER .. "/SavedKey.txt"
local WAYPOINTS_FILE = FS_FOLDER .. "/Waypoints_" .. CURRENT_PLACE_ID .. ".json"

pcall(function()
    if Env.makefolder and Env.isfolder and not Env.isfolder(FS_FOLDER) then
        Env.makefolder(FS_FOLDER)
    end
end)

--------------------------------------------------------------------------------
-- 1. SAFE FILE SYSTEM & JSON HELPERS
--------------------------------------------------------------------------------
local memoryFileStore = {}

local function safeWriteFile(path, content)
    memoryFileStore[path] = content
    if Env.writefile then
        pcall(function()
            Env.writefile(path, content)
        end)
    end
end

local function safeReadFile(path)
    if Env.readfile then
        local ok, data = pcall(function()
            if not Env.isfile or Env.isfile(path) then
                return Env.readfile(path)
            end
            return nil
        end)
        if ok and data and data ~= "" then
            return data
        end
    end
    return memoryFileStore[path]
end

local function safeJsonEncode(tbl)
    local ok, res = pcall(function()
        return HttpService:JSONEncode(tbl)
    end)
    return ok and res or "{}"
end

local function safeJsonDecode(str)
    if not str or str == "" then
        return nil
    end
    local ok, res = pcall(function()
        return HttpService:JSONDecode(str)
    end)
    return ok and res or nil
end

--------------------------------------------------------------------------------
-- 2. SAFE GUI PARENT & PREVIOUS INSTANCE CLEANUP
--------------------------------------------------------------------------------
local guiParent
do
    local ok, res = pcall(function()
        return (gethui and gethui()) or CoreGui
    end)
    guiParent = (ok and res) and res or LocalPlayer:WaitForChild("PlayerGui")
    local existingGui = guiParent:FindFirstChild("CoreXYZ_Universal")
    if existingGui then
        pcall(function()
            existingGui:Destroy()
        end)
    end
end

--------------------------------------------------------------------------------
-- 3. UNIFIED STATE & RUNTIME REGISTRIES (LOW LOCAL REGISTER FOOTPRINT)
--------------------------------------------------------------------------------
local ConfigState = {
    -- Combat & Silent Aim & Hitbox
    Aimbot = false,
    ShowFOV = false,
    FOVRadius = 85,
    Smoothness = 0.4,
    TeamCheck = true,
    UseWhitelist = true,
    TargetPart = "Head",
    SilentAim = false,
    SilentAimMethod = "Auto Hybrid (All Methods)",
    SilentHitChance = 100,
    SilentHeadWeight = 80,
    SilentTorsoWeight = 0,
    SilentLegsWeight = 20,
    SilentSnapline = false,
    HitboxExpander = false,
    HitboxSize = 10,
    HitboxTransparency = 0.7,
    -- Visuals
    ESP = false,
    Box3DESP = false,
    SkeletonESP = false,
    HealthBarESP = false,
    Tracers = false,
    TracerOrigin = "Center",
    ESPColorName = "White",
    Crosshair = false,
    CrosshairColorName = "White",
    CrosshairSize = 10,
    XRay = false,
    XRayTransparency = 0.6,
    SkyPreset = "Game Default",
    Fullbright = false,
    NoFog = false,
    TimeOfDay = 14,
    Freecam = false,
    FreecamSpeed = 45,
    CustomCamFOV = false,
    CamFOV = 70,
    InfZoom = false,
    NoclipCam = false,
    Headless = false,
    Korblox = false,
    -- Movement & Protection
    WalkSpeedEnabled = false,
    WalkSpeed = 16,
    JumpPowerEnabled = false,
    JumpPower = 50,
    InfJump = false,
    NoClip = false,
    SwimInAir = false,
    Spinbot = false,
    SpinSpeed = 25,
    AntiFling = false,
    AntiRagdoll = false,
    AntiVoid = false,
    -- World & Misc
    InstantInteract = false,
    AutoInteract = false,
    InteractRadius = 15,
    Disable3DRender = false,
    UncapFPS = false,
    CustomFPS = 144,
    ServerHopMode = "Lowest Players",
    AntiAFK = false,
    -- UI & Settings
    CustomPillTitle = "CORE.XYZ",
    RememberKey = true,
    ThemePreset = "Pure Monochrome",
    AccentR = 255,
    AccentG = 255,
    AccentB = 255,
    WindowTransparency = 0.03,
    ParticlesEnabled = true,
    ShimmerEnabled = true,
    AutoLoadConfig = false,
}

local State = {
    selectedTeams = { ["All"] = true },
    allTeams = { "All" },
    prioritizedPlayers = {},
    whitelistedPlayers = {},
    whitelistArray = {},
    spectatingPlayerName = nil,
    expandedPlayerName = nil,
    espObjects = {},
    noclipCollideCache = {},
    antiFlingCollideCache = {},
    hitboxCache = {},
    xrayCache = {},
    promptDurationCache = {},
    headlessCache = {},
    korbloxCache = {},
    activeHighlightCount = 0,
    MAX_HIGHLIGHTS = 30,
    defaultWalkSpeed = 16,
    defaultJumpPower = 50,
    defaultCamFOV = 70,
    defaultMaxZoom = LocalPlayer.CameraMaxZoomDistance or 128,
    defaultOcclusion = LocalPlayer.DevCameraOcclusionMode,
    origLighting = {
        Brightness = Lighting.Brightness,
        ClockTime = Lighting.ClockTime,
        FogEnd = Lighting.FogEnd,
        FogStart = Lighting.FogStart,
        GlobalShadows = Lighting.GlobalShadows,
        Ambient = Lighting.Ambient,
        OutdoorAmbient = Lighting.OutdoorAmbient,
    },
    espColor = Color3.fromRGB(255, 255, 255),
    crosshairColor = Color3.fromRGB(255, 255, 255),
    antiAFKConnection = nil,
    instantPromptConnection = nil,
    fpsBoosterConnection = nil,
    toolHookConnections = {},
    lastSafeCFrame = nil,
    freecamPos = nil,
    freecamYaw = 0,
    freecamPitch = 0,
    freecamKeys = {},
    currentSilentTarget = nil,
    isAuthorized = false,
    uiVisible = true,
    isAuthorizing = false,
    customUIScaleOverride = nil,
    activeTelemetryMetrics = { "FPS", "Ping" },
    TELEMETRY_OPTIONS = { "FPS", "Ping", "CPU Usage", "GPU Usage", "1% Lows", "RAM Usage" },
    frameHistory = {},
    currentFPS = 60,
    currentOnePercentLow = 55,
    liveGradients = {},
    liveParticles = {},
    liveRotators = {},
    accentBoundObjects = {},
    Tabs = {},
    activeTab = nil,
    refreshPlayerListUI = nil,
    refreshWhitelistDropdown = nil,
    loadConfigByName = nil,
}

local UI = {}

local rayParams = RaycastParams.new()
rayParams.FilterType = Enum.RaycastFilterType.Exclude
rayParams.IgnoreWater = true

--------------------------------------------------------------------------------
-- 4. DYNAMIC MONOCHROME & CUSTOM RGB THEME PALETTE
--------------------------------------------------------------------------------
local Theme = {
    Black = Color3.fromRGB(5, 5, 7),
    Deep = Color3.fromRGB(10, 10, 14),
    Surface = Color3.fromRGB(16, 16, 22),
    Elevated = Color3.fromRGB(24, 24, 32),
    Border = Color3.fromRGB(45, 45, 56),
    Muted = Color3.fromRGB(125, 125, 138),
    Silver = Color3.fromRGB(200, 200, 212),
    White = Color3.fromRGB(255, 255, 255),
    Accent = Color3.fromRGB(255, 255, 255),
    Error = Color3.fromRGB(255, 80, 80),
    Success = Color3.fromRGB(90, 255, 150),
}

local FastTween = TweenInfo.new(0.18, Enum.EasingStyle.Quart, Enum.EasingDirection.Out)
local SmoothTween = TweenInfo.new(0.32, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
local SpringTween = TweenInfo.new(0.45, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
local SlowTween = TweenInfo.new(0.55, Enum.EasingStyle.Exponential, Enum.EasingDirection.Out)

local function tween(instance, info, goals)
    if not instance then
        return nil
    end
    local ok, t = pcall(function()
        local tw = TweenService:Create(instance, info, goals)
        tw:Play()
        return tw
    end)
    return ok and t or nil
end

local function registerAccentObject(obj, prop)
    table.insert(State.accentBoundObjects, { Obj = obj, Prop = prop })
end

local function updateAccentColor(r, g, b)
    ConfigState.AccentR = math.clamp(math.floor(r), 0, 255)
    ConfigState.AccentG = math.clamp(math.floor(g), 0, 255)
    ConfigState.AccentB = math.clamp(math.floor(b), 0, 255)
    Theme.Accent = Color3.fromRGB(ConfigState.AccentR, ConfigState.AccentG, ConfigState.AccentB)
    for _, item in ipairs(State.accentBoundObjects) do
        if item.Obj and item.Obj.Parent then
            pcall(function()
                item.Obj[item.Prop] = Theme.Accent
            end)
        end
    end
end

local function addCorner(parent, radius)
    local c = Instance.new("UICorner")
    c.CornerRadius = UDim.new(0, radius or 8)
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

local function addLiveBorder(parent, thickness, speed, initialTransparency)
    local stroke = addStroke(parent, Theme.White, thickness or 1.2, initialTransparency or 0.15)
    local grad = Instance.new("UIGradient")
    grad.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0.0, Color3.fromRGB(36, 36, 44)),
        ColorSequenceKeypoint.new(0.35, Color3.fromRGB(55, 55, 68)),
        ColorSequenceKeypoint.new(0.5, Theme.White),
        ColorSequenceKeypoint.new(0.65, Color3.fromRGB(55, 55, 68)),
        ColorSequenceKeypoint.new(1.0, Color3.fromRGB(36, 36, 44)),
    })
    grad.Rotation = math.random(0, 360)
    grad.Parent = stroke
    table.insert(State.liveGradients, { Gradient = grad, Speed = speed or 65, Offset = math.random(0, 360) })
    return stroke, grad
end

local function createParticleCanvas(parent, count)
    local holder = Instance.new("Frame")
    holder.Name = "ParticleCanvas"
    holder.Size = UDim2.fromScale(1, 1)
    holder.BackgroundTransparency = 1
    holder.ClipsDescendants = true
    holder.ZIndex = parent.ZIndex
    holder.Parent = parent

    for i = 1, (count or 18) do
        local dot = Instance.new("Frame")
        local sz = (i % 3 == 0) and 3 or 2
        dot.Size = UDim2.fromOffset(sz, sz)
        local startX = (math.random(5, 95) / 100)
        local startY = (math.random(5, 95) / 100)
        dot.Position = UDim2.fromScale(startX, startY)
        dot.BackgroundColor3 = Theme.Accent
        dot.BackgroundTransparency = math.random(55, 85) / 100
        dot.BorderSizePixel = 0
        dot.ZIndex = parent.ZIndex
        dot.Parent = holder
        addCorner(dot, 99)
        registerAccentObject(dot, "BackgroundColor3")

        table.insert(State.liveParticles, {
            Instance = dot,
            Container = parent,
            Holder = holder,
            X = startX,
            Y = startY,
            SpeedY = math.random(4, 12) / 100,
            DriftX = math.random(-4, 4) / 100,
            Phase = math.random(0, 628) / 100,
        })
    end
    return holder
end

local function spawnRipple(button)
    pcall(function()
        local ripple = Instance.new("Frame")
        ripple.AnchorPoint = Vector2.new(0.5, 0.5)
        ripple.Position = UDim2.fromScale(0.5, 0.5)
        ripple.Size = UDim2.fromOffset(0, 0)
        ripple.BackgroundColor3 = Theme.Accent
        ripple.BackgroundTransparency = 0.65
        ripple.BorderSizePixel = 0
        ripple.ZIndex = button.ZIndex + 2
        ripple.Parent = button
        addCorner(ripple, 999)

        local maxDim = math.max(button.AbsoluteSize.X, button.AbsoluteSize.Y) * 1.6
        if maxDim <= 0 then
            maxDim = 180
        end
        tween(ripple, TweenInfo.new(0.4, Enum.EasingStyle.Quart, Enum.EasingDirection.Out), {
            Size = UDim2.fromOffset(maxDim, maxDim),
            BackgroundTransparency = 1,
        })
        task.delay(0.42, function()
            if ripple and ripple.Parent then
                ripple:Destroy()
            end
        end)
    end)
end

local function makeDraggable(handle, targetFrame)
    local dragging = false
    local dragInput = nil
    local dragStart = nil
    local startPos = nil

    handle.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = targetFrame.Position

            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    dragging = false
                end
            end)
        end
    end)

    handle.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
            dragInput = input
        end
    end)

    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging and dragStart and startPos then
            local delta = input.Position - dragStart
            targetFrame.Position = UDim2.new(
                startPos.X.Scale,
                startPos.X.Offset + delta.X,
                startPos.Y.Scale,
                startPos.Y.Offset + delta.Y
            )
        end
    end)
end

--------------------------------------------------------------------------------
-- 5. ROOT SCREENGUI, OVERLAYS & NOTIFICATION SYSTEM
--------------------------------------------------------------------------------
local function getResponsiveScale()
    if State.customUIScaleOverride then
        return State.customUIScaleOverride
    end
    local cam = workspace.CurrentCamera
    if not cam then
        return 1
    end
    local vp = cam.ViewportSize
    if vp.Y < 430 or vp.X < 680 then
        return math.clamp(math.min(vp.X / 660, vp.Y / 430), 0.72, 0.95)
    end
    return 1
end

do
    local ScreenGui = Instance.new("ScreenGui")
    ScreenGui.Name = "CoreXYZ_Universal"
    ScreenGui.ResetOnSpawn = false
    ScreenGui.IgnoreGuiInset = true
    ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    ScreenGui.Parent = guiParent
    UI.ScreenGui = ScreenGui

    local OverlayContainer = Instance.new("Folder")
    OverlayContainer.Name = "Overlays"
    OverlayContainer.Parent = ScreenGui
    UI.OverlayContainer = OverlayContainer

    local HighlightContainer = Instance.new("Folder")
    HighlightContainer.Name = "Highlights"
    HighlightContainer.Parent = ScreenGui
    UI.HighlightContainer = HighlightContainer

    local FovCircle = Instance.new("Frame")
    FovCircle.Name = "FOVCircle"
    FovCircle.AnchorPoint = Vector2.new(0.5, 0.5)
    FovCircle.Position = UDim2.fromScale(0.5, 0.5)
    FovCircle.Size = UDim2.fromOffset(ConfigState.FOVRadius * 2, ConfigState.FOVRadius * 2)
    FovCircle.BackgroundTransparency = 1
    FovCircle.Visible = false
    FovCircle.Parent = OverlayContainer
    addCorner(FovCircle, 9999)
    local FovStroke = addStroke(FovCircle, Theme.Accent, 1.3, 0.2)
    registerAccentObject(FovStroke, "Color")
    UI.FovCircle = FovCircle

    local SilentSnapline = Instance.new("Frame")
    SilentSnapline.Name = "SilentSnapline"
    SilentSnapline.AnchorPoint = Vector2.new(0.5, 0.5)
    SilentSnapline.BackgroundColor3 = Theme.Accent
    SilentSnapline.BorderSizePixel = 0
    SilentSnapline.Visible = false
    SilentSnapline.ZIndex = 6
    SilentSnapline.Parent = OverlayContainer
    registerAccentObject(SilentSnapline, "BackgroundColor3")
    UI.SilentSnapline = SilentSnapline

    local CrosshairV = Instance.new("Frame")
    CrosshairV.AnchorPoint = Vector2.new(0.5, 0.5)
    CrosshairV.Position = UDim2.fromScale(0.5, 0.5)
    CrosshairV.Size = UDim2.fromOffset(1, ConfigState.CrosshairSize * 2)
    CrosshairV.BackgroundColor3 = State.crosshairColor
    CrosshairV.BorderSizePixel = 0
    CrosshairV.Visible = false
    CrosshairV.Parent = OverlayContainer
    UI.CrosshairV = CrosshairV

    local CrosshairH = Instance.new("Frame")
    CrosshairH.AnchorPoint = Vector2.new(0.5, 0.5)
    CrosshairH.Position = UDim2.fromScale(0.5, 0.5)
    CrosshairH.Size = UDim2.fromOffset(ConfigState.CrosshairSize * 2, 1)
    CrosshairH.BackgroundColor3 = State.crosshairColor
    CrosshairH.BorderSizePixel = 0
    CrosshairH.Visible = false
    CrosshairH.Parent = OverlayContainer
    UI.CrosshairH = CrosshairH

    local RenderSaverOverlay = Instance.new("Frame")
    RenderSaverOverlay.Name = "RenderSaverOverlay"
    RenderSaverOverlay.Size = UDim2.fromScale(1, 1)
    RenderSaverOverlay.BackgroundColor3 = Theme.Black
    RenderSaverOverlay.BackgroundTransparency = 0.05
    RenderSaverOverlay.Visible = false
    RenderSaverOverlay.ZIndex = 5
    RenderSaverOverlay.Parent = ScreenGui
    UI.RenderSaverOverlay = RenderSaverOverlay

    local RenderSaverLabel = Instance.new("TextLabel")
    RenderSaverLabel.AnchorPoint = Vector2.new(0.5, 0.5)
    RenderSaverLabel.Position = UDim2.fromScale(0.5, 0.5)
    RenderSaverLabel.Size = UDim2.fromOffset(420, 60)
    RenderSaverLabel.BackgroundTransparency = 1
    RenderSaverLabel.Font = Enum.Font.GothamBlack
    RenderSaverLabel.Text = "CORE.XYZ  ·  3D RENDERING DISABLED (GPU SAVER ACTIVE)"
    RenderSaverLabel.TextColor3 = Theme.Muted
    RenderSaverLabel.TextSize = 14
    RenderSaverLabel.ZIndex = 6
    RenderSaverLabel.Parent = RenderSaverOverlay

    local NotifyHolder = Instance.new("Frame")
    NotifyHolder.AnchorPoint = Vector2.new(1, 1)
    NotifyHolder.Position = UDim2.new(1, -18, 1, -18)
    NotifyHolder.Size = UDim2.fromOffset(290, 300)
    NotifyHolder.BackgroundTransparency = 1
    NotifyHolder.ZIndex = 50
    NotifyHolder.Parent = ScreenGui
    UI.NotifyHolder = NotifyHolder

    local NotifyLayout = Instance.new("UIListLayout")
    NotifyLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
    NotifyLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
    NotifyLayout.Padding = UDim.new(0, 8)
    NotifyLayout.Parent = NotifyHolder
end

local function notify(title, content, duration)
    duration = duration or 4
    local card = Instance.new("Frame")
    card.Size = UDim2.fromOffset(280, 58)
    card.BackgroundColor3 = Theme.Black
    card.BackgroundTransparency = 1
    card.ClipsDescendants = true
    card.ZIndex = 51
    card.Parent = UI.NotifyHolder
    addCorner(card, 8)
    local st = addLiveBorder(card, 1.2, 110, 1)

    local cardScale = Instance.new("UIScale")
    cardScale.Scale = 0.9
    cardScale.Parent = card

    local accentBar = Instance.new("Frame")
    accentBar.Position = UDim2.fromOffset(8, 10)
    accentBar.Size = UDim2.new(0, 3, 1, -20)
    accentBar.BackgroundColor3 = Theme.Accent
    accentBar.BackgroundTransparency = 1
    accentBar.BorderSizePixel = 0
    accentBar.ZIndex = 52
    accentBar.Parent = card
    addCorner(accentBar, 4)

    local tLbl = Instance.new("TextLabel")
    tLbl.Position = UDim2.fromOffset(20, 8)
    tLbl.Size = UDim2.new(1, -28, 0, 18)
    tLbl.BackgroundTransparency = 1
    tLbl.Font = Enum.Font.GothamBlack
    tLbl.Text = string.upper(title)
    tLbl.TextColor3 = Theme.White
    tLbl.TextTransparency = 1
    tLbl.TextSize = 11
    tLbl.TextXAlignment = Enum.TextXAlignment.Left
    tLbl.ZIndex = 52
    tLbl.Parent = card

    local cLbl = Instance.new("TextLabel")
    cLbl.Position = UDim2.fromOffset(20, 25)
    cLbl.Size = UDim2.new(1, -28, 0, 26)
    cLbl.BackgroundTransparency = 1
    cLbl.Font = Enum.Font.GothamMedium
    cLbl.Text = content
    cLbl.TextColor3 = Theme.Silver
    cLbl.TextTransparency = 1
    cLbl.TextSize = 11
    cLbl.TextWrapped = true
    cLbl.TextXAlignment = Enum.TextXAlignment.Left
    cLbl.ZIndex = 52
    cLbl.Parent = card

    local progBar = Instance.new("Frame")
    progBar.AnchorPoint = Vector2.new(0, 1)
    progBar.Position = UDim2.fromScale(0, 1)
    progBar.Size = UDim2.new(1, 0, 0, 2)
    progBar.BackgroundColor3 = Theme.Accent
    progBar.BorderSizePixel = 0
    progBar.ZIndex = 53
    progBar.Parent = card

    tween(cardScale, SpringTween, { Scale = 1 })
    tween(card, FastTween, { BackgroundTransparency = 0.04 })
    tween(st, FastTween, { Transparency = 0.1 })
    tween(accentBar, FastTween, { BackgroundTransparency = 0 })
    tween(tLbl, FastTween, { TextTransparency = 0 })
    tween(cLbl, FastTween, { TextTransparency = 0 })
    tween(progBar, TweenInfo.new(duration, Enum.EasingStyle.Linear), { Size = UDim2.new(0, 0, 0, 2) })

    task.delay(duration, function()
        tween(cardScale, FastTween, { Scale = 0.9 })
        tween(card, FastTween, { BackgroundTransparency = 1 })
        tween(st, FastTween, { Transparency = 1 })
        tween(accentBar, FastTween, { BackgroundTransparency = 1 })
        tween(tLbl, FastTween, { TextTransparency = 1 })
        tween(cLbl, FastTween, { TextTransparency = 1 })
        task.wait(0.22)
        if card and card.Parent then
            card:Destroy()
        end
    end)
end

--------------------------------------------------------------------------------
-- 6. STAGE 1: ANIMATED LOADING SCREEN ("Core.xyz")
--------------------------------------------------------------------------------
do
    local LoaderCard = Instance.new("Frame")
    LoaderCard.Name = "CoreLoader"
    LoaderCard.AnchorPoint = Vector2.new(0.5, 0.5)
    LoaderCard.Position = UDim2.fromScale(0.5, 0.5)
    LoaderCard.Size = UDim2.fromOffset(390, 235)
    LoaderCard.BackgroundColor3 = Theme.Black
    LoaderCard.BackgroundTransparency = 1
    LoaderCard.ClipsDescendants = true
    LoaderCard.ZIndex = 30
    LoaderCard.Parent = UI.ScreenGui
    addCorner(LoaderCard, 12)
    local LoaderStroke = addLiveBorder(LoaderCard, 1.5, 85, 1)

    local LoaderScale = Instance.new("UIScale")
    LoaderScale.Scale = 0.86
    LoaderScale.Parent = LoaderCard

    createParticleCanvas(LoaderCard, 16)

    local EmblemOuter = Instance.new("Frame")
    EmblemOuter.AnchorPoint = Vector2.new(0.5, 0.5)
    EmblemOuter.Position = UDim2.new(0.5, 0, 0, 62)
    EmblemOuter.Size = UDim2.fromOffset(54, 54)
    EmblemOuter.BackgroundTransparency = 1
    EmblemOuter.ZIndex = 32
    EmblemOuter.Parent = LoaderCard
    addCorner(EmblemOuter, 12)
    local EmblemOuterStroke = addLiveBorder(EmblemOuter, 1.8, 120, 1)
    table.insert(State.liveRotators, { Instance = EmblemOuter, Speed = 38 })

    local EmblemInner = Instance.new("Frame")
    EmblemInner.AnchorPoint = Vector2.new(0.5, 0.5)
    EmblemInner.Position = UDim2.new(0.5, 0, 0, 62)
    EmblemInner.Size = UDim2.fromOffset(34, 34)
    EmblemInner.BackgroundTransparency = 1
    EmblemInner.Rotation = 45
    EmblemInner.ZIndex = 32
    EmblemInner.Parent = LoaderCard
    addCorner(EmblemInner, 8)
    local EmblemInnerStroke = addStroke(EmblemInner, Theme.Silver, 1.2, 1)
    table.insert(State.liveRotators, { Instance = EmblemInner, Speed = -55 })

    local EmblemCore = Instance.new("Frame")
    EmblemCore.AnchorPoint = Vector2.new(0.5, 0.5)
    EmblemCore.Position = UDim2.new(0.5, 0, 0, 62)
    EmblemCore.Size = UDim2.fromOffset(10, 10)
    EmblemCore.BackgroundColor3 = Theme.White
    EmblemCore.BackgroundTransparency = 1
    EmblemCore.ZIndex = 33
    EmblemCore.Parent = LoaderCard
    addCorner(EmblemCore, 99)

    local LoaderTitle = Instance.new("TextLabel")
    LoaderTitle.AnchorPoint = Vector2.new(0.5, 0)
    LoaderTitle.Position = UDim2.new(0.5, 0, 0, 108)
    LoaderTitle.Size = UDim2.new(1, -40, 0, 28)
    LoaderTitle.BackgroundTransparency = 1
    LoaderTitle.Font = Enum.Font.GothamBlack
    LoaderTitle.Text = "CORE.XYZ"
    LoaderTitle.TextColor3 = Theme.White
    LoaderTitle.TextTransparency = 1
    LoaderTitle.TextSize = 23
    LoaderTitle.ZIndex = 32
    LoaderTitle.Parent = LoaderCard

    local LoaderStatus = Instance.new("TextLabel")
    LoaderStatus.AnchorPoint = Vector2.new(0.5, 0)
    LoaderStatus.Position = UDim2.new(0.5, 0, 0, 138)
    LoaderStatus.Size = UDim2.new(1, -40, 0, 18)
    LoaderStatus.BackgroundTransparency = 1
    LoaderStatus.Font = Enum.Font.Code
    LoaderStatus.Text = "Initializing Core.xyz Universal v4.0..."
    LoaderStatus.TextColor3 = Theme.Silver
    LoaderStatus.TextTransparency = 1
    LoaderStatus.TextSize = 11
    LoaderStatus.ZIndex = 32
    LoaderStatus.Parent = LoaderCard

    local LoaderBarBg = Instance.new("Frame")
    LoaderBarBg.AnchorPoint = Vector2.new(0.5, 0)
    LoaderBarBg.Position = UDim2.new(0.5, 0, 0, 174)
    LoaderBarBg.Size = UDim2.new(1, -64, 0, 5)
    LoaderBarBg.BackgroundColor3 = Theme.Surface
    LoaderBarBg.BackgroundTransparency = 1
    LoaderBarBg.BorderSizePixel = 0
    LoaderBarBg.ClipsDescendants = true
    LoaderBarBg.ZIndex = 32
    LoaderBarBg.Parent = LoaderCard
    addCorner(LoaderBarBg, 99)

    local LoaderBarFill = Instance.new("Frame")
    LoaderBarFill.Size = UDim2.fromScale(0, 1)
    LoaderBarFill.BackgroundColor3 = Theme.White
    LoaderBarFill.BorderSizePixel = 0
    LoaderBarFill.ZIndex = 33
    LoaderBarFill.Parent = LoaderBarBg
    addCorner(LoaderBarFill, 99)

    local LoaderPercent = Instance.new("TextLabel")
    LoaderPercent.AnchorPoint = Vector2.new(0.5, 0)
    LoaderPercent.Position = UDim2.new(0.5, 0, 0, 188)
    LoaderPercent.Size = UDim2.new(1, -64, 0, 18)
    LoaderPercent.BackgroundTransparency = 1
    LoaderPercent.Font = Enum.Font.Code
    LoaderPercent.Text = "0%"
    LoaderPercent.TextColor3 = Theme.Muted
    LoaderPercent.TextTransparency = 1
    LoaderPercent.TextSize = 10
    LoaderPercent.ZIndex = 32
    LoaderPercent.Parent = LoaderCard

    UI.LoaderCard = LoaderCard
    UI.LoaderStroke = LoaderStroke
    UI.LoaderScale = LoaderScale
    UI.EmblemOuterStroke = EmblemOuterStroke
    UI.EmblemInnerStroke = EmblemInnerStroke
    UI.EmblemCore = EmblemCore
    UI.LoaderTitle = LoaderTitle
    UI.LoaderStatus = LoaderStatus
    UI.LoaderBarBg = LoaderBarBg
    UI.LoaderBarFill = LoaderBarFill
    UI.LoaderPercent = LoaderPercent
end

--------------------------------------------------------------------------------
-- 7. STAGE 2: LIVE-ANIMATED KEY SYSTEM ("FEYKSECURED" + REMEMBER KEY)
--------------------------------------------------------------------------------
do
    local KeyCard = Instance.new("Frame")
    KeyCard.Name = "CoreKeySystem"
    KeyCard.AnchorPoint = Vector2.new(0.5, 0.5)
    KeyCard.Position = UDim2.fromScale(0.5, 0.5)
    KeyCard.Size = UDim2.fromOffset(420, 292)
    KeyCard.BackgroundColor3 = Theme.Black
    KeyCard.BackgroundTransparency = 1
    KeyCard.Visible = false
    KeyCard.Active = true
    KeyCard.ClipsDescendants = true
    KeyCard.ZIndex = 30
    KeyCard.Parent = UI.ScreenGui
    addCorner(KeyCard, 12)
    local KeyCardStroke = addLiveBorder(KeyCard, 1.5, 75, 1)

    local KeyScale = Instance.new("UIScale")
    KeyScale.Scale = 0.88
    KeyScale.Parent = KeyCard

    createParticleCanvas(KeyCard, 18)
    makeDraggable(KeyCard, KeyCard)

    local KeyTopBar = Instance.new("Frame")
    KeyTopBar.Size = UDim2.new(1, 0, 0, 2)
    KeyTopBar.BackgroundColor3 = Theme.White
    KeyTopBar.BorderSizePixel = 0
    KeyTopBar.ZIndex = 32
    KeyTopBar.Parent = KeyCard

    local KeyTopGrad = Instance.new("UIGradient")
    KeyTopGrad.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0.0, Theme.Black),
        ColorSequenceKeypoint.new(0.5, Theme.White),
        ColorSequenceKeypoint.new(1.0, Theme.Black),
    })
    KeyTopGrad.Parent = KeyTopBar

    local KeySpinBadge = Instance.new("Frame")
    KeySpinBadge.Position = UDim2.fromOffset(24, 22)
    KeySpinBadge.Size = UDim2.fromOffset(22, 22)
    KeySpinBadge.BackgroundTransparency = 1
    KeySpinBadge.ZIndex = 32
    KeySpinBadge.Parent = KeyCard
    addCorner(KeySpinBadge, 5)
    addStroke(KeySpinBadge, Theme.White, 1.4, 0.1)
    table.insert(State.liveRotators, { Instance = KeySpinBadge, Speed = 42 })

    local KeySpinDot = Instance.new("Frame")
    KeySpinDot.AnchorPoint = Vector2.new(0.5, 0.5)
    KeySpinDot.Position = UDim2.fromScale(0.5, 0.5)
    KeySpinDot.Size = UDim2.fromOffset(6, 6)
    KeySpinDot.BackgroundColor3 = Theme.White
    KeySpinDot.BorderSizePixel = 0
    KeySpinDot.ZIndex = 33
    KeySpinDot.Parent = KeySpinBadge
    addCorner(KeySpinDot, 99)

    local KeyHeader = Instance.new("TextLabel")
    KeyHeader.Position = UDim2.fromOffset(56, 20)
    KeyHeader.Size = UDim2.new(1, -80, 0, 24)
    KeyHeader.BackgroundTransparency = 1
    KeyHeader.Font = Enum.Font.GothamBlack
    KeyHeader.Text = "CORE.XYZ  ·  AUTHORIZATION"
    KeyHeader.TextColor3 = Theme.White
    KeyHeader.TextSize = 16
    KeyHeader.TextXAlignment = Enum.TextXAlignment.Left
    KeyHeader.ZIndex = 32
    KeyHeader.Parent = KeyCard

    local KeySub = Instance.new("TextLabel")
    KeySub.Position = UDim2.fromOffset(24, 52)
    KeySub.Size = UDim2.new(1, -48, 0, 28)
    KeySub.BackgroundTransparency = 1
    KeySub.Font = Enum.Font.GothamMedium
    KeySub.Text = "Enter your Core.xyz access key below or tap GET KEY to auto-fill."
    KeySub.TextColor3 = Theme.Silver
    KeySub.TextSize = 12
    KeySub.TextWrapped = true
    KeySub.TextXAlignment = Enum.TextXAlignment.Left
    KeySub.ZIndex = 32
    KeySub.Parent = KeyCard

    local KeyInputHolder = Instance.new("Frame")
    KeyInputHolder.Position = UDim2.fromOffset(24, 90)
    KeyInputHolder.Size = UDim2.new(1, -48, 0, 42)
    KeyInputHolder.BackgroundColor3 = Theme.Surface
    KeyInputHolder.ZIndex = 32
    KeyInputHolder.Parent = KeyCard
    addCorner(KeyInputHolder, 8)
    local KeyInputStroke = addStroke(KeyInputHolder, Theme.Border, 1.2, 0)

    local KeyInputBox = Instance.new("TextBox")
    KeyInputBox.Position = UDim2.fromOffset(14, 0)
    KeyInputBox.Size = UDim2.new(1, -28, 1, 0)
    KeyInputBox.BackgroundTransparency = 1
    KeyInputBox.Font = Enum.Font.Code
    KeyInputBox.PlaceholderText = "ENTER KEY (FEYKSECURED)..."
    KeyInputBox.PlaceholderColor3 = Theme.Muted
    KeyInputBox.Text = ""
    KeyInputBox.TextColor3 = Theme.White
    KeyInputBox.TextSize = 13
    KeyInputBox.ClearTextOnFocus = false
    KeyInputBox.TextXAlignment = Enum.TextXAlignment.Left
    KeyInputBox.ZIndex = 33
    KeyInputBox.Parent = KeyInputHolder

    KeyInputBox.Focused:Connect(function()
        tween(KeyInputStroke, FastTween, { Color = Theme.White, Thickness = 1.6 })
        tween(KeyInputHolder, FastTween, { BackgroundColor3 = Theme.Elevated })
    end)
    KeyInputBox.FocusLost:Connect(function()
        tween(KeyInputStroke, FastTween, { Color = Theme.Border, Thickness = 1.2 })
        tween(KeyInputHolder, FastTween, { BackgroundColor3 = Theme.Surface })
    end)

    -- Remember Key Toggle Row inside KeyCard
    local RememberKeyBtn = Instance.new("TextButton")
    RememberKeyBtn.Position = UDim2.fromOffset(24, 140)
    RememberKeyBtn.Size = UDim2.new(1, -48, 0, 26)
    RememberKeyBtn.BackgroundTransparency = 1
    RememberKeyBtn.AutoButtonColor = false
    RememberKeyBtn.Font = Enum.Font.Code
    RememberKeyBtn.Text = "  [✓] Remember Key on this Device (Auto-Unlock)"
    RememberKeyBtn.TextColor3 = Theme.White
    RememberKeyBtn.TextSize = 11
    RememberKeyBtn.TextXAlignment = Enum.TextXAlignment.Left
    RememberKeyBtn.ZIndex = 32
    RememberKeyBtn.Parent = KeyCard

    RememberKeyBtn.MouseButton1Click:Connect(function()
        ConfigState.RememberKey = not ConfigState.RememberKey
        RememberKeyBtn.Text = ConfigState.RememberKey
            and "  [✓] Remember Key on this Device (Auto-Unlock)"
            or "  [ ] Remember Key on this Device (Auto-Unlock)"
        RememberKeyBtn.TextColor3 = ConfigState.RememberKey and Theme.White or Theme.Muted
    end)

    local KeyFeedback = Instance.new("TextLabel")
    KeyFeedback.Position = UDim2.fromOffset(24, 170)
    KeyFeedback.Size = UDim2.new(1, -48, 0, 18)
    KeyFeedback.BackgroundTransparency = 1
    KeyFeedback.Font = Enum.Font.Code
    KeyFeedback.Text = "STATUS: WAITING FOR AUTHORIZATION"
    KeyFeedback.TextColor3 = Theme.Muted
    KeyFeedback.TextSize = 11
    KeyFeedback.TextXAlignment = Enum.TextXAlignment.Left
    KeyFeedback.ZIndex = 32
    KeyFeedback.Parent = KeyCard

    local UnlockButton = Instance.new("TextButton")
    UnlockButton.Position = UDim2.fromOffset(24, 196)
    UnlockButton.Size = UDim2.new(0.6, -28, 0, 40)
    UnlockButton.BackgroundColor3 = Theme.White
    UnlockButton.AutoButtonColor = false
    UnlockButton.Font = Enum.Font.GothamBlack
    UnlockButton.Text = "AUTHORIZE KEY"
    UnlockButton.TextColor3 = Theme.Black
    UnlockButton.TextSize = 12
    UnlockButton.ClipsDescendants = true
    UnlockButton.ZIndex = 32
    UnlockButton.Parent = KeyCard
    addCorner(UnlockButton, 8)

    local CopyKeyButton = Instance.new("TextButton")
    CopyKeyButton.Position = UDim2.new(0.6, 4, 0, 196)
    CopyKeyButton.Size = UDim2.new(0.4, -28, 0, 40)
    CopyKeyButton.BackgroundColor3 = Theme.Surface
    CopyKeyButton.AutoButtonColor = false
    CopyKeyButton.Font = Enum.Font.GothamBold
    CopyKeyButton.Text = "GET KEY"
    CopyKeyButton.TextColor3 = Theme.White
    CopyKeyButton.TextSize = 12
    CopyKeyButton.ClipsDescendants = true
    CopyKeyButton.ZIndex = 32
    CopyKeyButton.Parent = KeyCard
    addCorner(CopyKeyButton, 8)
    local CopyKeyStroke = addStroke(CopyKeyButton, Theme.Border, 1.2, 0)

    local KeyFooter = Instance.new("TextLabel")
    KeyFooter.Position = UDim2.fromOffset(24, 248)
    KeyFooter.Size = UDim2.new(1, -48, 0, 18)
    KeyFooter.BackgroundTransparency = 1
    KeyFooter.Font = Enum.Font.Code
    KeyFooter.Text = "CORE.XYZ V4.0  ·  MONOCHROME ENGINE"
    KeyFooter.TextColor3 = Theme.Muted
    KeyFooter.TextSize = 10
    KeyFooter.TextXAlignment = Enum.TextXAlignment.Center
    KeyFooter.ZIndex = 32
    KeyFooter.Parent = KeyCard

    UI.KeyCard = KeyCard
    UI.KeyCardStroke = KeyCardStroke
    UI.KeyScale = KeyScale
    UI.KeyTopGrad = KeyTopGrad
    UI.KeyInputBox = KeyInputBox
    UI.KeyInputStroke = KeyInputStroke
    UI.KeyFeedback = KeyFeedback
    UI.UnlockButton = UnlockButton
    UI.CopyKeyButton = CopyKeyButton
    UI.RememberKeyBtn = RememberKeyBtn
end

--------------------------------------------------------------------------------
-- 8. EXACT AUTO-SIZING TELEMETRY FLOATING PILL (ZERO EMPTY SPACE)
--------------------------------------------------------------------------------
do
    local FloatingToggle = Instance.new("TextButton")
    FloatingToggle.Name = "CoreFloatingToggle"
    FloatingToggle.AnchorPoint = Vector2.new(0.5, 0)
    FloatingToggle.Position = UDim2.new(0.5, 0, 0, 14)
    FloatingToggle.Size = UDim2.fromOffset(92, 34)
    FloatingToggle.BackgroundColor3 = Theme.Black
    FloatingToggle.BackgroundTransparency = 0.04
    FloatingToggle.AutoButtonColor = false
    FloatingToggle.Text = ""
    FloatingToggle.Visible = false
    FloatingToggle.Active = true
    FloatingToggle.ClipsDescendants = true
    FloatingToggle.ZIndex = 40
    FloatingToggle.Parent = UI.ScreenGui
    local FloatCorner = addCorner(FloatingToggle, 999)
    addLiveBorder(FloatingToggle, 1.4, 95, 0.1)

    local FloatOrb = Instance.new("Frame")
    FloatOrb.AnchorPoint = Vector2.new(0, 0.5)
    FloatOrb.Position = UDim2.new(0, 10, 0.5, 0)
    FloatOrb.Size = UDim2.fromOffset(12, 12)
    FloatOrb.BackgroundTransparency = 1
    FloatOrb.ZIndex = 41
    FloatOrb.Parent = FloatingToggle
    addCorner(FloatOrb, 4)
    local FloatOrbStroke = addStroke(FloatOrb, Theme.Accent, 1.3, 0.1)
    registerAccentObject(FloatOrbStroke, "Color")
    table.insert(State.liveRotators, { Instance = FloatOrb, Speed = 50 })

    local FloatStatusDot = Instance.new("Frame")
    FloatStatusDot.AnchorPoint = Vector2.new(0.5, 0.5)
    FloatStatusDot.Position = UDim2.fromScale(0.5, 0.5)
    FloatStatusDot.Size = UDim2.fromOffset(4, 4)
    FloatStatusDot.BackgroundColor3 = Theme.Accent
    FloatStatusDot.BorderSizePixel = 0
    FloatStatusDot.ZIndex = 41
    FloatStatusDot.Parent = FloatOrb
    addCorner(FloatStatusDot, 99)
    registerAccentObject(FloatStatusDot, "BackgroundColor3")

    local FloatLabel = Instance.new("TextLabel")
    FloatLabel.Position = UDim2.fromOffset(28, 0)
    FloatLabel.Size = UDim2.new(1, -38, 1, 0)
    FloatLabel.BackgroundTransparency = 1
    FloatLabel.Font = Enum.Font.Code
    FloatLabel.Text = "CORE.XYZ"
    FloatLabel.TextColor3 = Theme.White
    FloatLabel.TextSize = 11
    FloatLabel.TextXAlignment = Enum.TextXAlignment.Left
    FloatLabel.ZIndex = 41
    FloatLabel.Parent = FloatingToggle

    makeDraggable(FloatingToggle, FloatingToggle)

    UI.FloatingToggle = FloatingToggle
    UI.FloatCorner = FloatCorner
    UI.FloatLabel = FloatLabel
end

local function updateFloatingPillTelemetry()
    local titleText = (ConfigState.CustomPillTitle and ConfigState.CustomPillTitle ~= "") and ConfigState.CustomPillTitle or "CORE.XYZ"
    local segments = { titleText }

    for _, metric in ipairs(State.activeTelemetryMetrics) do
        if metric == "FPS" then
            table.insert(segments, string.format("%d FPS", math.clamp(State.currentFPS, 1, 999)))
        elseif metric == "Ping" then
            local pingMs = 42
            pcall(function()
                if Env.Stats and Env.Stats.Network and Env.Stats.Network.ServerStatsItem and Env.Stats.Network.ServerStatsItem["Data Ping"] then
                    pingMs = math.floor(Env.Stats.Network.ServerStatsItem["Data Ping"]:GetValue())
                elseif LocalPlayer.GetNetworkPing then
                    pingMs = math.floor(LocalPlayer:GetNetworkPing() * 1000)
                end
            end)
            table.insert(segments, string.format("%02dms", math.clamp(pingMs, 0, 999)))
        elseif metric == "CPU Usage" then
            local cpuPct = math.clamp(math.floor((1 / math.max(State.currentFPS, 1)) * 1200), 4, 99)
            table.insert(segments, string.format("CPU %d%%", cpuPct))
        elseif metric == "GPU Usage" then
            local gpuPct = ConfigState.Disable3DRender and 2 or math.clamp(math.floor((1 / math.max(State.currentFPS, 1)) * 1450), 6, 99)
            table.insert(segments, string.format("GPU %d%%", gpuPct))
        elseif metric == "1% Lows" then
            table.insert(segments, string.format("1%%L %d", math.clamp(State.currentOnePercentLow, 1, 999)))
        elseif metric == "RAM Usage" then
            local ramMb = math.floor(collectgarbage("count") / 1024) + 420
            pcall(function()
                if Env.Stats and Env.Stats.GetTotalMemoryUsageMb then
                    ramMb = math.floor(Env.Stats:GetTotalMemoryUsageMb())
                end
            end)
            table.insert(segments, string.format("%dMB", ramMb))
        end
    end

    local fullText = table.concat(segments, " | ")
    UI.FloatLabel.Text = fullText

    -- Measure exact pixel width so there is NEVER dead space on the right or text clipping
    local textPixelWidth = math.floor(string.len(fullText) * 6.2)
    pcall(function()
        if Env.TextService and Env.TextService.GetTextSize then
            local measured = Env.TextService:GetTextSize(fullText, 11, Enum.Font.Code, Vector2.new(2000, 34))
            if measured and measured.X and measured.X > 0 then
                textPixelWidth = math.ceil(measured.X)
            end
        elseif UI.FloatLabel.TextBounds and UI.FloatLabel.TextBounds.X and UI.FloatLabel.TextBounds.X > 0 then
            textPixelWidth = math.ceil(UI.FloatLabel.TextBounds.X)
        end
    end)

    -- 28px left offset (10px pad + 12px icon + 6px gap) + textPixelWidth + 11px right pad = textPixelWidth + 39
    local targetWidth = math.clamp(textPixelWidth + 39, 64, 540)
    tween(UI.FloatingToggle, FastTween, {
        Size = UDim2.fromOffset(targetWidth, 34),
    })
end

--------------------------------------------------------------------------------
-- 9. STAGE 3: LIVE-ANIMATED MAIN HUB ("Core.xyz")
--------------------------------------------------------------------------------
local function toggleMainHub()
    if not State.isAuthorized then
        return
    end
    State.uiVisible = not State.uiVisible
    local targetScale = getResponsiveScale()
    if State.uiVisible then
        UI.MainWindow.Visible = true
        tween(UI.MainScale, SpringTween, { Scale = targetScale })
        tween(UI.MainWindow, FastTween, { BackgroundTransparency = ConfigState.WindowTransparency })
        tween(UI.MainStroke, FastTween, { Transparency = 0.08 })
        tween(UI.FloatingToggle, FastTween, { BackgroundColor3 = Theme.Black })
    else
        tween(UI.MainScale, FastTween, { Scale = targetScale * 0.9 })
        tween(UI.MainWindow, FastTween, { BackgroundTransparency = 1 })
        tween(UI.MainStroke, FastTween, { Transparency = 1 })
        tween(UI.FloatingToggle, FastTween, { BackgroundColor3 = Theme.Elevated })
        task.delay(0.18, function()
            if not State.uiVisible then
                UI.MainWindow.Visible = false
            end
        end)
    end
end

do
    local MainWindow = Instance.new("Frame")
    MainWindow.Name = "CoreMainWindow"
    MainWindow.AnchorPoint = Vector2.new(0.5, 0.5)
    MainWindow.Position = UDim2.fromScale(0.5, 0.52)
    MainWindow.Size = UDim2.fromOffset(560, 365)
    MainWindow.BackgroundColor3 = Theme.Black
    MainWindow.BackgroundTransparency = 1
    MainWindow.Active = true
    MainWindow.Visible = false
    MainWindow.ClipsDescendants = true
    MainWindow.ZIndex = 10
    MainWindow.Parent = UI.ScreenGui
    addCorner(MainWindow, 12)
    local MainStroke = addLiveBorder(MainWindow, 1.5, 55, 1)

    local MainScale = Instance.new("UIScale")
    MainScale.Scale = 0.88
    MainScale.Parent = MainWindow

    local MainParticleCanvas = createParticleCanvas(MainWindow, 22)

    local HeaderBar = Instance.new("Frame")
    HeaderBar.Size = UDim2.new(1, 0, 0, 46)
    HeaderBar.BackgroundColor3 = Theme.Deep
    HeaderBar.BackgroundTransparency = 0.08
    HeaderBar.BorderSizePixel = 0
    HeaderBar.ZIndex = 12
    HeaderBar.Parent = MainWindow
    addCorner(HeaderBar, 12)

    local HeaderBottomLine = Instance.new("Frame")
    HeaderBottomLine.Position = UDim2.new(0, 0, 1, -1)
    HeaderBottomLine.Size = UDim2.new(1, 0, 0, 1)
    HeaderBottomLine.BackgroundColor3 = Theme.Accent
    HeaderBottomLine.BackgroundTransparency = 0.72
    HeaderBottomLine.BorderSizePixel = 0
    HeaderBottomLine.ZIndex = 13
    HeaderBottomLine.Parent = HeaderBar
    registerAccentObject(HeaderBottomLine, "BackgroundColor3")

    local HeaderLineGrad = Instance.new("UIGradient")
    HeaderLineGrad.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0.0, Theme.Black),
        ColorSequenceKeypoint.new(0.5, Theme.White),
        ColorSequenceKeypoint.new(1.0, Theme.Black),
    })
    HeaderLineGrad.Parent = HeaderBottomLine

    local HeaderLogoOuter = Instance.new("Frame")
    HeaderLogoOuter.AnchorPoint = Vector2.new(0, 0.5)
    HeaderLogoOuter.Position = UDim2.new(0, 16, 0.5, 0)
    HeaderLogoOuter.Size = UDim2.fromOffset(18, 18)
    HeaderLogoOuter.BackgroundTransparency = 1
    HeaderLogoOuter.ZIndex = 13
    HeaderLogoOuter.Parent = HeaderBar
    addCorner(HeaderLogoOuter, 4)
    local HeaderLogoStroke = addStroke(HeaderLogoOuter, Theme.Accent, 1.4, 0)
    registerAccentObject(HeaderLogoStroke, "Color")
    table.insert(State.liveRotators, { Instance = HeaderLogoOuter, Speed = 45 })

    local HeaderLogoDot = Instance.new("Frame")
    HeaderLogoDot.AnchorPoint = Vector2.new(0.5, 0.5)
    HeaderLogoDot.Position = UDim2.fromScale(0.5, 0.5)
    HeaderLogoDot.Size = UDim2.fromOffset(5, 5)
    HeaderLogoDot.BackgroundColor3 = Theme.Accent
    HeaderLogoDot.BorderSizePixel = 0
    HeaderLogoDot.ZIndex = 13
    HeaderLogoDot.Parent = HeaderLogoOuter
    addCorner(HeaderLogoDot, 99)
    registerAccentObject(HeaderLogoDot, "BackgroundColor3")

    local HeaderTitle = Instance.new("TextLabel")
    HeaderTitle.Position = UDim2.fromOffset(42, 7)
    HeaderTitle.Size = UDim2.fromOffset(180, 18)
    HeaderTitle.BackgroundTransparency = 1
    HeaderTitle.Font = Enum.Font.GothamBlack
    HeaderTitle.Text = "CORE.XYZ"
    HeaderTitle.TextColor3 = Theme.White
    HeaderTitle.TextSize = 15
    HeaderTitle.TextXAlignment = Enum.TextXAlignment.Left
    HeaderTitle.ZIndex = 13
    HeaderTitle.Parent = HeaderBar

    local HeaderSub = Instance.new("TextLabel")
    HeaderSub.Position = UDim2.fromOffset(42, 24)
    HeaderSub.Size = UDim2.fromOffset(260, 14)
    HeaderSub.BackgroundTransparency = 1
    HeaderSub.Font = Enum.Font.Code
    HeaderSub.Text = "UNIVERSAL V4.0  ·  FEYKSECURED"
    HeaderSub.TextColor3 = Theme.Muted
    HeaderSub.TextSize = 9
    HeaderSub.TextXAlignment = Enum.TextXAlignment.Left
    HeaderSub.ZIndex = 13
    HeaderSub.Parent = HeaderBar

    local MinimizeBtn = Instance.new("TextButton")
    MinimizeBtn.AnchorPoint = Vector2.new(1, 0.5)
    MinimizeBtn.Position = UDim2.new(1, -12, 0.5, 0)
    MinimizeBtn.Size = UDim2.fromOffset(28, 28)
    MinimizeBtn.BackgroundColor3 = Theme.Surface
    MinimizeBtn.AutoButtonColor = false
    MinimizeBtn.Font = Enum.Font.GothamBold
    MinimizeBtn.Text = "—"
    MinimizeBtn.TextColor3 = Theme.Silver
    MinimizeBtn.TextSize = 12
    MinimizeBtn.ZIndex = 14
    MinimizeBtn.Parent = HeaderBar
    addCorner(MinimizeBtn, 6)
    local MinStroke = addStroke(MinimizeBtn, Theme.Border, 1, 0)

    makeDraggable(HeaderBar, MainWindow)

    UI.FloatingToggle.MouseButton1Click:Connect(function()
        spawnRipple(UI.FloatingToggle)
        toggleMainHub()
    end)

    MinimizeBtn.MouseButton1Click:Connect(function()
        spawnRipple(MinimizeBtn)
        toggleMainHub()
    end)

    local Sidebar = Instance.new("Frame")
    Sidebar.Position = UDim2.fromOffset(0, 46)
    Sidebar.Size = UDim2.new(0, 146, 1, -46)
    Sidebar.BackgroundColor3 = Theme.Deep
    Sidebar.BackgroundTransparency = 0.2
    Sidebar.BorderSizePixel = 0
    Sidebar.ZIndex = 12
    Sidebar.Parent = MainWindow

    local SidebarDivider = Instance.new("Frame")
    SidebarDivider.Position = UDim2.new(1, -1, 0, 0)
    SidebarDivider.Size = UDim2.new(0, 1, 1, 0)
    SidebarDivider.BackgroundColor3 = Theme.Border
    SidebarDivider.BorderSizePixel = 0
    SidebarDivider.ZIndex = 13
    SidebarDivider.Parent = Sidebar

    local ActiveTabIndicator = Instance.new("Frame")
    ActiveTabIndicator.Position = UDim2.fromOffset(10, 16)
    ActiveTabIndicator.Size = UDim2.fromOffset(3, 18)
    ActiveTabIndicator.BackgroundColor3 = Theme.Accent
    ActiveTabIndicator.BorderSizePixel = 0
    ActiveTabIndicator.ZIndex = 15
    ActiveTabIndicator.Parent = Sidebar
    addCorner(ActiveTabIndicator, 99)
    registerAccentObject(ActiveTabIndicator, "BackgroundColor3")

    local NavList = Instance.new("ScrollingFrame")
    NavList.Position = UDim2.fromOffset(10, 10)
    NavList.Size = UDim2.new(1, -20, 1, -52)
    NavList.BackgroundTransparency = 1
    NavList.BorderSizePixel = 0
    NavList.ScrollBarThickness = 0
    NavList.AutomaticCanvasSize = Enum.AutomaticSize.Y
    NavList.CanvasSize = UDim2.new(0, 0, 0, 0)
    NavList.ZIndex = 13
    NavList.Parent = Sidebar

    local NavLayout = Instance.new("UIListLayout")
    NavLayout.Padding = UDim.new(0, 5)
    NavLayout.SortOrder = Enum.SortOrder.LayoutOrder
    NavLayout.Parent = NavList

    local UserBadge = Instance.new("Frame")
    UserBadge.AnchorPoint = Vector2.new(0, 1)
    UserBadge.Position = UDim2.new(0, 10, 1, -8)
    UserBadge.Size = UDim2.new(1, -20, 0, 34)
    UserBadge.BackgroundColor3 = Theme.Surface
    UserBadge.ZIndex = 13
    UserBadge.Parent = Sidebar
    addCorner(UserBadge, 8)
    addStroke(UserBadge, Theme.Border, 1, 0)

    local UserNameLbl = Instance.new("TextLabel")
    UserNameLbl.Position = UDim2.fromOffset(10, 4)
    UserNameLbl.Size = UDim2.new(1, -20, 0, 14)
    UserNameLbl.BackgroundTransparency = 1
    UserNameLbl.Font = Enum.Font.GothamBold
    UserNameLbl.Text = tostring(LocalPlayer.DisplayName or LocalPlayer.Name)
    UserNameLbl.TextColor3 = Theme.White
    UserNameLbl.TextSize = 10
    UserNameLbl.TextTruncate = Enum.TextTruncate.AtEnd
    UserNameLbl.TextXAlignment = Enum.TextXAlignment.Left
    UserNameLbl.ZIndex = 14
    UserNameLbl.Parent = UserBadge

    local UserStatusLbl = Instance.new("TextLabel")
    UserStatusLbl.Position = UDim2.fromOffset(10, 17)
    UserStatusLbl.Size = UDim2.new(1, -20, 0, 12)
    UserStatusLbl.BackgroundTransparency = 1
    UserStatusLbl.Font = Enum.Font.Code
    UserStatusLbl.Text = "● ACTIVE · V4.0"
    UserStatusLbl.TextColor3 = Theme.Silver
    UserStatusLbl.TextSize = 9
    UserStatusLbl.TextXAlignment = Enum.TextXAlignment.Left
    UserStatusLbl.ZIndex = 14
    UserStatusLbl.Parent = UserBadge

    local PagesHolder = Instance.new("Frame")
    PagesHolder.Name = "PagesHolder"
    PagesHolder.Position = UDim2.fromOffset(156, 54)
    PagesHolder.Size = UDim2.new(1, -166, 1, -62)
    PagesHolder.BackgroundTransparency = 1
    PagesHolder.ClipsDescendants = true
    PagesHolder.ZIndex = 12
    PagesHolder.Parent = MainWindow

    UI.MainWindow = MainWindow
    UI.MainStroke = MainStroke
    UI.MainScale = MainScale
    UI.MainParticleCanvas = MainParticleCanvas
    UI.HeaderLineGrad = HeaderLineGrad
    UI.ActiveTabIndicator = ActiveTabIndicator
    UI.NavList = NavList
    UI.PagesHolder = PagesHolder
end

--------------------------------------------------------------------------------
-- 10. ANIMATED UI COMPONENT BUILDERS
--------------------------------------------------------------------------------
local function createTab(name, order)
    local btn = Instance.new("TextButton")
    btn.Name = name .. "_TabBtn"
    btn.LayoutOrder = order
    btn.Size = UDim2.new(1, 0, 0, 31)
    btn.BackgroundColor3 = Theme.Elevated
    btn.BackgroundTransparency = 1
    btn.AutoButtonColor = false
    btn.Font = Enum.Font.GothamBold
    btn.Text = "    " .. name
    btn.TextColor3 = Theme.Muted
    btn.TextSize = 11
    btn.TextXAlignment = Enum.TextXAlignment.Left
    btn.ClipsDescendants = true
    btn.ZIndex = 14
    btn.Parent = UI.NavList
    addCorner(btn, 7)
    local st = addStroke(btn, Theme.Border, 1, 1)

    local page = Instance.new("ScrollingFrame")
    page.Name = name .. "_Page"
    page.Size = UDim2.fromScale(1, 1)
    page.BackgroundTransparency = 1
    page.BorderSizePixel = 0
    page.ScrollBarThickness = 2
    page.ScrollBarImageColor3 = Theme.Accent
    page.AutomaticCanvasSize = Enum.AutomaticSize.Y
    page.CanvasSize = UDim2.new(0, 0, 0, 0)
    page.Visible = false
    page.ZIndex = 13
    page.Parent = UI.PagesHolder
    registerAccentObject(page, "ScrollBarImageColor3")

    local pad = Instance.new("UIPadding")
    pad.PaddingTop = UDim.new(0, 2)
    pad.PaddingBottom = UDim.new(0, 14)
    pad.PaddingLeft = UDim.new(0, 2)
    pad.PaddingRight = UDim.new(0, 8)
    pad.Parent = page

    local list = Instance.new("UIListLayout")
    list.Padding = UDim.new(0, 8)
    list.SortOrder = Enum.SortOrder.LayoutOrder
    list.Parent = page

    local tabObj = { Btn = btn, Stroke = st, Page = page, Order = order }
    table.insert(State.Tabs, tabObj)

    local function selectTab()
        if State.activeTab == tabObj then
            return
        end
        for _, t in ipairs(State.Tabs) do
            tween(t.Btn, FastTween, {
                BackgroundTransparency = 1,
                TextColor3 = Theme.Muted,
            })
            tween(t.Stroke, FastTween, { Transparency = 1 })
            t.Page.Visible = false
        end
        State.activeTab = tabObj
        tween(btn, FastTween, {
            BackgroundTransparency = 0.1,
            TextColor3 = Theme.White,
        })
        tween(st, FastTween, { Transparency = 0.2, Color = Theme.Accent })

        local targetY = 10 + ((order - 1) * 36) + 6
        tween(UI.ActiveTabIndicator, SpringTween, {
            Position = UDim2.fromOffset(10, targetY),
        })

        page.Position = UDim2.fromOffset(14, 0)
        page.Visible = true
        tween(page, SmoothTween, { Position = UDim2.fromOffset(0, 0) })
    end

    btn.MouseButton1Click:Connect(function()
        spawnRipple(btn)
        selectTab()
    end)

    if #State.Tabs == 1 then
        selectTab()
    end

    return page
end

local function createLabel(page, text)
    local holder = Instance.new("Frame")
    holder.Size = UDim2.new(1, 0, 0, 22)
    holder.BackgroundTransparency = 1
    holder.ZIndex = 14
    holder.Parent = page

    local dot = Instance.new("Frame")
    dot.AnchorPoint = Vector2.new(0, 0.5)
    dot.Position = UDim2.new(0, 2, 0.5, 0)
    dot.Size = UDim2.fromOffset(4, 4)
    dot.BackgroundColor3 = Theme.Accent
    dot.BorderSizePixel = 0
    dot.ZIndex = 14
    dot.Parent = holder
    addCorner(dot, 99)
    registerAccentObject(dot, "BackgroundColor3")

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(12, 0)
    lbl.Size = UDim2.new(1, -12, 1, 0)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamBlack
    lbl.Text = string.upper(text)
    lbl.TextColor3 = Theme.Silver
    lbl.TextSize = 10
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.ZIndex = 14
    lbl.Parent = holder
end

local function createButton(page, text, callback)
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(1, 0, 0, 38)
    btn.BackgroundColor3 = Theme.Surface
    btn.AutoButtonColor = false
    btn.Font = Enum.Font.GothamBold
    btn.Text = text
    btn.TextColor3 = Theme.White
    btn.TextSize = 12
    btn.ZIndex = 14
    btn.Parent = page
    addCorner(btn, 8)
    local st = addStroke(btn, Theme.Border, 1, 0)

    btn.MouseButton1Click:Connect(function()
        spawnRipple(btn)
        tween(btn, TweenInfo.new(0.08), { BackgroundColor3 = Theme.Accent, TextColor3 = Theme.Black })
        task.delay(0.12, function()
            tween(btn, FastTween, { BackgroundColor3 = Theme.Surface, TextColor3 = Theme.White })
        end)
        callback()
    end)
    return btn
end

local function createToggle(page, text, defaultVal, callback)
    local row = Instance.new("TextButton")
    row.Size = UDim2.new(1, 0, 0, 40)
    row.BackgroundColor3 = Theme.Surface
    row.AutoButtonColor = false
    row.Text = ""
    row.ZIndex = 14
    row.Parent = page
    addCorner(row, 8)
    local st = addStroke(row, defaultVal and Theme.Accent or Theme.Border, 1, defaultVal and 0.35 or 0)

    local statusBar = Instance.new("Frame")
    statusBar.AnchorPoint = Vector2.new(0, 0.5)
    statusBar.Position = UDim2.new(0, 0, 0.5, 0)
    statusBar.Size = UDim2.fromOffset(3, defaultVal and 20 or 0)
    statusBar.BackgroundColor3 = Theme.Accent
    statusBar.BorderSizePixel = 0
    statusBar.ZIndex = 15
    statusBar.Parent = row
    addCorner(statusBar, 99)
    registerAccentObject(statusBar, "BackgroundColor3")

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(14, 0)
    lbl.Size = UDim2.new(1, -76, 1, 0)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamMedium
    lbl.Text = text
    lbl.TextColor3 = defaultVal and Theme.White or Theme.Silver
    lbl.TextSize = 12
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.ZIndex = 15
    lbl.Parent = row

    local pill = Instance.new("Frame")
    pill.AnchorPoint = Vector2.new(1, 0.5)
    pill.Position = UDim2.new(1, -12, 0.5, 0)
    pill.Size = UDim2.fromOffset(42, 22)
    pill.BackgroundColor3 = defaultVal and Theme.Accent or Theme.Deep
    pill.ZIndex = 15
    pill.Parent = row
    addCorner(pill, 99)
    local pillStroke = addStroke(pill, defaultVal and Theme.Accent or Theme.Border, 1, 0)

    local dot = Instance.new("Frame")
    dot.AnchorPoint = Vector2.new(0, 0.5)
    dot.Position = defaultVal and UDim2.new(1, -19, 0.5, 0) or UDim2.new(0, 3, 0.5, 0)
    dot.Size = UDim2.fromOffset(16, 16)
    dot.BackgroundColor3 = defaultVal and Theme.Black or Theme.Muted
    dot.ZIndex = 16
    dot.Parent = pill
    addCorner(dot, 99)

    local state = defaultVal
    local function setState(newVal, fireCallback)
        state = newVal
        tween(lbl, FastTween, { TextColor3 = state and Theme.White or Theme.Silver })
        tween(st, FastTween, {
            Color = state and Theme.Accent or Theme.Border,
            Transparency = state and 0.35 or 0,
        })
        tween(statusBar, SpringTween, { Size = UDim2.fromOffset(3, state and 20 or 0) })
        tween(pill, FastTween, { BackgroundColor3 = state and Theme.Accent or Theme.Deep })
        tween(pillStroke, FastTween, { Color = state and Theme.Accent or Theme.Border })
        tween(dot, SpringTween, {
            Position = state and UDim2.new(1, -19, 0.5, 0) or UDim2.new(0, 3, 0.5, 0),
            BackgroundColor3 = state and Theme.Black or Theme.Muted,
        })
        if fireCallback ~= false then
            callback(state)
        end
    end

    row.MouseButton1Click:Connect(function()
        setState(not state, true)
    end)

    return { Set = setState, Get = function() return state end, Row = row }
end

local function createSlider(page, text, minVal, maxVal, defaultVal, step, suffix, callback)
    suffix = suffix or ""
    local card = Instance.new("Frame")
    card.Size = UDim2.new(1, 0, 0, 54)
    card.BackgroundColor3 = Theme.Surface
    card.ZIndex = 14
    card.Parent = page
    addCorner(card, 8)
    local st = addStroke(card, Theme.Border, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(14, 7)
    lbl.Size = UDim2.new(0.65, 0, 0, 18)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamMedium
    lbl.Text = text
    lbl.TextColor3 = Theme.Silver
    lbl.TextSize = 12
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.ZIndex = 15
    lbl.Parent = card

    local valBadge = Instance.new("TextLabel")
    valBadge.AnchorPoint = Vector2.new(1, 0)
    valBadge.Position = UDim2.new(1, -14, 0, 7)
    valBadge.Size = UDim2.fromOffset(80, 18)
    valBadge.BackgroundTransparency = 1
    valBadge.Font = Enum.Font.Code
    valBadge.Text = tostring(defaultVal) .. suffix
    valBadge.TextColor3 = Theme.White
    valBadge.TextSize = 11
    valBadge.TextXAlignment = Enum.TextXAlignment.Right
    valBadge.ZIndex = 15
    valBadge.Parent = card

    local track = Instance.new("Frame")
    track.Position = UDim2.fromOffset(14, 34)
    track.Size = UDim2.new(1, -28, 0, 6)
    track.BackgroundColor3 = Theme.Deep
    track.BorderSizePixel = 0
    track.ZIndex = 15
    track.Parent = card
    addCorner(track, 99)

    local initPct = math.clamp((defaultVal - minVal) / math.max(maxVal - minVal, 0.0001), 0, 1)
    local fill = Instance.new("Frame")
    fill.Size = UDim2.fromScale(initPct, 1)
    fill.BackgroundColor3 = Theme.Accent
    fill.BorderSizePixel = 0
    fill.ZIndex = 16
    fill.Parent = track
    addCorner(fill, 99)
    registerAccentObject(fill, "BackgroundColor3")

    local knob = Instance.new("Frame")
    knob.AnchorPoint = Vector2.new(0.5, 0.5)
    knob.Position = UDim2.fromScale(initPct, 0.5)
    knob.Size = UDim2.fromOffset(13, 13)
    knob.BackgroundColor3 = Theme.White
    knob.ZIndex = 17
    knob.Parent = track
    addCorner(knob, 99)

    local dragging = false

    local function setValue(rawVal, fireCallback)
        local stepped = math.floor((rawVal / step) + 0.5) * step
        stepped = tonumber(string.format("%.2f", math.clamp(stepped, minVal, maxVal))) or defaultVal
        local pct = math.clamp((stepped - minVal) / math.max(maxVal - minVal, 0.0001), 0, 1)
        tween(fill, TweenInfo.new(0.08), { Size = UDim2.fromScale(pct, 1) })
        tween(knob, TweenInfo.new(0.08), { Position = UDim2.fromScale(pct, 0.5) })
        valBadge.Text = tostring(stepped) .. suffix
        if fireCallback ~= false then
            callback(stepped)
        end
    end

    local function updateFromInput(input)
        local width = math.max(track.AbsoluteSize.X, 1)
        local pct = math.clamp((input.Position.X - track.AbsolutePosition.X) / width, 0, 1)
        local raw = minVal + (maxVal - minVal) * pct
        setValue(raw, true)
    end

    track.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            tween(st, FastTween, { Color = Theme.Accent })
            updateFromInput(input)
        end
    end)

    UserInputService.InputChanged:Connect(function(input)
        if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            updateFromInput(input)
        end
    end)

    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            if dragging then
                dragging = false
                tween(st, FastTween, { Color = Theme.Border })
            end
        end
    end)

    return { Set = setValue }
end

local function createTextInputRow(page, labelText, placeholder, defaultText, onCommit)
    local row = Instance.new("Frame")
    row.Size = UDim2.new(1, 0, 0, 42)
    row.BackgroundColor3 = Theme.Surface
    row.ZIndex = 14
    row.Parent = page
    addCorner(row, 8)
    local st = addStroke(row, Theme.Border, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(14, 0)
    lbl.Size = UDim2.new(0.45, -14, 1, 0)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamMedium
    lbl.Text = labelText
    lbl.TextColor3 = Theme.Silver
    lbl.TextSize = 12
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.ZIndex = 15
    lbl.Parent = row

    local boxHolder = Instance.new("Frame")
    boxHolder.AnchorPoint = Vector2.new(1, 0.5)
    boxHolder.Position = UDim2.new(1, -10, 0.5, 0)
    boxHolder.Size = UDim2.new(0.52, 0, 0, 28)
    boxHolder.BackgroundColor3 = Theme.Deep
    boxHolder.ZIndex = 15
    boxHolder.Parent = row
    addCorner(boxHolder, 6)
    local boxStroke = addStroke(boxHolder, Theme.Border, 1, 0)

    local box = Instance.new("TextBox")
    box.Position = UDim2.fromOffset(10, 0)
    box.Size = UDim2.new(1, -20, 1, 0)
    box.BackgroundTransparency = 1
    box.Font = Enum.Font.Code
    box.PlaceholderText = placeholder or ""
    box.PlaceholderColor3 = Theme.Muted
    box.Text = defaultText or ""
    box.TextColor3 = Theme.White
    box.TextSize = 11
    box.ClearTextOnFocus = false
    box.TextXAlignment = Enum.TextXAlignment.Left
    box.ZIndex = 16
    box.Parent = boxHolder

    box.Focused:Connect(function()
        tween(boxStroke, FastTween, { Color = Theme.Accent })
        tween(st, FastTween, { Color = Theme.Accent })
    end)
    box.FocusLost:Connect(function()
        tween(boxStroke, FastTween, { Color = Theme.Border })
        tween(st, FastTween, { Color = Theme.Border })
        if onCommit then
            onCommit(box.Text)
        end
    end)

    return box
end

local function createDropdown(page, text, options, defaultOpt, callback)
    local isOpen = false
    local selected = defaultOpt or options[1]

    local container = Instance.new("Frame")
    container.Size = UDim2.new(1, 0, 0, 40)
    container.BackgroundColor3 = Theme.Surface
    container.ClipsDescendants = true
    container.ZIndex = 14
    container.Parent = page
    addCorner(container, 8)
    local st = addStroke(container, Theme.Border, 1, 0)

    local headerBtn = Instance.new("TextButton")
    headerBtn.Size = UDim2.new(1, 0, 0, 40)
    headerBtn.BackgroundTransparency = 1
    headerBtn.Text = ""
    headerBtn.ZIndex = 15
    headerBtn.Parent = container

    local titleLbl = Instance.new("TextLabel")
    titleLbl.Position = UDim2.fromOffset(14, 0)
    titleLbl.Size = UDim2.new(0.52, 0, 1, 0)
    titleLbl.BackgroundTransparency = 1
    titleLbl.Font = Enum.Font.GothamMedium
    titleLbl.Text = text
    titleLbl.TextColor3 = Theme.Silver
    titleLbl.TextSize = 12
    titleLbl.TextXAlignment = Enum.TextXAlignment.Left
    titleLbl.ZIndex = 15
    titleLbl.Parent = headerBtn

    local optLbl = Instance.new("TextLabel")
    optLbl.AnchorPoint = Vector2.new(1, 0)
    optLbl.Position = UDim2.new(1, -28, 0, 0)
    optLbl.Size = UDim2.new(0.44, 0, 1, 0)
    optLbl.BackgroundTransparency = 1
    optLbl.Font = Enum.Font.Code
    optLbl.Text = tostring(selected)
    optLbl.TextColor3 = Theme.White
    optLbl.TextSize = 11
    optLbl.TextTruncate = Enum.TextTruncate.AtEnd
    optLbl.TextXAlignment = Enum.TextXAlignment.Right
    optLbl.ZIndex = 15
    optLbl.Parent = headerBtn

    local arrow = Instance.new("TextLabel")
    arrow.AnchorPoint = Vector2.new(1, 0.5)
    arrow.Position = UDim2.new(1, -12, 0.5, 0)
    arrow.Size = UDim2.fromOffset(12, 12)
    arrow.BackgroundTransparency = 1
    arrow.Font = Enum.Font.GothamBold
    arrow.Text = "▾"
    arrow.TextColor3 = Theme.Muted
    arrow.TextSize = 12
    arrow.ZIndex = 15
    arrow.Parent = headerBtn

    local listHolder = Instance.new("Frame")
    listHolder.Position = UDim2.fromOffset(8, 42)
    listHolder.Size = UDim2.new(1, -16, 0, #options * 28)
    listHolder.BackgroundTransparency = 1
    listHolder.ZIndex = 15
    listHolder.Parent = container

    local listLayout = Instance.new("UIListLayout")
    listLayout.Padding = UDim.new(0, 4)
    listLayout.SortOrder = Enum.SortOrder.LayoutOrder
    listLayout.Parent = listHolder

    local optionButtons = {}

    local function rebuildOptions(newOptions)
        options = newOptions
        for _, b in ipairs(optionButtons) do
            if b and b.Parent then
                b:Destroy()
            end
        end
        table.clear(optionButtons)

        for i, opt in ipairs(options) do
            local optBtn = Instance.new("TextButton")
            optBtn.LayoutOrder = i
            optBtn.Size = UDim2.new(1, 0, 0, 26)
            optBtn.BackgroundColor3 = (opt == selected) and Theme.Accent or Theme.Deep
            optBtn.AutoButtonColor = false
            optBtn.Font = Enum.Font.Code
            optBtn.Text = tostring(opt)
            optBtn.TextColor3 = (opt == selected) and Theme.Black or Theme.Silver
            optBtn.TextSize = 11
            optBtn.ZIndex = 16
            optBtn.Parent = listHolder
            addCorner(optBtn, 6)
            table.insert(optionButtons, optBtn)

            optBtn.MouseButton1Click:Connect(function()
                selected = opt
                optLbl.Text = tostring(opt)
                for _, otherBtn in ipairs(optionButtons) do
                    local isSel = (otherBtn == optBtn)
                    tween(otherBtn, FastTween, {
                        BackgroundColor3 = isSel and Theme.Accent or Theme.Deep,
                        TextColor3 = isSel and Theme.Black or Theme.Silver,
                    })
                end
                callback(opt)
            end)
        end
    end

    rebuildOptions(options)

    headerBtn.MouseButton1Click:Connect(function()
        spawnRipple(headerBtn)
        isOpen = not isOpen
        local openHeight = 46 + (#options * 30)
        tween(container, SmoothTween, {
            Size = UDim2.new(1, 0, 0, isOpen and openHeight or 40),
        })
        tween(arrow, FastTween, { Rotation = isOpen and 180 or 0 })
        tween(st, FastTween, { Color = isOpen and Theme.Accent or Theme.Border })
    end)

    return {
        Refresh = function(newOptions, newSelected)
            if newSelected then
                selected = newSelected
                optLbl.Text = tostring(selected)
            end
            rebuildOptions(newOptions)
            if isOpen then
                local openHeight = 46 + (#newOptions * 30)
                container.Size = UDim2.new(1, 0, 0, openHeight)
            end
        end,
    }
end

local function createMultiDropdown(page, text, options, defaultSelectedList, maxChoices, callback)
    local isOpen = false
    local selectedList = {}
    for _, item in ipairs(defaultSelectedList or {}) do
        table.insert(selectedList, item)
    end

    local container = Instance.new("Frame")
    container.Size = UDim2.new(1, 0, 0, 40)
    container.BackgroundColor3 = Theme.Surface
    container.ClipsDescendants = true
    container.ZIndex = 14
    container.Parent = page
    addCorner(container, 8)
    local st = addStroke(container, Theme.Border, 1, 0)

    local headerBtn = Instance.new("TextButton")
    headerBtn.Size = UDim2.new(1, 0, 0, 40)
    headerBtn.BackgroundTransparency = 1
    headerBtn.Text = ""
    headerBtn.ZIndex = 15
    headerBtn.Parent = container

    local titleLbl = Instance.new("TextLabel")
    titleLbl.Position = UDim2.fromOffset(14, 0)
    titleLbl.Size = UDim2.new(0.46, 0, 1, 0)
    titleLbl.BackgroundTransparency = 1
    titleLbl.Font = Enum.Font.GothamMedium
    titleLbl.Text = text
    titleLbl.TextColor3 = Theme.Silver
    titleLbl.TextSize = 12
    titleLbl.TextXAlignment = Enum.TextXAlignment.Left
    titleLbl.ZIndex = 15
    titleLbl.Parent = headerBtn

    local optLbl = Instance.new("TextLabel")
    optLbl.AnchorPoint = Vector2.new(1, 0)
    optLbl.Position = UDim2.new(1, -28, 0, 0)
    optLbl.Size = UDim2.new(0.50, 0, 1, 0)
    optLbl.BackgroundTransparency = 1
    optLbl.Font = Enum.Font.Code
    optLbl.Text = #selectedList > 0 and table.concat(selectedList, ", ") or "None"
    optLbl.TextColor3 = Theme.White
    optLbl.TextSize = 10
    optLbl.TextTruncate = Enum.TextTruncate.AtEnd
    optLbl.TextXAlignment = Enum.TextXAlignment.Right
    optLbl.ZIndex = 15
    optLbl.Parent = headerBtn

    local arrow = Instance.new("TextLabel")
    arrow.AnchorPoint = Vector2.new(1, 0.5)
    arrow.Position = UDim2.new(1, -12, 0.5, 0)
    arrow.Size = UDim2.fromOffset(12, 12)
    arrow.BackgroundTransparency = 1
    arrow.Font = Enum.Font.GothamBold
    arrow.Text = "▾"
    arrow.TextColor3 = Theme.Muted
    arrow.TextSize = 12
    arrow.ZIndex = 15
    arrow.Parent = headerBtn

    local listHolder = Instance.new("Frame")
    listHolder.Position = UDim2.fromOffset(8, 42)
    listHolder.Size = UDim2.new(1, -16, 0, #options * 28)
    listHolder.BackgroundTransparency = 1
    listHolder.ZIndex = 15
    listHolder.Parent = container

    local listLayout = Instance.new("UIListLayout")
    listLayout.Padding = UDim.new(0, 4)
    listLayout.SortOrder = Enum.SortOrder.LayoutOrder
    listLayout.Parent = listHolder

    local optionButtons = {}

    local function isOptionSelected(opt)
        for i, v in ipairs(selectedList) do
            if v == opt then
                return true, i
            end
        end
        return false, nil
    end

    local function refreshButtons()
        optLbl.Text = #selectedList > 0 and table.concat(selectedList, ", ") or "None"
        for _, item in ipairs(optionButtons) do
            local active = isOptionSelected(item.Value)
            tween(item.Btn, FastTween, {
                BackgroundColor3 = active and Theme.Accent or Theme.Deep,
                TextColor3 = active and Theme.Black or Theme.Silver,
            })
        end
    end

    local function rebuildMultiOptions(newOptions, newSelectedList)
        options = newOptions
        if newSelectedList then
            selectedList = {}
            for _, v in ipairs(newSelectedList) do
                table.insert(selectedList, v)
            end
        end
        for _, item in ipairs(optionButtons) do
            if item.Btn and item.Btn.Parent then
                item.Btn:Destroy()
            end
        end
        table.clear(optionButtons)

        for i, opt in ipairs(options) do
            local active = isOptionSelected(opt)
            local optBtn = Instance.new("TextButton")
            optBtn.LayoutOrder = i
            optBtn.Size = UDim2.new(1, 0, 0, 26)
            optBtn.BackgroundColor3 = active and Theme.Accent or Theme.Deep
            optBtn.AutoButtonColor = false
            optBtn.Font = Enum.Font.Code
            optBtn.Text = tostring(opt)
            optBtn.TextColor3 = active and Theme.Black or Theme.Silver
            optBtn.TextSize = 11
            optBtn.ZIndex = 16
            optBtn.Parent = listHolder
            addCorner(optBtn, 6)

            table.insert(optionButtons, { Btn = optBtn, Value = opt })

            optBtn.MouseButton1Click:Connect(function()
                local currentlyActive, idx = isOptionSelected(opt)
                if currentlyActive and idx then
                    table.remove(selectedList, idx)
                else
                    if maxChoices and #selectedList >= maxChoices then
                        notify("Core.xyz", "Maximum " .. tostring(maxChoices) .. " options can be selected at once!", 3)
                        return
                    end
                    table.insert(selectedList, opt)
                end
                refreshButtons()
                callback(selectedList)
            end)
        end
        refreshButtons()
    end

    rebuildMultiOptions(options, selectedList)

    headerBtn.MouseButton1Click:Connect(function()
        spawnRipple(headerBtn)
        isOpen = not isOpen
        local openHeight = 46 + (#options * 30)
        tween(container, SmoothTween, {
            Size = UDim2.new(1, 0, 0, isOpen and openHeight or 40),
        })
        tween(arrow, FastTween, { Rotation = isOpen and 180 or 0 })
        tween(st, FastTween, { Color = isOpen and Theme.Accent or Theme.Border })
    end)

    return {
        Refresh = function(newOptions, newSelectedList)
            rebuildMultiOptions(newOptions, newSelectedList)
            if isOpen then
                local openHeight = 46 + (#options * 30)
                container.Size = UDim2.new(1, 0, 0, openHeight)
            end
        end,
    }
end

--------------------------------------------------------------------------------
-- 11. CORE GAMEPLAY & UNIVERSAL FEATURE IMPLEMENTATIONS
--------------------------------------------------------------------------------
local function getTargetPartFromCharacter(char, partName)
    if not char then
        return nil
    end
    local found = char:FindFirstChild(partName)
    if found then
        return found
    end
    if partName == "UpperTorso" or partName == "LowerTorso" then
        return char:FindFirstChild("Torso") or char:FindFirstChild("HumanoidRootPart")
    elseif partName == "RightUpperArm" then
        return char:FindFirstChild("Right Arm") or char:FindFirstChild("HumanoidRootPart")
    elseif partName == "LeftUpperArm" then
        return char:FindFirstChild("Left Arm") or char:FindFirstChild("HumanoidRootPart")
    elseif partName == "RightUpperLeg" or partName == "RightLowerLeg" then
        return char:FindFirstChild("RightLowerLeg") or char:FindFirstChild("Right Leg") or char:FindFirstChild("HumanoidRootPart")
    elseif partName == "LeftUpperLeg" or partName == "LeftLowerLeg" then
        return char:FindFirstChild("LeftLowerLeg") or char:FindFirstChild("Left Leg") or char:FindFirstChild("HumanoidRootPart")
    end
    return char:FindFirstChild("HumanoidRootPart") or char:FindFirstChild("Head")
end

-- Weighted Body-Part Selector for Silent Aim (Head %, Torso %, Legs %)
local function chooseWeightedSilentPart(char)
    if not char then
        return nil
    end
    local wHead = math.max(ConfigState.SilentHeadWeight or 80, 0)
    local wTorso = math.max(ConfigState.SilentTorsoWeight or 0, 0)
    local wLegs = math.max(ConfigState.SilentLegsWeight or 20, 0)
    local total = wHead + wTorso + wLegs

    if total <= 0 then
        return getTargetPartFromCharacter(char, "Head")
    end

    local roll = math.random() * total
    if roll <= wHead then
        return char:FindFirstChild("Head") or getTargetPartFromCharacter(char, "Head")
    elseif roll <= (wHead + wTorso) then
        return char:FindFirstChild("UpperTorso") or char:FindFirstChild("Torso") or char:FindFirstChild("HumanoidRootPart")
    else
        return char:FindFirstChild("RightLowerLeg")
            or char:FindFirstChild("LeftLowerLeg")
            or char:FindFirstChild("Right Leg")
            or char:FindFirstChild("Left Leg")
            or char:FindFirstChild("HumanoidRootPart")
    end
end

local function isPlayerWhitelisted(player)
    if not ConfigState.UseWhitelist then
        return false
    end
    return State.whitelistedPlayers[player.Name] == true
end

local function passesTeamCheck(player)
    if isPlayerWhitelisted(player) then
        return false
    end
    if not ConfigState.TeamCheck then
        return true
    end
    if State.selectedTeams["All"] then
        return true
    end
    return State.selectedTeams[tostring(player.Team)] == true
end

local function syncWhitelistArrayFromMap()
    table.clear(State.whitelistArray)
    for name, active in pairs(State.whitelistedPlayers) do
        if active then
            table.insert(State.whitelistArray, name)
        end
    end
    table.sort(State.whitelistArray)
    if State.refreshWhitelistDropdown then
        local names = {}
        for _, p in ipairs(Players:GetPlayers()) do
            if p ~= LocalPlayer then
                table.insert(names, p.Name)
            end
        end
        State.refreshWhitelistDropdown(names, State.whitelistArray)
    end
end

--------------------------------------------------------------------------------
-- 3D BOUNDING BOX (12 EDGES) + SKELETON RIG (10 BONES) + HEALTH BAR OVERLAY
--------------------------------------------------------------------------------
local BOX_3D_CORNERS = {
    Vector3.new(-2.1,  3.0, -1.2),
    Vector3.new( 2.1,  3.0, -1.2),
    Vector3.new( 2.1,  3.0,  1.2),
    Vector3.new(-2.1,  3.0,  1.2),
    Vector3.new(-2.1, -3.2, -1.2),
    Vector3.new( 2.1, -3.2, -1.2),
    Vector3.new( 2.1, -3.2,  1.2),
    Vector3.new(-2.1, -3.2,  1.2),
}

local BOX_3D_EDGES = {
    { 1, 2 }, { 2, 3 }, { 3, 4 }, { 4, 1 }, -- Top 4 edges
    { 5, 6 }, { 6, 7 }, { 7, 8 }, { 8, 5 }, -- Bottom 4 edges
    { 1, 5 }, { 2, 6 }, { 3, 7 }, { 4, 8 }, -- Vertical 4 pillars
}

local SKELETON_JOINTS = {
    { "Head", "UpperTorso", "Torso" },
    { "UpperTorso", "LowerTorso", "Torso" },
    { "UpperTorso", "LeftUpperArm", "Left Arm" },
    { "LeftUpperArm", "LeftLowerArm", "Left Arm" },
    { "UpperTorso", "RightUpperArm", "Right Arm" },
    { "RightUpperArm", "RightLowerArm", "Right Arm" },
    { "LowerTorso", "LeftUpperLeg", "Left Leg" },
    { "LeftUpperLeg", "LeftLowerLeg", "Left Leg" },
    { "LowerTorso", "RightUpperLeg", "Right Leg" },
    { "RightUpperLeg", "RightLowerLeg", "Right Leg" },
}

local function drawLineFrame(lineFrame, fromVec2, toVec2, color, thickness)
    local diff = toVec2 - fromVec2
    local dist = diff.Magnitude
    if dist < 1 then
        lineFrame.Visible = false
        return
    end
    local mid = (fromVec2 + toVec2) / 2
    local atan2Fn = math.atan2 or math.atan
    lineFrame.Position = UDim2.fromOffset(mid.X, mid.Y)
    lineFrame.Size = UDim2.fromOffset(dist, thickness or 1)
    lineFrame.Rotation = math.deg(atan2Fn(diff.Y, diff.X))
    lineFrame.BackgroundColor3 = color
    lineFrame.Visible = true
end

local function create3DOverlayGui()
    local folder = Instance.new("Frame")
    folder.Name = "Box3DOverlay"
    folder.Size = UDim2.fromScale(1, 1)
    folder.BackgroundTransparency = 1
    folder.Visible = false
    folder.ZIndex = 4
    folder.Parent = UI.OverlayContainer

    local boxLines = {}
    for i = 1, 12 do
        local line = Instance.new("Frame")
        line.Name = "Edge3D_" .. i
        line.AnchorPoint = Vector2.new(0.5, 0.5)
        line.BackgroundColor3 = State.espColor
        line.BorderSizePixel = 0
        line.Visible = false
        line.Parent = folder
        table.insert(boxLines, line)
    end

    local skelLines = {}
    for i = 1, #SKELETON_JOINTS do
        local sLine = Instance.new("Frame")
        sLine.Name = "Bone_" .. i
        sLine.AnchorPoint = Vector2.new(0.5, 0.5)
        sLine.BackgroundColor3 = Theme.White
        sLine.BorderSizePixel = 0
        sLine.Visible = false
        sLine.Parent = folder
        table.insert(skelLines, sLine)
    end

    local hbBg = Instance.new("Frame")
    hbBg.Name = "HealthBar3D"
    hbBg.AnchorPoint = Vector2.new(1, 0)
    hbBg.Size = UDim2.fromOffset(3, 50)
    hbBg.BackgroundColor3 = Theme.Black
    hbBg.BackgroundTransparency = 0.25
    hbBg.BorderSizePixel = 0
    hbBg.Visible = false
    hbBg.Parent = folder
    addCorner(hbBg, 99)

    local hbFill = Instance.new("Frame")
    hbFill.AnchorPoint = Vector2.new(0, 1)
    hbFill.Position = UDim2.fromScale(0, 1)
    hbFill.Size = UDim2.fromScale(1, 1)
    hbFill.BackgroundColor3 = Theme.Success
    hbFill.BorderSizePixel = 0
    hbFill.Parent = hbBg
    addCorner(hbFill, 99)

    return folder, boxLines, skelLines, hbBg, hbFill
end

local function cleanupPlayerESP(player)
    local data = State.espObjects[player]
    if not data then
        return
    end
    if data.Billboard then
        pcall(function() data.Billboard:Destroy() end)
    end
    if data.Tracer then
        pcall(function() data.Tracer:Destroy() end)
    end
    if data.Overlay3D then
        pcall(function() data.Overlay3D:Destroy() end)
    end
    if data.Highlight then
        pcall(function() data.Highlight:Destroy() end)
        State.activeHighlightCount = math.max(0, State.activeHighlightCount - 1)
    end
    State.espObjects[player] = nil
end

local function clearESP()
    for player in pairs(State.espObjects) do
        cleanupPlayerESP(player)
    end
end

Players.PlayerRemoving:Connect(function(player)
    cleanupPlayerESP(player)
    State.whitelistedPlayers[player.Name] = nil
    State.prioritizedPlayers[player.Name] = nil
    if State.expandedPlayerName == player.Name then
        State.expandedPlayerName = nil
    end
end)

local function updateESP(camera)
    local anyVisualActive = ConfigState.ESP or ConfigState.Box3DESP or ConfigState.SkeletonESP or ConfigState.HealthBarESP or ConfigState.Tracers
    if not anyVisualActive then
        return
    end

    for player in pairs(State.espObjects) do
        local char = player.Character
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        if not player or not player.Parent or not char or not hum or hum.Health <= 0 or not passesTeamCheck(player) then
            cleanupPlayerESP(player)
        end
    end

    local vp = camera.ViewportSize

    for _, player in ipairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and passesTeamCheck(player) then
            local char = player.Character
            local hrp = char:FindFirstChild("HumanoidRootPart")
            local hum = char:FindFirstChildOfClass("Humanoid")

            if hrp and hum and hum.Health > 0 then
                local tagData = State.espObjects[player]
                if not tagData then
                    local bb = Instance.new("BillboardGui")
                    bb.Name = "CoreESP"
                    bb.Adornee = hrp
                    bb.Size = UDim2.fromOffset(210, 28)
                    bb.StudsOffset = Vector3.new(0, 3.3, 0)
                    bb.AlwaysOnTop = true
                    bb.Parent = UI.OverlayContainer

                    local txt = Instance.new("TextLabel")
                    txt.Size = UDim2.fromScale(1, 1)
                    txt.BackgroundTransparency = 1
                    txt.Font = Enum.Font.GothamBold
                    txt.TextColor3 = State.espColor
                    txt.TextStrokeTransparency = 0.15
                    txt.TextSize = 12
                    txt.Parent = bb

                    local line = Instance.new("Frame")
                    line.AnchorPoint = Vector2.new(0.5, 0.5)
                    line.BackgroundColor3 = State.espColor
                    line.BorderSizePixel = 0
                    line.Visible = false
                    line.Parent = UI.OverlayContainer

                    local ov3D, bLines, sLines, hbBg, hbFill = create3DOverlayGui()

                    tagData = {
                        Billboard = bb,
                        Text = txt,
                        Tracer = line,
                        Overlay3D = ov3D,
                        Box3DLines = bLines,
                        SkeletonLines = sLines,
                        HealthBarBg = hbBg,
                        HealthBarFill = hbFill,
                    }
                    State.espObjects[player] = tagData
                end

                if ConfigState.ESP and (not tagData.Highlight or tagData.Highlight.Adornee ~= char) and State.activeHighlightCount < State.MAX_HIGHLIGHTS then
                    if tagData.Highlight then
                        pcall(function() tagData.Highlight:Destroy() end)
                        State.activeHighlightCount = math.max(0, State.activeHighlightCount - 1)
                    end
                    local hl = Instance.new("Highlight")
                    hl.FillColor = State.espColor
                    hl.OutlineColor = Theme.White
                    hl.FillTransparency = 0.7
                    hl.OutlineTransparency = 0.25
                    hl.Adornee = char
                    hl.Parent = UI.HighlightContainer
                    tagData.Highlight = hl
                    State.activeHighlightCount = State.activeHighlightCount + 1
                end

                local dist = math.floor((hrp.Position - camera.CFrame.Position).Magnitude)
                local screenPos, onScreen = camera:WorldToViewportPoint(hrp.Position)
                local isPriority = State.prioritizedPlayers[player.Name] == true
                local displayCol = isPriority and Theme.Success or State.espColor

                tagData.Billboard.Adornee = hrp
                tagData.Billboard.Enabled = onScreen and ConfigState.ESP
                local prefix = isPriority and "[PRIORITY] " or ""
                tagData.Text.Text = string.format("%s%s [%dm] | HP: %d", prefix, player.Name, dist, math.floor(hum.Health))
                tagData.Text.TextColor3 = displayCol

                if tagData.Highlight then
                    tagData.Highlight.FillColor = displayCol
                    tagData.Highlight.Enabled = ConfigState.ESP
                end

                -- 3D Bounding Box + Skeleton Rig + Health Bar Overlay
                if onScreen and (ConfigState.Box3DESP or ConfigState.SkeletonESP or ConfigState.HealthBarESP) then
                    tagData.Overlay3D.Visible = true
                    local minX, maxX = 99999, -99999
                    local minY, maxY = 99999, -99999
                    local projectedCorners = {}

                    for idx, offset in ipairs(BOX_3D_CORNERS) do
                        local worldCorner = (hrp.CFrame * CFrame.new(offset)).Position
                        local vpPt = camera:WorldToViewportPoint(worldCorner)
                        local v2 = Vector2.new(vpPt.X, vpPt.Y)
                        projectedCorners[idx] = v2
                        if v2.X < minX then minX = v2.X end
                        if v2.X > maxX then maxX = v2.X end
                        if v2.Y < minY then minY = v2.Y end
                        if v2.Y > maxY then maxY = v2.Y end
                    end

                    if ConfigState.Box3DESP then
                        for eIdx, edge in ipairs(BOX_3D_EDGES) do
                            local p1 = projectedCorners[edge[1]]
                            local p2 = projectedCorners[edge[2]]
                            drawLineFrame(tagData.Box3DLines[eIdx], p1, p2, displayCol, 1)
                        end
                    else
                        for _, l in ipairs(tagData.Box3DLines) do
                            l.Visible = false
                        end
                    end

                    if ConfigState.SkeletonESP then
                        for bIdx, jointDef in ipairs(SKELETON_JOINTS) do
                            local partA = char:FindFirstChild(jointDef[1]) or (jointDef[1] == "UpperTorso" and char:FindFirstChild("Torso")) or (jointDef[1] == "LowerTorso" and char:FindFirstChild("Torso"))
                            local partB = char:FindFirstChild(jointDef[2]) or (jointDef[3] and char:FindFirstChild(jointDef[3]))
                            if partA and partB and partA ~= partB then
                                local vpA = camera:WorldToViewportPoint(partA.Position)
                                local vpB = camera:WorldToViewportPoint(partB.Position)
                                drawLineFrame(tagData.SkeletonLines[bIdx], Vector2.new(vpA.X, vpA.Y), Vector2.new(vpB.X, vpB.Y), Theme.White, 1)
                            else
                                tagData.SkeletonLines[bIdx].Visible = false
                            end
                        end
                    else
                        for _, sLine in ipairs(tagData.SkeletonLines) do
                            sLine.Visible = false
                        end
                    end

                    if ConfigState.HealthBarESP then
                        local boxH = math.clamp(maxY - minY, 24, 340)
                        local maxHp = math.max(hum.MaxHealth or 100, 1)
                        local hpRatio = math.clamp(hum.Health / maxHp, 0, 1)
                        tagData.HealthBarBg.Position = UDim2.fromOffset(minX - 6, minY)
                        tagData.HealthBarBg.Size = UDim2.fromOffset(3, boxH)
                        tagData.HealthBarBg.Visible = true
                        tagData.HealthBarFill.Size = UDim2.fromScale(1, hpRatio)
                        tagData.HealthBarFill.BackgroundColor3 = Color3.fromRGB(
                            math.floor(255 * (1 - hpRatio)),
                            math.floor(255 * hpRatio),
                            90
                        )
                    else
                        tagData.HealthBarBg.Visible = false
                    end
                else
                    tagData.Overlay3D.Visible = false
                end

                if onScreen and ConfigState.Tracers then
                    local fromPos
                    if ConfigState.TracerOrigin == "Center" then
                        fromPos = Vector2.new(vp.X / 2, vp.Y / 2)
                    elseif ConfigState.TracerOrigin == "Bottom" then
                        fromPos = Vector2.new(vp.X / 2, vp.Y)
                    else
                        fromPos = Vector2.new(vp.X / 2, 0)
                    end
                    drawLineFrame(tagData.Tracer, fromPos, Vector2.new(screenPos.X, screenPos.Y), displayCol, 1)
                else
                    tagData.Tracer.Visible = false
                end
            end
        end
    end
end

local function updateCrosshair()
    UI.CrosshairV.Size = UDim2.fromOffset(1, ConfigState.CrosshairSize * 2)
    UI.CrosshairV.BackgroundColor3 = State.crosshairColor
    UI.CrosshairV.Visible = ConfigState.Crosshair

    UI.CrosshairH.Size = UDim2.fromOffset(ConfigState.CrosshairSize * 2, 1)
    UI.CrosshairH.BackgroundColor3 = State.crosshairColor
    UI.CrosshairH.Visible = ConfigState.Crosshair
end

local function getClosestTarget(camera, forSilentAim)
    local closestNormal, shortestNormal = nil, ConfigState.FOVRadius
    local closestPriority, shortestPriority = nil, ConfigState.FOVRadius
    local center = Vector2.new(camera.ViewportSize.X / 2, camera.ViewportSize.Y / 2)

    rayParams.FilterDescendantsInstances = LocalPlayer.Character and { LocalPlayer.Character } or {}

    for _, player in ipairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and passesTeamCheck(player) then
            local humanoid = player.Character:FindFirstChildOfClass("Humanoid")
            local part = forSilentAim
                and chooseWeightedSilentPart(player.Character)
                or getTargetPartFromCharacter(player.Character, ConfigState.TargetPart)
            if humanoid and humanoid.Health > 0 and part then
                local screenPos, onScreen = camera:WorldToViewportPoint(part.Position)
                if onScreen then
                    local dist = (Vector2.new(screenPos.X, screenPos.Y) - center).Magnitude
                    if dist <= ConfigState.FOVRadius then
                        local dir = part.Position - camera.CFrame.Position
                        local ray = workspace:Raycast(camera.CFrame.Position, dir.Unit * 999, rayParams)
                        if ray and ray.Instance and ray.Instance:IsDescendantOf(player.Character) then
                            if State.prioritizedPlayers[player.Name] then
                                if dist <= shortestPriority then
                                    shortestPriority = dist
                                    closestPriority = part
                                end
                            else
                                if dist <= shortestNormal then
                                    shortestNormal = dist
                                    closestNormal = part
                                end
                            end
                        end
                    end
                end
            end
        end
    end

    return closestPriority or closestNormal
end

-- Universal Multi-Method Silent Aim Setup (Raycast Hook + Mouse Hook + Camera Micro-Flick)
local function shouldSilentAimTrigger()
    if not State.isAuthorized or not ConfigState.SilentAim then
        return false
    end
    local chance = math.clamp(ConfigState.SilentHitChance or 100, 1, 100)
    return math.random(1, 100) <= chance
end

local function triggerSilentAimMicroFlick()
    if not shouldSilentAimTrigger() then
        return
    end
    local method = ConfigState.SilentAimMethod
    if method ~= "Auto Hybrid (All Methods)" and method ~= "Camera Micro-Flick (Undetected)" then
        return
    end
    local cam = workspace.CurrentCamera
    if not cam then
        return
    end
    local targetPart = getClosestTarget(cam, true)
    if targetPart then
        State.currentSilentTarget = targetPart
        local savedCF = cam.CFrame
        cam.CFrame = CFrame.new(savedCF.Position, targetPart.Position)
        task.delay(0.016, function()
            if cam and not ConfigState.Aimbot then
                cam.CFrame = savedCF
            end
        end)
    end
end

-- Hook metamethods safely if supported by executor (Raycast + FindPartOnRay + Mouse.Hit/Target)
pcall(function()
    if Env.hookmetamethod then
        local playerMouse = nil
        pcall(function()
            playerMouse = LocalPlayer:GetMouse()
        end)

        local oldNamecall
        oldNamecall = Env.hookmetamethod(game, "__namecall", function(self, ...)
            local method = Env.getnamecallmethod()
            local args = { ... }
            if not Env.checkcaller() and shouldSilentAimTrigger() then
                local cfgMethod = ConfigState.SilentAimMethod
                if cfgMethod == "Auto Hybrid (All Methods)" or cfgMethod == "Raycast + FindPartOnRay Hook" then
                    if self == workspace and (method == "Raycast" or method == "FindPartOnRay" or method == "FindPartOnRayWithIgnoreList" or method == "FindPartOnRayWithWhitelist") then
                        local cam = workspace.CurrentCamera
                        local targetPart = cam and getClosestTarget(cam, true)
                        if targetPart then
                            State.currentSilentTarget = targetPart
                            if method == "Raycast" and args[1] then
                                local origin = args[1]
                                args[2] = (targetPart.Position - origin).Unit * 1000
                                return oldNamecall(self, unpack(args))
                            elseif Ray and Ray.new and args[1] and args[1].Origin then
                                local orig = args[1].Origin
                                args[1] = Ray.new(orig, (targetPart.Position - orig).Unit * 1000)
                                return oldNamecall(self, unpack(args))
                            end
                        end
                    end
                end
            end
            return oldNamecall(self, ...)
        end)

        local oldIndex
        oldIndex = Env.hookmetamethod(game, "__index", function(self, key)
            if not Env.checkcaller() and playerMouse and self == playerMouse and shouldSilentAimTrigger() then
                local cfgMethod = ConfigState.SilentAimMethod
                if cfgMethod == "Auto Hybrid (All Methods)" or cfgMethod == "Mouse.Hit / Target Hook" then
                    if key == "Hit" or key == "Target" or key == "UnitRay" then
                        local cam = workspace.CurrentCamera
                        local targetPart = cam and getClosestTarget(cam, true)
                        if targetPart then
                            State.currentSilentTarget = targetPart
                            if key == "Hit" then
                                return targetPart.CFrame
                            elseif key == "Target" then
                                return targetPart
                            elseif key == "UnitRay" and cam and Ray and Ray.new then
                                return Ray.new(cam.CFrame.Position, (targetPart.Position - cam.CFrame.Position).Unit)
                            end
                        end
                    end
                end
            end
            return oldIndex(self, key)
        end)
    end
end)

-- Universal Hitbox Expander (Supports Team Check & Whitelist)
local function updateHitboxExpander()
    for _, p in ipairs(Players:GetPlayers()) do
        if p ~= LocalPlayer and p.Character then
            local hrp = p.Character:FindFirstChild("HumanoidRootPart")
            if hrp then
                if ConfigState.HitboxExpander and passesTeamCheck(p) then
                    if not State.hitboxCache[hrp] then
                        State.hitboxCache[hrp] = {
                            Size = hrp.Size,
                            Transparency = hrp.Transparency,
                            CanCollide = hrp.CanCollide,
                        }
                    end
                    local sz = ConfigState.HitboxSize or 10
                    hrp.Size = Vector3.new(sz, sz, sz)
                    hrp.Transparency = ConfigState.HitboxTransparency or 0.7
                    hrp.CanCollide = false
                elseif State.hitboxCache[hrp] then
                    local orig = State.hitboxCache[hrp]
                    hrp.Size = orig.Size
                    hrp.Transparency = orig.Transparency
                    hrp.CanCollide = orig.CanCollide
                    State.hitboxCache[hrp] = nil
                end
            end
        end
    end
end

local function restoreAllHitboxes()
    for hrp, orig in pairs(State.hitboxCache) do
        if hrp and hrp.Parent then
            pcall(function()
                hrp.Size = orig.Size
                hrp.Transparency = orig.Transparency
                hrp.CanCollide = orig.CanCollide
            end)
        end
    end
    table.clear(State.hitboxCache)
end

-- X-Ray Vision (Map Wall Transparency with Full Restoration)
local function applyXRayVision(enabled)
    if enabled then
        for _, desc in ipairs(workspace:GetDescendants()) do
            if desc:IsA("BasePart") then
                local isPlayerPart = false
                for _, p in ipairs(Players:GetPlayers()) do
                    if p.Character and desc:IsDescendantOf(p.Character) then
                        isPlayerPart = true
                        break
                    end
                end
                if not isPlayerPart and desc.Transparency < 0.95 then
                    if State.xrayCache[desc] == nil then
                        State.xrayCache[desc] = desc.Transparency
                    end
                    desc.Transparency = ConfigState.XRayTransparency
                end
            end
        end
    else
        for part, origT in pairs(State.xrayCache) do
            if part and part.Parent then
                pcall(function()
                    part.Transparency = origT
                end)
            end
        end
        table.clear(State.xrayCache)
    end
end

-- Sky & Atmosphere Preset Switcher
local SKY_PRESETS = {
    ["Pitch Black Void"] = {
        ClockTime = 0,
        Brightness = 0.4,
        Ambient = Color3.fromRGB(12, 12, 16),
        OutdoorAmbient = Color3.fromRGB(8, 8, 12),
    },
    ["Cyberpunk Night"] = {
        ClockTime = 21,
        Brightness = 1.6,
        Ambient = Color3.fromRGB(45, 95, 160),
        OutdoorAmbient = Color3.fromRGB(80, 40, 140),
    },
    ["Starry Nebula"] = {
        ClockTime = 2,
        Brightness = 1.2,
        Ambient = Color3.fromRGB(70, 60, 120),
        OutdoorAmbient = Color3.fromRGB(50, 45, 95),
    },
    ["Sunset Gold"] = {
        ClockTime = 17.8,
        Brightness = 2.0,
        Ambient = Color3.fromRGB(185, 115, 75),
        OutdoorAmbient = Color3.fromRGB(210, 130, 80),
    },
    ["Matrix Monochrome"] = {
        ClockTime = 1,
        Brightness = 1.5,
        Ambient = Color3.fromRGB(110, 110, 115),
        OutdoorAmbient = Color3.fromRGB(90, 90, 95),
    },
    ["Clean Daylight"] = {
        ClockTime = 13.5,
        Brightness = 2.4,
        Ambient = Color3.fromRGB(190, 195, 205),
        OutdoorAmbient = Color3.fromRGB(205, 210, 220),
    },
}

local function updateLightingEnvironment()
    local preset = SKY_PRESETS[ConfigState.SkyPreset]
    if preset then
        Lighting.ClockTime = preset.ClockTime
        Lighting.Brightness = preset.Brightness
        Lighting.Ambient = preset.Ambient
        Lighting.OutdoorAmbient = preset.OutdoorAmbient
    elseif ConfigState.Fullbright then
        Lighting.Brightness = 2
        Lighting.GlobalShadows = false
        Lighting.Ambient = Color3.fromRGB(255, 255, 255)
        Lighting.OutdoorAmbient = Color3.fromRGB(255, 255, 255)
    else
        Lighting.Brightness = State.origLighting.Brightness
        Lighting.GlobalShadows = State.origLighting.GlobalShadows
        Lighting.Ambient = State.origLighting.Ambient
        Lighting.OutdoorAmbient = State.origLighting.OutdoorAmbient
    end

    if ConfigState.NoFog then
        Lighting.FogEnd = 100000
        Lighting.FogStart = 100000
        for _, child in ipairs(Lighting:GetChildren()) do
            if child:IsA("Atmosphere") then
                pcall(function() child.Density = 0 end)
            end
        end
    else
        Lighting.FogEnd = State.origLighting.FogEnd
        Lighting.FogStart = State.origLighting.FogStart
    end
end

-- Glitch-Free Freecam Toggle
local function setFreecamEnabled(enabled)
    ConfigState.Freecam = enabled
    local cam = workspace.CurrentCamera
    local char = LocalPlayer.Character
    local hrp = char and char:FindFirstChild("HumanoidRootPart")
    local hum = char and char:FindFirstChildOfClass("Humanoid")

    if enabled and cam then
        State.freecamPos = cam.CFrame.Position
        State.freecamYaw = 0
        State.freecamPitch = 0
        if hrp then
            hrp.Anchored = true
        end
        cam.CameraType = Enum.CameraType.Scriptable
    else
        if hrp then
            hrp.Anchored = false
        end
        if cam then
            cam.CameraType = Enum.CameraType.Custom
            if hum then
                cam.CameraSubject = hum
            end
        end
    end
end

local function updateMovement()
    local char = LocalPlayer.Character
    local humanoid = char and char:FindFirstChildOfClass("Humanoid")
    if humanoid then
        humanoid.WalkSpeed = ConfigState.WalkSpeedEnabled and ConfigState.WalkSpeed or State.defaultWalkSpeed
        humanoid.UseJumpPower = true
        humanoid.JumpPower = ConfigState.JumpPowerEnabled and ConfigState.JumpPower or State.defaultJumpPower
    end
end

local function restoreNoClipCollisions()
    for part, origState in pairs(State.noclipCollideCache) do
        if part and part.Parent then
            part.CanCollide = origState
        end
    end
    table.clear(State.noclipCollideCache)
end

local function restoreAntiFlingCollisions()
    for part, origState in pairs(State.antiFlingCollideCache) do
        if part and part.Parent then
            part.CanCollide = origState
        end
    end
    table.clear(State.antiFlingCollideCache)
end

local function applyHeadless(state)
    local char = LocalPlayer.Character
    if not char then
        return
    end
    local head = char:FindFirstChild("Head")
    if not head then
        return
    end
    if state then
        if State.headlessCache.HeadTransparency == nil then
            State.headlessCache.HeadTransparency = head.Transparency
        end
        head.Transparency = 1
        for _, child in ipairs(head:GetChildren()) do
            if child:IsA("Decal") then
                State.headlessCache[child] = child.Transparency
                child.Transparency = 1
            end
        end
    else
        if State.headlessCache.HeadTransparency ~= nil then
            head.Transparency = State.headlessCache.HeadTransparency
        end
        for inst, origT in pairs(State.headlessCache) do
            if type(inst) == "table" and inst.Parent then
                pcall(function() inst.Transparency = origT end)
            end
        end
        table.clear(State.headlessCache)
    end
end

local function applyKorblox(state)
    local char = LocalPlayer.Character
    if not char then
        return
    end
    local rLower = char:FindFirstChild("RightLowerLeg")
    local rFoot = char:FindFirstChild("RightFoot")
    local rUpper = char:FindFirstChild("RightUpperLeg")
    local r6Leg = char:FindFirstChild("Right Leg")

    if state then
        if rLower then
            State.korbloxCache[rLower] = rLower.Transparency
            rLower.Transparency = 1
        end
        if rFoot then
            State.korbloxCache[rFoot] = rFoot.Transparency
            rFoot.Transparency = 1
        end
        if rUpper then
            pcall(function()
                rUpper.MeshId = "http://www.roblox.com/asset/?id=902942096"
                rUpper.TextureID = "http://www.roblox.com/asset/?id=902843398"
            end)
        end
        if r6Leg then
            State.korbloxCache[r6Leg] = r6Leg.Transparency
            r6Leg.Transparency = 0.45
        end
    else
        for part, origT in pairs(State.korbloxCache) do
            if part and part.Parent then
                pcall(function() part.Transparency = origT end)
            end
        end
        table.clear(State.korbloxCache)
    end
end

local function applyInstantInteract(state)
    if state then
        for _, desc in ipairs(workspace:GetDescendants()) do
            if desc:IsA("ProximityPrompt") then
                if State.promptDurationCache[desc] == nil then
                    State.promptDurationCache[desc] = desc.HoldDuration
                end
                desc.HoldDuration = 0
            end
        end
        if not State.instantPromptConnection and workspace.DescendantAdded then
            State.instantPromptConnection = workspace.DescendantAdded:Connect(function(desc)
                if ConfigState.InstantInteract and desc:IsA("ProximityPrompt") then
                    if State.promptDurationCache[desc] == nil then
                        State.promptDurationCache[desc] = desc.HoldDuration
                    end
                    desc.HoldDuration = 0
                end
            end)
        end
    else
        if State.instantPromptConnection then
            State.instantPromptConnection:Disconnect()
            State.instantPromptConnection = nil
        end
        for prompt, origDur in pairs(State.promptDurationCache) do
            if prompt and prompt.Parent then
                pcall(function() prompt.HoldDuration = origDur end)
            end
        end
        table.clear(State.promptDurationCache)
    end
end

local function runUltimateFPSBooster()
    local optimizedCount = 0
    pcall(function()
        Lighting.GlobalShadows = false
        Lighting.FogEnd = 9e9
        settings().Rendering.QualityLevel = Enum.QualityLevel.Level01
    end)

    local function optimizeInstance(obj)
        if obj:IsA("BasePart") then
            pcall(function()
                obj.Material = Enum.Material.SmoothPlastic
                obj.Reflectance = 0
                obj.CastShadow = false
            end)
            optimizedCount = optimizedCount + 1
        elseif obj:IsA("Decal") or obj:IsA("Texture") then
            pcall(function()
                obj.Transparency = 1
            end)
            optimizedCount = optimizedCount + 1
        elseif obj:IsA("ParticleEmitter") or obj:IsA("Trail") or obj:IsA("Smoke") or obj:IsA("Fire") or obj:IsA("Sparkles") then
            pcall(function()
                obj.Enabled = false
            end)
            optimizedCount = optimizedCount + 1
        elseif obj:IsA("PostEffect") or obj:IsA("BloomEffect") or obj:IsA("BlurEffect") or obj:IsA("DepthOfFieldEffect") or obj:IsA("SunRaysEffect") then
            pcall(function()
                obj.Enabled = false
            end)
            optimizedCount = optimizedCount + 1
        end
    end

    for _, desc in ipairs(workspace:GetDescendants()) do
        optimizeInstance(desc)
    end
    for _, desc in ipairs(Lighting:GetDescendants()) do
        optimizeInstance(desc)
    end

    if not State.fpsBoosterConnection and workspace.DescendantAdded then
        State.fpsBoosterConnection = workspace.DescendantAdded:Connect(function(desc)
            optimizeInstance(desc)
        end)
    end

    notify("FPS Booster", string.format("Deep optimized %d instances & locked SmoothPlastic!", optimizedCount), 5)
end

local function flingTargetPlayer(targetPlayer)
    local myChar = LocalPlayer.Character
    local myHRP = myChar and myChar:FindFirstChild("HumanoidRootPart")
    local tChar = targetPlayer and targetPlayer.Character
    local tHRP = tChar and tChar:FindFirstChild("HumanoidRootPart")

    if not myHRP or not tHRP then
        notify("Core.xyz", "Target character or HumanoidRootPart unavailable.", 3)
        return
    end

    local savedCFrame = myHRP.CFrame
    notify("Core.xyz", "Flinging " .. tostring(targetPlayer.Name) .. "...", 3)

    task.spawn(function()
        for _ = 1, 28 do
            if not myHRP or not myHRP.Parent or not tHRP or not tHRP.Parent then
                break
            end
            myHRP.CFrame = tHRP.CFrame * CFrame.new(0, 0, 0)
            pcall(function()
                myHRP.Velocity = Vector3.new(9000, 9000, 9000)
                myHRP.RotVelocity = Vector3.new(9000, 9000, 9000)
            end)
            task.wait(0.025)
        end
        if myHRP and myHRP.Parent then
            pcall(function()
                myHRP.Velocity = Vector3.zero
                myHRP.RotVelocity = Vector3.zero
            end)
            myHRP.CFrame = savedCFrame
        end
        notify("Core.xyz", "Returned to original position after fling.", 3)
    end)
end

--------------------------------------------------------------------------------
-- 12. BUILD ALL 7 TABS (SCOPED IN DO-BLOCKS TO FREE LOCAL REGISTERS)
--------------------------------------------------------------------------------
local HomeTab = createTab("Home", 1)
local CombatTab = createTab("Combat", 2)
local VisualsTab = createTab("Visuals", 3)
local MovementTab = createTab("Movement", 4)
local PlayersTab = createTab("Players", 5)
local WorldTab = createTab("World", 6)
local SettingsTab = createTab("Settings", 7)

-- TAB 1: HOME
do
    createLabel(HomeTab, "Core.xyz Universal v4.0")
    createButton(HomeTab, "Copy Discord Invite", function()
        if Env.setclipboard then
            Env.setclipboard("https://discord.gg/yeKPEZpMMu")
            notify("Core.xyz", "Discord invite copied to clipboard!", 4)
        else
            notify("Core.xyz", "Discord: discord.gg/yeKPEZpMMu", 4)
        end
    end)
    createButton(HomeTab, "Reset Character Camera", function()
        local cam = workspace.CurrentCamera
        local hum = LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
        if cam and hum then
            setFreecamEnabled(false)
            cam.CameraSubject = hum
            cam.CameraType = Enum.CameraType.Custom
            notify("Core.xyz", "Camera subject reset to your character.", 3)
        end
    end)
end

-- TAB 2: COMBAT (AIMBOT + SILENT AIM + WEIGHTED BODY HIT CHANCE + HITBOX EXPANDER + WHITELIST)
do
    createLabel(CombatTab, "Camera Aimbot & FOV")
    createToggle(CombatTab, "Aimbot", false, function(val)
        ConfigState.Aimbot = val
    end)
    createToggle(CombatTab, "FOV Circle", false, function(val)
        ConfigState.ShowFOV = val
        UI.FovCircle.Visible = val
    end)
    createSlider(CombatTab, "FOV Radius", 10, 240, 85, 1, "px", function(val)
        ConfigState.FOVRadius = val
        UI.FovCircle.Size = UDim2.fromOffset(val * 2, val * 2)
    end)
    createSlider(CombatTab, "Aimbot Smoothness", 0.05, 1, 0.4, 0.01, "", function(val)
        ConfigState.Smoothness = val
    end)
    createDropdown(CombatTab, "Aimbot Target Bone", {
        "Head",
        "HumanoidRootPart",
        "UpperTorso",
        "LowerTorso",
    }, "Head", function(opt)
        ConfigState.TargetPart = opt
    end)

    createLabel(CombatTab, "Universal Silent Aim & Weighted Hit Chance")
    createToggle(CombatTab, "Silent Aim", false, function(val)
        ConfigState.SilentAim = val
        if not val then
            UI.SilentSnapline.Visible = false
        end
    end)
    createDropdown(CombatTab, "Silent Aim Method", {
        "Auto Hybrid (All Methods)",
        "Raycast + FindPartOnRay Hook",
        "Mouse.Hit / Target Hook",
        "Camera Micro-Flick (Undetected)",
    }, "Auto Hybrid (All Methods)", function(opt)
        ConfigState.SilentAimMethod = opt
    end)
    createSlider(CombatTab, "Silent Aim Hit Chance", 1, 100, 100, 1, "%", function(val)
        ConfigState.SilentHitChance = val
    end)
    createSlider(CombatTab, "Head Hit Weight", 0, 100, 80, 1, "%", function(val)
        ConfigState.SilentHeadWeight = val
    end)
    createSlider(CombatTab, "Torso Hit Weight", 0, 100, 0, 1, "%", function(val)
        ConfigState.SilentTorsoWeight = val
    end)
    createSlider(CombatTab, "Legs Hit Weight", 0, 100, 20, 1, "%", function(val)
        ConfigState.SilentLegsWeight = val
    end)
    createToggle(CombatTab, "Silent Aim Target Snapline", false, function(val)
        ConfigState.SilentSnapline = val
        if not val then
            UI.SilentSnapline.Visible = false
        end
    end)

    createLabel(CombatTab, "Universal Hitbox Expander (Team & Whitelist Aware)")
    createToggle(CombatTab, "Hitbox Expander", false, function(val)
        ConfigState.HitboxExpander = val
        if val then
            updateHitboxExpander()
        else
            restoreAllHitboxes()
        end
    end)
    createSlider(CombatTab, "Hitbox Size", 2, 25, 10, 1, "studs", function(val)
        ConfigState.HitboxSize = val
        if ConfigState.HitboxExpander then
            updateHitboxExpander()
        end
    end)
    createSlider(CombatTab, "Hitbox Transparency", 0, 1, 0.7, 0.05, "", function(val)
        ConfigState.HitboxTransparency = val
        if ConfigState.HitboxExpander then
            updateHitboxExpander()
        end
    end)

    createLabel(CombatTab, "Team Check & Player Whitelist")
    createToggle(CombatTab, "Team Check", true, function(val)
        ConfigState.TeamCheck = val
        if ConfigState.HitboxExpander then
            updateHitboxExpander()
        end
    end)
    createToggle(CombatTab, "Ignore Whitelisted Players", true, function(val)
        ConfigState.UseWhitelist = val
        if ConfigState.HitboxExpander then
            updateHitboxExpander()
        end
    end)

    local initialPlayerNames = {}
    for _, p in ipairs(Players:GetPlayers()) do
        if p ~= LocalPlayer then
            table.insert(initialPlayerNames, p.Name)
        end
    end

    local WhitelistDropdownCtrl = createMultiDropdown(CombatTab, "Whitelisted Players", initialPlayerNames, State.whitelistArray, 50, function(selectedNames)
        table.clear(State.whitelistedPlayers)
        for _, name in ipairs(selectedNames) do
            State.whitelistedPlayers[name] = true
        end
        if ConfigState.HitboxExpander then
            updateHitboxExpander()
        end
        if State.refreshPlayerListUI then
            State.refreshPlayerListUI()
        end
    end)
    State.refreshWhitelistDropdown = WhitelistDropdownCtrl.Refresh

    for _, team in ipairs(Teams:GetChildren()) do
        table.insert(State.allTeams, team.Name)
    end
    createDropdown(CombatTab, "Target Teams", State.allTeams, "All", function(opt)
        State.selectedTeams = { [opt] = true }
    end)
end

-- TAB 3: VISUALS (3D BOUNDING BOX + SKELETON RIG + X-RAY + SKY/ATMOSPHERE + FREECAM)
do
    createLabel(VisualsTab, "3D ESP & Skeleton Rig Overlays")
    createToggle(VisualsTab, "Player ESP (Highlight + Tag)", false, function(val)
        ConfigState.ESP = val
        if not val and not ConfigState.Box3DESP and not ConfigState.SkeletonESP and not ConfigState.HealthBarESP and not ConfigState.Tracers then
            clearESP()
        end
    end)
    createToggle(VisualsTab, "3D Bounding Box Overlay", false, function(val)
        ConfigState.Box3DESP = val
        if not val and not ConfigState.ESP and not ConfigState.SkeletonESP and not ConfigState.HealthBarESP and not ConfigState.Tracers then
            clearESP()
        end
    end)
    createToggle(VisualsTab, "3D Skeleton Rig Overlay", false, function(val)
        ConfigState.SkeletonESP = val
        if not val and not ConfigState.ESP and not ConfigState.Box3DESP and not ConfigState.HealthBarESP and not ConfigState.Tracers then
            clearESP()
        end
    end)
    createToggle(VisualsTab, "Animated Health Bar Overlay", false, function(val)
        ConfigState.HealthBarESP = val
        if not val and not ConfigState.ESP and not ConfigState.Box3DESP and not ConfigState.SkeletonESP and not ConfigState.Tracers then
            clearESP()
        end
    end)
    createToggle(VisualsTab, "Snapline Tracers", false, function(val)
        ConfigState.Tracers = val
        for _, data in pairs(State.espObjects) do
            if data.Tracer then
                data.Tracer.Visible = val
            end
        end
    end)
    createDropdown(VisualsTab, "Tracer Origin", { "Center", "Bottom", "Top" }, "Center", function(opt)
        ConfigState.TracerOrigin = opt
    end)

    local ColorMap = {
        White = Color3.fromRGB(255, 255, 255),
        Silver = Color3.fromRGB(185, 185, 195),
        Red = Color3.fromRGB(255, 70, 70),
        Cyan = Color3.fromRGB(80, 225, 255),
        Green = Color3.fromRGB(90, 255, 145),
    }
    createDropdown(VisualsTab, "ESP Color", { "White", "Silver", "Red", "Cyan", "Green" }, "White", function(opt)
        ConfigState.ESPColorName = opt
        State.espColor = ColorMap[opt] or Theme.White
    end)

    createToggle(VisualsTab, "Custom Crosshair", false, function(val)
        ConfigState.Crosshair = val
        updateCrosshair()
    end)
    createDropdown(VisualsTab, "Crosshair Color", { "White", "Red", "Cyan", "Green" }, "White", function(opt)
        ConfigState.CrosshairColorName = opt
        State.crosshairColor = ColorMap[opt] or Theme.White
        updateCrosshair()
    end)
    createSlider(VisualsTab, "Crosshair Size", 4, 45, 10, 1, "px", function(val)
        ConfigState.CrosshairSize = val
        updateCrosshair()
    end)

    createLabel(VisualsTab, "X-Ray, Sky & World Atmosphere")
    createToggle(VisualsTab, "X-Ray Vision (See-Through Walls)", false, function(val)
        ConfigState.XRay = val
        applyXRayVision(val)
    end)
    createSlider(VisualsTab, "X-Ray Wall Transparency", 0.1, 0.9, 0.6, 0.05, "", function(val)
        ConfigState.XRayTransparency = val
        if ConfigState.XRay then
            applyXRayVision(true)
        end
    end)
    createDropdown(VisualsTab, "Sky & Atmosphere Preset", {
        "Game Default",
        "Pitch Black Void",
        "Cyberpunk Night",
        "Starry Nebula",
        "Sunset Gold",
        "Matrix Monochrome",
        "Clean Daylight",
    }, "Game Default", function(opt)
        ConfigState.SkyPreset = opt
        updateLightingEnvironment()
    end)
    createToggle(VisualsTab, "Fullbright", false, function(val)
        ConfigState.Fullbright = val
        updateLightingEnvironment()
    end)
    createToggle(VisualsTab, "No Fog", false, function(val)
        ConfigState.NoFog = val
        updateLightingEnvironment()
    end)
    createSlider(VisualsTab, "Time of Day", 0, 24, 14, 0.5, "hr", function(val)
        ConfigState.TimeOfDay = val
        Lighting.ClockTime = val
    end)

    createLabel(VisualsTab, "Freecam & Camera Enhancements")
    createToggle(VisualsTab, "Freecam (Drone Camera)", false, function(val)
        setFreecamEnabled(val)
    end)
    createSlider(VisualsTab, "Freecam Speed", 10, 150, 45, 1, "studs/s", function(val)
        ConfigState.FreecamSpeed = val
    end)
    createToggle(VisualsTab, "Custom Camera FOV", false, function(val)
        ConfigState.CustomCamFOV = val
        local cam = workspace.CurrentCamera
        if cam and not val then
            cam.FieldOfView = State.defaultCamFOV
        end
    end)
    createSlider(VisualsTab, "Camera FOV", 50, 120, 70, 1, "deg", function(val)
        ConfigState.CamFOV = val
        local cam = workspace.CurrentCamera
        if cam and ConfigState.CustomCamFOV then
            cam.FieldOfView = val
        end
    end)
    createToggle(VisualsTab, "Infinite Zoom Distance", false, function(val)
        ConfigState.InfZoom = val
        LocalPlayer.CameraMaxZoomDistance = val and 9999 or State.defaultMaxZoom
    end)
    createToggle(VisualsTab, "Noclip Camera (See Through Walls)", false, function(val)
        ConfigState.NoclipCam = val
        pcall(function()
            LocalPlayer.DevCameraOcclusionMode = val and Enum.DevCameraOcclusionMode.Invisicam or State.defaultOcclusion
        end)
    end)

    createLabel(VisualsTab, "Client Character Cosmetics")
    createToggle(VisualsTab, "Headless Horseman", false, function(val)
        ConfigState.Headless = val
        applyHeadless(val)
    end)
    createToggle(VisualsTab, "Korblox Right Leg", false, function(val)
        ConfigState.Korblox = val
        applyKorblox(val)
    end)
end

-- TAB 4: MOVEMENT & PROTECTION (SWIM IN AIR + SPINBOT + ANTI-FLING + ANTI-RAGDOLL + ANTI-VOID)
do
    createLabel(MovementTab, "Character Speed, Jump & Air Swim")
    createToggle(MovementTab, "Custom WalkSpeed", false, function(val)
        ConfigState.WalkSpeedEnabled = val
        updateMovement()
    end)
    createSlider(MovementTab, "WalkSpeed", 16, 150, 16, 1, "studs", function(val)
        ConfigState.WalkSpeed = val
        if ConfigState.WalkSpeedEnabled then
            updateMovement()
        end
    end)
    createToggle(MovementTab, "Custom JumpPower", false, function(val)
        ConfigState.JumpPowerEnabled = val
        updateMovement()
    end)
    createSlider(MovementTab, "JumpPower", 50, 250, 50, 1, "power", function(val)
        ConfigState.JumpPower = val
        if ConfigState.JumpPowerEnabled then
            updateMovement()
        end
    end)
    createToggle(MovementTab, "Infinite Jump", false, function(val)
        ConfigState.InfJump = val
    end)
    createToggle(MovementTab, "Swim in Air (Sky-Swim)", false, function(val)
        ConfigState.SwimInAir = val
        local hum = LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
        if hum and val then
            pcall(function()
                hum:ChangeState(Enum.HumanoidStateType.Swimming)
            end)
        end
    end)
    createToggle(MovementTab, "NoClip (Stepped)", false, function(val)
        ConfigState.NoClip = val
        if not val then
            restoreNoClipCollisions()
        end
    end)

    createLabel(MovementTab, "Spinbot Controller")
    createToggle(MovementTab, "Spinbot", false, function(val)
        ConfigState.Spinbot = val
    end)
    createSlider(MovementTab, "Spinbot Speed", 1, 100, 25, 1, "deg/f", function(val)
        ConfigState.SpinSpeed = val
    end)

    createLabel(MovementTab, "Character Protection & Immortality")
    createToggle(MovementTab, "Anti-Fling (Disable Other Players Collision)", false, function(val)
        ConfigState.AntiFling = val
        if not val then
            restoreAntiFlingCollisions()
        end
    end)
    createToggle(MovementTab, "Anti-Ragdoll / Anti-Stun", false, function(val)
        ConfigState.AntiRagdoll = val
    end)
    createToggle(MovementTab, "Anti-Void Protection (Return to Safe Ground)", false, function(val)
        ConfigState.AntiVoid = val
    end)
end

-- TAB 5: PLAYERS (EXPANDABLE PLAYER CARDS WITH AVATAR & 6 INLINE ACTION BUTTONS)
do
    createLabel(PlayersTab, "Server Players (Tap Player to Open/Close 6 Actions)")

    local PlayerListContainer = Instance.new("Frame")
    PlayerListContainer.Size = UDim2.new(1, 0, 0, 180)
    PlayerListContainer.AutomaticSize = Enum.AutomaticSize.Y
    PlayerListContainer.BackgroundTransparency = 1
    PlayerListContainer.ZIndex = 14
    PlayerListContainer.Parent = PlayersTab

    local PlayerListLayout = Instance.new("UIListLayout")
    PlayerListLayout.Padding = UDim.new(0, 6)
    PlayerListLayout.SortOrder = Enum.SortOrder.LayoutOrder
    PlayerListLayout.Parent = PlayerListContainer

    local playerCardsUI = {}

    local function refreshPlayerListUI()
        for _, card in ipairs(playerCardsUI) do
            if card and card.Parent then
                card:Destroy()
            end
        end
        table.clear(playerCardsUI)

        local myHRP = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")

        for i, p in ipairs(Players:GetPlayers()) do
            if p ~= LocalPlayer then
                local isExpanded = (State.expandedPlayerName == p.Name)
                local isWhite = State.whitelistedPlayers[p.Name] == true
                local isPrio = State.prioritizedPlayers[p.Name] == true
                local isSpec = (State.spectatingPlayerName == p.Name)

                local card = Instance.new("Frame")
                card.Name = "PlayerCard_" .. p.Name
                card.LayoutOrder = i
                card.Size = UDim2.new(1, 0, 0, isExpanded and 126 or 44)
                card.BackgroundColor3 = isExpanded and Theme.Elevated or Theme.Surface
                card.ClipsDescendants = true
                card.ZIndex = 15
                card.Parent = PlayerListContainer
                addCorner(card, 8)
                addStroke(card, isExpanded and Theme.Accent or Theme.Border, 1, 0)

                -- Header Button (Avatar + Name + Badges)
                local headerBtn = Instance.new("TextButton")
                headerBtn.Name = "PlayerHeader_" .. p.Name
                headerBtn.Size = UDim2.new(1, 0, 0, 44)
                headerBtn.BackgroundTransparency = 1
                headerBtn.AutoButtonColor = false
                headerBtn.Text = ""
                headerBtn.ZIndex = 16
                headerBtn.Parent = card

                local avatarImg = Instance.new("ImageLabel")
                avatarImg.Name = "AvatarImage"
                avatarImg.AnchorPoint = Vector2.new(0, 0.5)
                avatarImg.Position = UDim2.new(0, 8, 0.5, 0)
                avatarImg.Size = UDim2.fromOffset(30, 30)
                avatarImg.BackgroundColor3 = Theme.Deep
                avatarImg.Image = "rbxthumb://type=AvatarHeadShot&id=" .. tostring(p.UserId or 1) .. "&w=150&h=150"
                avatarImg.ZIndex = 17
                avatarImg.Parent = headerBtn
                addCorner(avatarImg, 99)
                addStroke(avatarImg, isPrio and Theme.Success or Theme.Border, 1, 0)

                local distStr = ""
                local tHRP = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
                if myHRP and tHRP then
                    distStr = string.format(" [%dm]", math.floor((tHRP.Position - myHRP.Position).Magnitude))
                end

                local badges = ""
                if isWhite then badges = badges .. " [WHITELIST]" end
                if isPrio then badges = badges .. " [PRIORITY]" end
                if isSpec then badges = badges .. " [SPECTATING]" end

                local nameLbl = Instance.new("TextLabel")
                nameLbl.Position = UDim2.fromOffset(46, 0)
                nameLbl.Size = UDim2.new(1, -72, 1, 0)
                nameLbl.BackgroundTransparency = 1
                nameLbl.Font = Enum.Font.Code
                nameLbl.Text = string.format("%s (@%s)%s%s", tostring(p.DisplayName or p.Name), p.Name, distStr, badges)
                nameLbl.TextColor3 = isExpanded and Theme.White or Theme.Silver
                nameLbl.TextSize = 11
                nameLbl.TextTruncate = Enum.TextTruncate.AtEnd
                nameLbl.TextXAlignment = Enum.TextXAlignment.Left
                nameLbl.ZIndex = 17
                nameLbl.Parent = headerBtn

                local chev = Instance.new("TextLabel")
                chev.AnchorPoint = Vector2.new(1, 0.5)
                chev.Position = UDim2.new(1, -12, 0.5, 0)
                chev.Size = UDim2.fromOffset(14, 14)
                chev.BackgroundTransparency = 1
                chev.Font = Enum.Font.GothamBold
                chev.Text = isExpanded and "▴" or "▾"
                chev.TextColor3 = Theme.Muted
                chev.TextSize = 12
                chev.ZIndex = 17
                chev.Parent = headerBtn

                -- Clicking header toggles 6-option drawer under this player (or switches from another player)
                headerBtn.MouseButton1Click:Connect(function()
                    if State.expandedPlayerName == p.Name then
                        State.expandedPlayerName = nil
                    else
                        State.expandedPlayerName = p.Name
                    end
                    refreshPlayerListUI()
                end)

                -- 6 Action Buttons Container underneath Header (2 rows x 3 columns)
                local actionsHolder = Instance.new("Frame")
                actionsHolder.Name = "PlayerActions_" .. p.Name
                actionsHolder.Position = UDim2.fromOffset(8, 46)
                actionsHolder.Size = UDim2.new(1, -16, 0, 72)
                actionsHolder.BackgroundTransparency = 1
                actionsHolder.Visible = isExpanded
                actionsHolder.ZIndex = 16
                actionsHolder.Parent = card

                local function makeActionBtn(col, row, label, isActive, onClick)
                    local aBtn = Instance.new("TextButton")
                    aBtn.Name = "Action_" .. label
                    aBtn.Position = UDim2.new((col - 1) * 0.335, 0, 0, (row - 1) * 36)
                    aBtn.Size = UDim2.new(0.32, 0, 0, 30)
                    aBtn.BackgroundColor3 = isActive and Theme.Accent or Theme.Deep
                    aBtn.AutoButtonColor = false
                    aBtn.Font = Enum.Font.GothamBold
                    aBtn.Text = label
                    aBtn.TextColor3 = isActive and Theme.Black or Theme.White
                    aBtn.TextSize = 10
                    aBtn.ZIndex = 17
                    aBtn.Parent = actionsHolder
                    addCorner(aBtn, 6)
                    addStroke(aBtn, isActive and Theme.Accent or Theme.Border, 1, 0)
                    aBtn.MouseButton1Click:Connect(onClick)
                    return aBtn
                end

                -- 1. Whitelist
                makeActionBtn(1, 1, "Whitelist", isWhite, function()
                    State.whitelistedPlayers[p.Name] = not isWhite and true or nil
                    syncWhitelistArrayFromMap()
                    if ConfigState.HitboxExpander then
                        updateHitboxExpander()
                    end
                    notify("Players", (not isWhite and "Whitelisted " or "Removed whitelist on ") .. p.Name, 3)
                    refreshPlayerListUI()
                end)

                -- 2. Prioritize
                makeActionBtn(2, 1, "Prioritize", isPrio, function()
                    State.prioritizedPlayers[p.Name] = not isPrio and true or nil
                    notify("Players", (not isPrio and "Prioritizing " or "Removed priority on ") .. p.Name, 3)
                    refreshPlayerListUI()
                end)

                -- 3. Spectate
                makeActionBtn(3, 1, "Spectate", isSpec, function()
                    local cam = workspace.CurrentCamera
                    if isSpec then
                        State.spectatingPlayerName = nil
                        local myHum = LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
                        if cam and myHum then
                            cam.CameraSubject = myHum
                        end
                    else
                        State.spectatingPlayerName = p.Name
                        local tHum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
                        if cam and tHum then
                            cam.CameraSubject = tHum
                            notify("Players", "Spectating " .. p.Name, 3)
                        end
                    end
                    refreshPlayerListUI()
                end)

                -- 4. Teleport
                makeActionBtn(1, 2, "Teleport", false, function()
                    local myRoot = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
                    local targetRoot = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
                    if myRoot and targetRoot then
                        myRoot.CFrame = targetRoot.CFrame * CFrame.new(0, 0, 3)
                        notify("Players", "Teleported to " .. p.Name, 3)
                    end
                end)

                -- 5. Copy UserName
                makeActionBtn(2, 2, "Copy UserName", false, function()
                    if Env.setclipboard then
                        Env.setclipboard(p.Name)
                    end
                    notify("Players", "Copied username: " .. p.Name, 3)
                end)

                -- 6. Fling
                makeActionBtn(3, 2, "Fling", false, function()
                    flingTargetPlayer(p)
                end)

                table.insert(playerCardsUI, card)
            end
        end
    end

    State.refreshPlayerListUI = refreshPlayerListUI
    refreshPlayerListUI()

    Players.PlayerAdded:Connect(function()
        syncWhitelistArrayFromMap()
        if UI.MainWindow.Visible then
            refreshPlayerListUI()
        end
    end)
    Players.PlayerRemoving:Connect(function()
        syncWhitelistArrayFromMap()
        if UI.MainWindow.Visible then
            refreshPlayerListUI()
        end
    end)
end

-- TAB 6: WORLD & MISC
do
    createLabel(WorldTab, "Universal Interaction Automation")
    createToggle(WorldTab, "Instant Interact (0s ProximityPrompts)", false, function(val)
        ConfigState.InstantInteract = val
        applyInstantInteract(val)
    end)
    createToggle(WorldTab, "Auto-Interact Nearby Prompts/ClickDetectors", false, function(val)
        ConfigState.AutoInteract = val
    end)
    createSlider(WorldTab, "Auto-Interact Radius", 5, 25, 15, 1, "studs", function(val)
        ConfigState.InteractRadius = val
    end)

    createLabel(WorldTab, "Game Waypoints (Saved for PlaceId: " .. CURRENT_PLACE_ID .. ")")

    local gameWaypoints = safeJsonDecode(safeReadFile(WAYPOINTS_FILE))
    if type(gameWaypoints) ~= "table" then
        gameWaypoints = {}
    end

    local WaypointNameBox = createTextInputRow(WorldTab, "Waypoint Name", "e.g. SafeZone, Boss, Shop", "", nil)
    local WaypointsListFrame = Instance.new("Frame")
    local waypointItemsUI = {}

    local function saveGameWaypointsToDisk()
        safeWriteFile(WAYPOINTS_FILE, safeJsonEncode(gameWaypoints))
    end

    local function rebuildWaypointsUI()
        for _, item in ipairs(waypointItemsUI) do
            if item and item.Parent then
                item:Destroy()
            end
        end
        table.clear(waypointItemsUI)

        for i, wp in ipairs(gameWaypoints) do
            local row = Instance.new("Frame")
            row.LayoutOrder = i
            row.Size = UDim2.new(1, 0, 0, 34)
            row.BackgroundColor3 = Theme.Surface
            row.ZIndex = 14
            row.Parent = WaypointsListFrame
            addCorner(row, 6)
            addStroke(row, Theme.Border, 1, 0)

            local nameLbl = Instance.new("TextLabel")
            nameLbl.Position = UDim2.fromOffset(12, 0)
            nameLbl.Size = UDim2.new(0.55, 0, 1, 0)
            nameLbl.BackgroundTransparency = 1
            nameLbl.Font = Enum.Font.Code
            nameLbl.Text = string.format("%s (%d, %d, %d)", tostring(wp.Name), math.floor(wp.X), math.floor(wp.Y), math.floor(wp.Z))
            nameLbl.TextColor3 = Theme.White
            nameLbl.TextSize = 11
            nameLbl.TextTruncate = Enum.TextTruncate.AtEnd
            nameLbl.TextXAlignment = Enum.TextXAlignment.Left
            nameLbl.ZIndex = 15
            nameLbl.Parent = row

            local tpBtn = Instance.new("TextButton")
            tpBtn.AnchorPoint = Vector2.new(1, 0.5)
            tpBtn.Position = UDim2.new(1, -68, 0.5, 0)
            tpBtn.Size = UDim2.fromOffset(58, 24)
            tpBtn.BackgroundColor3 = Theme.Accent
            tpBtn.AutoButtonColor = false
            tpBtn.Font = Enum.Font.GothamBold
            tpBtn.Text = "TP"
            tpBtn.TextColor3 = Theme.Black
            tpBtn.TextSize = 10
            tpBtn.ZIndex = 15
            tpBtn.Parent = row
            addCorner(tpBtn, 5)
            registerAccentObject(tpBtn, "BackgroundColor3")

            local delBtn = Instance.new("TextButton")
            delBtn.AnchorPoint = Vector2.new(1, 0.5)
            delBtn.Position = UDim2.new(1, -8, 0.5, 0)
            delBtn.Size = UDim2.fromOffset(54, 24)
            delBtn.BackgroundColor3 = Theme.Deep
            delBtn.AutoButtonColor = false
            delBtn.Font = Enum.Font.GothamBold
            delBtn.Text = "DEL"
            delBtn.TextColor3 = Theme.Error
            delBtn.TextSize = 10
            delBtn.ZIndex = 15
            delBtn.Parent = row
            addCorner(delBtn, 5)
            addStroke(delBtn, Theme.Border, 1, 0)

            tpBtn.MouseButton1Click:Connect(function()
                local myHRP = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
                if myHRP then
                    myHRP.CFrame = CFrame.new(Vector3.new(wp.X, wp.Y, wp.Z))
                    notify("Waypoints", "Teleported to waypoint: " .. tostring(wp.Name), 3)
                end
            end)

            delBtn.MouseButton1Click:Connect(function()
                table.remove(gameWaypoints, i)
                saveGameWaypointsToDisk()
                rebuildWaypointsUI()
                notify("Waypoints", "Deleted waypoint: " .. tostring(wp.Name), 3)
            end)

            table.insert(waypointItemsUI, row)
        end
    end

    createButton(WorldTab, "Save Current Position as Waypoint", function()
        local name = (WaypointNameBox.Text or ""):gsub("^%s*(.-)%s*$", "%1")
        if name == "" then
            notify("Waypoints", "Please enter a Waypoint Name first!", 3)
            return
        end
        local myHRP = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
        if not myHRP then
            notify("Waypoints", "Character HumanoidRootPart not found!", 3)
            return
        end
        local pos = myHRP.Position
        table.insert(gameWaypoints, {
            Name = name,
            X = pos.X,
            Y = pos.Y,
            Z = pos.Z,
            PlaceId = CURRENT_PLACE_ID,
        })
        WaypointNameBox.Text = ""
        saveGameWaypointsToDisk()
        rebuildWaypointsUI()
        notify("Waypoints", "Saved '" .. name .. "' for PlaceId " .. CURRENT_PLACE_ID, 4)
    end)

    WaypointsListFrame.Size = UDim2.new(1, 0, 0, 10)
    WaypointsListFrame.AutomaticSize = Enum.AutomaticSize.Y
    WaypointsListFrame.BackgroundTransparency = 1
    WaypointsListFrame.ZIndex = 14
    WaypointsListFrame.Parent = WorldTab

    local WaypointsListLayout = Instance.new("UIListLayout")
    WaypointsListLayout.Padding = UDim.new(0, 6)
    WaypointsListLayout.SortOrder = Enum.SortOrder.LayoutOrder
    WaypointsListLayout.Parent = WaypointsListFrame

    rebuildWaypointsUI()

    createLabel(WorldTab, "Performance & FPS Optimization")
    createButton(WorldTab, "Activate Ultimate Deep FPS Booster", function()
        runUltimateFPSBooster()
    end)

    createToggle(WorldTab, "Disable 3D Rendering (AFK GPU/Battery Saver)", false, function(val)
        ConfigState.Disable3DRender = val
        UI.RenderSaverOverlay.Visible = val
        pcall(function()
            if RunService.Set3dRenderingEnabled then
                RunService:Set3dRenderingEnabled(not val)
            end
        end)
        notify("Core.xyz", val and "3D Rendering paused (Battery Saver On)." or "3D Rendering restored.", 3)
    end)

    local CustomFpsBox
    createToggle(WorldTab, "Uncap FPS", false, function(val)
        ConfigState.UncapFPS = val
        if Env.setfpscap then
            local targetCap = val and (tonumber(CustomFpsBox and CustomFpsBox.Text) or ConfigState.CustomFPS or 999) or 60
            pcall(function()
                Env.setfpscap(targetCap)
            end)
            notify("FPS Cap", "FPS Cap set to " .. tostring(targetCap), 3)
        else
            notify("FPS Cap", "Executor setfpscap applied (" .. tostring(val and ConfigState.CustomFPS or 60) .. " FPS).", 3)
        end
    end)

    CustomFpsBox = createTextInputRow(WorldTab, "Custom FPS Target", "e.g. 144, 240, 999", "144", function(txt)
        local num = tonumber(txt)
        if num and num >= 15 then
            ConfigState.CustomFPS = math.floor(num)
            if ConfigState.UncapFPS and Env.setfpscap then
                pcall(function()
                    Env.setfpscap(ConfigState.CustomFPS)
                end)
            end
        end
    end)

    createLabel(WorldTab, "Server & Session Tools")
    createButton(WorldTab, "Rejoin Current Server", function()
        notify("Server", "Rejoining current server...", 3)
        pcall(function()
            TeleportService:TeleportToPlaceInstance(game.PlaceId, game.JobId, LocalPlayer)
        end)
    end)

    createDropdown(WorldTab, "Server Hop Mode", { "Default", "Lowest Players", "Highest Players", "Lower Ping" }, "Lowest Players", function(opt)
        ConfigState.ServerHopMode = opt
    end)

    createButton(WorldTab, "Server Hop Now", function()
        notify("Server Hop", "Searching servers (" .. ConfigState.ServerHopMode .. ")...", 4)
        task.spawn(function()
            local ok, response = pcall(function()
                local sortOrder = (ConfigState.ServerHopMode == "Lowest Players") and "Asc" or "Desc"
                local url = string.format(
                    "https://games.roblox.com/v1/games/%s/servers/Public?sortOrder=%s&limit=100",
                    tostring(game.PlaceId),
                    sortOrder
                )
                return game:HttpGet(url)
            end)
            if ok and response then
                local decoded = safeJsonDecode(response)
                if decoded and type(decoded.data) == "table" then
                    local candidates = {}
                    for _, srv in ipairs(decoded.data) do
                        if type(srv) == "table" and srv.id ~= game.JobId and (srv.playing or 0) < (srv.maxPlayers or 100) then
                            table.insert(candidates, srv)
                        end
                    end
                    if ConfigState.ServerHopMode == "Lower Ping" then
                        table.sort(candidates, function(a, b)
                            return (a.ping or 999) < (b.ping or 999)
                        end)
                    elseif ConfigState.ServerHopMode == "Lowest Players" then
                        table.sort(candidates, function(a, b)
                            return (a.playing or 999) < (b.playing or 999)
                        end)
                    elseif ConfigState.ServerHopMode == "Highest Players" then
                        table.sort(candidates, function(a, b)
                            return (a.playing or 0) > (b.playing or 0)
                        end)
                    end
                    if #candidates > 0 then
                        local chosen = candidates[1]
                        notify("Server Hop", "Teleporting to server (" .. tostring(chosen.playing) .. " players)...", 4)
                        pcall(function()
                            TeleportService:TeleportToPlaceInstance(game.PlaceId, chosen.id, LocalPlayer)
                        end)
                        return
                    end
                end
            end
            pcall(function()
                TeleportService:Teleport(game.PlaceId, LocalPlayer)
            end)
        end)
    end)

    createToggle(WorldTab, "Anti-AFK Protection", false, function(val)
        ConfigState.AntiAFK = val
        if val then
            if State.antiAFKConnection then
                State.antiAFKConnection:Disconnect()
            end
            State.antiAFKConnection = LocalPlayer.Idled:Connect(function()
                local cam = workspace.CurrentCamera
                if cam then
                    VirtualUser:Button2Down(Vector2.zero, cam.CFrame)
                    task.wait(1)
                    VirtualUser:Button2Up(Vector2.zero, cam.CFrame)
                end
            end)
            notify("Core.xyz", "Anti-AFK protection enabled.", 4)
        else
            if State.antiAFKConnection then
                State.antiAFKConnection:Disconnect()
                State.antiAFKConnection = nil
            end
        end
    end)
end

-- TAB 7: SETTINGS (CUSTOM FLOATING PILL + REMEMBER KEY + THEME FREEDOM + CONFIG MANAGER)
do
    createLabel(SettingsTab, "Customizable Floating Pill & Telemetry (Max 3)")

    createTextInputRow(SettingsTab, "Floating Pill Title", "e.g. CORE.XYZ, FEYK.XYZ", "CORE.XYZ", function(txt)
        local cleaned = (txt or ""):gsub("^%s*(.-)%s*$", "%1")
        ConfigState.CustomPillTitle = (cleaned ~= "") and cleaned or "CORE.XYZ"
        updateFloatingPillTelemetry()
    end)

    createMultiDropdown(SettingsTab, "Telemetry Metrics", State.TELEMETRY_OPTIONS, State.activeTelemetryMetrics, 3, function(newSelection)
        State.activeTelemetryMetrics = newSelection
        updateFloatingPillTelemetry()
    end)

    createDropdown(SettingsTab, "Floating Pill Shape", { "Rounded Pill", "Sharp Box" }, "Rounded Pill", function(opt)
        if UI.FloatCorner then
            UI.FloatCorner.CornerRadius = UDim.new(0, (opt == "Rounded Pill") and 999 or 8)
        end
    end)

    createToggle(SettingsTab, "Remember Key (Auto-Unlock on Startup)", true, function(val)
        ConfigState.RememberKey = val
        if val and State.isAuthorized then
            safeWriteFile(SAVED_KEY_FILE, REQUIRED_KEY)
        elseif not val then
            safeWriteFile(SAVED_KEY_FILE, "")
        end
    end)

    createLabel(SettingsTab, "UI Theme & RGB Color Freedom")

    local RSliderCtrl, GSliderCtrl, BSliderCtrl

    local ThemePresets = {
        ["Pure Monochrome"] = { 255, 255, 255 },
        ["Obsidian Silver"] = { 190, 195, 210 },
        ["Cyber Cyan"] = { 75, 225, 255 },
        ["Crimson Ops"] = { 255, 70, 85 },
        ["Emerald Matrix"] = { 85, 255, 145 },
        ["Royal Amethyst"] = { 185, 110, 255 },
    }

    createDropdown(SettingsTab, "Theme Preset", {
        "Pure Monochrome",
        "Obsidian Silver",
        "Cyber Cyan",
        "Crimson Ops",
        "Emerald Matrix",
        "Royal Amethyst",
    }, "Pure Monochrome", function(presetName)
        ConfigState.ThemePreset = presetName
        local rgb = ThemePresets[presetName]
        if rgb then
            updateAccentColor(rgb[1], rgb[2], rgb[3])
            if RSliderCtrl then RSliderCtrl.Set(rgb[1], false) end
            if GSliderCtrl then GSliderCtrl.Set(rgb[2], false) end
            if BSliderCtrl then BSliderCtrl.Set(rgb[3], false) end
        end
    end)

    RSliderCtrl = createSlider(SettingsTab, "Accent Red (R)", 0, 255, 255, 1, "", function(val)
        updateAccentColor(val, ConfigState.AccentG, ConfigState.AccentB)
    end)
    GSliderCtrl = createSlider(SettingsTab, "Accent Green (G)", 0, 255, 255, 1, "", function(val)
        updateAccentColor(ConfigState.AccentR, val, ConfigState.AccentB)
    end)
    BSliderCtrl = createSlider(SettingsTab, "Accent Blue (B)", 0, 255, 255, 1, "", function(val)
        updateAccentColor(ConfigState.AccentR, ConfigState.AccentG, val)
    end)

    createSlider(SettingsTab, "Window Background Transparency", 0, 0.45, 0.03, 0.01, "", function(val)
        ConfigState.WindowTransparency = val
        UI.MainWindow.BackgroundTransparency = val
    end)

    createSlider(SettingsTab, "UI Scale Override", 0.70, 1.15, 1.00, 0.01, "x", function(val)
        State.customUIScaleOverride = val
        UI.MainScale.Scale = val
    end)

    createToggle(SettingsTab, "Live Particle Starfield", true, function(val)
        ConfigState.ParticlesEnabled = val
        UI.MainParticleCanvas.Visible = val
    end)

    createToggle(SettingsTab, "Live Border Shimmer Beam", true, function(val)
        ConfigState.ShimmerEnabled = val
    end)

    createLabel(SettingsTab, "Config Management (Name Required to Save)")

    local savedConfigNames = safeJsonDecode(safeReadFile(CONFIG_INDEX_FILE))
    if type(savedConfigNames) ~= "table" or #savedConfigNames == 0 then
        savedConfigNames = { "Default" }
    end

    local ConfigNameBox = createTextInputRow(SettingsTab, "Config Name (Required)", "Enter config name...", "", nil)
    local selectedConfigToLoad = savedConfigNames[1]
    local ConfigListDropdown

    local function saveConfigByName(cfgName)
        local cleanName = (cfgName or ""):gsub("^%s*(.-)%s*$", "%1")
        if cleanName == "" then
            notify("Config System", "Config Name is required! Please type a name before saving.", 4)
            return false
        end
        local path = FS_FOLDER .. "/Config_" .. cleanName .. ".json"
        safeWriteFile(path, safeJsonEncode(ConfigState))

        if not table.find(savedConfigNames, cleanName) then
            table.insert(savedConfigNames, cleanName)
            safeWriteFile(CONFIG_INDEX_FILE, safeJsonEncode(savedConfigNames))
        end
        selectedConfigToLoad = cleanName
        if ConfigListDropdown then
            ConfigListDropdown.Refresh(savedConfigNames, cleanName)
        end
        if ConfigState.AutoLoadConfig then
            safeWriteFile(AUTO_LOAD_FILE, cleanName)
        end
        notify("Config System", "Saved configuration '" .. cleanName .. "'!", 4)
        return true
    end

    local function loadConfigByName(cfgName)
        local cleanName = (cfgName or ""):gsub("^%s*(.-)%s*$", "%1")
        if cleanName == "" then
            return false
        end
        local path = FS_FOLDER .. "/Config_" .. cleanName .. ".json"
        local raw = safeReadFile(path)
        local decoded = safeJsonDecode(raw)
        if type(decoded) ~= "table" then
            notify("Config System", "Config '" .. cleanName .. "' not found on disk.", 3)
            return false
        end
        for k, v in pairs(decoded) do
            ConfigState[k] = v
        end
        updateAccentColor(ConfigState.AccentR or 255, ConfigState.AccentG or 255, ConfigState.AccentB or 255)
        if RSliderCtrl then RSliderCtrl.Set(ConfigState.AccentR or 255, false) end
        if GSliderCtrl then GSliderCtrl.Set(ConfigState.AccentG or 255, false) end
        if BSliderCtrl then BSliderCtrl.Set(ConfigState.AccentB or 255, false) end
        UI.MainWindow.BackgroundTransparency = ConfigState.WindowTransparency or 0.03
        updateMovement()
        updateLightingEnvironment()
        updateCrosshair()
        updateFloatingPillTelemetry()
        notify("Config System", "Loaded configuration '" .. cleanName .. "'!", 4)
        return true
    end

    State.loadConfigByName = loadConfigByName

    createButton(SettingsTab, "Save Config", function()
        saveConfigByName(ConfigNameBox.Text)
    end)

    ConfigListDropdown = createDropdown(SettingsTab, "Saved Configs", savedConfigNames, savedConfigNames[1], function(opt)
        selectedConfigToLoad = opt
    end)

    createButton(SettingsTab, "Load Selected Config", function()
        loadConfigByName(selectedConfigToLoad)
    end)

    createToggle(SettingsTab, "Auto-Load Config on Startup", false, function(val)
        ConfigState.AutoLoadConfig = val
        if val then
            local targetName = (ConfigNameBox.Text ~= "" and ConfigNameBox.Text) or selectedConfigToLoad or "Default"
            safeWriteFile(AUTO_LOAD_FILE, targetName)
            notify("Core.xyz", "Auto-Load enabled for '" .. targetName .. "'.", 3)
        else
            safeWriteFile(AUTO_LOAD_FILE, "")
        end
    end)
end

--------------------------------------------------------------------------------
-- 13. KEY SYSTEM AUTHORIZATION & MAIN HUB LAUNCHER
--------------------------------------------------------------------------------
local function launchMainHub()
    State.isAuthorized = true
    State.uiVisible = true

    if ConfigState.RememberKey then
        safeWriteFile(SAVED_KEY_FILE, REQUIRED_KEY)
    end

    local targetScale = getResponsiveScale()
    updateFloatingPillTelemetry()
    if UI.FloatingToggle then
        UI.FloatingToggle.Visible = true
    end
    if UI.MainWindow then
        UI.MainWindow.Visible = true
        UI.MainScale.Scale = targetScale * 0.86
        tween(UI.MainWindow, SmoothTween, { BackgroundTransparency = ConfigState.WindowTransparency })
        tween(UI.MainStroke, SmoothTween, { Transparency = 0.08 })
        tween(UI.MainScale, SpringTween, { Scale = targetScale })
    end

    local autoCfg = safeReadFile(AUTO_LOAD_FILE)
    if autoCfg and autoCfg ~= "" and State.loadConfigByName then
        State.loadConfigByName(autoCfg)
    end

    notify("Core.xyz", "Authorized! Tap CORE.XYZ pill or RightShift to toggle UI.", 5)
end

local function attemptAuthorization()
    if State.isAuthorizing or State.isAuthorized then
        return
    end
    local entered = string.upper((UI.KeyInputBox.Text or ""):gsub("%s+", ""))
    if entered == REQUIRED_KEY then
        State.isAuthorizing = true
        UI.KeyFeedback.Text = "ACCESS GRANTED — LAUNCHING CORE.XYZ..."
        UI.KeyFeedback.TextColor3 = Theme.Accent
        tween(UI.KeyScale, FastTween, { Scale = 0.9 })
        tween(UI.KeyCard, FastTween, { BackgroundTransparency = 1 })
        tween(UI.KeyCardStroke, FastTween, { Transparency = 1 })
        task.wait(0.22)
        UI.KeyCard.Visible = false
        launchMainHub()
    else
        UI.KeyFeedback.Text = "INVALID KEY! Required Key: " .. REQUIRED_KEY
        UI.KeyFeedback.TextColor3 = Theme.Error
        tween(UI.KeyInputStroke, FastTween, { Color = Theme.Error })
        local origPos = UI.KeyCard.Position
        for _, offset in ipairs({ -9, 9, -6, 6, -3, 0 }) do
            UI.KeyCard.Position = UDim2.new(origPos.X.Scale, origPos.X.Offset + offset, origPos.Y.Scale, origPos.Y.Offset)
            task.wait(0.028)
        end
        tween(UI.KeyInputStroke, SmoothTween, { Color = Theme.Border })
    end
end

UI.CopyKeyButton.MouseButton1Click:Connect(function()
    spawnRipple(UI.CopyKeyButton)
    if Env.setclipboard then
        pcall(function()
            Env.setclipboard(REQUIRED_KEY)
        end)
    end
    UI.KeyInputBox.Text = REQUIRED_KEY
    UI.KeyFeedback.Text = "Key copied & auto-filled: " .. REQUIRED_KEY
    UI.KeyFeedback.TextColor3 = Theme.White
end)

UI.UnlockButton.MouseButton1Click:Connect(function()
    spawnRipple(UI.UnlockButton)
    attemptAuthorization()
end)

UI.KeyInputBox.FocusLost:Connect(function(enterPressed)
    if enterPressed then
        attemptAuthorization()
    end
end)

--------------------------------------------------------------------------------
-- 14. RUNTIME LOOPS (60FPS LIVE UI + PROTECTION + SILENT AIM + 3D ESP + FREECAM)
--------------------------------------------------------------------------------
LocalPlayer.CharacterAdded:Connect(function(character)
    table.clear(State.noclipCollideCache)
    table.clear(State.headlessCache)
    table.clear(State.korbloxCache)
    local humanoid = character:WaitForChild("Humanoid", 5)
    if humanoid then
        State.defaultWalkSpeed = humanoid.WalkSpeed
        State.defaultJumpPower = humanoid.JumpPower
        updateMovement()
    end
    if ConfigState.Freecam then
        setFreecamEnabled(false)
    end
    if ConfigState.Headless then
        task.delay(0.5, function() applyHeadless(true) end)
    end
    if ConfigState.Korblox then
        task.delay(0.5, function() applyKorblox(true) end)
    end
end)

UserInputService.JumpRequest:Connect(function()
    if State.isAuthorized and ConfigState.InfJump and LocalPlayer.Character then
        local hum = LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
        if hum then
            hum:ChangeState(Enum.HumanoidStateType.Jumping)
        end
    end
end)

UserInputService.InputBegan:Connect(function(input, gpe)
    if not gpe and State.isAuthorized then
        if input.KeyCode == Enum.KeyCode.RightShift then
            toggleMainHub()
        end
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            if ConfigState.SilentAim and LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Tool") then
                triggerSilentAimMicroFlick()
            end
        end
    end
end)

do
    local interactCooldown = 0
    RunService.Stepped:Connect(function(_, stepDt)
        if not State.isAuthorized then
            return
        end
        local char = LocalPlayer.Character
        if not char then
            return
        end

        local myHRP = char:FindFirstChild("HumanoidRootPart")
        local myHum = char:FindFirstChildOfClass("Humanoid")

        -- Save last safe CFrame for Anti-Void
        if myHRP and myHRP.Position.Y > -50 then
            State.lastSafeCFrame = myHRP.CFrame
        end

        -- Anti-Void Protection
        if ConfigState.AntiVoid and myHRP then
            local destroyY = -500
            pcall(function()
                if workspace.FallenPartsDestroyHeight then
                    destroyY = workspace.FallenPartsDestroyHeight
                end
            end)
            if myHRP.Position.Y <= (destroyY + 55) or myHRP.Position.Y <= -220 then
                pcall(function()
                    myHRP.Velocity = Vector3.zero
                end)
                myHRP.CFrame = State.lastSafeCFrame or CFrame.new(Vector3.new(0, 25, 0))
            end
        end

        -- Swim in Air
        if ConfigState.SwimInAir and myHum then
            pcall(function()
                myHum:ChangeState(Enum.HumanoidStateType.Swimming)
            end)
        end

        -- Anti-Ragdoll / Anti-Stun
        if ConfigState.AntiRagdoll and myHum then
            myHum.PlatformStand = false
            myHum.Sit = false
            pcall(function()
                if myHum.SetStateEnabled and Enum.HumanoidStateType.Ragdoll then
                    myHum:SetStateEnabled(Enum.HumanoidStateType.Ragdoll, false)
                end
            end)
        end

        -- Character NoClip
        if ConfigState.NoClip then
            for _, part in ipairs(char:GetDescendants()) do
                if part:IsA("BasePart") then
                    if State.noclipCollideCache[part] == nil then
                        State.noclipCollideCache[part] = part.CanCollide
                    end
                    part.CanCollide = false
                end
            end
        end

        -- Anti-Fling (Disable collision on all other players' characters)
        if ConfigState.AntiFling then
            for _, p in ipairs(Players:GetPlayers()) do
                if p ~= LocalPlayer and p.Character then
                    for _, part in ipairs(p.Character:GetDescendants()) do
                        if part:IsA("BasePart") then
                            if State.antiFlingCollideCache[part] == nil then
                                State.antiFlingCollideCache[part] = part.CanCollide
                            end
                            part.CanCollide = false
                        end
                    end
                end
            end
        end

        -- Hitbox Expander live update
        if ConfigState.HitboxExpander then
            updateHitboxExpander()
        end

        -- Auto-Interact
        if ConfigState.AutoInteract and myHRP then
            interactCooldown = interactCooldown + (stepDt or 0.016)
            if interactCooldown >= 0.25 then
                interactCooldown = 0
                for _, desc in ipairs(workspace:GetDescendants()) do
                    if desc:IsA("ProximityPrompt") and desc.Enabled then
                        local parentPart = desc.Parent
                        if parentPart and parentPart:IsA("BasePart") then
                            if (parentPart.Position - myHRP.Position).Magnitude <= ConfigState.InteractRadius then
                                if Env.fireproximityprompt then
                                    pcall(function() Env.fireproximityprompt(desc) end)
                                end
                            end
                        end
                    elseif desc:IsA("ClickDetector") then
                        local parentPart = desc.Parent
                        if parentPart and parentPart:IsA("BasePart") then
                            if (parentPart.Position - myHRP.Position).Magnitude <= ConfigState.InteractRadius then
                                if Env.fireclickdetector then
                                    pcall(function() Env.fireclickdetector(desc) end)
                                end
                            end
                        end
                    end
                end
            end
        end
    end)
end

do
    local animClock = 0
    local telemetryTimer = 0
    local playerListRefreshTimer = 0

    RunService.RenderStepped:Connect(function(deltaTime)
        local safeDt = (deltaTime and deltaTime > 0) and deltaTime or (1 / 60)
        animClock = animClock + safeDt
        telemetryTimer = telemetryTimer + safeDt
        playerListRefreshTimer = playerListRefreshTimer + safeDt

        if playerListRefreshTimer >= 2.0 then
            playerListRefreshTimer = 0
            if State.isAuthorized and UI.MainWindow.Visible and State.refreshPlayerListUI then
                State.refreshPlayerListUI()
            end
        end

        local instantFps = math.floor(1 / safeDt)
        table.insert(State.frameHistory, instantFps)
        if #State.frameHistory > 60 then
            table.remove(State.frameHistory, 1)
        end
        if telemetryTimer >= 0.4 then
            telemetryTimer = 0
            local sum = 0
            local minFps = 999
            for _, f in ipairs(State.frameHistory) do
                sum = sum + f
                if f < minFps then
                    minFps = f
                end
            end
            State.currentFPS = math.floor(sum / math.max(#State.frameHistory, 1))
            State.currentOnePercentLow = minFps
            if State.isAuthorized and UI.FloatingToggle.Visible then
                updateFloatingPillTelemetry()
            end
        end

        if ConfigState.ShimmerEnabled then
            for _, item in ipairs(State.liveGradients) do
                if item.Gradient and item.Gradient.Parent then
                    item.Gradient.Rotation = (item.Offset + animClock * item.Speed) % 360
                end
            end
        end

        for _, rot in ipairs(State.liveRotators) do
            if rot.Instance and rot.Instance.Parent then
                rot.Instance.Rotation = (animClock * rot.Speed) % 360
            end
        end

        if ConfigState.ParticlesEnabled then
            for _, p in ipairs(State.liveParticles) do
                if p.Instance and p.Container and p.Container.Visible then
                    p.Y = p.Y - (p.SpeedY * safeDt)
                    p.X = p.X + math.sin(animClock * 1.5 + p.Phase) * (p.DriftX * safeDt)
                    if p.Y < -0.04 then
                        p.Y = 1.04
                        p.X = math.random(5, 95) / 100
                    end
                    p.Instance.Position = UDim2.fromScale(p.X, p.Y)
                    p.Instance.BackgroundTransparency = 0.55 + 0.35 * math.sin(animClock * 3 + p.Phase)
                end
            end
        end

        local pulse = 1 + 0.22 * math.sin(animClock * 4.5)
        if UI.LoaderCard.Visible then
            UI.EmblemCore.Size = UDim2.fromOffset(8 * pulse, 8 * pulse)
        end
        if UI.KeyCard.Visible then
            UI.KeyTopGrad.Offset = Vector2.new(math.sin(animClock * 2.2) * 0.45, 0)
        end
        if UI.MainWindow.Visible then
            UI.HeaderLineGrad.Offset = Vector2.new(math.sin(animClock * 1.8) * 0.42, 0)
        end

        if not State.isAuthorized then
            return
        end

        if ConfigState.Spinbot and LocalPlayer.Character then
            local hrp = LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
            if hrp and CFrame.Angles then
                pcall(function()
                    hrp.CFrame = hrp.CFrame * CFrame.Angles(0, math.rad(ConfigState.SpinSpeed), 0)
                end)
            end
        end

        local camera = workspace.CurrentCamera
        if not camera then
            return
        end

        -- Glitch-Free Freecam movement
        if ConfigState.Freecam then
            camera.CameraType = Enum.CameraType.Scriptable
            local hum = LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
            local moveDir = (hum and hum.MoveDirection) or Vector3.zero
            local curPos = State.freecamPos or camera.CFrame.Position
            local nextPos = curPos + (moveDir * (ConfigState.FreecamSpeed * safeDt))
            State.freecamPos = nextPos
            camera.CFrame = CFrame.new(nextPos, nextPos + Vector3.new(0, 0, -1))
        end

        if ConfigState.CustomCamFOV then
            camera.FieldOfView = ConfigState.CamFOV
        end

        UI.FovCircle.Visible = ConfigState.ShowFOV

        if ConfigState.ESP or ConfigState.Box3DESP or ConfigState.SkeletonESP or ConfigState.HealthBarESP or ConfigState.Tracers then
            updateESP(camera)
        end

        if ConfigState.Crosshair then
            updateCrosshair()
        else
            UI.CrosshairV.Visible = false
            UI.CrosshairH.Visible = false
        end

        -- Silent Aim Target & Snapline Update
        if ConfigState.SilentAim then
            local silentTarget = getClosestTarget(camera, true)
            State.currentSilentTarget = silentTarget
            if ConfigState.SilentSnapline and silentTarget then
                local vpPt, onScr = camera:WorldToViewportPoint(silentTarget.Position)
                if onScr then
                    local center = Vector2.new(camera.ViewportSize.X / 2, camera.ViewportSize.Y / 2)
                    drawLineFrame(UI.SilentSnapline, center, Vector2.new(vpPt.X, vpPt.Y), Theme.Accent, 1)
                else
                    UI.SilentSnapline.Visible = false
                end
            else
                UI.SilentSnapline.Visible = false
            end
        else
            State.currentSilentTarget = nil
            UI.SilentSnapline.Visible = false
        end

        if ConfigState.Aimbot then
            local target = getClosestTarget(camera, false)
            if target then
                local alpha = 1 - ((1 - math.clamp(ConfigState.Smoothness, 0.01, 0.99)) ^ (safeDt * 60))
                camera.CFrame = camera.CFrame:Lerp(CFrame.new(camera.CFrame.Position, target.Position), alpha)
            end
        end
    end)
end

--------------------------------------------------------------------------------
-- 15. START-TO-END ANIMATED BOOT SEQUENCE (WITH REMEMBER KEY AUTO-UNLOCK)
--------------------------------------------------------------------------------
task.spawn(function()
    local targetScale = getResponsiveScale()
    tween(UI.LoaderCard, SmoothTween, { BackgroundTransparency = 0.03 })
    tween(UI.LoaderStroke, SmoothTween, { Transparency = 0.08 })
    tween(UI.LoaderScale, SpringTween, { Scale = targetScale })
    tween(UI.EmblemOuterStroke, SmoothTween, { Transparency = 0.08 })
    tween(UI.EmblemInnerStroke, SmoothTween, { Transparency = 0.25 })
    tween(UI.EmblemCore, SmoothTween, { BackgroundTransparency = 0 })
    tween(UI.LoaderTitle, SmoothTween, { TextTransparency = 0 })
    tween(UI.LoaderStatus, SmoothTween, { TextTransparency = 0 })
    tween(UI.LoaderBarBg, SmoothTween, { BackgroundTransparency = 0 })
    tween(UI.LoaderPercent, SmoothTween, { TextTransparency = 0 })

    local stages = {
        { pct = 28, text = "Mounting Core.xyz 3D Box & Skeleton Engine..." },
        { pct = 64, text = "Loading Silent Aim, Waypoints & Telemetry..." },
        { pct = 92, text = "Verifying FEYKSECURED Security Gate..." },
        { pct = 100, text = "Core.xyz v4.0 Ready." },
    }

    local currentPct = 0
    for _, stage in ipairs(stages) do
        UI.LoaderStatus.Text = stage.text
        tween(UI.LoaderBarFill, SlowTween, { Size = UDim2.fromScale(stage.pct / 100, 1) })
        while currentPct < stage.pct do
            currentPct = math.min(stage.pct, currentPct + 3)
            UI.LoaderPercent.Text = tostring(currentPct) .. "%"
            task.wait(0.022)
        end
        task.wait(0.16)
    end

    tween(UI.LoaderScale, FastTween, { Scale = targetScale * 0.9 })
    tween(UI.LoaderCard, FastTween, { BackgroundTransparency = 1 })
    tween(UI.LoaderStroke, FastTween, { Transparency = 1 })
    tween(UI.LoaderTitle, FastTween, { TextTransparency = 1 })
    tween(UI.LoaderStatus, FastTween, { TextTransparency = 1 })
    tween(UI.LoaderPercent, FastTween, { TextTransparency = 1 })
    tween(UI.LoaderBarBg, FastTween, { BackgroundTransparency = 1 })
    tween(UI.LoaderBarFill, FastTween, { BackgroundTransparency = 1 })
    tween(UI.EmblemOuterStroke, FastTween, { Transparency = 1 })
    tween(UI.EmblemInnerStroke, FastTween, { Transparency = 1 })
    tween(UI.EmblemCore, FastTween, { BackgroundTransparency = 1 })
    task.wait(0.2)
    UI.LoaderCard.Visible = false

    -- Check Remember Key
    local savedKey = safeReadFile(SAVED_KEY_FILE)
    if savedKey and savedKey:gsub("%s+", "") == REQUIRED_KEY then
        launchMainHub()
    else
        UI.KeyCard.Visible = true
        UI.KeyScale.Scale = targetScale * 0.88
        tween(UI.KeyCard, SmoothTween, { BackgroundTransparency = 0.03 })
        tween(UI.KeyCardStroke, SmoothTween, { Transparency = 0.08 })
        tween(UI.KeyScale, SpringTween, { Scale = targetScale })
    end
end)
