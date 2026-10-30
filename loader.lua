--[=[
    CORE.XYZ | UNIVERSAL ROBLOX LUA SCRIPT (V2.5 ULTRA-STABLE LIVE-ANIMATED EDITION)
    Theme: Pure Black & White Monochrome (Live 60FPS Animated UI)
    Key System Authorization Key: FEYKSECURED

    Architecture & Fixes:
      1. Live-Animated Start-to-End Loading Screen ("Core.xyz")
         - Sweeping UIGradient border beam, floating monochrome particle field,
           dual counter-rotating geometric rings, smooth progress interpolation.
      2. Live-Animated Key System / Authorization Gate (Key: FEYKSECURED)
         - Rotating white-beam border, live particle canvas, focus-glow input,
           1-tap "GET KEY" auto-fill + clipboard copy, error shake, cinematic unlock morph.
      3. High-Craft Live-Animated Main Hub + Draggable Mobile/PC Floating Pill
         - Auto-scales to Mobile (Delta Executor) & PC viewports cleanly.
         - Locks ScrollingFrame while dragging sliders on mobile touchscreens.
         - Sliding sidebar tab indicator, touch/click ripple effects, expandable
           animated dropdowns, glowing thumb sliders, and spring toggles.
      4. All Gameplay & Engine Fixes Applied:
         - Safe game:IsLoaded() & LocalPlayer wait for Delta autoexec support
         - DisplayOrder = 999999 so UI always renders above game HUDs
         - Frame-rate independent DeltaTime Aimbot Lerp
         - Automatic R6 & R15 body-part fallback
         - 30-Highlight Roblox engine limit guard + Billboard/Tracer ESP
         - RunService.Stepped NoClip with full CanCollide restoration on toggle off
         - Reused RaycastParams with Enum.RaycastFilterType.Exclude
         - Humanoid.UseJumpPower = true compatibility
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

local LocalPlayer = Players.LocalPlayer
if not LocalPlayer then
    LocalPlayer = Players.PlayerAdded:Wait()
end

local setclipboard = setclipboard or toclipboard
local REQUIRED_KEY = "FEYKSECURED"

--------------------------------------------------------------------------------
-- 1. SAFE GUI PARENT & PREVIOUS INSTANCE CLEANUP
--------------------------------------------------------------------------------
local function getSafeGuiParent()
    local ok, res = pcall(function()
        return (gethui and gethui()) or CoreGui
    end)
    if ok and res then
        return res
    end
    return LocalPlayer:WaitForChild("PlayerGui")
end

local guiParent = getSafeGuiParent()
local existingGui = guiParent:FindFirstChild("CoreXYZ_Universal")
if existingGui then
    pcall(function()
        existingGui:Destroy()
    end)
end

--------------------------------------------------------------------------------
-- 2. CORE STATE & GAMEPLAY VARIABLES (ALL PROPERLY SCOPED)
--------------------------------------------------------------------------------
local enabled = false
local showFOV = false
local espEnabled = false
local tracersEnabled = false
local noClipEnabled = false
local infJumpEnabled = false
local walkSpeedEnabled = false
local jumpPowerEnabled = false
local crosshairEnabled = false
local teamCheckEnabled = true

local selectedTeams = { ["All"] = true }
local allTeams = { "All" }
local espObjects = {}
local noclipCollideCache = {}
local activeHighlightCount = 0
local MAX_HIGHLIGHTS = 30

local fovRadius = 75
local smoothness = 0.4
local walkSpeed = 16
local jumpPower = 50
local defaultWalkSpeed = 16
local defaultJumpPower = 50

local espColor = Color3.fromRGB(255, 255, 255)
local crosshairColor = Color3.fromRGB(255, 255, 255)
local crosshairSize = 10
local tracerOrigin = "Center"
local targetPart = "Head"
local antiAFKConnection = nil
local isAuthorized = false
local uiVisible = true
local isAuthorizing = false

local rayParams = RaycastParams.new()
rayParams.FilterType = Enum.RaycastFilterType.Exclude
rayParams.IgnoreWater = true

--------------------------------------------------------------------------------
-- 3. MONOCHROME DESIGN SYSTEM & LIVE ANIMATION REGISTRIES
--------------------------------------------------------------------------------
local Theme = {
    Black = Color3.fromRGB(5, 5, 7),
    Deep = Color3.fromRGB(10, 10, 13),
    Surface = Color3.fromRGB(15, 15, 19),
    Elevated = Color3.fromRGB(23, 23, 29),
    Hover = Color3.fromRGB(32, 32, 40),
    White = Color3.fromRGB(255, 255, 255),
    Silver = Color3.fromRGB(200, 200, 210),
    Muted = Color3.fromRGB(125, 125, 138),
    Dim = Color3.fromRGB(65, 65, 75),
    Border = Color3.fromRGB(38, 38, 46),
    Error = Color3.fromRGB(255, 75, 75),
}

local FastTween = TweenInfo.new(0.18, Enum.EasingStyle.Quart, Enum.EasingDirection.Out)
local SmoothTween = TweenInfo.new(0.35, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
local SpringTween = TweenInfo.new(0.42, Enum.EasingStyle.Back, Enum.EasingDirection.Out)
local SlowTween = TweenInfo.new(0.55, Enum.EasingStyle.Exponential, Enum.EasingDirection.Out)

local liveGradients = {}
local liveParticles = {}
local liveRotators = {}

local function tween(obj, info, goals)
    if not obj then
        return nil
    end
    local ok, t = pcall(function()
        local tw = TweenService:Create(obj, info, goals)
        tw:Play()
        return tw
    end)
    if ok then
        return t
    end
    -- Fallback direct property assignment if TweenService rejects a property
    for k, v in pairs(goals) do
        pcall(function()
            obj[k] = v
        end)
    end
    return nil
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

-- Creates a live-rotating monochrome shimmer border (White -> Obsidian -> Silver -> White)
local function addLiveBorder(parent, thickness, speed, baseTransparency)
    local s = Instance.new("UIStroke")
    s.Color = Theme.White
    s.Thickness = thickness or 1.4
    s.Transparency = baseTransparency or 0.1
    s.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
    s.Parent = parent

    local grad = Instance.new("UIGradient")
    grad.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0.00, Color3.fromRGB(255, 255, 255)),
        ColorSequenceKeypoint.new(0.28, Color3.fromRGB(45, 45, 55)),
        ColorSequenceKeypoint.new(0.50, Color3.fromRGB(190, 190, 205)),
        ColorSequenceKeypoint.new(0.75, Color3.fromRGB(35, 35, 45)),
        ColorSequenceKeypoint.new(1.00, Color3.fromRGB(255, 255, 255)),
    })
    grad.Rotation = 0
    grad.Parent = s

    table.insert(liveGradients, {
        Gradient = grad,
        Speed = speed or 65,
        Offset = math.random(0, 360),
    })

    return s, grad
end

-- Spawns an expanding white ripple animation inside any button/frame
local function spawnRipple(button, inputPos)
    pcall(function()
        local holder = Instance.new("Frame")
        holder.Size = UDim2.fromScale(1, 1)
        holder.BackgroundTransparency = 1
        holder.ClipsDescendants = true
        holder.ZIndex = button.ZIndex + 1
        holder.Parent = button
        addCorner(holder, 8)

        local relX = 0.5
        local relY = 0.5
        if inputPos and button.AbsoluteSize.X > 0 and button.AbsoluteSize.Y > 0 then
            relX = math.clamp((inputPos.X - button.AbsolutePosition.X) / button.AbsoluteSize.X, 0, 1)
            relY = math.clamp((inputPos.Y - button.AbsolutePosition.Y) / button.AbsoluteSize.Y, 0, 1)
        end

        local circle = Instance.new("Frame")
        circle.AnchorPoint = Vector2.new(0.5, 0.5)
        circle.Position = UDim2.fromScale(relX, relY)
        circle.Size = UDim2.fromOffset(0, 0)
        circle.BackgroundColor3 = Theme.White
        circle.BackgroundTransparency = 0.72
        circle.BorderSizePixel = 0
        circle.Parent = holder
        addCorner(circle, 999)

        local maxDim = math.max(button.AbsoluteSize.X, button.AbsoluteSize.Y)
        if maxDim <= 0 then
            maxDim = 160
        end
        local targetDiameter = maxDim * 2.2
        tween(circle, TweenInfo.new(0.45, Enum.EasingStyle.Quart, Enum.EasingDirection.Out), {
            Size = UDim2.fromOffset(targetDiameter, targetDiameter),
            BackgroundTransparency = 1,
        })
        task.delay(0.46, function()
            if holder and holder.Parent then
                holder:Destroy()
            end
        end)
    end)
end

-- Spawns live-drifting monochrome star/particle dots inside a container
local function createParticleCanvas(parent, count)
    local canvas = Instance.new("Frame")
    canvas.Name = "ParticleCanvas"
    canvas.Size = UDim2.fromScale(1, 1)
    canvas.BackgroundTransparency = 1
    canvas.ClipsDescendants = true
    canvas.ZIndex = 1
    canvas.Parent = parent

    for i = 1, (count or 18) do
        local dot = Instance.new("Frame")
        local sz = (i % 3 == 0) and 3 or 2
        dot.AnchorPoint = Vector2.new(0.5, 0.5)
        dot.Size = UDim2.fromOffset(sz, sz)
        dot.BackgroundColor3 = Theme.White
        dot.BackgroundTransparency = 0.65
        dot.BorderSizePixel = 0
        dot.ZIndex = 1
        dot.Parent = canvas
        addCorner(dot, 99)

        local startX = (math.random(5, 95) / 100)
        local startY = (math.random(5, 95) / 100)
        dot.Position = UDim2.fromScale(startX, startY)

        table.insert(liveParticles, {
            Instance = dot,
            Container = parent,
            X = startX,
            Y = startY,
            SpeedY = math.random(4, 11) / 100,
            DriftX = (math.random(-3, 3) / 100),
            Phase = math.random() * 6.28,
        })
    end

    return canvas
end

-- Smooth Dragging Helper for Mobile Touch & PC Mouse
local function makeDraggable(dragHandle, targetFrame)
    local dragging = false
    local dragInput = nil
    local dragStart = nil
    local startPos = nil

    dragHandle.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = targetFrame.Position
            if input.Changed then
                input.Changed:Connect(function()
                    if input.UserInputState == Enum.UserInputState.End then
                        dragging = false
                    end
                end)
            end
        end
    end)

    dragHandle.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
            dragInput = input
        end
    end)

    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging and dragStart and startPos then
            local delta = input.Position - dragStart
            tween(targetFrame, TweenInfo.new(0.07, Enum.EasingStyle.Sine, Enum.EasingDirection.Out), {
                Position = UDim2.new(
                    startPos.X.Scale,
                    startPos.X.Offset + delta.X,
                    startPos.Y.Scale,
                    startPos.Y.Offset + delta.Y
                ),
            })
        end
    end)
end

-- Responsive Viewport Scale Calculator (prevents clipping on Delta Mobile)
local function getResponsiveScale()
    local cam = workspace.CurrentCamera
    if not cam then
        return 1
    end
    local vp = cam.ViewportSize
    if vp.Y < 430 or vp.X < 620 then
        return math.clamp(math.min(vp.X / 620, vp.Y / 420), 0.72, 0.95)
    end
    return 1
end

--------------------------------------------------------------------------------
-- 4. ROOT SCREENGUI, OVERLAYS & ANIMATED TOAST NOTIFICATIONS
--------------------------------------------------------------------------------
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "CoreXYZ_Universal"
ScreenGui.DisplayOrder = 999999
ScreenGui.IgnoreGuiInset = true
ScreenGui.ResetOnSpawn = false
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
ScreenGui.Parent = guiParent

local OverlayContainer = Instance.new("Folder")
OverlayContainer.Name = "Overlays"
OverlayContainer.Parent = ScreenGui

local HighlightContainer = Instance.new("Folder")
HighlightContainer.Name = "Highlights"
HighlightContainer.Parent = ScreenGui

-- FOV Circle (Live Animated Stroke)
local FovCircle = Instance.new("Frame")
FovCircle.AnchorPoint = Vector2.new(0.5, 0.5)
FovCircle.Position = UDim2.fromScale(0.5, 0.5)
FovCircle.Size = UDim2.fromOffset(fovRadius * 2, fovRadius * 2)
FovCircle.BackgroundTransparency = 1
FovCircle.Visible = false
FovCircle.Parent = OverlayContainer
addCorner(FovCircle, 999)
addLiveBorder(FovCircle, 1.5, 90, 0.08)

-- Custom Crosshair
local CrosshairV = Instance.new("Frame")
CrosshairV.AnchorPoint = Vector2.new(0.5, 0.5)
CrosshairV.Position = UDim2.fromScale(0.5, 0.5)
CrosshairV.Size = UDim2.fromOffset(1, crosshairSize * 2)
CrosshairV.BackgroundColor3 = crosshairColor
CrosshairV.BorderSizePixel = 0
CrosshairV.Visible = false
CrosshairV.Parent = OverlayContainer

local CrosshairH = Instance.new("Frame")
CrosshairH.AnchorPoint = Vector2.new(0.5, 0.5)
CrosshairH.Position = UDim2.fromScale(0.5, 0.5)
CrosshairH.Size = UDim2.fromOffset(crosshairSize * 2, 1)
CrosshairH.BackgroundColor3 = crosshairColor
CrosshairH.BorderSizePixel = 0
CrosshairH.Visible = false
CrosshairH.Parent = OverlayContainer

-- Toast Notifications
local NotifyHolder = Instance.new("Frame")
NotifyHolder.AnchorPoint = Vector2.new(1, 1)
NotifyHolder.Position = UDim2.new(1, -18, 1, -18)
NotifyHolder.Size = UDim2.fromOffset(290, 300)
NotifyHolder.BackgroundTransparency = 1
NotifyHolder.ZIndex = 50
NotifyHolder.Parent = ScreenGui

local NotifyLayout = Instance.new("UIListLayout")
NotifyLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
NotifyLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
NotifyLayout.Padding = UDim.new(0, 8)
NotifyLayout.Parent = NotifyHolder

local function notify(title, content, duration)
    duration = duration or 4
    local card = Instance.new("Frame")
    card.Size = UDim2.fromOffset(280, 58)
    card.BackgroundColor3 = Theme.Black
    card.BackgroundTransparency = 1
    card.ClipsDescendants = true
    card.ZIndex = 51
    card.Parent = NotifyHolder
    addCorner(card, 8)
    local st = addLiveBorder(card, 1.2, 110, 1)

    local cardScale = Instance.new("UIScale")
    cardScale.Scale = 0.9
    cardScale.Parent = card

    local accentBar = Instance.new("Frame")
    accentBar.Position = UDim2.fromOffset(8, 10)
    accentBar.Size = UDim2.new(0, 3, 1, -20)
    accentBar.BackgroundColor3 = Theme.White
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
    progBar.BackgroundColor3 = Theme.White
    progBar.BorderSizePixel = 0
    progBar.ZIndex = 52
    progBar.Parent = card

    tween(card, FastTween, { BackgroundTransparency = 0.04 })
    tween(cardScale, SpringTween, { Scale = 1 })
    tween(st, FastTween, { Transparency = 0.1 })
    tween(accentBar, FastTween, { BackgroundTransparency = 0 })
    tween(tLbl, FastTween, { TextTransparency = 0 })
    tween(cLbl, FastTween, { TextTransparency = 0 })
    tween(progBar, TweenInfo.new(duration, Enum.EasingStyle.Linear), { Size = UDim2.new(0, 0, 0, 2) })

    task.delay(duration, function()
        if not card or not card.Parent then
            return
        end
        tween(cardScale, FastTween, { Scale = 0.9 })
        tween(card, FastTween, { BackgroundTransparency = 1 })
        tween(st, FastTween, { Transparency = 1 })
        tween(accentBar, FastTween, { BackgroundTransparency = 1 })
        tween(tLbl, FastTween, { TextTransparency = 1 })
        tween(cLbl, FastTween, { TextTransparency = 1 })
        task.wait(0.2)
        if card and card.Parent then
            card:Destroy()
        end
    end)
end

--------------------------------------------------------------------------------
-- 5. STAGE 1: LIVE-ANIMATED LOADING SCREEN ("Core.xyz")
--------------------------------------------------------------------------------
local LoaderCard = Instance.new("Frame")
LoaderCard.Name = "CoreLoader"
LoaderCard.AnchorPoint = Vector2.new(0.5, 0.5)
LoaderCard.Position = UDim2.fromScale(0.5, 0.5)
LoaderCard.Size = UDim2.fromOffset(360, 200)
LoaderCard.BackgroundColor3 = Theme.Black
LoaderCard.BackgroundTransparency = 1
LoaderCard.Active = true
LoaderCard.ClipsDescendants = true
LoaderCard.ZIndex = 20
LoaderCard.Parent = ScreenGui
addCorner(LoaderCard, 12)
local LoaderStroke = addLiveBorder(LoaderCard, 1.5, 75, 1)

local LoaderScale = Instance.new("UIScale")
LoaderScale.Scale = 0.88
LoaderScale.Parent = LoaderCard

createParticleCanvas(LoaderCard, 16)

-- Animated Dual Geometric Orbital Emblem
local EmblemOuter = Instance.new("Frame")
EmblemOuter.AnchorPoint = Vector2.new(0.5, 0.5)
EmblemOuter.Position = UDim2.new(0.5, 0, 0, 48)
EmblemOuter.Size = UDim2.fromOffset(44, 44)
EmblemOuter.BackgroundTransparency = 1
EmblemOuter.ZIndex = 22
EmblemOuter.Parent = LoaderCard
addCorner(EmblemOuter, 10)
local EmblemOuterStroke = addLiveBorder(EmblemOuter, 1.5, 120, 1)
table.insert(liveRotators, { Instance = EmblemOuter, Speed = 55 })

local EmblemInner = Instance.new("Frame")
EmblemInner.AnchorPoint = Vector2.new(0.5, 0.5)
EmblemInner.Position = UDim2.new(0.5, 0, 0, 48)
EmblemInner.Size = UDim2.fromOffset(24, 24)
EmblemInner.BackgroundTransparency = 1
EmblemInner.ZIndex = 22
EmblemInner.Parent = LoaderCard
addCorner(EmblemInner, 6)
local EmblemInnerStroke = addStroke(EmblemInner, Theme.Silver, 1.2, 1)
table.insert(liveRotators, { Instance = EmblemInner, Speed = -85 })

local EmblemCore = Instance.new("Frame")
EmblemCore.AnchorPoint = Vector2.new(0.5, 0.5)
EmblemCore.Position = UDim2.new(0.5, 0, 0, 48)
EmblemCore.Size = UDim2.fromOffset(8, 8)
EmblemCore.BackgroundColor3 = Theme.White
EmblemCore.BackgroundTransparency = 1
EmblemCore.ZIndex = 22
EmblemCore.Parent = LoaderCard
addCorner(EmblemCore, 99)

local LoaderTitle = Instance.new("TextLabel")
LoaderTitle.Position = UDim2.fromOffset(0, 82)
LoaderTitle.Size = UDim2.new(1, 0, 0, 26)
LoaderTitle.BackgroundTransparency = 1
LoaderTitle.Font = Enum.Font.GothamBlack
LoaderTitle.Text = "CORE.XYZ"
LoaderTitle.TextColor3 = Theme.White
LoaderTitle.TextTransparency = 1
LoaderTitle.TextSize = 21
LoaderTitle.ZIndex = 22
LoaderTitle.Parent = LoaderCard

local LoaderStatus = Instance.new("TextLabel")
LoaderStatus.Position = UDim2.fromOffset(20, 110)
LoaderStatus.Size = UDim2.new(1, -40, 0, 18)
LoaderStatus.BackgroundTransparency = 1
LoaderStatus.Font = Enum.Font.GothamMedium
LoaderStatus.Text = "Initializing Core.xyz Live Engine..."
LoaderStatus.TextColor3 = Theme.Silver
LoaderStatus.TextTransparency = 1
LoaderStatus.TextSize = 11
LoaderStatus.ZIndex = 22
LoaderStatus.Parent = LoaderCard

local LoaderBarBg = Instance.new("Frame")
LoaderBarBg.AnchorPoint = Vector2.new(0.5, 0)
LoaderBarBg.Position = UDim2.new(0.5, 0, 0, 142)
LoaderBarBg.Size = UDim2.fromOffset(290, 6)
LoaderBarBg.BackgroundColor3 = Theme.Elevated
LoaderBarBg.BackgroundTransparency = 1
LoaderBarBg.BorderSizePixel = 0
LoaderBarBg.ZIndex = 22
LoaderBarBg.Parent = LoaderCard
addCorner(LoaderBarBg, 99)

local LoaderBarFill = Instance.new("Frame")
LoaderBarFill.Size = UDim2.fromScale(0, 1)
LoaderBarFill.BackgroundColor3 = Theme.White
LoaderBarFill.BorderSizePixel = 0
LoaderBarFill.ZIndex = 23
LoaderBarFill.Parent = LoaderBarBg
addCorner(LoaderBarFill, 99)

local LoaderPercent = Instance.new("TextLabel")
LoaderPercent.Position = UDim2.fromOffset(0, 156)
LoaderPercent.Size = UDim2.new(1, 0, 0, 18)
LoaderPercent.BackgroundTransparency = 1
LoaderPercent.Font = Enum.Font.Code
LoaderPercent.Text = "0%"
LoaderPercent.TextColor3 = Theme.Muted
LoaderPercent.TextTransparency = 1
LoaderPercent.TextSize = 11
LoaderPercent.ZIndex = 22
LoaderPercent.Parent = LoaderCard

--------------------------------------------------------------------------------
-- 6. STAGE 2: LIVE-ANIMATED KEY SYSTEM GATE ("FEYKSECURED")
--------------------------------------------------------------------------------
local KeyCard = Instance.new("Frame")
KeyCard.Name = "CoreKeySystem"
KeyCard.AnchorPoint = Vector2.new(0.5, 0.5)
KeyCard.Position = UDim2.fromScale(0.5, 0.5)
KeyCard.Size = UDim2.fromOffset(390, 245)
KeyCard.BackgroundColor3 = Theme.Black
KeyCard.BackgroundTransparency = 1
KeyCard.Active = true
KeyCard.Visible = false
KeyCard.ClipsDescendants = true
KeyCard.ZIndex = 20
KeyCard.Parent = ScreenGui
addCorner(KeyCard, 12)
local KeyCardStroke = addLiveBorder(KeyCard, 1.5, 65, 1)

local KeyScale = Instance.new("UIScale")
KeyScale.Scale = 0.88
KeyScale.Parent = KeyCard

createParticleCanvas(KeyCard, 18)

-- Animated Top Shimmer Bar
local KeyTopBar = Instance.new("Frame")
KeyTopBar.Size = UDim2.new(1, 0, 0, 2)
KeyTopBar.BackgroundColor3 = Theme.White
KeyTopBar.BorderSizePixel = 0
KeyTopBar.ZIndex = 22
KeyTopBar.Parent = KeyCard

local KeyTopGrad = Instance.new("UIGradient")
KeyTopGrad.Color = ColorSequence.new({
    ColorSequenceKeypoint.new(0, Theme.Black),
    ColorSequenceKeypoint.new(0.5, Theme.White),
    ColorSequenceKeypoint.new(1, Theme.Black),
})
KeyTopGrad.Parent = KeyTopBar

-- Rotating Mini Emblem in Key Header
local KeyOrb = Instance.new("Frame")
KeyOrb.AnchorPoint = Vector2.new(0, 0.5)
KeyOrb.Position = UDim2.fromOffset(22, 34)
KeyOrb.Size = UDim2.fromOffset(18, 18)
KeyOrb.BackgroundTransparency = 1
KeyOrb.ZIndex = 22
KeyOrb.Parent = KeyCard
addCorner(KeyOrb, 4)
addStroke(KeyOrb, Theme.White, 1.4, 0.1)
table.insert(liveRotators, { Instance = KeyOrb, Speed = 50 })

local KeyOrbDot = Instance.new("Frame")
KeyOrbDot.AnchorPoint = Vector2.new(0.5, 0.5)
KeyOrbDot.Position = UDim2.fromScale(0.5, 0.5)
KeyOrbDot.Size = UDim2.fromOffset(5, 5)
KeyOrbDot.BackgroundColor3 = Theme.White
KeyOrbDot.BorderSizePixel = 0
KeyOrbDot.ZIndex = 22
KeyOrbDot.Parent = KeyOrb
addCorner(KeyOrbDot, 99)

local KeyHeaderTitle = Instance.new("TextLabel")
KeyHeaderTitle.Position = UDim2.fromOffset(48, 20)
KeyHeaderTitle.Size = UDim2.new(1, -68, 0, 24)
KeyHeaderTitle.BackgroundTransparency = 1
KeyHeaderTitle.Font = Enum.Font.GothamBlack
KeyHeaderTitle.Text = "CORE.XYZ  ·  KEY SYSTEM"
KeyHeaderTitle.TextColor3 = Theme.White
KeyHeaderTitle.TextSize = 16
KeyHeaderTitle.TextXAlignment = Enum.TextXAlignment.Left
KeyHeaderTitle.ZIndex = 22
KeyHeaderTitle.Parent = KeyCard

local KeyHeaderSub = Instance.new("TextLabel")
KeyHeaderSub.Position = UDim2.fromOffset(22, 50)
KeyHeaderSub.Size = UDim2.new(1, -44, 0, 18)
KeyHeaderSub.BackgroundTransparency = 1
KeyHeaderSub.Font = Enum.Font.GothamMedium
KeyHeaderSub.Text = "Enter your security key or tap GET KEY to auto-fill."
KeyHeaderSub.TextColor3 = Theme.Muted
KeyHeaderSub.TextSize = 11
KeyHeaderSub.TextXAlignment = Enum.TextXAlignment.Left
KeyHeaderSub.ZIndex = 22
KeyHeaderSub.Parent = KeyCard

local KeyInputHolder = Instance.new("Frame")
KeyInputHolder.Position = UDim2.fromOffset(22, 78)
KeyInputHolder.Size = UDim2.new(1, -44, 0, 44)
KeyInputHolder.BackgroundColor3 = Theme.Surface
KeyInputHolder.ZIndex = 22
KeyInputHolder.Parent = KeyCard
addCorner(KeyInputHolder, 8)
local KeyInputStroke = addStroke(KeyInputHolder, Theme.Border, 1.2, 0)

local KeyInputBox = Instance.new("TextBox")
KeyInputBox.Position = UDim2.fromOffset(14, 0)
KeyInputBox.Size = UDim2.new(1, -28, 1, 0)
KeyInputBox.BackgroundTransparency = 1
KeyInputBox.Font = Enum.Font.Code
KeyInputBox.PlaceholderText = "Enter Key (FEYKSECURED)..."
KeyInputBox.PlaceholderColor3 = Theme.Muted
KeyInputBox.Text = ""
KeyInputBox.TextColor3 = Theme.White
KeyInputBox.TextSize = 13
KeyInputBox.ClearTextOnFocus = false
KeyInputBox.TextXAlignment = Enum.TextXAlignment.Left
KeyInputBox.ZIndex = 23
KeyInputBox.Parent = KeyInputHolder

KeyInputBox.Focused:Connect(function()
    tween(KeyInputStroke, FastTween, { Color = Theme.White, Thickness = 1.6 })
    tween(KeyInputHolder, FastTween, { BackgroundColor3 = Theme.Elevated })
end)
KeyInputBox.FocusLost:Connect(function()
    tween(KeyInputStroke, FastTween, { Color = Theme.Border, Thickness = 1.2 })
    tween(KeyInputHolder, FastTween, { BackgroundColor3 = Theme.Surface })
end)

local KeyFeedback = Instance.new("TextLabel")
KeyFeedback.Position = UDim2.fromOffset(22, 128)
KeyFeedback.Size = UDim2.new(1, -44, 0, 18)
KeyFeedback.BackgroundTransparency = 1
KeyFeedback.Font = Enum.Font.GothamMedium
KeyFeedback.Text = "Status: Awaiting Authorization..."
KeyFeedback.TextColor3 = Theme.Silver
KeyFeedback.TextSize = 11
KeyFeedback.TextXAlignment = Enum.TextXAlignment.Left
KeyFeedback.ZIndex = 22
KeyFeedback.Parent = KeyCard

local UnlockButton = Instance.new("TextButton")
UnlockButton.Position = UDim2.fromOffset(22, 156)
UnlockButton.Size = UDim2.new(0.62, -26, 0, 42)
UnlockButton.BackgroundColor3 = Theme.White
UnlockButton.AutoButtonColor = false
UnlockButton.Font = Enum.Font.GothamBlack
UnlockButton.Text = "AUTHORIZE KEY"
UnlockButton.TextColor3 = Theme.Black
UnlockButton.TextSize = 12
UnlockButton.ZIndex = 22
UnlockButton.Parent = KeyCard
addCorner(UnlockButton, 8)

local CopyKeyButton = Instance.new("TextButton")
CopyKeyButton.Position = UDim2.new(0.62, 4, 0, 156)
CopyKeyButton.Size = UDim2.new(0.38, -26, 0, 42)
CopyKeyButton.BackgroundColor3 = Theme.Surface
CopyKeyButton.AutoButtonColor = false
CopyKeyButton.Font = Enum.Font.GothamBold
CopyKeyButton.Text = "GET KEY"
CopyKeyButton.TextColor3 = Theme.White
CopyKeyButton.TextSize = 11
CopyKeyButton.ZIndex = 22
CopyKeyButton.Parent = KeyCard
addCorner(CopyKeyButton, 8)
local CopyKeyStroke = addLiveBorder(CopyKeyButton, 1.2, 85, 0.2)

local KeyFooter = Instance.new("TextLabel")
KeyFooter.Position = UDim2.fromOffset(22, 210)
KeyFooter.Size = UDim2.new(1, -44, 0, 18)
KeyFooter.BackgroundTransparency = 1
KeyFooter.Font = Enum.Font.Code
KeyFooter.Text = "CORE.XYZ SECURITY  ·  KEY: FEYKSECURED"
KeyFooter.TextColor3 = Theme.Muted
KeyFooter.TextSize = 10
KeyFooter.TextXAlignment = Enum.TextXAlignment.Center
KeyFooter.ZIndex = 22
KeyFooter.Parent = KeyCard

makeDraggable(KeyCard, KeyCard)

--------------------------------------------------------------------------------
-- 7. FLOATING DRAGGABLE TOGGLE PILL (DECLARED BEFORE MAIN HUB!)
--------------------------------------------------------------------------------
local FloatingToggle = Instance.new("TextButton")
FloatingToggle.Name = "CoreFloatingToggle"
FloatingToggle.AnchorPoint = Vector2.new(0.5, 0)
FloatingToggle.Position = UDim2.new(0.5, 0, 0, 14)
FloatingToggle.Size = UDim2.fromOffset(132, 34)
FloatingToggle.BackgroundColor3 = Theme.Black
FloatingToggle.BackgroundTransparency = 0.05
FloatingToggle.AutoButtonColor = false
FloatingToggle.Text = ""
FloatingToggle.Visible = false
FloatingToggle.ZIndex = 40
FloatingToggle.Parent = ScreenGui
addCorner(FloatingToggle, 99)
addLiveBorder(FloatingToggle, 1.4, 95, 0.08)

local FloatOrb = Instance.new("Frame")
FloatOrb.AnchorPoint = Vector2.new(0, 0.5)
FloatOrb.Position = UDim2.new(0, 12, 0.5, 0)
FloatOrb.Size = UDim2.fromOffset(12, 12)
FloatOrb.BackgroundTransparency = 1
FloatOrb.ZIndex = 41
FloatOrb.Parent = FloatingToggle
addCorner(FloatOrb, 3)
addStroke(FloatOrb, Theme.White, 1.3, 0)
table.insert(liveRotators, { Instance = FloatOrb, Speed = 65 })

local FloatStatusDot = Instance.new("Frame")
FloatStatusDot.AnchorPoint = Vector2.new(0.5, 0.5)
FloatStatusDot.Position = UDim2.fromScale(0.5, 0.5)
FloatStatusDot.Size = UDim2.fromOffset(4, 4)
FloatStatusDot.BackgroundColor3 = Theme.White
FloatStatusDot.BorderSizePixel = 0
FloatStatusDot.ZIndex = 41
FloatStatusDot.Parent = FloatOrb
addCorner(FloatStatusDot, 99)

local FloatLabel = Instance.new("TextLabel")
FloatLabel.Position = UDim2.fromOffset(30, 0)
FloatLabel.Size = UDim2.new(1, -38, 1, 0)
FloatLabel.BackgroundTransparency = 1
FloatLabel.Font = Enum.Font.GothamBlack
FloatLabel.Text = "CORE.XYZ"
FloatLabel.TextColor3 = Theme.White
FloatLabel.TextSize = 11
FloatLabel.TextXAlignment = Enum.TextXAlignment.Left
FloatLabel.ZIndex = 41
FloatLabel.Parent = FloatingToggle

makeDraggable(FloatingToggle, FloatingToggle)

--------------------------------------------------------------------------------
-- 8. STAGE 3: LIVE-ANIMATED MAIN HUB ("Core.xyz")
--------------------------------------------------------------------------------
local MainWindow = Instance.new("Frame")
MainWindow.Name = "CoreMainWindow"
MainWindow.AnchorPoint = Vector2.new(0.5, 0.5)
MainWindow.Position = UDim2.fromScale(0.5, 0.52)
MainWindow.Size = UDim2.fromOffset(530, 345)
MainWindow.BackgroundColor3 = Theme.Black
MainWindow.BackgroundTransparency = 1
MainWindow.Active = true
MainWindow.Visible = false
MainWindow.ClipsDescendants = true
MainWindow.ZIndex = 10
MainWindow.Parent = ScreenGui
addCorner(MainWindow, 12)
local MainStroke = addLiveBorder(MainWindow, 1.5, 55, 1)

local MainScale = Instance.new("UIScale")
MainScale.Scale = 0.88
MainScale.Parent = MainWindow

-- Live Monochrome Particle Field inside Main Window
createParticleCanvas(MainWindow, 22)

-- Top Header Bar
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
HeaderBottomLine.BackgroundColor3 = Theme.White
HeaderBottomLine.BackgroundTransparency = 0.78
HeaderBottomLine.BorderSizePixel = 0
HeaderBottomLine.ZIndex = 13
HeaderBottomLine.Parent = HeaderBar

local HeaderLineGrad = Instance.new("UIGradient")
HeaderLineGrad.Color = ColorSequence.new({
    ColorSequenceKeypoint.new(0.0, Theme.Black),
    ColorSequenceKeypoint.new(0.5, Theme.White),
    ColorSequenceKeypoint.new(1.0, Theme.Black),
})
HeaderLineGrad.Parent = HeaderBottomLine

-- Live Rotating Emblem in Header
local HeaderLogoOuter = Instance.new("Frame")
HeaderLogoOuter.AnchorPoint = Vector2.new(0, 0.5)
HeaderLogoOuter.Position = UDim2.new(0, 16, 0.5, 0)
HeaderLogoOuter.Size = UDim2.fromOffset(18, 18)
HeaderLogoOuter.BackgroundTransparency = 1
HeaderLogoOuter.ZIndex = 13
HeaderLogoOuter.Parent = HeaderBar
addCorner(HeaderLogoOuter, 4)
addStroke(HeaderLogoOuter, Theme.White, 1.4, 0)
table.insert(liveRotators, { Instance = HeaderLogoOuter, Speed = 45 })

local HeaderLogoDot = Instance.new("Frame")
HeaderLogoDot.AnchorPoint = Vector2.new(0.5, 0.5)
HeaderLogoDot.Position = UDim2.fromScale(0.5, 0.5)
HeaderLogoDot.Size = UDim2.fromOffset(5, 5)
HeaderLogoDot.BackgroundColor3 = Theme.White
HeaderLogoDot.BorderSizePixel = 0
HeaderLogoDot.ZIndex = 13
HeaderLogoDot.Parent = HeaderLogoOuter
addCorner(HeaderLogoDot, 99)

local HeaderTitle = Instance.new("TextLabel")
HeaderTitle.Position = UDim2.fromOffset(42, 7)
HeaderTitle.Size = UDim2.fromOffset(150, 18)
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
HeaderSub.Size = UDim2.fromOffset(220, 14)
HeaderSub.BackgroundTransparency = 1
HeaderSub.Font = Enum.Font.Code
HeaderSub.Text = "UNIVERSAL SUITE  ·  FEYKSECURED"
HeaderSub.TextColor3 = Theme.Muted
HeaderSub.TextSize = 9
HeaderSub.TextXAlignment = Enum.TextXAlignment.Left
HeaderSub.ZIndex = 13
HeaderSub.Parent = HeaderBar

-- Minimize Button in Header
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

MinimizeBtn.MouseEnter:Connect(function()
    tween(MinimizeBtn, FastTween, { BackgroundColor3 = Theme.White, TextColor3 = Theme.Black })
    tween(MinStroke, FastTween, { Color = Theme.White })
end)
MinimizeBtn.MouseLeave:Connect(function()
    tween(MinimizeBtn, FastTween, { BackgroundColor3 = Theme.Surface, TextColor3 = Theme.Silver })
    tween(MinStroke, FastTween, { Color = Theme.Border })
end)

makeDraggable(HeaderBar, MainWindow)

-- Toggle Window Visibility Function (Used by Floating Pill, Minimize Button, and RightShift)
local function toggleMainHub()
    if not isAuthorized then
        return
    end
    uiVisible = not uiVisible
    local targetScale = getResponsiveScale()
    if uiVisible then
        MainWindow.Visible = true
        tween(MainScale, SpringTween, { Scale = targetScale })
        tween(MainWindow, FastTween, { BackgroundTransparency = 0.03 })
        tween(MainStroke, FastTween, { Transparency = 0.08 })
        tween(FloatingToggle, FastTween, { BackgroundColor3 = Theme.Black })
    else
        tween(MainScale, FastTween, { Scale = targetScale * 0.9 })
        tween(MainWindow, FastTween, { BackgroundTransparency = 1 })
        tween(MainStroke, FastTween, { Transparency = 1 })
        tween(FloatingToggle, FastTween, { BackgroundColor3 = Theme.Elevated })
        task.delay(0.18, function()
            if not uiVisible then
                MainWindow.Visible = false
            end
        end)
    end
end

FloatingToggle.MouseButton1Click:Connect(function()
    spawnRipple(FloatingToggle)
    toggleMainHub()
end)

MinimizeBtn.MouseButton1Click:Connect(function()
    spawnRipple(MinimizeBtn)
    toggleMainHub()
end)

-- Left Navigation Sidebar
local Sidebar = Instance.new("Frame")
Sidebar.Position = UDim2.fromOffset(0, 46)
Sidebar.Size = UDim2.new(0, 142, 1, -46)
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

-- Live Sliding Active Tab Indicator Bar
local ActiveTabIndicator = Instance.new("Frame")
ActiveTabIndicator.Position = UDim2.fromOffset(10, 18)
ActiveTabIndicator.Size = UDim2.fromOffset(3, 20)
ActiveTabIndicator.BackgroundColor3 = Theme.White
ActiveTabIndicator.BorderSizePixel = 0
ActiveTabIndicator.ZIndex = 15
ActiveTabIndicator.Parent = Sidebar
addCorner(ActiveTabIndicator, 99)

local NavList = Instance.new("Frame")
NavList.Position = UDim2.fromOffset(10, 12)
NavList.Size = UDim2.new(1, -20, 1, -54)
NavList.BackgroundTransparency = 1
NavList.ZIndex = 13
NavList.Parent = Sidebar

local NavLayout = Instance.new("UIListLayout")
NavLayout.Padding = UDim.new(0, 6)
NavLayout.SortOrder = Enum.SortOrder.LayoutOrder
NavLayout.Parent = NavList

-- User Footer Badge in Sidebar
local UserCard = Instance.new("Frame")
UserCard.AnchorPoint = Vector2.new(0.5, 1)
UserCard.Position = UDim2.new(0.5, 0, 1, -10)
UserCard.Size = UDim2.new(1, -20, 0, 32)
UserCard.BackgroundColor3 = Theme.Surface
UserCard.ZIndex = 13
UserCard.Parent = Sidebar
addCorner(UserCard, 6)
addStroke(UserCard, Theme.Border, 1, 0)

local UserDot = Instance.new("Frame")
UserDot.AnchorPoint = Vector2.new(0, 0.5)
UserDot.Position = UDim2.new(0, 10, 0.5, 0)
UserDot.Size = UDim2.fromOffset(6, 6)
UserDot.BackgroundColor3 = Theme.White
UserDot.BorderSizePixel = 0
UserDot.ZIndex = 14
UserDot.Parent = UserCard
addCorner(UserDot, 99)

local UserLabel = Instance.new("TextLabel")
UserLabel.Position = UDim2.fromOffset(22, 0)
UserLabel.Size = UDim2.new(1, -26, 1, 0)
UserLabel.BackgroundTransparency = 1
UserLabel.Font = Enum.Font.Code
UserLabel.Text = LocalPlayer.Name or "Operator"
UserLabel.TextColor3 = Theme.Silver
UserLabel.TextSize = 10
UserLabel.TextTruncate = Enum.TextTruncate.AtEnd
UserLabel.TextXAlignment = Enum.TextXAlignment.Left
UserLabel.ZIndex = 14
UserLabel.Parent = UserCard

-- Right Pages Container
local PagesHolder = Instance.new("Frame")
PagesHolder.Position = UDim2.fromOffset(142, 46)
PagesHolder.Size = UDim2.new(1, -142, 1, -46)
PagesHolder.BackgroundTransparency = 1
PagesHolder.ClipsDescendants = true
PagesHolder.ZIndex = 12
PagesHolder.Parent = MainWindow

--------------------------------------------------------------------------------
-- 9. ANIMATED COMPONENT BUILDERS (TABS, TOGGLES, SLIDERS, DROPDOWNS, BUTTONS)
--------------------------------------------------------------------------------
local Tabs = {}
local activeTab = nil

local function createTab(name, order)
    local btn = Instance.new("TextButton")
    btn.LayoutOrder = order
    btn.Size = UDim2.new(1, 0, 0, 34)
    btn.BackgroundColor3 = Theme.Elevated
    btn.BackgroundTransparency = 1
    btn.AutoButtonColor = false
    btn.Font = Enum.Font.GothamBold
    btn.Text = "    " .. string.upper(name)
    btn.TextColor3 = Theme.Muted
    btn.TextSize = 11
    btn.TextXAlignment = Enum.TextXAlignment.Left
    btn.ZIndex = 14
    btn.Parent = NavList
    addCorner(btn, 7)
    local st = addStroke(btn, Theme.Border, 1, 1)

    local page = Instance.new("ScrollingFrame")
    page.Name = name .. "_Page"
    page.Size = UDim2.new(1, 0, 1, 0)
    page.Position = UDim2.fromOffset(0, 12)
    page.BackgroundTransparency = 1
    page.BorderSizePixel = 0
    page.ScrollBarThickness = 2
    page.ScrollBarImageColor3 = Theme.White
    page.ScrollingEnabled = true
    page.Visible = false
    page.AutomaticCanvasSize = Enum.AutomaticSize.Y
    page.CanvasSize = UDim2.new(0, 0, 0, 0)
    page.ZIndex = 13
    page.Parent = PagesHolder

    local pad = Instance.new("UIPadding")
    pad.PaddingTop = UDim.new(0, 12)
    pad.PaddingBottom = UDim.new(0, 18)
    pad.PaddingLeft = UDim.new(0, 14)
    pad.PaddingRight = UDim.new(0, 14)
    pad.Parent = page

    local list = Instance.new("UIListLayout")
    list.Padding = UDim.new(0, 8)
    list.SortOrder = Enum.SortOrder.LayoutOrder
    list.Parent = page

    local tabObj = { Btn = btn, Stroke = st, Page = page, Order = order }
    table.insert(Tabs, tabObj)

    local function selectTab()
        if activeTab == tabObj then
            return
        end
        for _, t in ipairs(Tabs) do
            tween(t.Btn, FastTween, {
                BackgroundTransparency = 1,
                TextColor3 = Theme.Muted,
            })
            tween(t.Stroke, FastTween, { Transparency = 1 })
            t.Page.Visible = false
        end
        activeTab = tabObj
        tween(btn, FastTween, {
            BackgroundTransparency = 0.1,
            TextColor3 = Theme.White,
        })
        tween(st, FastTween, { Transparency = 0.2, Color = Theme.White })

        -- Slide ActiveTabIndicator smoothly to selected button row
        local targetY = 12 + ((order - 1) * 40) + 7
        tween(ActiveTabIndicator, SpringTween, {
            Position = UDim2.fromOffset(10, targetY),
        })

        page.Position = UDim2.fromOffset(14, 0)
        page.Visible = true
        tween(page, SmoothTween, { Position = UDim2.fromOffset(0, 0) })
    end

    btn.MouseEnter:Connect(function()
        if activeTab ~= tabObj then
            tween(btn, FastTween, { BackgroundTransparency = 0.5, TextColor3 = Theme.Silver })
        end
    end)
    btn.MouseLeave:Connect(function()
        if activeTab ~= tabObj then
            tween(btn, FastTween, { BackgroundTransparency = 1, TextColor3 = Theme.Muted })
        end
    end)
    btn.MouseButton1Click:Connect(function()
        spawnRipple(btn)
        selectTab()
    end)

    if #Tabs == 1 then
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
    dot.BackgroundColor3 = Theme.White
    dot.BorderSizePixel = 0
    dot.ZIndex = 14
    dot.Parent = holder
    addCorner(dot, 99)

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

    btn.MouseEnter:Connect(function()
        tween(btn, FastTween, { BackgroundColor3 = Theme.Elevated })
        tween(st, FastTween, { Color = Theme.White })
    end)
    btn.MouseLeave:Connect(function()
        tween(btn, FastTween, { BackgroundColor3 = Theme.Surface })
        tween(st, FastTween, { Color = Theme.Border })
    end)
    btn.MouseButton1Click:Connect(function()
        spawnRipple(btn)
        tween(btn, TweenInfo.new(0.08), { BackgroundColor3 = Theme.White, TextColor3 = Theme.Black })
        task.delay(0.12, function()
            tween(btn, FastTween, { BackgroundColor3 = Theme.Surface, TextColor3 = Theme.White })
        end)
        callback()
    end)
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
    local st = addStroke(row, defaultVal and Theme.White or Theme.Border, 1, defaultVal and 0.35 or 0)

    local statusBar = Instance.new("Frame")
    statusBar.AnchorPoint = Vector2.new(0, 0.5)
    statusBar.Position = UDim2.new(0, 0, 0.5, 0)
    statusBar.Size = UDim2.fromOffset(3, defaultVal and 20 or 0)
    statusBar.BackgroundColor3 = Theme.White
    statusBar.BorderSizePixel = 0
    statusBar.ZIndex = 15
    statusBar.Parent = row
    addCorner(statusBar, 99)

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
    pill.BackgroundColor3 = defaultVal and Theme.White or Theme.Deep
    pill.ZIndex = 15
    pill.Parent = row
    addCorner(pill, 99)
    local pillStroke = addStroke(pill, defaultVal and Theme.White or Theme.Border, 1, 0)

    local dot = Instance.new("Frame")
    dot.AnchorPoint = Vector2.new(0, 0.5)
    dot.Position = defaultVal and UDim2.new(1, -19, 0.5, 0) or UDim2.new(0, 3, 0.5, 0)
    dot.Size = UDim2.fromOffset(16, 16)
    dot.BackgroundColor3 = defaultVal and Theme.Black or Theme.Muted
    dot.ZIndex = 16
    dot.Parent = pill
    addCorner(dot, 99)

    local state = defaultVal
    row.MouseEnter:Connect(function()
        tween(row, FastTween, { BackgroundColor3 = Theme.Elevated })
    end)
    row.MouseLeave:Connect(function()
        tween(row, FastTween, { BackgroundColor3 = Theme.Surface })
    end)
    row.MouseButton1Click:Connect(function()
        state = not state
        spawnRipple(row)
        tween(lbl, FastTween, { TextColor3 = state and Theme.White or Theme.Silver })
        tween(st, FastTween, {
            Color = state and Theme.White or Theme.Border,
            Transparency = state and 0.35 or 0,
        })
        tween(statusBar, SpringTween, {
            Size = UDim2.fromOffset(3, state and 20 or 0),
        })
        tween(pill, FastTween, {
            BackgroundColor3 = state and Theme.White or Theme.Deep,
        })
        tween(pillStroke, FastTween, {
            Color = state and Theme.White or Theme.Border,
        })
        tween(dot, SpringTween, {
            Position = state and UDim2.new(1, -19, 0.5, 0) or UDim2.new(0, 3, 0.5, 0),
            BackgroundColor3 = state and Theme.Black or Theme.Muted,
        })
        callback(state)
    end)
end

local function createSlider(page, text, minVal, maxVal, defaultVal, increment, suffix, callback)
    local card = Instance.new("Frame")
    card.Size = UDim2.new(1, 0, 0, 54)
    card.BackgroundColor3 = Theme.Surface
    card.ZIndex = 14
    card.Parent = page
    addCorner(card, 8)
    local st = addStroke(card, Theme.Border, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(14, 7)
    lbl.Size = UDim2.new(0.62, 0, 0, 18)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamMedium
    lbl.Text = text
    lbl.TextColor3 = Theme.White
    lbl.TextSize = 12
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.ZIndex = 15
    lbl.Parent = card

    local valBadge = Instance.new("TextLabel")
    valBadge.AnchorPoint = Vector2.new(1, 0)
    valBadge.Position = UDim2.new(1, -14, 0, 7)
    valBadge.Size = UDim2.new(0.38, -14, 0, 18)
    valBadge.BackgroundTransparency = 1
    valBadge.Font = Enum.Font.Code
    valBadge.Text = tostring(defaultVal) .. (suffix ~= "" and (" " .. suffix) or "")
    valBadge.TextColor3 = Theme.White
    valBadge.TextSize = 11
    valBadge.TextXAlignment = Enum.TextXAlignment.Right
    valBadge.ZIndex = 15
    valBadge.Parent = card

    local track = Instance.new("TextButton")
    track.Position = UDim2.fromOffset(14, 34)
    track.Size = UDim2.new(1, -28, 0, 6)
    track.BackgroundColor3 = Theme.Deep
    track.AutoButtonColor = false
    track.Text = ""
    track.ZIndex = 15
    track.Parent = card
    addCorner(track, 99)
    addStroke(track, Theme.Border, 1, 0.3)

    local initPct = math.clamp((defaultVal - minVal) / (maxVal - minVal), 0, 1)
    local fill = Instance.new("Frame")
    fill.Size = UDim2.fromScale(initPct, 1)
    fill.BackgroundColor3 = Theme.White
    fill.BorderSizePixel = 0
    fill.ZIndex = 16
    fill.Parent = track
    addCorner(fill, 99)

    local thumb = Instance.new("Frame")
    thumb.AnchorPoint = Vector2.new(0.5, 0.5)
    thumb.Position = UDim2.fromScale(initPct, 0.5)
    thumb.Size = UDim2.fromOffset(12, 12)
    thumb.BackgroundColor3 = Theme.White
    thumb.BorderSizePixel = 0
    thumb.ZIndex = 17
    thumb.Parent = track
    addCorner(thumb, 99)
    addStroke(thumb, Theme.Black, 2, 0)

    local sliding = false
    local function updateSlider(input)
        local trackWidth = track.AbsoluteSize.X
        if trackWidth <= 0 then
            trackWidth = 300
        end
        local pct = math.clamp((input.Position.X - track.AbsolutePosition.X) / trackWidth, 0, 1)
        local raw = minVal + (maxVal - minVal) * pct
        local snapped = math.floor((raw / increment) + 0.5) * increment
        snapped = tonumber(string.format("%.2f", snapped)) or snapped
        tween(fill, TweenInfo.new(0.06), { Size = UDim2.fromScale(pct, 1) })
        tween(thumb, TweenInfo.new(0.06), { Position = UDim2.fromScale(pct, 0.5) })
        valBadge.Text = tostring(snapped) .. (suffix ~= "" and (" " .. suffix) or "")
        callback(snapped)
    end

    track.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            sliding = true
            if page and page:IsA("ScrollingFrame") then
                page.ScrollingEnabled = false
            end
            tween(thumb, FastTween, { Size = UDim2.fromOffset(16, 16) })
            tween(st, FastTween, { Color = Theme.White })
            updateSlider(input)
        end
    end)
    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            if sliding then
                sliding = false
                if page and page:IsA("ScrollingFrame") then
                    page.ScrollingEnabled = true
                end
                tween(thumb, FastTween, { Size = UDim2.fromOffset(12, 12) })
                tween(st, FastTween, { Color = Theme.Border })
            end
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if sliding and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            updateSlider(input)
        end
    end)
end

-- Smooth Expandable Animated Dropdown
local function createDropdown(page, text, options, defaultOption, callback)
    local isOpen = false
    local selected = defaultOption or options[1]

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
    headerBtn.AutoButtonColor = false
    headerBtn.Text = ""
    headerBtn.ZIndex = 15
    headerBtn.Parent = container

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(14, 0)
    lbl.Size = UDim2.new(0.52, 0, 1, 0)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamMedium
    lbl.Text = text
    lbl.TextColor3 = Theme.White
    lbl.TextSize = 12
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.ZIndex = 15
    lbl.Parent = headerBtn

    local badge = Instance.new("Frame")
    badge.AnchorPoint = Vector2.new(1, 0.5)
    badge.Position = UDim2.new(1, -12, 0.5, 0)
    badge.Size = UDim2.fromOffset(148, 24)
    badge.BackgroundColor3 = Theme.Deep
    badge.ZIndex = 15
    badge.Parent = headerBtn
    addCorner(badge, 6)
    addStroke(badge, Theme.Border, 1, 0)

    local optLbl = Instance.new("TextLabel")
    optLbl.Position = UDim2.fromOffset(8, 0)
    optLbl.Size = UDim2.new(1, -24, 1, 0)
    optLbl.BackgroundTransparency = 1
    optLbl.Font = Enum.Font.Code
    optLbl.Text = tostring(selected)
    optLbl.TextColor3 = Theme.White
    optLbl.TextSize = 11
    optLbl.TextTruncate = Enum.TextTruncate.AtEnd
    optLbl.TextXAlignment = Enum.TextXAlignment.Left
    optLbl.ZIndex = 16
    optLbl.Parent = badge

    local arrow = Instance.new("TextLabel")
    arrow.AnchorPoint = Vector2.new(1, 0.5)
    arrow.Position = UDim2.new(1, -6, 0.5, 0)
    arrow.Size = UDim2.fromOffset(14, 14)
    arrow.BackgroundTransparency = 1
    arrow.Font = Enum.Font.GothamBold
    arrow.Text = "v"
    arrow.TextColor3 = Theme.Silver
    arrow.TextSize = 10
    arrow.ZIndex = 16
    arrow.Parent = badge

    local listHolder = Instance.new("Frame")
    listHolder.Position = UDim2.fromOffset(10, 42)
    listHolder.Size = UDim2.new(1, -20, 0, #options * 28)
    listHolder.BackgroundTransparency = 1
    listHolder.ZIndex = 15
    listHolder.Parent = container

    local listLayout = Instance.new("UIListLayout")
    listLayout.Padding = UDim.new(0, 4)
    listLayout.SortOrder = Enum.SortOrder.LayoutOrder
    listLayout.Parent = listHolder

    local optionButtons = {}

    local function setOpen(state)
        isOpen = state
        local openHeight = 46 + (#options * 30)
        tween(container, SmoothTween, {
            Size = UDim2.new(1, 0, 0, isOpen and openHeight or 40),
        })
        tween(arrow, FastTween, {
            Rotation = isOpen and 180 or 0,
        })
        tween(st, FastTween, {
            Color = isOpen and Theme.White or Theme.Border,
        })
    end

    for i, opt in ipairs(options) do
        local optBtn = Instance.new("TextButton")
        optBtn.LayoutOrder = i
        optBtn.Size = UDim2.new(1, 0, 0, 26)
        optBtn.BackgroundColor3 = (opt == selected) and Theme.White or Theme.Deep
        optBtn.AutoButtonColor = false
        optBtn.Font = Enum.Font.Code
        optBtn.Text = tostring(opt)
        optBtn.TextColor3 = (opt == selected) and Theme.Black or Theme.Silver
        optBtn.TextSize = 11
        optBtn.ZIndex = 16
        optBtn.Parent = listHolder
        addCorner(optBtn, 6)

        table.insert(optionButtons, { Btn = optBtn, Value = opt })

        optBtn.MouseButton1Click:Connect(function()
            selected = opt
            optLbl.Text = tostring(opt)
            for _, item in ipairs(optionButtons) do
                local active = (item.Value == selected)
                tween(item.Btn, FastTween, {
                    BackgroundColor3 = active and Theme.White or Theme.Deep,
                    TextColor3 = active and Theme.Black or Theme.Silver,
                })
            end
            setOpen(false)
            callback(opt)
        end)
    end

    headerBtn.MouseButton1Click:Connect(function()
        spawnRipple(headerBtn)
        setOpen(not isOpen)
    end)
end

--------------------------------------------------------------------------------
-- 10. CORE GAMEPLAY FUNCTIONS (WITH ALL CODE REVIEW IMPROVEMENTS)
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
    elseif partName == "RightUpperLeg" then
        return char:FindFirstChild("Right Leg") or char:FindFirstChild("HumanoidRootPart")
    elseif partName == "LeftUpperLeg" then
        return char:FindFirstChild("Left Leg") or char:FindFirstChild("HumanoidRootPart")
    end
    return char:FindFirstChild("HumanoidRootPart") or char:FindFirstChild("Head")
end

local function passesTeamCheck(player)
    if not teamCheckEnabled then
        return true
    end
    if selectedTeams["All"] then
        return true
    end
    return selectedTeams[tostring(player.Team)] == true
end

local function cleanupPlayerESP(player)
    local data = espObjects[player]
    if not data then
        return
    end
    if data.Billboard then
        pcall(function()
            data.Billboard:Destroy()
        end)
    end
    if data.Tracer then
        pcall(function()
            data.Tracer:Destroy()
        end)
    end
    if data.Highlight then
        pcall(function()
            data.Highlight:Destroy()
        end)
        activeHighlightCount = math.max(0, activeHighlightCount - 1)
    end
    espObjects[player] = nil
end

local function clearESP()
    for player in pairs(espObjects) do
        cleanupPlayerESP(player)
    end
end

Players.PlayerRemoving:Connect(cleanupPlayerESP)

local function updateESP(camera)
    for player in pairs(espObjects) do
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
                local tagData = espObjects[player]
                if not tagData then
                    local bb = Instance.new("BillboardGui")
                    bb.Name = "CoreESP"
                    bb.Adornee = hrp
                    bb.Size = UDim2.fromOffset(200, 28)
                    bb.StudsOffset = Vector3.new(0, 3.2, 0)
                    bb.AlwaysOnTop = true
                    bb.Parent = OverlayContainer

                    local txt = Instance.new("TextLabel")
                    txt.Size = UDim2.fromScale(1, 1)
                    txt.BackgroundTransparency = 1
                    txt.Font = Enum.Font.GothamBold
                    txt.TextColor3 = espColor
                    txt.TextStrokeTransparency = 0.15
                    txt.TextSize = 12
                    txt.Parent = bb

                    local line = Instance.new("Frame")
                    line.AnchorPoint = Vector2.new(0.5, 0.5)
                    line.BackgroundColor3 = espColor
                    line.BorderSizePixel = 0
                    line.Visible = false
                    line.Parent = OverlayContainer

                    tagData = { Billboard = bb, Text = txt, Tracer = line }
                    espObjects[player] = tagData
                end

                if (not tagData.Highlight or tagData.Highlight.Adornee ~= char) and activeHighlightCount < MAX_HIGHLIGHTS then
                    if tagData.Highlight then
                        pcall(function()
                            tagData.Highlight:Destroy()
                        end)
                        activeHighlightCount = math.max(0, activeHighlightCount - 1)
                    end
                    local hl = Instance.new("Highlight")
                    hl.FillColor = espColor
                    hl.OutlineColor = Theme.White
                    hl.FillTransparency = 0.7
                    hl.OutlineTransparency = 0.25
                    hl.Adornee = char
                    hl.Parent = HighlightContainer
                    tagData.Highlight = hl
                    activeHighlightCount = activeHighlightCount + 1
                end

                local dist = math.floor((hrp.Position - camera.CFrame.Position).Magnitude)
                local screenPos, onScreen = camera:WorldToViewportPoint(hrp.Position)

                tagData.Billboard.Adornee = hrp
                tagData.Billboard.Enabled = onScreen
                tagData.Text.Text = string.format("%s [%dm] | HP: %d", player.Name, dist, math.floor(hum.Health))
                tagData.Text.TextColor3 = espColor

                if tagData.Highlight then
                    tagData.Highlight.FillColor = espColor
                    tagData.Highlight.Enabled = true
                end

                if onScreen and tracersEnabled then
                    local fromPos
                    if tracerOrigin == "Center" then
                        fromPos = Vector2.new(vp.X / 2, vp.Y / 2)
                    elseif tracerOrigin == "Bottom" then
                        fromPos = Vector2.new(vp.X / 2, vp.Y)
                    else
                        fromPos = Vector2.new(vp.X / 2, 0)
                    end
                    local toPos = Vector2.new(screenPos.X, screenPos.Y)
                    local diff = toPos - fromPos
                    local mid = (fromPos + toPos) / 2

                    local atan2Fn = math.atan2 or math.atan
                    tagData.Tracer.Position = UDim2.fromOffset(mid.X, mid.Y)
                    tagData.Tracer.Size = UDim2.fromOffset(diff.Magnitude, 1)
                    tagData.Tracer.Rotation = math.deg(atan2Fn(diff.Y, diff.X))
                    tagData.Tracer.BackgroundColor3 = espColor
                    tagData.Tracer.Visible = true
                else
                    tagData.Tracer.Visible = false
                end
            end
        end
    end
end

local function updateCrosshair()
    CrosshairV.Size = UDim2.fromOffset(1, crosshairSize * 2)
    CrosshairV.BackgroundColor3 = crosshairColor
    CrosshairV.Visible = crosshairEnabled

    CrosshairH.Size = UDim2.fromOffset(crosshairSize * 2, 1)
    CrosshairH.BackgroundColor3 = crosshairColor
    CrosshairH.Visible = crosshairEnabled
end

local function getClosestTarget(camera)
    local closest, shortest = nil, fovRadius
    local center = Vector2.new(camera.ViewportSize.X / 2, camera.ViewportSize.Y / 2)

    rayParams.FilterDescendantsInstances = LocalPlayer.Character and { LocalPlayer.Character } or {}

    for _, player in ipairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and passesTeamCheck(player) then
            local humanoid = player.Character:FindFirstChildOfClass("Humanoid")
            local part = getTargetPartFromCharacter(player.Character, targetPart)
            if humanoid and humanoid.Health > 0 and part then
                local screenPos, onScreen = camera:WorldToViewportPoint(part.Position)
                if onScreen then
                    local dist = (Vector2.new(screenPos.X, screenPos.Y) - center).Magnitude
                    if dist <= shortest then
                        local dir = part.Position - camera.CFrame.Position
                        local ray = workspace:Raycast(camera.CFrame.Position, dir.Unit * 999, rayParams)
                        if ray and ray.Instance and ray.Instance:IsDescendantOf(player.Character) then
                            shortest = dist
                            closest = part
                        end
                    end
                end
            end
        end
    end

    return closest
end

local function updateMovement()
    local char = LocalPlayer.Character
    local humanoid = char and char:FindFirstChildOfClass("Humanoid")
    if humanoid then
        humanoid.WalkSpeed = walkSpeedEnabled and walkSpeed or defaultWalkSpeed
        humanoid.UseJumpPower = true
        humanoid.JumpPower = jumpPowerEnabled and jumpPower or defaultJumpPower
    end
end

local function restoreNoClipCollisions()
    for part, origState in pairs(noclipCollideCache) do
        if part and part.Parent then
            part.CanCollide = origState
        end
    end
    table.clear(noclipCollideCache)
end

--------------------------------------------------------------------------------
-- 11. BUILD ALL TABS (HOME, COMBAT, VISUALS, MOVEMENT, MISC)
--------------------------------------------------------------------------------
local HomeTab = createTab("Home", 1)
local CombatTab = createTab("Combat", 2)
local VisualsTab = createTab("Visuals", 3)
local MovementTab = createTab("Movement", 4)
local MiscTab = createTab("Misc", 5)

-- Home Tab
createLabel(HomeTab, "Core.xyz Universal Control")
createButton(HomeTab, "Copy Discord Invite", function()
    if setclipboard then
        setclipboard("https://discord.gg/yeKPEZpMMu")
        notify("Core.xyz", "Discord invite copied to clipboard!", 4)
    else
        notify("Core.xyz", "Discord: discord.gg/yeKPEZpMMu", 4)
    end
end)
createButton(HomeTab, "Reset Character Camera", function()
    local cam = workspace.CurrentCamera
    local hum = LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
    if cam and hum then
        cam.CameraSubject = hum
        cam.CameraType = Enum.CameraType.Custom
        notify("Core.xyz", "Camera reset to Humanoid.", 3)
    end
end)

-- Combat Tab
createLabel(CombatTab, "Aimbot & Precision")
createToggle(CombatTab, "Aimbot", false, function(val)
    enabled = val
end)
createToggle(CombatTab, "FOV Circle", false, function(val)
    showFOV = val
    FovCircle.Visible = val
end)
createSlider(CombatTab, "FOV Radius", 10, 220, 75, 1, "px", function(val)
    fovRadius = val
    FovCircle.Size = UDim2.fromOffset(val * 2, val * 2)
end)
createSlider(CombatTab, "Aimbot Smoothness", 0.05, 1, 0.4, 0.01, "", function(val)
    smoothness = val
end)
createToggle(CombatTab, "Team Check", true, function(val)
    teamCheckEnabled = val
end)

for _, team in ipairs(Teams:GetChildren()) do
    table.insert(allTeams, team.Name)
end
createDropdown(CombatTab, "Target Teams", allTeams, "All", function(opt)
    selectedTeams = { [opt] = true }
end)
createDropdown(CombatTab, "Target Hitbox", {
    "Head",
    "HumanoidRootPart",
    "UpperTorso",
    "LowerTorso",
    "RightUpperArm",
    "LeftUpperArm",
    "RightUpperLeg",
    "LeftUpperLeg",
}, "Head", function(opt)
    targetPart = opt
end)

-- Visuals Tab
createLabel(VisualsTab, "ESP & Overlay Visuals")
createToggle(VisualsTab, "Player ESP", false, function(val)
    espEnabled = val
    if not val then
        clearESP()
    end
end)
createToggle(VisualsTab, "Snapline Tracers", false, function(val)
    tracersEnabled = val
    for _, data in pairs(espObjects) do
        if data.Tracer then
            data.Tracer.Visible = val
        end
    end
end)
createDropdown(VisualsTab, "Tracer Origin", { "Center", "Bottom", "Top" }, "Center", function(opt)
    tracerOrigin = opt
end)

local ColorMap = {
    White = Color3.fromRGB(255, 255, 255),
    Silver = Color3.fromRGB(185, 185, 195),
    Red = Color3.fromRGB(255, 70, 70),
    Cyan = Color3.fromRGB(80, 225, 255),
    Green = Color3.fromRGB(90, 255, 145),
}
createDropdown(VisualsTab, "ESP Color", { "White", "Silver", "Red", "Cyan", "Green" }, "White", function(opt)
    espColor = ColorMap[opt] or Theme.White
end)
createToggle(VisualsTab, "Custom Crosshair", false, function(val)
    crosshairEnabled = val
    updateCrosshair()
end)
createDropdown(VisualsTab, "Crosshair Color", { "White", "Red", "Cyan", "Green" }, "White", function(opt)
    crosshairColor = ColorMap[opt] or Theme.White
    updateCrosshair()
end)
createSlider(VisualsTab, "Crosshair Size", 4, 45, 10, 1, "px", function(val)
    crosshairSize = val
    updateCrosshair()
end)

-- Movement Tab
createLabel(MovementTab, "Character Movement")
createToggle(MovementTab, "Custom WalkSpeed", false, function(val)
    walkSpeedEnabled = val
    updateMovement()
end)
createSlider(MovementTab, "WalkSpeed", 16, 120, 16, 1, "studs", function(val)
    walkSpeed = val
    if walkSpeedEnabled then
        updateMovement()
    end
end)
createToggle(MovementTab, "Custom JumpPower", false, function(val)
    jumpPowerEnabled = val
    updateMovement()
end)
createSlider(MovementTab, "JumpPower", 50, 220, 50, 1, "power", function(val)
    jumpPower = val
    if jumpPowerEnabled then
        updateMovement()
    end
end)
createToggle(MovementTab, "Infinite Jump", false, function(val)
    infJumpEnabled = val
end)
createToggle(MovementTab, "NoClip (Stepped)", false, function(val)
    noClipEnabled = val
    if not val then
        restoreNoClipCollisions()
    end
end)

-- Misc Tab
createLabel(MiscTab, "Session Utilities")
createToggle(MiscTab, "Anti-AFK Protection", false, function(val)
    if val then
        if antiAFKConnection then
            antiAFKConnection:Disconnect()
        end
        antiAFKConnection = LocalPlayer.Idled:Connect(function()
            local cam = workspace.CurrentCamera
            if cam then
                VirtualUser:Button2Down(Vector2.zero, cam.CFrame)
                task.wait(1)
                VirtualUser:Button2Up(Vector2.zero, cam.CFrame)
            end
        end)
        notify("Core.xyz", "Anti-AFK protection enabled.", 4)
    else
        if antiAFKConnection then
            antiAFKConnection:Disconnect()
            antiAFKConnection = nil
        end
    end
end)

--------------------------------------------------------------------------------
-- 12. KEY SYSTEM AUTHORIZATION & MAIN HUB LAUNCHER
--------------------------------------------------------------------------------
local function launchMainHub()
    isAuthorized = true
    uiVisible = true

    local targetScale = getResponsiveScale()
    if FloatingToggle then
        FloatingToggle.Visible = true
    end
    if MainWindow then
        MainWindow.Visible = true
        MainScale.Scale = targetScale * 0.86
        tween(MainWindow, SmoothTween, { BackgroundTransparency = 0.03 })
        tween(MainStroke, SmoothTween, { Transparency = 0.08 })
        tween(MainScale, SpringTween, { Scale = targetScale })
    end

    notify("Core.xyz", "Authorized! Tap CORE.XYZ pill or RightShift to toggle UI.", 5)
end

local function attemptAuthorization()
    if isAuthorizing or isAuthorized then
        return
    end
    local entered = string.upper((KeyInputBox.Text or ""):gsub("%s+", ""))
    if entered == REQUIRED_KEY then
        isAuthorizing = true
        KeyFeedback.Text = "ACCESS GRANTED — LAUNCHING CORE.XYZ..."
        KeyFeedback.TextColor3 = Theme.White
        tween(KeyScale, FastTween, { Scale = 0.9 })
        tween(KeyCard, FastTween, { BackgroundTransparency = 1 })
        tween(KeyCardStroke, FastTween, { Transparency = 1 })
        task.wait(0.22)
        KeyCard.Visible = false
        launchMainHub()
    else
        KeyFeedback.Text = "INVALID KEY! Required Key: " .. REQUIRED_KEY
        KeyFeedback.TextColor3 = Theme.Error
        tween(KeyInputStroke, FastTween, { Color = Theme.Error })
        local origPos = KeyCard.Position
        for _, offset in ipairs({ -9, 9, -6, 6, -3, 0 }) do
            KeyCard.Position = UDim2.new(origPos.X.Scale, origPos.X.Offset + offset, origPos.Y.Scale, origPos.Y.Offset)
            task.wait(0.028)
        end
        tween(KeyInputStroke, SmoothTween, { Color = Theme.Border })
    end
end

CopyKeyButton.MouseButton1Click:Connect(function()
    spawnRipple(CopyKeyButton)
    if setclipboard then
        pcall(function()
            setclipboard(REQUIRED_KEY)
        end)
    end
    KeyInputBox.Text = REQUIRED_KEY
    KeyFeedback.Text = "Key copied & auto-filled: " .. REQUIRED_KEY
    KeyFeedback.TextColor3 = Theme.White
end)

UnlockButton.MouseButton1Click:Connect(function()
    spawnRipple(UnlockButton)
    attemptAuthorization()
end)

KeyInputBox.FocusLost:Connect(function(enterPressed)
    if enterPressed then
        attemptAuthorization()
    end
end)

--------------------------------------------------------------------------------
-- 13. RUNTIME LOOPS (60FPS LIVE UI ANIMATIONS + AIMBOT + ESP + NOCLIP)
--------------------------------------------------------------------------------
LocalPlayer.CharacterAdded:Connect(function(character)
    table.clear(noclipCollideCache)
    local humanoid = character:WaitForChild("Humanoid", 5)
    if humanoid then
        defaultWalkSpeed = humanoid.WalkSpeed
        defaultJumpPower = humanoid.JumpPower
        updateMovement()
    end
end)

UserInputService.JumpRequest:Connect(function()
    if isAuthorized and infJumpEnabled and LocalPlayer.Character then
        local hum = LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
        if hum then
            hum:ChangeState(Enum.HumanoidStateType.Jumping)
        end
    end
end)

UserInputService.InputBegan:Connect(function(input, gpe)
    if not gpe and isAuthorized and input.KeyCode == Enum.KeyCode.RightShift then
        toggleMainHub()
    end
end)

RunService.Stepped:Connect(function()
    if isAuthorized and noClipEnabled and LocalPlayer.Character then
        for _, part in ipairs(LocalPlayer.Character:GetDescendants()) do
            if part:IsA("BasePart") then
                if noclipCollideCache[part] == nil then
                    noclipCollideCache[part] = part.CanCollide
                end
                part.CanCollide = false
            end
        end
    end
end)

local animClock = 0
RunService.RenderStepped:Connect(function(deltaTime)
    animClock = animClock + deltaTime

    -- 1. Live Rotating UIGradient Shimmer Borders
    for _, item in ipairs(liveGradients) do
        if item.Gradient and item.Gradient.Parent then
            item.Gradient.Rotation = (item.Offset + animClock * item.Speed) % 360
        end
    end

    -- 2. Live Rotating Geometric Orbs & Header Logos
    for _, rot in ipairs(liveRotators) do
        if rot.Instance and rot.Instance.Parent then
            rot.Instance.Rotation = (animClock * rot.Speed) % 360
        end
    end

    -- 3. Live Drifting Monochrome Starfield Particles
    for _, p in ipairs(liveParticles) do
        if p.Instance and p.Container and p.Container.Visible then
            p.Y = p.Y - (p.SpeedY * deltaTime)
            p.X = p.X + math.sin(animClock * 1.5 + p.Phase) * (p.DriftX * deltaTime)
            if p.Y < -0.04 then
                p.Y = 1.04
                p.X = math.random(5, 95) / 100
            end
            p.Instance.Position = UDim2.fromScale(p.X, p.Y)
            p.Instance.BackgroundTransparency = 0.55 + 0.35 * math.sin(animClock * 3 + p.Phase)
        end
    end

    -- 4. Pulsing Core Dots & Shimmer Sweeps
    local pulse = 1 + 0.22 * math.sin(animClock * 4.5)
    if LoaderCard.Visible then
        EmblemCore.Size = UDim2.fromOffset(8 * pulse, 8 * pulse)
    end
    if KeyCard.Visible then
        KeyTopGrad.Offset = Vector2.new(math.sin(animClock * 2.2) * 0.45, 0)
    end
    if MainWindow.Visible then
        HeaderLineGrad.Offset = Vector2.new(math.sin(animClock * 1.8) * 0.42, 0)
    end

    if not isAuthorized then
        return
    end

    local camera = workspace.CurrentCamera
    if not camera then
        return
    end

    FovCircle.Visible = showFOV

    if espEnabled then
        updateESP(camera)
    end

    if crosshairEnabled then
        updateCrosshair()
    else
        CrosshairV.Visible = false
        CrosshairH.Visible = false
    end

    if enabled then
        local target = getClosestTarget(camera)
        if target then
            local alpha = 1 - ((1 - math.clamp(smoothness, 0.01, 0.99)) ^ (deltaTime * 60))
            camera.CFrame = camera.CFrame:Lerp(CFrame.new(camera.CFrame.Position, target.Position), alpha)
        end
    end
end)

--------------------------------------------------------------------------------
-- 14. START-TO-END ANIMATED BOOT SEQUENCE
--------------------------------------------------------------------------------
task.spawn(function()
    local targetScale = getResponsiveScale()
    tween(LoaderCard, SmoothTween, { BackgroundTransparency = 0.03 })
    tween(LoaderStroke, SmoothTween, { Transparency = 0.08 })
    tween(LoaderScale, SpringTween, { Scale = targetScale })
    tween(EmblemOuterStroke, SmoothTween, { Transparency = 0.08 })
    tween(EmblemInnerStroke, SmoothTween, { Transparency = 0.25 })
    tween(EmblemCore, SmoothTween, { BackgroundTransparency = 0 })
    tween(LoaderTitle, SmoothTween, { TextTransparency = 0 })
    tween(LoaderStatus, SmoothTween, { TextTransparency = 0 })
    tween(LoaderBarBg, SmoothTween, { BackgroundTransparency = 0 })
    tween(LoaderPercent, SmoothTween, { TextTransparency = 0 })

    local stages = {
        { pct = 28, text = "Mounting Core.xyz Monochrome Shaders..." },
        { pct = 64, text = "Calibrating DeltaTime Aimbot & ESP Engine..." },
        { pct = 92, text = "Verifying FEYKSECURED Security Gate..." },
        { pct = 100, text = "Core.xyz Ready." },
    }

    local currentPct = 0
    for _, stage in ipairs(stages) do
        LoaderStatus.Text = stage.text
        tween(LoaderBarFill, SlowTween, { Size = UDim2.fromScale(stage.pct / 100, 1) })
        while currentPct < stage.pct do
            currentPct = math.min(stage.pct, currentPct + 3)
            LoaderPercent.Text = tostring(currentPct) .. "%"
            task.wait(0.022)
        end
        task.wait(0.16)
    end

    -- Morph Loader out
    tween(LoaderScale, FastTween, { Scale = targetScale * 0.9 })
    tween(LoaderCard, FastTween, { BackgroundTransparency = 1 })
    tween(LoaderStroke, FastTween, { Transparency = 1 })
    tween(LoaderTitle, FastTween, { TextTransparency = 1 })
    tween(LoaderStatus, FastTween, { TextTransparency = 1 })
    tween(LoaderPercent, FastTween, { TextTransparency = 1 })
    tween(LoaderBarBg, FastTween, { BackgroundTransparency = 1 })
    tween(LoaderBarFill, FastTween, { BackgroundTransparency = 1 })
    tween(EmblemOuterStroke, FastTween, { Transparency = 1 })
    tween(EmblemInnerStroke, FastTween, { Transparency = 1 })
    tween(EmblemCore, FastTween, { BackgroundTransparency = 1 })
    task.wait(0.2)
    LoaderCard.Visible = false

    -- Morph Key System Gate in
    KeyCard.Visible = true
    KeyScale.Scale = targetScale * 0.88
    tween(KeyCard, SmoothTween, { BackgroundTransparency = 0.03 })
    tween(KeyCardStroke, SmoothTween, { Transparency = 0.08 })
    tween(KeyScale, SpringTween, { Scale = targetScale })
end)
