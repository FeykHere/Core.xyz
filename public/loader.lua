--[=[
    CORE.XYZ | UNIVERSAL ROBLOX LUA SCRIPT
    Theme: Pure Black & White Monochrome (Live Animated)
    Features:
      1. Live-Animated Start-to-End Loading Screen (Core.xyz)
      2. Animated Key System / Authorization Gate (Key: FEYKSECURED)
      3. Full Custom Animated UI (Home, Combat, Visuals, Movement, Misc)
      4. All Engine Fixes Applied:
         - DeltaTime frame-rate independent Aimbot Lerp
         - R6 & R15 automatic body-part fallback
         - 31-Highlight engine limit protection + Drawing/GUI fallback
         - RunService.Stepped NoClip with CanCollide restoration
         - Enum.RaycastFilterType.Exclude & reused RaycastParams
         - Humanoid.UseJumpPower = true compatibility
         - PlayerRemoving cleanup & properly scoped local variables
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
local REQUIRED_KEY = "FEYKSECURED"

--------------------------------------------------------------------------------
-- SAFE GUI PARENT & CLEANUP PREVIOUS INSTANCE
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
local oldGui = guiParent:FindFirstChild("CoreXYZ_Universal")
if oldGui then
    oldGui:Destroy()
end

--------------------------------------------------------------------------------
-- CORE VARIABLES & STATE
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

-- Reusable RaycastParams (Modern Exclude Filter)
local rayParams = RaycastParams.new()
rayParams.FilterType = Enum.RaycastFilterType.Exclude
rayParams.IgnoreWater = true

--------------------------------------------------------------------------------
-- BLACK & WHITE MONOCHROME THEME & TWEEN HELPERS
--------------------------------------------------------------------------------
local Theme = {
    Black = Color3.fromRGB(6, 6, 6),
    Surface = Color3.fromRGB(14, 14, 14),
    Elevated = Color3.fromRGB(22, 22, 22),
    Hover = Color3.fromRGB(30, 30, 30),
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

--------------------------------------------------------------------------------
-- ROOT SCREENGUI & OVERLAY ELEMENTS (FOV, CROSSHAIR, ESP, NOTIFICATIONS)
--------------------------------------------------------------------------------
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "CoreXYZ_Universal"
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

-- FOV Circle (Native UI so it works on every executor)
local FovCircle = Instance.new("Frame")
FovCircle.AnchorPoint = Vector2.new(0.5, 0.5)
FovCircle.Position = UDim2.fromScale(0.5, 0.5)
FovCircle.Size = UDim2.fromOffset(fovRadius * 2, fovRadius * 2)
FovCircle.BackgroundTransparency = 1
FovCircle.Visible = false
FovCircle.Parent = OverlayContainer
addCorner(FovCircle, 999)
local FovStroke = addStroke(FovCircle, Theme.White, 1.5, 0.1)

-- Custom Crosshair Lines
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

-- Toast Notification System
local NotifyHolder = Instance.new("Frame")
NotifyHolder.AnchorPoint = Vector2.new(1, 1)
NotifyHolder.Position = UDim2.new(1, -20, 1, -20)
NotifyHolder.Size = UDim2.fromOffset(290, 320)
NotifyHolder.BackgroundTransparency = 1
NotifyHolder.Parent = ScreenGui

local NotifyLayout = Instance.new("UIListLayout")
NotifyLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
NotifyLayout.HorizontalAlignment = Enum.HorizontalAlignment.Right
NotifyLayout.Padding = UDim.new(0, 8)
NotifyLayout.Parent = NotifyHolder

local function notify(title, content, duration)
    duration = duration or 4.5
    local card = Instance.new("Frame")
    card.Size = UDim2.fromOffset(280, 60)
    card.BackgroundColor3 = Theme.Black
    card.BackgroundTransparency = 1
    card.Parent = NotifyHolder
    addCorner(card, 6)
    local st = addStroke(card, Theme.White, 1, 1)

    local bar = Instance.new("Frame")
    bar.Position = UDim2.fromOffset(6, 8)
    bar.Size = UDim2.new(0, 3, 1, -16)
    bar.BackgroundColor3 = Theme.White
    bar.BackgroundTransparency = 1
    bar.BorderSizePixel = 0
    bar.Parent = card
    addCorner(bar, 2)

    local tLbl = Instance.new("TextLabel")
    tLbl.Position = UDim2.fromOffset(18, 8)
    tLbl.Size = UDim2.new(1, -26, 0, 18)
    tLbl.BackgroundTransparency = 1
    tLbl.Font = Enum.Font.GothamBlack
    tLbl.Text = string.upper(title)
    tLbl.TextColor3 = Theme.White
    tLbl.TextTransparency = 1
    tLbl.TextSize = 12
    tLbl.TextXAlignment = Enum.TextXAlignment.Left
    tLbl.Parent = card

    local cLbl = Instance.new("TextLabel")
    cLbl.Position = UDim2.fromOffset(18, 27)
    cLbl.Size = UDim2.new(1, -26, 0, 26)
    cLbl.BackgroundTransparency = 1
    cLbl.Font = Enum.Font.Gotham
    cLbl.Text = content
    cLbl.TextColor3 = Theme.Silver
    cLbl.TextTransparency = 1
    cLbl.TextSize = 11
    cLbl.TextWrapped = true
    cLbl.TextXAlignment = Enum.TextXAlignment.Left
    cLbl.Parent = card

    tween(card, FastTween, { BackgroundTransparency = 0.03 })
    tween(st, FastTween, { Transparency = 0.2 })
    tween(bar, FastTween, { BackgroundTransparency = 0 })
    tween(tLbl, FastTween, { TextTransparency = 0 })
    tween(cLbl, FastTween, { TextTransparency = 0 })

    task.delay(duration, function()
        if not card.Parent then return end
        tween(card, FastTween, { BackgroundTransparency = 1 })
        tween(st, FastTween, { Transparency = 1 })
        tween(bar, FastTween, { BackgroundTransparency = 1 })
        tween(tLbl, FastTween, { TextTransparency = 1 })
        tween(cLbl, FastTween, { TextTransparency = 1 })
        task.wait(0.22)
        if card and card.Parent then
            card:Destroy()
        end
    end)
end

--------------------------------------------------------------------------------
-- STAGE 1: LIVE ANIMATED LOADING SCREEN ("Core.xyz")
--------------------------------------------------------------------------------
local LoaderCard = Instance.new("Frame")
LoaderCard.Name = "CoreLoader"
LoaderCard.AnchorPoint = Vector2.new(0.5, 0.5)
LoaderCard.Position = UDim2.fromScale(0.5, 0.5)
LoaderCard.Size = UDim2.fromOffset(370, 195)
LoaderCard.BackgroundColor3 = Theme.Black
LoaderCard.BackgroundTransparency = 1
LoaderCard.ClipsDescendants = true
LoaderCard.Parent = ScreenGui
addCorner(LoaderCard, 10)
local LoaderStroke = addStroke(LoaderCard, Theme.White, 1, 1)

local LoaderScale = Instance.new("UIScale")
LoaderScale.Scale = 0.9
LoaderScale.Parent = LoaderCard

-- Live Animated Geometric Emblem inside Loader
local EmblemRingOuter = Instance.new("Frame")
EmblemRingOuter.AnchorPoint = Vector2.new(0.5, 0.5)
EmblemRingOuter.Position = UDim2.new(0.5, 0, 0, 48)
EmblemRingOuter.Size = UDim2.fromOffset(42, 42)
EmblemRingOuter.BackgroundTransparency = 1
EmblemRingOuter.Parent = LoaderCard
addCorner(EmblemRingOuter, 8)
local EmblemOuterStroke = addStroke(EmblemRingOuter, Theme.White, 1.5, 1)

local EmblemRingInner = Instance.new("Frame")
EmblemRingInner.AnchorPoint = Vector2.new(0.5, 0.5)
EmblemRingInner.Position = UDim2.new(0.5, 0, 0, 48)
EmblemRingInner.Size = UDim2.fromOffset(22, 22)
EmblemRingInner.BackgroundTransparency = 1
EmblemRingInner.Parent = LoaderCard
addCorner(EmblemRingInner, 4)
local EmblemInnerStroke = addStroke(EmblemRingInner, Theme.White, 1.2, 1)

local EmblemCoreDot = Instance.new("Frame")
EmblemCoreDot.AnchorPoint = Vector2.new(0.5, 0.5)
EmblemCoreDot.Position = UDim2.new(0.5, 0, 0, 48)
EmblemCoreDot.Size = UDim2.fromOffset(6, 6)
EmblemCoreDot.BackgroundColor3 = Theme.White
EmblemCoreDot.BackgroundTransparency = 1
EmblemCoreDot.Parent = LoaderCard
addCorner(EmblemCoreDot, 99)

local LoaderTitle = Instance.new("TextLabel")
LoaderTitle.Position = UDim2.fromOffset(0, 80)
LoaderTitle.Size = UDim2.new(1, 0, 0, 26)
LoaderTitle.BackgroundTransparency = 1
LoaderTitle.Font = Enum.Font.GothamBlack
LoaderTitle.Text = "Core.xyz"
LoaderTitle.TextColor3 = Theme.White
LoaderTitle.TextTransparency = 1
LoaderTitle.TextSize = 22
LoaderTitle.Parent = LoaderCard

local LoaderStatus = Instance.new("TextLabel")
LoaderStatus.Position = UDim2.fromOffset(24, 110)
LoaderStatus.Size = UDim2.new(1, -48, 0, 18)
LoaderStatus.BackgroundTransparency = 1
LoaderStatus.Font = Enum.Font.GothamMedium
LoaderStatus.Text = "Initializing Core.xyz Monochrome Environment..."
LoaderStatus.TextColor3 = Theme.Muted
LoaderStatus.TextTransparency = 1
LoaderStatus.TextSize = 11
LoaderStatus.Parent = LoaderCard

local LoaderBarBg = Instance.new("Frame")
LoaderBarBg.AnchorPoint = Vector2.new(0.5, 0)
LoaderBarBg.Position = UDim2.new(0.5, 0, 0, 142)
LoaderBarBg.Size = UDim2.fromOffset(300, 5)
LoaderBarBg.BackgroundColor3 = Theme.Elevated
LoaderBarBg.BackgroundTransparency = 1
LoaderBarBg.BorderSizePixel = 0
LoaderBarBg.Parent = LoaderCard
addCorner(LoaderBarBg, 99)

local LoaderBarFill = Instance.new("Frame")
LoaderBarFill.Size = UDim2.fromScale(0, 1)
LoaderBarFill.BackgroundColor3 = Theme.White
LoaderBarFill.BorderSizePixel = 0
LoaderBarFill.Parent = LoaderBarBg
addCorner(LoaderBarFill, 99)

local LoaderPercent = Instance.new("TextLabel")
LoaderPercent.Position = UDim2.fromOffset(0, 156)
LoaderPercent.Size = UDim2.new(1, 0, 0, 18)
LoaderPercent.BackgroundTransparency = 1
LoaderPercent.Font = Enum.Font.Code
LoaderPercent.Text = "0%"
LoaderPercent.TextColor3 = Theme.Silver
LoaderPercent.TextTransparency = 1
LoaderPercent.TextSize = 11
LoaderPercent.Parent = LoaderCard

--------------------------------------------------------------------------------
-- STAGE 2: ANIMATED KEY SYSTEM / AUTHORIZATION ("FEYKSECURED")
--------------------------------------------------------------------------------
local KeyCard = Instance.new("Frame")
KeyCard.Name = "CoreKeySystem"
KeyCard.AnchorPoint = Vector2.new(0.5, 0.5)
KeyCard.Position = UDim2.fromScale(0.5, 0.5)
KeyCard.Size = UDim2.fromOffset(390, 235)
KeyCard.BackgroundColor3 = Theme.Black
KeyCard.BackgroundTransparency = 1
KeyCard.Visible = false
KeyCard.ClipsDescendants = true
KeyCard.Parent = ScreenGui
addCorner(KeyCard, 10)
local KeyCardStroke = addStroke(KeyCard, Theme.White, 1, 1)

local KeyScale = Instance.new("UIScale")
KeyScale.Scale = 0.92
KeyScale.Parent = KeyCard

-- Top Animated Scanline Accent
local KeyTopAccent = Instance.new("Frame")
KeyTopAccent.Size = UDim2.new(1, 0, 0, 2)
KeyTopAccent.BackgroundColor3 = Theme.White
KeyTopAccent.BorderSizePixel = 0
KeyTopAccent.Parent = KeyCard

local KeyHeaderTitle = Instance.new("TextLabel")
KeyHeaderTitle.Position = UDim2.fromOffset(24, 22)
KeyHeaderTitle.Size = UDim2.new(1, -48, 0, 24)
KeyHeaderTitle.BackgroundTransparency = 1
KeyHeaderTitle.Font = Enum.Font.GothamBlack
KeyHeaderTitle.Text = "Core.xyz  |  Key System"
KeyHeaderTitle.TextColor3 = Theme.White
KeyHeaderTitle.TextSize = 18
KeyHeaderTitle.TextXAlignment = Enum.TextXAlignment.Left
KeyHeaderTitle.Parent = KeyCard

local KeyHeaderSub = Instance.new("TextLabel")
KeyHeaderSub.Position = UDim2.fromOffset(24, 46)
KeyHeaderSub.Size = UDim2.new(1, -48, 0, 18)
KeyHeaderSub.BackgroundTransparency = 1
KeyHeaderSub.Font = Enum.Font.Gotham
KeyHeaderSub.Text = "Authorization required. Enter your access key below."
KeyHeaderSub.TextColor3 = Theme.Muted
KeyHeaderSub.TextSize = 11
KeyHeaderSub.TextXAlignment = Enum.TextXAlignment.Left
KeyHeaderSub.Parent = KeyCard

local KeyInputBox = Instance.new("TextBox")
KeyInputBox.Position = UDim2.fromOffset(24, 78)
KeyInputBox.Size = UDim2.new(1, -48, 0, 42)
KeyInputBox.BackgroundColor3 = Theme.Surface
KeyInputBox.Font = Enum.Font.Code
KeyInputBox.PlaceholderText = "Enter Key (FEYKSECURED)..."
KeyInputBox.PlaceholderColor3 = Theme.Muted
KeyInputBox.Text = ""
KeyInputBox.TextColor3 = Theme.White
KeyInputBox.TextSize = 13
KeyInputBox.ClearTextOnFocus = false
KeyInputBox.Parent = KeyCard
addCorner(KeyInputBox, 6)
local KeyInputStroke = addStroke(KeyInputBox, Theme.Border, 1, 0)

KeyInputBox.Focused:Connect(function()
    tween(KeyInputStroke, FastTween, { Color = Theme.White })
end)
KeyInputBox.FocusLost:Connect(function()
    tween(KeyInputStroke, FastTween, { Color = Theme.Border })
end)

local KeyFeedback = Instance.new("TextLabel")
KeyFeedback.Position = UDim2.fromOffset(24, 126)
KeyFeedback.Size = UDim2.new(1, -48, 0, 18)
KeyFeedback.BackgroundTransparency = 1
KeyFeedback.Font = Enum.Font.GothamMedium
KeyFeedback.Text = "Status: Awaiting Authorization..."
KeyFeedback.TextColor3 = Theme.Muted
KeyFeedback.TextSize = 11
KeyFeedback.TextXAlignment = Enum.TextXAlignment.Left
KeyFeedback.Parent = KeyCard

local UnlockButton = Instance.new("TextButton")
UnlockButton.Position = UDim2.fromOffset(24, 156)
UnlockButton.Size = UDim2.new(0.62, -28, 0, 40)
UnlockButton.BackgroundColor3 = Theme.White
UnlockButton.AutoButtonColor = false
UnlockButton.Font = Enum.Font.GothamBold
UnlockButton.Text = "AUTHORIZE KEY"
UnlockButton.TextColor3 = Theme.Black
UnlockButton.TextSize = 12
UnlockButton.Parent = KeyCard
addCorner(UnlockButton, 6)

local CopyKeyButton = Instance.new("TextButton")
CopyKeyButton.Position = UDim2.new(0.62, 4, 0, 156)
CopyKeyButton.Size = UDim2.new(0.38, -28, 0, 40)
CopyKeyButton.BackgroundColor3 = Theme.Surface
CopyKeyButton.AutoButtonColor = false
CopyKeyButton.Font = Enum.Font.GothamBold
CopyKeyButton.Text = "GET KEY"
CopyKeyButton.TextColor3 = Theme.White
CopyKeyButton.TextSize = 11
CopyKeyButton.Parent = KeyCard
addCorner(CopyKeyButton, 6)
local CopyKeyStroke = addStroke(CopyKeyButton, Theme.Border, 1, 0)

CopyKeyButton.MouseEnter:Connect(function()
    tween(CopyKeyButton, FastTween, { BackgroundColor3 = Theme.Elevated })
    tween(CopyKeyStroke, FastTween, { Color = Theme.White })
end)
CopyKeyButton.MouseLeave:Connect(function()
    tween(CopyKeyButton, FastTween, { BackgroundColor3 = Theme.Surface })
    tween(CopyKeyStroke, FastTween, { Color = Theme.Border })
end)

local KeyFooter = Instance.new("TextLabel")
KeyFooter.Position = UDim2.fromOffset(24, 206)
KeyFooter.Size = UDim2.new(1, -48, 0, 16)
KeyFooter.BackgroundTransparency = 1
KeyFooter.Font = Enum.Font.Code
KeyFooter.Text = "Core.xyz Security  ·  Key: FEYKSECURED"
KeyFooter.TextColor3 = Theme.Muted
KeyFooter.TextSize = 10
KeyFooter.TextXAlignment = Enum.TextXAlignment.Center
KeyFooter.Parent = KeyCard

--------------------------------------------------------------------------------
-- STAGE 3: MAIN "Core.xyz" ANIMATED WINDOW (BLACK & WHITE MONOCHROME)
--------------------------------------------------------------------------------
local MainWindow = Instance.new("Frame")
MainWindow.Name = "CoreMainWindow"
MainWindow.AnchorPoint = Vector2.new(0.5, 0.5)
MainWindow.Position = UDim2.fromScale(0.5, 0.5)
MainWindow.Size = UDim2.fromOffset(580, 390)
MainWindow.BackgroundColor3 = Theme.Black
MainWindow.BackgroundTransparency = 1
MainWindow.Visible = false
MainWindow.ClipsDescendants = true
MainWindow.Parent = ScreenGui
addCorner(MainWindow, 10)
local MainStroke = addStroke(MainWindow, Theme.White, 1, 1)

local MainScale = Instance.new("UIScale")
MainScale.Scale = 0.92
MainScale.Parent = MainWindow

-- Top Header Bar
local HeaderBar = Instance.new("Frame")
HeaderBar.Size = UDim2.new(1, 0, 0, 46)
HeaderBar.BackgroundColor3 = Theme.Surface
HeaderBar.BorderSizePixel = 0
HeaderBar.Parent = MainWindow
addCorner(HeaderBar, 10)

local HeaderLine = Instance.new("Frame")
HeaderLine.Position = UDim2.new(0, 0, 1, -1)
HeaderLine.Size = UDim2.new(1, 0, 0, 1)
HeaderLine.BackgroundColor3 = Theme.Border
HeaderLine.BorderSizePixel = 0
HeaderLine.Parent = HeaderBar

local HeaderLogoSquare = Instance.new("Frame")
HeaderLogoSquare.AnchorPoint = Vector2.new(0, 0.5)
HeaderLogoSquare.Position = UDim2.new(0, 16, 0.5, 0)
HeaderLogoSquare.Size = UDim2.fromOffset(12, 12)
HeaderLogoSquare.BackgroundTransparency = 1
HeaderLogoSquare.Parent = HeaderBar
addStroke(HeaderLogoSquare, Theme.White, 1.5, 0)

local HeaderTitle = Instance.new("TextLabel")
HeaderTitle.Position = UDim2.fromOffset(36, 0)
HeaderTitle.Size = UDim2.fromOffset(200, 46)
HeaderTitle.BackgroundTransparency = 1
HeaderTitle.Font = Enum.Font.GothamBlack
HeaderTitle.Text = "Core.xyz"
HeaderTitle.TextColor3 = Theme.White
HeaderTitle.TextSize = 16
HeaderTitle.TextXAlignment = Enum.TextXAlignment.Left
HeaderTitle.Parent = HeaderBar

local HeaderBadge = Instance.new("TextLabel")
HeaderBadge.AnchorPoint = Vector2.new(1, 0.5)
HeaderBadge.Position = UDim2.new(1, -16, 0.5, 0)
HeaderBadge.Size = UDim2.fromOffset(220, 20)
HeaderBadge.BackgroundTransparency = 1
HeaderBadge.Font = Enum.Font.Code
HeaderBadge.Text = "AUTH: FEYKSECURED · [R-SHIFT]"
HeaderBadge.TextColor3 = Theme.Muted
HeaderBadge.TextSize = 10
HeaderBadge.TextXAlignment = Enum.TextXAlignment.Right
HeaderBadge.Parent = HeaderBar

-- Smooth Dragging on HeaderBar
do
    local dragging, dragInput, dragStart, startPos
    HeaderBar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            dragging = true
            dragStart = input.Position
            startPos = MainWindow.Position
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    dragging = false
                end
            end)
        end
    end)
    HeaderBar.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
            dragInput = input
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging then
            local delta = input.Position - dragStart
            tween(MainWindow, TweenInfo.new(0.08, Enum.EasingStyle.Sine, Enum.EasingDirection.Out), {
                Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
            })
        end
    end)
end

-- Left Navigation Sidebar
local Sidebar = Instance.new("Frame")
Sidebar.Position = UDim2.fromOffset(0, 46)
Sidebar.Size = UDim2.new(0, 150, 1, -46)
Sidebar.BackgroundColor3 = Theme.Surface
Sidebar.BorderSizePixel = 0
Sidebar.Parent = MainWindow

local SidebarDivider = Instance.new("Frame")
SidebarDivider.Position = UDim2.new(1, -1, 0, 0)
SidebarDivider.Size = UDim2.new(0, 1, 1, 0)
SidebarDivider.BackgroundColor3 = Theme.Border
SidebarDivider.BorderSizePixel = 0
SidebarDivider.Parent = Sidebar

local NavList = Instance.new("Frame")
NavList.Position = UDim2.fromOffset(10, 12)
NavList.Size = UDim2.new(1, -20, 1, -24)
NavList.BackgroundTransparency = 1
NavList.Parent = Sidebar

local NavLayout = Instance.new("UIListLayout")
NavLayout.Padding = UDim.new(0, 6)
NavLayout.SortOrder = Enum.SortOrder.LayoutOrder
NavLayout.Parent = NavList

-- Right Tab Pages Container
local PagesHolder = Instance.new("Frame")
PagesHolder.Position = UDim2.fromOffset(150, 46)
PagesHolder.Size = UDim2.new(1, -150, 1, -46)
PagesHolder.BackgroundTransparency = 1
PagesHolder.ClipsDescendants = true
PagesHolder.Parent = MainWindow

--------------------------------------------------------------------------------
-- UI COMPONENT BUILDERS (TABS, TOGGLES, SLIDERS, DROPDOWNS, BUTTONS)
--------------------------------------------------------------------------------
local Tabs = {}
local activeTab = nil

local function createTab(name, order)
    local btn = Instance.new("TextButton")
    btn.LayoutOrder = order
    btn.Size = UDim2.new(1, 0, 0, 36)
    btn.BackgroundColor3 = Theme.White
    btn.BackgroundTransparency = 1
    btn.AutoButtonColor = false
    btn.Font = Enum.Font.GothamBold
    btn.Text = "   " .. name
    btn.TextColor3 = Theme.Muted
    btn.TextSize = 12
    btn.TextXAlignment = Enum.TextXAlignment.Left
    btn.Parent = NavList
    addCorner(btn, 6)
    local st = addStroke(btn, Theme.Border, 1, 1)

    local page = Instance.new("ScrollingFrame")
    page.Name = name .. "_Page"
    page.Size = UDim2.new(1, 0, 1, 0)
    page.Position = UDim2.fromOffset(0, 10)
    page.BackgroundTransparency = 1
    page.BorderSizePixel = 0
    page.ScrollBarThickness = 2
    page.ScrollBarImageColor3 = Theme.White
    page.Visible = false
    page.AutomaticCanvasSize = Enum.AutomaticSize.Y
    page.CanvasSize = UDim2.new(0, 0, 0, 0)
    page.Parent = PagesHolder

    local pad = Instance.new("UIPadding")
    pad.PaddingTop = UDim.new(0, 14)
    pad.PaddingBottom = UDim.new(0, 18)
    pad.PaddingLeft = UDim.new(0, 16)
    pad.PaddingRight = UDim.new(0, 16)
    pad.Parent = page

    local list = Instance.new("UIListLayout")
    list.Padding = UDim.new(0, 8)
    list.SortOrder = Enum.SortOrder.LayoutOrder
    list.Parent = page

    local tabObj = { Btn = btn, Stroke = st, Page = page }
    table.insert(Tabs, tabObj)

    local function selectTab()
        if activeTab == tabObj then return end
        for _, t in ipairs(Tabs) do
            tween(t.Btn, FastTween, { BackgroundTransparency = 1, TextColor3 = Theme.Muted })
            tween(t.Stroke, FastTween, { Transparency = 1 })
            t.Page.Visible = false
        end
        activeTab = tabObj
        tween(btn, FastTween, { BackgroundTransparency = 0, TextColor3 = Theme.Black })
        tween(st, FastTween, { Transparency = 0 })
        page.Position = UDim2.fromOffset(0, 12)
        page.Visible = true
        tween(page, SmoothTween, { Position = UDim2.fromOffset(0, 0) })
    end

    btn.MouseButton1Click:Connect(selectTab)
    if #Tabs == 1 then
        selectTab()
    end
    return page
end

local function createLabel(page, text)
    local lbl = Instance.new("TextLabel")
    lbl.Size = UDim2.new(1, 0, 0, 22)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamBold
    lbl.Text = string.upper(text)
    lbl.TextColor3 = Theme.Muted
    lbl.TextSize = 10
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.Parent = page
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
    btn.Parent = page
    addCorner(btn, 6)
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
        tween(btn, TweenInfo.new(0.08), { BackgroundColor3 = Theme.White, TextColor3 = Theme.Black })
        task.delay(0.12, function()
            tween(btn, FastTween, { BackgroundColor3 = Theme.Surface, TextColor3 = Theme.White })
        end)
        callback()
    end)
end

local function createToggle(page, text, defaultVal, callback)
    local row = Instance.new("TextButton")
    row.Size = UDim2.new(1, 0, 0, 38)
    row.BackgroundColor3 = Theme.Surface
    row.AutoButtonColor = false
    row.Text = ""
    row.Parent = page
    addCorner(row, 6)
    local st = addStroke(row, Theme.Border, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(12, 0)
    lbl.Size = UDim2.new(1, -70, 1, 0)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamMedium
    lbl.Text = text
    lbl.TextColor3 = Theme.White
    lbl.TextSize = 12
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.Parent = row

    local pill = Instance.new("Frame")
    pill.AnchorPoint = Vector2.new(1, 0.5)
    pill.Position = UDim2.new(1, -12, 0.5, 0)
    pill.Size = UDim2.fromOffset(38, 20)
    pill.BackgroundColor3 = defaultVal and Theme.White or Theme.Elevated
    pill.Parent = row
    addCorner(pill, 99)
    addStroke(pill, Theme.Border, 1, 0)

    local dot = Instance.new("Frame")
    dot.AnchorPoint = Vector2.new(0, 0.5)
    dot.Position = defaultVal and UDim2.new(1, -17, 0.5, 0) or UDim2.new(0, 3, 0.5, 0)
    dot.Size = UDim2.fromOffset(14, 14)
    dot.BackgroundColor3 = defaultVal and Theme.Black or Theme.Muted
    dot.Parent = pill
    addCorner(dot, 99)

    local state = defaultVal
    row.MouseEnter:Connect(function()
        tween(st, FastTween, { Color = Theme.Silver })
    end)
    row.MouseLeave:Connect(function()
        tween(st, FastTween, { Color = Theme.Border })
    end)
    row.MouseButton1Click:Connect(function()
        state = not state
        tween(pill, FastTween, { BackgroundColor3 = state and Theme.White or Theme.Elevated })
        tween(dot, FastTween, {
            Position = state and UDim2.new(1, -17, 0.5, 0) or UDim2.new(0, 3, 0.5, 0),
            BackgroundColor3 = state and Theme.Black or Theme.Muted,
        })
        callback(state)
    end)
end

local function createSlider(page, text, minVal, maxVal, defaultVal, increment, suffix, callback)
    local card = Instance.new("Frame")
    card.Size = UDim2.new(1, 0, 0, 52)
    card.BackgroundColor3 = Theme.Surface
    card.Parent = page
    addCorner(card, 6)
    addStroke(card, Theme.Border, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(12, 6)
    lbl.Size = UDim2.new(0.65, 0, 0, 18)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamMedium
    lbl.Text = text
    lbl.TextColor3 = Theme.White
    lbl.TextSize = 12
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.Parent = card

    local valText = Instance.new("TextLabel")
    valText.AnchorPoint = Vector2.new(1, 0)
    valText.Position = UDim2.new(1, -12, 0, 6)
    valText.Size = UDim2.new(0.35, -12, 0, 18)
    valText.BackgroundTransparency = 1
    valText.Font = Enum.Font.Code
    valText.Text = tostring(defaultVal) .. (suffix ~= "" and (" " .. suffix) or "")
    valText.TextColor3 = Theme.Silver
    valText.TextSize = 11
    valText.TextXAlignment = Enum.TextXAlignment.Right
    valText.Parent = card

    local track = Instance.new("TextButton")
    track.Position = UDim2.fromOffset(12, 32)
    track.Size = UDim2.new(1, -24, 0, 6)
    track.BackgroundColor3 = Theme.Elevated
    track.AutoButtonColor = false
    track.Text = ""
    track.Parent = card
    addCorner(track, 99)

    local initPct = math.clamp((defaultVal - minVal) / (maxVal - minVal), 0, 1)
    local fill = Instance.new("Frame")
    fill.Size = UDim2.fromScale(initPct, 1)
    fill.BackgroundColor3 = Theme.White
    fill.BorderSizePixel = 0
    fill.Parent = track
    addCorner(fill, 99)

    local sliding = false
    local function updateSlider(input)
        local pct = math.clamp((input.Position.X - track.AbsolutePosition.X) / track.AbsoluteSize.X, 0, 1)
        local raw = minVal + (maxVal - minVal) * pct
        local snapped = math.floor((raw / increment) + 0.5) * increment
        snapped = tonumber(string.format("%.2f", snapped)) or snapped
        tween(fill, TweenInfo.new(0.06), { Size = UDim2.fromScale(pct, 1) })
        valText.Text = tostring(snapped) .. (suffix ~= "" and (" " .. suffix) or "")
        callback(snapped)
    end

    track.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            sliding = true
            updateSlider(input)
        end
    end)
    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
            sliding = false
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if sliding and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
            updateSlider(input)
        end
    end)
end

local function createDropdown(page, text, options, defaultOption, callback)
    local idx = table.find(options, defaultOption) or 1
    local row = Instance.new("TextButton")
    row.Size = UDim2.new(1, 0, 0, 38)
    row.BackgroundColor3 = Theme.Surface
    row.AutoButtonColor = false
    row.Text = ""
    row.Parent = page
    addCorner(row, 6)
    local st = addStroke(row, Theme.Border, 1, 0)

    local lbl = Instance.new("TextLabel")
    lbl.Position = UDim2.fromOffset(12, 0)
    lbl.Size = UDim2.new(0.55, 0, 1, 0)
    lbl.BackgroundTransparency = 1
    lbl.Font = Enum.Font.GothamMedium
    lbl.Text = text
    lbl.TextColor3 = Theme.White
    lbl.TextSize = 12
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.Parent = row

    local badge = Instance.new("Frame")
    badge.AnchorPoint = Vector2.new(1, 0.5)
    badge.Position = UDim2.new(1, -10, 0.5, 0)
    badge.Size = UDim2.fromOffset(145, 24)
    badge.BackgroundColor3 = Theme.Elevated
    badge.Parent = row
    addCorner(badge, 4)
    addStroke(badge, Theme.Border, 1, 0)

    local optLbl = Instance.new("TextLabel")
    optLbl.Size = UDim2.fromScale(1, 1)
    optLbl.BackgroundTransparency = 1
    optLbl.Font = Enum.Font.Code
    optLbl.Text = tostring(options[idx])
    optLbl.TextColor3 = Theme.White
    optLbl.TextSize = 11
    optLbl.Parent = badge

    row.MouseEnter:Connect(function()
        tween(st, FastTween, { Color = Theme.White })
    end)
    row.MouseLeave:Connect(function()
        tween(st, FastTween, { Color = Theme.Border })
    end)
    row.MouseButton1Click:Connect(function()
        idx = (idx % #options) + 1
        optLbl.Text = tostring(options[idx])
        callback(options[idx])
    end)
end

--------------------------------------------------------------------------------
-- CORE GAMEPLAY FUNCTIONS (WITH ALL CODE REVIEW FIXES)
--------------------------------------------------------------------------------
-- R6 & R15 Rig Target Fallback
local function getTargetPartFromCharacter(char, partName)
    if not char then return nil end
    local found = char:FindFirstChild(partName)
    if found then return found end

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
    if not teamCheckEnabled then return true end
    if selectedTeams["All"] then return true end
    return selectedTeams[tostring(player.Team)] == true
end

local function cleanupPlayerESP(player)
    local data = espObjects[player]
    if not data then return end
    if data.Billboard then pcall(function() data.Billboard:Destroy() end) end
    if data.Tracer then pcall(function() data.Tracer:Destroy() end) end
    if data.Highlight then
        pcall(function() data.Highlight:Destroy() end)
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
                        pcall(function() tagData.Highlight:Destroy() end)
                        activeHighlightCount = math.max(0, activeHighlightCount - 1)
                    end
                    local hl = Instance.new("Highlight")
                    hl.FillColor = espColor
                    hl.OutlineColor = Theme.White
                    hl.FillTransparency = 0.7
                    hl.OutlineTransparency = 0.3
                    hl.Adornee = char
                    hl.Parent = HighlightContainer
                    tagData.Highlight = hl
                    activeHighlightCount += 1
                end

                local dist = math.floor((hrp.Position - camera.CFrame.Position).Magnitude)
                local screenPos, onScreen = camera:WorldToViewportPoint(hrp.Position)

                tagData.Billboard.Adornee = hrp
                tagData.Billboard.Enabled = onScreen
                tagData.Text.Text = string.format("%s [%dm] | health : %d", player.Name, dist, math.floor(hum.Health))
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

                    tagData.Tracer.Position = UDim2.fromOffset(mid.X, mid.Y)
                    tagData.Tracer.Size = UDim2.fromOffset(diff.Magnitude, 1)
                    tagData.Tracer.Rotation = math.deg(math.atan2(diff.Y, diff.X))
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
                        if ray and ray.Instance:IsDescendantOf(player.Character) then
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
-- BUILD ALL TABS (HOME, COMBAT, VISUALS, MOVEMENT, MISC)
--------------------------------------------------------------------------------
local HomeTab = createTab("Home", 1)
local CombatTab = createTab("Combat", 2)
local VisualsTab = createTab("Visuals", 3)
local MovementTab = createTab("Movement", 4)
local MiscTab = createTab("Misc", 5)

-- Home Tab
createLabel(HomeTab, "Welcome to Core.xyz Universal")
createButton(HomeTab, "Copy Discord Link", function()
    if setclipboard then
        setclipboard("https://discord.gg/yeKPEZpMMu")
        notify("Core.xyz", "Discord link copied to clipboard!", 5)
    else
        notify("Core.xyz", "Discord: discord.gg/yeKPEZpMMu", 5)
    end
end)

-- Combat Tab
createLabel(CombatTab, "Aimbot and Targeting")
createToggle(CombatTab, "Aimbot", false, function(val)
    enabled = val
end)
createToggle(CombatTab, "FOV Visual", false, function(val)
    showFOV = val
    FovCircle.Visible = val
end)
createSlider(CombatTab, "FOV Radius", 1, 200, 75, 1, "Radius", function(val)
    fovRadius = val
    FovCircle.Size = UDim2.fromOffset(val * 2, val * 2)
end)
createSlider(CombatTab, "Smoothness", 0.05, 1, 0.4, 0.01, "", function(val)
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
createDropdown(CombatTab, "Part Target", {
    "Head",
    "HumanoidRootPart",
    "UpperTorso",
    "LowerTorso",
    "RightUpperArm",
    "LeftUpperArm",
    "RightUpperLeg",
    "LeftUpperLeg"
}, "Head", function(opt)
    targetPart = opt
end)

-- Visuals Tab
createLabel(VisualsTab, "ESP and Visual Settings")
createToggle(VisualsTab, "ESP", false, function(val)
    espEnabled = val
    if not val then clearESP() end
end)
createToggle(VisualsTab, "Tracers", false, function(val)
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
    Silver = Color3.fromRGB(180, 180, 180),
    Red = Color3.fromRGB(255, 65, 65),
    Cyan = Color3.fromRGB(70, 225, 255),
    Green = Color3.fromRGB(80, 255, 140),
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
createSlider(VisualsTab, "Crosshair Size", 5, 50, 10, 1, "Px", function(val)
    crosshairSize = val
    updateCrosshair()
end)

-- Movement Tab
createLabel(MovementTab, "Movement Enhancements")
createToggle(MovementTab, "Custom Walkspeed", false, function(val)
    walkSpeedEnabled = val
    updateMovement()
end)
createSlider(MovementTab, "Walkspeed", 16, 100, 16, 1, "Speed", function(val)
    walkSpeed = val
    if walkSpeedEnabled then updateMovement() end
end)
createToggle(MovementTab, "Custom Jump Power", false, function(val)
    jumpPowerEnabled = val
    updateMovement()
end)
createSlider(MovementTab, "Jump Power", 50, 200, 50, 1, "studs", function(val)
    jumpPower = val
    if jumpPowerEnabled then updateMovement() end
end)
createToggle(MovementTab, "Infinite Jump", false, function(val)
    infJumpEnabled = val
end)
createToggle(MovementTab, "NoClip", false, function(val)
    noClipEnabled = val
    if not val then
        restoreNoClipCollisions()
    end
end)

-- Misc Tab
createLabel(MiscTab, "Miscellaneous Features")
createToggle(MiscTab, "Anti-AFK", false, function(val)
    if val then
        if antiAFKConnection then antiAFKConnection:Disconnect() end
        antiAFKConnection = LocalPlayer.Idled:Connect(function()
            local cam = workspace.CurrentCamera
            if cam then
                VirtualUser:Button2Down(Vector2.zero, cam.CFrame)
                task.wait(1)
                VirtualUser:Button2Up(Vector2.zero, cam.CFrame)
            end
        end)
        notify("Core.xyz", "Anti-AFK protection active.", 4)
    else
        if antiAFKConnection then
            antiAFKConnection:Disconnect()
            antiAFKConnection = nil
        end
    end
end)

--------------------------------------------------------------------------------
-- KEY SYSTEM VERIFICATION & BOOT ORCHESTRATION
--------------------------------------------------------------------------------
local function launchMainHub()
    isAuthorized = true
    FloatingToggle.Visible = true
    MainWindow.Visible = true
    tween(MainWindow, SmoothTween, { BackgroundTransparency = 0 })
    tween(MainStroke, SmoothTween, { Transparency = 0.15 })
    tween(MainScale, SmoothTween, { Scale = 1 })
    notify("Core.xyz", "Authorized! Tap CORE.XYZ button or RightShift to toggle UI.", 6)
end

CopyKeyButton.MouseButton1Click:Connect(function()
    if setclipboard then
        setclipboard(REQUIRED_KEY)
    end
    KeyInputBox.Text = REQUIRED_KEY
    KeyFeedback.Text = "Key copied & filled: " .. REQUIRED_KEY
    KeyFeedback.TextColor3 = Theme.White
end)

UnlockButton.MouseButton1Click:Connect(function()
    local entered = string.upper((KeyInputBox.Text or ""):gsub("%s+", ""))
    if entered == REQUIRED_KEY then
        KeyFeedback.Text = "ACCESS GRANTED — LAUNCHING CORE.XYZ..."
        KeyFeedback.TextColor3 = Theme.White
        tween(UnlockButton, FastTween, { BackgroundColor3 = Theme.White })
        tween(KeyScale, FastTween, { Scale = 0.94 })
        tween(KeyCard, FastTween, { BackgroundTransparency = 1 })
        tween(KeyCardStroke, FastTween, { Transparency = 1 })
        task.wait(0.25)
        KeyCard.Visible = false
        launchMainHub()
    else
        KeyFeedback.Text = "INVALID KEY! Required Key: " .. REQUIRED_KEY
        KeyFeedback.TextColor3 = Theme.Error
        tween(KeyCardStroke, FastTween, { Color = Theme.Error })
        -- Shake animation
        local origPos = KeyCard.Position
        for _, offset in ipairs({ -8, 8, -6, 6, -3, 0 }) do
            KeyCard.Position = UDim2.new(origPos.X.Scale, origPos.X.Offset + offset, origPos.Y.Scale, origPos.Y.Offset)
            task.wait(0.03)
        end
        tween(KeyCardStroke, SmoothTween, { Color = Theme.White })
    end
end)

-- Character Respawn Listener
LocalPlayer.CharacterAdded:Connect(function(character)
    table.clear(noclipCollideCache)
    local humanoid = character:WaitForChild("Humanoid", 5)
    if humanoid then
        defaultWalkSpeed = humanoid.WalkSpeed
        defaultJumpPower = humanoid.JumpPower
        updateMovement()
    end
end)

-- Infinite Jump Listener
UserInputService.JumpRequest:Connect(function()
    if isAuthorized and infJumpEnabled and LocalPlayer.Character then
        local hum = LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
        if hum then
            hum:ChangeState(Enum.HumanoidStateType.Jumping)
        end
    end
end)

-- RightShift Toggle UI
UserInputService.InputBegan:Connect(function(input, gpe)
    if not gpe and isAuthorized and input.KeyCode == Enum.KeyCode.RightShift then
        uiVisible = not uiVisible
        if uiVisible then
            MainWindow.Visible = true
            tween(MainScale, SmoothTween, { Scale = 1 })
            tween(MainWindow, FastTween, { BackgroundTransparency = 0 })
        else
            tween(MainScale, FastTween, { Scale = 0.92 })
            tween(MainWindow, FastTween, { BackgroundTransparency = 1 })
            task.delay(0.18, function()
                if not uiVisible then
                    MainWindow.Visible = false
                end
            end)
        end
    end
end)

-- Stepped Loop for NoClip & Live Emblem Animation
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

-- RenderStepped Loop (Live UI Animations + Aimbot + ESP + Crosshair)
local animClock = 0
RunService.RenderStepped:Connect(function(deltaTime)
    animClock += deltaTime

    -- Live geometric rotation while Loader or Header is visible
    if LoaderCard.Visible then
        EmblemRingOuter.Rotation = (animClock * 55) % 360
        EmblemRingInner.Rotation = (-animClock * 90) % 360
    end
    if MainWindow.Visible then
        HeaderLogoSquare.Rotation = (animClock * 40) % 360
    end

    if not isAuthorized then return end

    local camera = workspace.CurrentCamera
    if not camera then return end

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
            local alpha = 1 - math.pow(1 - math.clamp(smoothness, 0.01, 0.99), deltaTime * 60)
            camera.CFrame = camera.CFrame:Lerp(CFrame.new(camera.CFrame.Position, target.Position), alpha)
        end
    end
end)

--------------------------------------------------------------------------------
-- START-TO-END ANIMATED BOOT SEQUENCE
--------------------------------------------------------------------------------
task.spawn(function()
    tween(LoaderCard, SmoothTween, { BackgroundTransparency = 0 })
    tween(LoaderStroke, SmoothTween, { Transparency = 0.15 })
    tween(LoaderScale, SmoothTween, { Scale = 1 })
    tween(EmblemOuterStroke, SmoothTween, { Transparency = 0.15 })
    tween(EmblemInnerStroke, SmoothTween, { Transparency = 0.35 })
    tween(EmblemCoreDot, SmoothTween, { BackgroundTransparency = 0 })
    tween(LoaderTitle, SmoothTween, { TextTransparency = 0 })
    tween(LoaderStatus, SmoothTween, { TextTransparency = 0 })
    tween(LoaderBarBg, SmoothTween, { BackgroundTransparency = 0 })
    tween(LoaderPercent, SmoothTween, { TextTransparency = 0 })

    local stages = {
        { pct = 28, text = "Loading Monochrome UI Components..." },
        { pct = 62, text = "Configuring DeltaTime Camera & ESP..." },
        { pct = 90, text = "Preparing FEYKSECURED Authorization Gate..." },
        { pct = 100, text = "Core.xyz Ready." },
    }

    local currentPct = 0
    for _, stage in ipairs(stages) do
        LoaderStatus.Text = stage.text
        tween(LoaderBarFill, SlowTween, { Size = UDim2.fromScale(stage.pct / 100, 1) })
        while currentPct < stage.pct do
            currentPct = math.min(stage.pct, currentPct + 3)
            LoaderPercent.Text = tostring(currentPct) .. "%"
            task.wait(0.025)
        end
        task.wait(0.18)
    end

    -- Fade out Loader
    tween(LoaderScale, FastTween, { Scale = 0.94 })
    tween(LoaderCard, FastTween, { BackgroundTransparency = 1 })
    tween(LoaderStroke, FastTween, { Transparency = 1 })
    tween(LoaderTitle, FastTween, { TextTransparency = 1 })
    tween(LoaderStatus, FastTween, { TextTransparency = 1 })
    tween(LoaderPercent, FastTween, { TextTransparency = 1 })
    tween(LoaderBarBg, FastTween, { BackgroundTransparency = 1 })
    tween(LoaderBarFill, FastTween, { BackgroundTransparency = 1 })
    tween(EmblemOuterStroke, FastTween, { Transparency = 1 })
    tween(EmblemInnerStroke, FastTween, { Transparency = 1 })
    tween(EmblemCoreDot, FastTween, { BackgroundTransparency = 1 })
    task.wait(0.22)
    LoaderCard.Visible = false

    -- Fade in Key System Gate
    KeyCard.Visible = true
    tween(KeyCard, SmoothTween, { BackgroundTransparency = 0 })
    tween(KeyCardStroke, SmoothTween, { Transparency = 0.15 })
    tween(KeyScale, SmoothTween, { Scale = 1 })
end)
