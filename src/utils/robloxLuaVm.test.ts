import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
// @ts-ignore
import fengari from 'fengari';

const { lua, lauxlib, lualib } = fengari;

const ROBLOX_MOCK_PRELUDE = `
if not table.clear then
    function table.clear(t)
        for k in pairs(t) do
            t[k] = nil
        end
    end
end

if not table.find then
    function table.find(t, val)
        for i, v in ipairs(t) do
            if v == val then return i end
        end
        return nil
    end
end

if not math.clamp then
    function math.clamp(x, minVal, maxVal)
        if x < minVal then return minVal end
        if x > maxVal then return maxVal end
        return x
    end
end

_G.__CLIPBOARD = nil
function setclipboard(txt)
    _G.__CLIPBOARD = txt
end
toclipboard = setclipboard

_G.__FILES = {}
function writefile(path, content)
    _G.__FILES[path] = content
end
function readfile(path)
    return _G.__FILES[path]
end
function isfile(path)
    return _G.__FILES[path] ~= nil
end
function makefolder() end
function isfolder() return true end

_G.__FPS_CAP = 60
function setfpscap(fps)
    _G.__FPS_CAP = fps
end

_G.__FIRED_PROMPTS = 0
function fireproximityprompt(p)
    _G.__FIRED_PROMPTS = _G.__FIRED_PROMPTS + 1
end

_G.__FIRED_CLICKS = 0
function fireclickdetector(c)
    _G.__FIRED_CLICKS = _G.__FIRED_CLICKS + 1
end

function settings()
    return {
        Rendering = { QualityLevel = 1 }
    }
end

local function createSignal()
    local listeners = {}
    local sig = {}
    function sig:Connect(fn)
        table.insert(listeners, fn)
        local conn = { Connected = true }
        function conn:Disconnect()
            conn.Connected = false
            for i, l in ipairs(listeners) do
                if l == fn then
                    table.remove(listeners, i)
                    break
                end
            end
        end
        return conn
    end
    function sig:Fire(...)
        local copy = {}
        for i, fn in ipairs(listeners) do copy[i] = fn end
        for _, fn in ipairs(copy) do
            fn(...)
        end
    end
    function sig:Wait()
        return nil
    end
    return sig
end

task = {
    wait = function(sec) return sec or 0.016 end,
    spawn = function(fn, ...) fn(...) end,
    delay = function(sec, fn, ...)
        table.insert(_G.__DELAYED_TASKS, fn)
    end,
}
_G.__DELAYED_TASKS = {}
function _G.__FLUSH_DELAYED()
    local q = _G.__DELAYED_TASKS
    _G.__DELAYED_TASKS = {}
    for _, fn in ipairs(q) do
        fn()
    end
end

Vector2 = {}
Vector2.__index = Vector2
function Vector2.new(x, y)
    return setmetatable({ X = x or 0, Y = y or 0, Magnitude = math.sqrt((x or 0)^2 + (y or 0)^2) }, Vector2)
end
function Vector2.__sub(a, b)
    return Vector2.new(a.X - b.X, a.Y - b.Y)
end
function Vector2.__add(a, b)
    return Vector2.new(a.X + b.X, a.Y + b.Y)
end
function Vector2.__div(a, b)
    if type(b) == "number" then
        return Vector2.new(a.X / b, a.Y / b)
    end
    return Vector2.new(a.X / b.X, a.Y / b.Y)
end
Vector2.zero = Vector2.new(0, 0)

Vector3 = {}
Vector3.__index = Vector3
function Vector3.new(x, y, z)
    local mag = math.sqrt((x or 0)^2 + (y or 0)^2 + (z or 0)^2)
    local v = { X = x or 0, Y = y or 0, Z = z or 0, Magnitude = mag }
    if mag > 0 then
        v.Unit = setmetatable({ X = v.X / mag, Y = v.Y / mag, Z = v.Z / mag, Magnitude = 1 }, Vector3)
    else
        v.Unit = setmetatable({ X = 0, Y = 0, Z = 0, Magnitude = 0 }, Vector3)
    end
    return setmetatable(v, Vector3)
end
function Vector3.__sub(a, b)
    return Vector3.new(a.X - b.X, a.Y - b.Y, a.Z - b.Z)
end
function Vector3.__add(a, b)
    return Vector3.new(a.X + b.X, a.Y + b.Y, a.Z + b.Z)
end
function Vector3.__mul(a, b)
    if type(b) == "number" then
        return Vector3.new(a.X * b, a.Y * b, a.Z * b)
    end
    return Vector3.new(a.X * b.X, a.Y * b.Y, a.Z * b.Z)
end
Vector3.zero = Vector3.new(0, 0, 0)

UDim = {
    new = function(s, o) return { Scale = s or 0, Offset = o or 0 } end
}

UDim2 = {
    new = function(xs, xo, ys, yo)
        return {
            X = UDim.new(xs, xo),
            Y = UDim.new(ys, yo),
        }
    end,
    fromScale = function(xs, ys)
        return UDim2.new(xs, 0, ys, 0)
    end,
    fromOffset = function(xo, yo)
        return UDim2.new(0, xo, 0, yo)
    end,
}

Color3 = {
    fromRGB = function(r, g, b) return { R = r, G = g, B = b } end,
    new = function(r, g, b) return { R = r, G = g, B = b } end,
}

ColorSequenceKeypoint = {
    new = function(t, c) return { Time = t, Value = c } end
}
ColorSequence = {
    new = function(kps) return { Keypoints = kps } end
}

CFrame = {}
CFrame.__index = CFrame
function CFrame.new(pos, lookAt)
    if type(pos) == "number" then
        pos = Vector3.new(pos, lookAt or 0, 0)
        lookAt = nil
    end
    return setmetatable({
        Position = pos or Vector3.new(0, 0, 0),
        LookAt = lookAt or Vector3.new(0, 0, -1),
        RotationY = 0,
        Lerp = function(self, goal, alpha)
            local p1 = self.Position
            local p2 = goal.Position
            return CFrame.new(
                Vector3.new(
                    p1.X + (p2.X - p1.X) * alpha,
                    p1.Y + (p2.Y - p1.Y) * alpha,
                    p1.Z + (p2.Z - p1.Z) * alpha
                ),
                goal.LookAt
            )
        end
    }, CFrame)
end
function CFrame.Angles(rx, ry, rz)
    local cf = CFrame.new(Vector3.zero)
    cf.RotationY = ry or 0
    return cf
end
function CFrame.__mul(a, b)
    local out = CFrame.new(Vector3.new(
        a.Position.X + (b.Position and b.Position.X or 0),
        a.Position.Y + (b.Position and b.Position.Y or 0),
        a.Position.Z + (b.Position and b.Position.Z or 0)
    ), a.LookAt)
    out.RotationY = (a.RotationY or 0) + (b.RotationY or 0)
    return out
end

TweenInfo = {
    new = function(t, style, dir) return { Time = t or 0.2, EasingStyle = style, EasingDirection = dir } end
}

RaycastParams = {
    new = function()
        return {
            FilterType = nil,
            IgnoreWater = false,
            FilterDescendantsInstances = {},
        }
    end
}

Enum = {
    RaycastFilterType = { Exclude = "Exclude", Include = "Include" },
    EasingStyle = { Quart = "Quart", Quint = "Quint", Back = "Back", Exponential = "Exponential", Sine = "Sine", Linear = "Linear" },
    EasingDirection = { Out = "Out", In = "In", InOut = "InOut" },
    ApplyStrokeMode = { Border = "Border", Contextual = "Contextual" },
    ZIndexBehavior = { Sibling = "Sibling", Global = "Global" },
    VerticalAlignment = { Bottom = "Bottom", Top = "Top", Center = "Center" },
    HorizontalAlignment = { Right = "Right", Left = "Left", Center = "Center" },
    Font = { GothamBlack = "GothamBlack", GothamBold = "GothamBold", GothamMedium = "GothamMedium", Gotham = "Gotham", Code = "Code" },
    TextXAlignment = { Left = "Left", Right = "Right", Center = "Center" },
    TextTruncate = { AtEnd = "AtEnd" },
    SortOrder = { LayoutOrder = "LayoutOrder" },
    AutomaticSize = { Y = "Y", X = "X", XY = "XY" },
    UserInputType = { MouseButton1 = "MouseButton1", Touch = "Touch", MouseMovement = "MouseMovement", Keyboard = "Keyboard" },
    UserInputState = { Begin = "Begin", Change = "Change", End = "End" },
    KeyCode = { RightShift = "RightShift" },
    HumanoidStateType = { Jumping = "Jumping", Swimming = "Swimming", Ragdoll = "Ragdoll" },
    CameraType = { Custom = "Custom", Scriptable = "Scriptable" },
    DevCameraOcclusionMode = { Zoom = "Zoom", Invisicam = "Invisicam" },
    Material = { SmoothPlastic = "SmoothPlastic", Plastic = "Plastic" },
    QualityLevel = { Level01 = "Level01" },
}

_G.__ALL_INSTANCES = {}

local function createInstance(className)
    local children = {}
    local isPart = (className == "Part" or className == "MeshPart" or className == "BasePart")
    local props = {
        ClassName = className,
        Name = className,
        Visible = true,
        Enabled = true,
        Active = false,
        ScrollingEnabled = true,
        BackgroundTransparency = 0,
        TextTransparency = 0,
        Transparency = 0,
        Rotation = 0,
        ZIndex = 1,
        Size = isPart and Vector3.new(2, 2, 1) or UDim2.fromOffset(100, 30),
        Position = isPart and Vector3.new(0, 5, 0) or UDim2.fromOffset(0, 0),
        CFrame = CFrame.new(Vector3.new(0, 5, 0)),
        AbsolutePosition = Vector2.new(10, 10),
        AbsoluteSize = Vector2.new(200, 40),
        Text = "",
        PlaceholderText = "",
        CanCollide = true,
        CastShadow = true,
        Reflectance = 0.2,
        HoldDuration = 2.5,
        Health = 100,
        MaxHealth = 100,
        WalkSpeed = 16,
        JumpPower = 50,
        UseJumpPower = true,
        MouseButton1Click = createSignal(),
        MouseEnter = createSignal(),
        MouseLeave = createSignal(),
        InputBegan = createSignal(),
        InputChanged = createSignal(),
        InputEnded = createSignal(),
        Focused = createSignal(),
        FocusLost = createSignal(),
        Changed = createSignal(),
        __rawChildren = children,
    }

    local inst = {}

    function props:IsA(cls)
        if cls == self.ClassName then return true end
        if cls == "BasePart" and (self.ClassName == "Part" or self.ClassName == "MeshPart") then return true end
        return false
    end

    function props:GetChildren()
        local copy = {}
        for i, c in ipairs(children) do copy[i] = c end
        return copy
    end

    function props:GetDescendants()
        local list = {}
        local function walk(node)
            for _, c in ipairs(node:GetChildren()) do
                table.insert(list, c)
                walk(c)
            end
        end
        walk(inst)
        return list
    end

    function props:FindFirstChild(name)
        for _, c in ipairs(children) do
            if c.Name == name then return c end
        end
        return nil
    end

    function props:FindFirstChildOfClass(cls)
        for _, c in ipairs(children) do
            if c.ClassName == cls then return c end
        end
        return nil
    end

    function props:WaitForChild(name)
        return inst:FindFirstChild(name) or createInstance("Folder")
    end

    function props:IsDescendantOf(ancestor)
        local cur = inst.Parent
        while cur do
            if cur == ancestor then return true end
            cur = cur.Parent
        end
        return false
    end

    function props:ChangeState(st)
        props.__lastState = st
    end

    function props:Destroy()
        local oldParent = props.Parent
        if oldParent and oldParent.__rawChildren then
            for i, c in ipairs(oldParent.__rawChildren) do
                if c == inst then
                    table.remove(oldParent.__rawChildren, i)
                    break
                end
            end
        end
        props.Parent = nil
    end

    local mt = {
        __index = function(_, k)
            return props[k]
        end,
        __newindex = function(_, k, v)
            if k == "Parent" then
                local oldParent = props.Parent
                if oldParent and oldParent.__rawChildren then
                    for i, c in ipairs(oldParent.__rawChildren) do
                        if c == inst then
                            table.remove(oldParent.__rawChildren, i)
                            break
                        end
                    end
                end
                props.Parent = v
                if v and v.__rawChildren then
                    table.insert(v.__rawChildren, inst)
                end
            elseif k == "CFrame" and type(v) == "table" and v.Position then
                props.CFrame = v
                props.Position = v.Position
            elseif k == "Position" and isPart and type(v) == "table" and v.X then
                props.Position = v
                props.CFrame = CFrame.new(v)
            else
                props[k] = v
            end
        end
    }

    setmetatable(inst, mt)
    table.insert(_G.__ALL_INSTANCES, inst)
    return inst
end

_G.__createInstance = createInstance

Instance = {
    new = function(className, parent)
        local obj = createInstance(className)
        if parent then obj.Parent = parent end
        return obj
    end
}

local CoreGui = createInstance("CoreGui")
function gethui() return CoreGui end

local LocalChar = createInstance("Model")
LocalChar.Name = "FeykCharacter"
local LocalHRP = createInstance("Part")
LocalHRP.Name = "HumanoidRootPart"
LocalHRP.CFrame = CFrame.new(Vector3.new(10, 5, 20))
LocalHRP.CanCollide = true
LocalHRP.Parent = LocalChar
local LocalHead = createInstance("Part")
LocalHead.Name = "Head"
LocalHead.Transparency = 0
LocalHead.CFrame = CFrame.new(Vector3.new(10, 6.5, 20))
LocalHead.CanCollide = false
LocalHead.Parent = LocalChar
local FaceDecal = createInstance("Decal")
FaceDecal.Name = "face"
FaceDecal.Transparency = 0
FaceDecal.Parent = LocalHead
local RightLowerLeg = createInstance("MeshPart")
RightLowerLeg.Name = "RightLowerLeg"
RightLowerLeg.Transparency = 0
RightLowerLeg.Parent = LocalChar
local RightFoot = createInstance("MeshPart")
RightFoot.Name = "RightFoot"
RightFoot.Transparency = 0
RightFoot.Parent = LocalChar
local RightUpperLeg = createInstance("MeshPart")
RightUpperLeg.Name = "RightUpperLeg"
RightUpperLeg.Transparency = 0
RightUpperLeg.Parent = LocalChar

local LocalHum = createInstance("Humanoid")
LocalHum.Name = "Humanoid"
LocalHum.WalkSpeed = 16
LocalHum.JumpPower = 50
LocalHum.Health = 100
LocalHum.Parent = LocalChar

local LocalPlayer = createInstance("Player")
LocalPlayer.Name = "FeykHere"
LocalPlayer.DisplayName = "Feyk"
LocalPlayer.Team = "Alpha"
LocalPlayer.Character = LocalChar
LocalPlayer.CameraMaxZoomDistance = 128
LocalPlayer.DevCameraOcclusionMode = Enum.DevCameraOcclusionMode.Zoom
LocalPlayer.CharacterAdded = createSignal()
LocalPlayer.Idled = createSignal()
function LocalPlayer:GetNetworkPing() return 0.038 end

local allPlayers = { LocalPlayer }

-- Spawn 35 enemy players (mix of R15 and R6)
for i = 1, 35 do
    local eChar = createInstance("Model")
    eChar.Name = "EnemyChar_" .. i
    local eHRP = createInstance("Part")
    eHRP.Name = "HumanoidRootPart"
    eHRP.CFrame = CFrame.new(Vector3.new((i % 7) * 2, 5, -20 - i))
    eHRP.Parent = eChar

    local eHead = createInstance("Part")
    eHead.Name = "Head"
    eHead.CFrame = eHRP.CFrame * CFrame.new(Vector3.new(0, 1.5, 0))
    eHead.Parent = eChar

    if i % 2 == 0 then
        local eTorso = createInstance("Part")
        eTorso.Name = "Torso"
        eTorso.CFrame = eHRP.CFrame
        eTorso.Parent = eChar
    else
        local eUT = createInstance("Part")
        eUT.Name = "UpperTorso"
        eUT.CFrame = eHRP.CFrame
        eUT.Parent = eChar
    end

    local eHum = createInstance("Humanoid")
    eHum.Health = 80
    eHum.MaxHealth = 100
    eHum.Parent = eChar

    local ep = createInstance("Player")
    ep.Name = "Enemy_" .. i
    ep.DisplayName = "Target_" .. i
    ep.Team = "Bravo"
    ep.Character = eChar
    ep.Parent = CoreGui
    table.insert(allPlayers, ep)
end

_G.__ALL_PLAYERS = allPlayers

local PlayersService = {
    LocalPlayer = LocalPlayer,
    PlayerAdded = createSignal(),
    PlayerRemoving = createSignal(),
    GetPlayers = function()
        return allPlayers
    end
}

local RunService = {
    __3dRenderEnabled = true,
    RenderStepped = createSignal(),
    Stepped = createSignal(),
    Set3dRenderingEnabled = function(self, val)
        self.__3dRenderEnabled = val
    end
}

local TeamAlpha = createInstance("Team")
TeamAlpha.Name = "Alpha"
local TeamBravo = createInstance("Team")
TeamBravo.Name = "Bravo"
local TeamsService = {
    GetChildren = function()
        return { TeamAlpha, TeamBravo }
    end
}

local UserInputService = {
    InputBegan = createSignal(),
    InputChanged = createSignal(),
    InputEnded = createSignal(),
    JumpRequest = createSignal(),
}

local TweenService = {
    Create = function(self, obj, info, goals)
        return {
            Play = function()
                for k, v in pairs(goals) do
                    obj[k] = v
                end
            end
        }
    end
}

local VirtualUser = {
    __clicks = 0,
    Button2Down = function(self) self.__clicks = self.__clicks + 1 end,
    Button2Up = function(self) self.__clicks = self.__clicks + 1 end,
}

local LightingService = createInstance("Lighting")
LightingService.Brightness = 1
LightingService.ClockTime = 12
LightingService.FogEnd = 1000
LightingService.FogStart = 0
LightingService.GlobalShadows = true
LightingService.Ambient = Color3.fromRGB(100, 100, 100)
LightingService.OutdoorAmbient = Color3.fromRGB(120, 120, 120)
local Bloom = createInstance("BloomEffect")
Bloom.Parent = LightingService

-- Minimal JSON encoder/decoder mock for HttpService
local HttpService = {
    JSONEncode = function(self, tbl)
        if type(tbl) ~= "table" then return "{}" end
        -- Check if array
        if #tbl > 0 then
            local parts = {}
            for _, item in ipairs(tbl) do
                if type(item) == "string" then
                    table.insert(parts, string.format("%q", item))
                elseif type(item) == "table" then
                    local kv = {}
                    for k, v in pairs(item) do
                        if type(v) == "string" then
                            table.insert(kv, string.format("%q:%q", k, v))
                        else
                            table.insert(kv, string.format("%q:%s", k, tostring(v)))
                        end
                    end
                    table.insert(parts, "{" .. table.concat(kv, ",") .. "}")
                end
            end
            return "[" .. table.concat(parts, ",") .. "]"
        else
            local kv = {}
            for k, v in pairs(tbl) do
                if type(v) == "string" then
                    table.insert(kv, string.format("%q:%q", k, v))
                elseif type(v) == "number" or type(v) == "boolean" then
                    table.insert(kv, string.format("%q:%s", k, tostring(v)))
                end
            end
            return "{" .. table.concat(kv, ",") .. "}"
        end
    end,
    JSONDecode = function(self, str)
        if not str or str == "" then return nil end
        if string.find(str, "SafeZone") then
            return { { Name = "SafeZone", X = 10, Y = 5, Z = 20, PlaceId = "55555" } }
        end
        if string.find(str, "MyProConfig") then
            return { "Default", "MyProConfig" }
        end
        if string.find(str, "AccentR") then
            return { AccentR = 75, AccentG = 225, AccentB = 255, WalkSpeed = 60, WalkSpeedEnabled = true }
        end
        if string.find(str, "srv_low_ping") then
            return {
                data = {
                    { id = "srv_high", playing = 18, maxPlayers = 20, ping = 120 },
                    { id = "srv_low_ping", playing = 4, maxPlayers = 20, ping = 25 },
                }
            }
        end
        return {}
    end
}

local TeleportService = {
    __lastTeleportPlace = nil,
    __lastTeleportJob = nil,
    TeleportToPlaceInstance = function(self, placeId, jobId)
        self.__lastTeleportPlace = placeId
        self.__lastTeleportJob = jobId
    end,
    Teleport = function(self, placeId)
        self.__lastTeleportPlace = placeId
    end
}

local StatsService = {
    GetTotalMemoryUsageMb = function() return 612 end,
    Network = {
        ServerStatsItem = {
            ["Data Ping"] = { GetValue = function() return 34 end }
        }
    }
}

local Camera = {
    FieldOfView = 70,
    CameraSubject = LocalHum,
    CameraType = Enum.CameraType.Custom,
    ViewportSize = Vector2.new(800, 380),
    CFrame = CFrame.new(Vector3.new(10, 5, 20), Vector3.new(10, 5, -10)),
    WorldToViewportPoint = function(self, worldPos)
        return Vector3.new(400 + (worldPos.X or 0) * 4, 210 - (worldPos.Y or 0) * 6, 25), true
    end
}

-- Create World Interactive Objects (ProximityPrompt, ClickDetector, Map Part, ParticleEmitter)
local WorkspaceObj = createInstance("Workspace")
WorkspaceObj.CurrentCamera = Camera
WorkspaceObj.DescendantAdded = createSignal()

local ChestPart = createInstance("Part")
ChestPart.Name = "ChestPart"
ChestPart.CFrame = CFrame.new(Vector3.new(12, 5, 20)) -- 2 studs away from LocalHRP (10,5,20)!
ChestPart.Parent = WorkspaceObj

local Prompt = createInstance("ProximityPrompt")
Prompt.HoldDuration = 2.5
Prompt.Enabled = true
Prompt.Parent = ChestPart

local ClickDet = createInstance("ClickDetector")
ClickDet.Parent = ChestPart

local LagParticle = createInstance("ParticleEmitter")
LagParticle.Enabled = true
LagParticle.Parent = ChestPart

function WorkspaceObj:Raycast(origin, direction, params)
    -- Return whichever enemy is along the ray
    for i = 2, #allPlayers do
        local ep = allPlayers[i]
        local head = ep.Character and ep.Character:FindFirstChild("Head")
        if head and math.abs((head.Position.X - origin.X) - direction.X * 10) < 999 then
            return { Instance = head, Position = head.Position }
        end
    end
    local firstEnemy = allPlayers[2]
    local part = firstEnemy.Character:FindFirstChild("Head")
    return { Instance = part, Position = part.Position }
end

workspace = WorkspaceObj

game = {
    PlaceId = 55555,
    JobId = "job_current_1",
    Loaded = createSignal(),
    IsLoaded = function() return true end,
    HttpGet = function(self, url)
        return '{"data":[{"id":"srv_low_ping","playing":4,"maxPlayers":20,"ping":25}]}'
    end,
    GetService = function(self, name)
        if name == "Players" then return PlayersService end
        if name == "RunService" then return RunService end
        if name == "Teams" then return TeamsService end
        if name == "UserInputService" then return UserInputService end
        if name == "TweenService" then return TweenService end
        if name == "VirtualUser" then return VirtualUser end
        if name == "CoreGui" then return CoreGui end
        if name == "Lighting" then return LightingService end
        if name == "HttpService" then return HttpService end
        if name == "TeleportService" then return TeleportService end
        if name == "Stats" then return StatsService end
        return createInstance(name)
    end
}
`;

const ROBLOX_ASSERTIONS_POSTLUDE = `
local screenGui = gethui():FindFirstChild("CoreXYZ_Universal")
assert(screenGui ~= nil, "CoreXYZ_Universal ScreenGui should exist")

local loaderCard = screenGui:FindFirstChild("CoreLoader")
local keyCard = screenGui:FindFirstChild("CoreKeySystem")
local floatingToggle = screenGui:FindFirstChild("CoreFloatingToggle")
local mainWindow = screenGui:FindFirstChild("CoreMainWindow")

assert(loaderCard.Visible == false, "LoaderCard should hide after boot sequence")
assert(keyCard.Visible == true, "KeyCard should be visible after boot sequence")

-- Unlock with GET KEY + AUTHORIZE KEY (and verify Remember Key saves FEYKSECURED)
local keyInputBox, unlockBtn, copyKeyBtn
for _, desc in ipairs(keyCard:GetDescendants()) do
    if desc.ClassName == "TextBox" then keyInputBox = desc end
    if desc.ClassName == "TextButton" and desc.Text == "AUTHORIZE KEY" then unlockBtn = desc end
    if desc.ClassName == "TextButton" and desc.Text == "GET KEY" then copyKeyBtn = desc end
end

copyKeyBtn.MouseButton1Click:Fire()
assert(keyInputBox.Text == "FEYKSECURED", "GET KEY should fill FEYKSECURED")
unlockBtn.MouseButton1Click:Fire()

assert(keyCard.Visible == false, "KeyCard must hide after FEYKSECURED")
assert(floatingToggle.Visible == true, "FloatingToggle must be visible")
assert(mainWindow.Visible == true, "MainWindow must be visible")
assert(_G.__FILES["CoreXYZ_Data/SavedKey.txt"] == "FEYKSECURED", "Remember Key must persist FEYKSECURED to SavedKey.txt")

-- 1. Verify Dynamic Floating Pill exact size & text ("CORE.XYZ | 60 FPS | 34ms")
local floatLabel
for _, desc in ipairs(floatingToggle:GetDescendants()) do
    if desc.ClassName == "TextLabel" then floatLabel = desc end
end
assert(floatLabel ~= nil and string.find(floatLabel.Text, "CORE.XYZ") ~= nil, "FloatLabel should display CORE.XYZ")
local widthWith2Metrics = floatingToggle.Size.X.Offset
assert(widthWith2Metrics >= 140 and widthWith2Metrics <= 260, "FloatingToggle width should fit 2 metrics snugly")

-- 2. Test Telemetry Multi-Choice Dropdown & Custom Pill Title in Settings_Page
local settingsPage
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "Settings_Page" then settingsPage = desc end
end
assert(settingsPage ~= nil, "Settings_Page must exist")

local cpuBtn, gpuBtn, fpsBtn, pingBtn
for _, desc in ipairs(settingsPage:GetDescendants()) do
    if desc.ClassName == "TextButton" then
        if desc.Text == "CPU Usage" then cpuBtn = desc end
        if desc.Text == "GPU Usage" then gpuBtn = desc end
        if desc.Text == "FPS" then fpsBtn = desc end
        if desc.Text == "Ping" then pingBtn = desc end
    end
end
assert(cpuBtn ~= nil and gpuBtn ~= nil, "Telemetry multi-dropdown option buttons must exist")

-- Click "CPU Usage" (3rd metric) -> width must increase!
cpuBtn.MouseButton1Click:Fire()
local widthWith3Metrics = floatingToggle.Size.X.Offset
assert(widthWith3Metrics > widthWith2Metrics, "FloatingToggle width must expand when 3rd metric is added")

-- Click "GPU Usage" (4th metric) -> must be blocked because max is 3!
gpuBtn.MouseButton1Click:Fire()
assert(string.find(floatLabel.Text, "GPU") == nil, "4th telemetry metric must be rejected (max 3)")

-- Deselect CPU, Ping, FPS -> pill shrinks cleanly to exact width of "CORE.XYZ" (~88px, NO empty space!)
cpuBtn.MouseButton1Click:Fire()
pingBtn.MouseButton1Click:Fire()
fpsBtn.MouseButton1Click:Fire()
assert(floatLabel.Text == "CORE.XYZ", "When 0 metrics selected, FloatLabel shows CORE.XYZ")
assert(floatingToggle.Size.X.Offset <= 95, "FloatingToggle with only CORE.XYZ must have zero empty space on right (<=95px)")

-- Test Custom Pill Title TextBox in Settings
local pillTitleBox
for _, desc in ipairs(settingsPage:GetDescendants()) do
    if desc.ClassName == "TextBox" and string.find(desc.PlaceholderText, "FEYK.XYZ") then
        pillTitleBox = desc
    end
end
assert(pillTitleBox ~= nil, "Custom Floating Pill Title TextBox must exist in Settings_Page")
pillTitleBox.Text = "FEYK.XYZ"
pillTitleBox.FocusLost:Fire(true)
assert(floatLabel.Text == "FEYK.XYZ", "Custom Pill Title must update FloatLabel text immediately")
pillTitleBox.Text = "CORE.XYZ"
pillTitleBox.FocusLost:Fire(true)

-- Re-enable FPS & Ping
fpsBtn.MouseButton1Click:Fire()
pingBtn.MouseButton1Click:Fire()

-- 3. Test Redesigned Players Tab (Avatar Cards + Click-to-Expand 6 Inline Options + Click-Again-to-Collapse)
local playersPage
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "Players_Page" then playersPage = desc end
end
assert(playersPage ~= nil, "Players_Page must exist")

local function findPlayerCardAndActions(pName)
    local card, header, actions
    for _, desc in ipairs(playersPage:GetDescendants()) do
        if desc.Name == "PlayerCard_" .. pName then card = desc end
        if desc.Name == "PlayerHeader_" .. pName then header = desc end
        if desc.Name == "PlayerActions_" .. pName then actions = desc end
    end
    return card, header, actions
end

local card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
assert(card3 ~= nil and header3 ~= nil and actions3 ~= nil, "PlayerCard_Enemy_3 must exist with header and actions container")
assert(header3:FindFirstChild("AvatarImage") ~= nil, "PlayerCard must include AvatarImage thumbnail")
assert(actions3.Visible == false and card3.Size.Y.Offset == 44, "PlayerCard_Enemy_3 must start collapsed (44px)")

-- Click Enemy_3 -> expands to show all 6 options underneath!
header3.MouseButton1Click:Fire()
card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
assert(actions3.Visible == true and card3.Size.Y.Offset == 126, "Clicking Enemy_3 must expand card to show 6 options (126px)")

-- Verify all 6 buttons exist inside PlayerActions_Enemy_3 and test them
local btnWhitelist = actions3:FindFirstChild("Action_Whitelist")
local btnPrioritize = actions3:FindFirstChild("Action_Prioritize")
local btnSpectate = actions3:FindFirstChild("Action_Spectate")
local btnTeleport = actions3:FindFirstChild("Action_Teleport")
local btnCopy = actions3:FindFirstChild("Action_Copy UserName")
local btnFling = actions3:FindFirstChild("Action_Fling")
assert(btnWhitelist and btnPrioritize and btnSpectate and btnTeleport and btnCopy and btnFling, "All 6 inline player action buttons must exist")

btnCopy.MouseButton1Click:Fire()
assert(_G.__CLIPBOARD == "Enemy_3", "Copy UserName must copy Enemy_3")

btnTeleport.MouseButton1Click:Fire()
local myHRP = game:GetService("Players").LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
assert(myHRP.Position.Z < -15, "Teleport action must move LocalHRP to Enemy_3")

myHRP.CFrame = CFrame.new(Vector3.new(10, 5, 20))
btnFling.MouseButton1Click:Fire()
assert(myHRP.Position.X == 10 and myHRP.Position.Z == 20, "Fling must return LocalPlayer to exact starting CFrame")

-- Toggle Prioritize on Enemy_3
btnPrioritize.MouseButton1Click:Fire()
card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
assert(actions3.Visible == true, "Enemy_3 card stays expanded after clicking an inline option")

-- Click Enemy_3 header again -> must collapse/close the 6 options!
header3.MouseButton1Click:Fire()
card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
assert(actions3.Visible == false and card3.Size.Y.Offset == 44, "Clicking Enemy_3 header again must collapse the 6 options")

-- Also Whitelist Enemy_2 via Enemy_2's card to verify Hitbox Expander skips whitelisted players
local _, header2, _ = findPlayerCardAndActions("Enemy_2")
header2.MouseButton1Click:Fire()
local _, _, actions2 = findPlayerCardAndActions("Enemy_2")
actions2:FindFirstChild("Action_Whitelist").MouseButton1Click:Fire()

-- 4. Test World Tab (Instant Interact, Auto-Interact, Per-Game Waypoints, FPS Booster, Uncap FPS, Server Hop)
local worldPage
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "World_Page" then worldPage = desc end
end
assert(worldPage ~= nil, "World_Page must exist")

local waypointBox, customFpsBox
for _, desc in ipairs(worldPage:GetDescendants()) do
    if desc.ClassName == "TextBox" then
        if string.find(desc.PlaceholderText, "SafeZone") then waypointBox = desc end
        if string.find(desc.PlaceholderText, "144") then customFpsBox = desc end
    end
end
waypointBox.Text = "SafeZone"
customFpsBox.Text = "240"
customFpsBox.FocusLost:Fire(true)

for _, desc in ipairs(worldPage:GetDescendants()) do
    if desc.ClassName == "TextButton" then
        desc.MouseButton1Click:Fire()
    end
end
_G.__FLUSH_DELAYED()

assert(_G.__FILES["CoreXYZ_Data/Waypoints_55555.json"] ~= nil, "Waypoint must be persisted in PlaceId-specific file")
local chest = workspace:FindFirstChild("ChestPart")
assert(chest.Material == Enum.Material.SmoothPlastic, "FPS Booster must set parts to SmoothPlastic")
assert(chest:FindFirstChildOfClass("ProximityPrompt").HoldDuration == 0, "Instant Interact must set HoldDuration = 0")
assert(_G.__FPS_CAP == 240, "Uncap FPS with Custom FPS 240 must call setfpscap(240)")

-- 5. Enable Combat (Aimbot + Silent Aim + Hitbox Expander), Visuals (ESP + 3D Bounding Box + 3D Skeleton Rig + Health Bar + X-Ray + Freecam + Headless + Korblox), and Movement (Swim in Air + Spinbot + NoClip + Anti-Fling + Anti-Ragdoll + Anti-Void)
for _, pageName in ipairs({ "Combat_Page", "Visuals_Page", "Movement_Page" }) do
    for _, desc in ipairs(mainWindow:GetDescendants()) do
        if desc.Name == pageName then
            for _, ctrl in ipairs(desc:GetDescendants()) do
                if ctrl.ClassName == "TextButton" and ctrl.Text == "" then
                    local rowLabel = ctrl:FindFirstChildOfClass("TextLabel")
                    local lText = rowLabel and rowLabel.Text or ""
                    if lText ~= "" and lText ~= "Team Check" and lText ~= "Ignore Whitelisted Players" then
                        ctrl.MouseButton1Click:Fire()
                    end
                end
            end
        end
    end
end

-- Verify X-Ray Vision made ChestPart translucent (0.6) while keeping player parts untouched
assert(math.abs(chest.Transparency - 0.6) < 0.05, "X-Ray Vision must set map part transparency to 0.6")

-- Verify Hitbox Expander expanded Enemy_3 (non-whitelisted) to 10 studs, while Enemy_2 (whitelisted) stayed size 2!
local enemy2HRP = _G.__ALL_PLAYERS[3].Character:FindFirstChild("HumanoidRootPart") -- Enemy_2
local enemy3HRP = _G.__ALL_PLAYERS[4].Character:FindFirstChild("HumanoidRootPart") -- Enemy_3
assert(enemy3HRP.Size.X == 10, "Hitbox Expander must expand non-whitelisted enemy HumanoidRootPart to 10")
assert(enemy2HRP.Size.X == 2, "Hitbox Expander must ignore whitelisted player Enemy_2")

-- Verify Freecam enabled Scriptable camera & anchored LocalHRP
assert(workspace.CurrentCamera.CameraType == Enum.CameraType.Scriptable, "Freecam must set CameraType to Scriptable")
assert(myHRP.Anchored == true, "Freecam must anchor LocalHRP while active")

-- 6. Run 40 frames of Stepped & RenderStepped (tests 3D Bounding Box, Skeleton Rig, Silent Aim Snapline, Swim in Air, Anti-Fling, Anti-Ragdoll, Spinbot, Auto-Interact)
local RunService = game:GetService("RunService")
local initialRotY = myHRP.CFrame.RotationY or 0
for frame = 1, 40 do
    RunService.Stepped:Fire(0, 0.1)
    RunService.RenderStepped:Fire(0.06)
end

-- Verify Swim in Air put Humanoid into Swimming state
local myHum = game:GetService("Players").LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
assert(myHum.__lastState == Enum.HumanoidStateType.Swimming, "Swim in Air must set Humanoid state to Swimming")

-- Verify Anti-Fling disabled CanCollide on Enemy_3's character parts
assert(enemy3HRP.CanCollide == false, "Anti-Fling must disable CanCollide on other players")

-- Verify Anti-Void catches LocalHRP if dropped to Y = -300 and restores to safe height
myHRP.CFrame = CFrame.new(Vector3.new(10, -300, 20))
RunService.Stepped:Fire(0, 0.016)
assert(myHRP.Position.Y > -50, "Anti-Void must teleport LocalPlayer back to safe ground when falling into void")

-- Verify 3D Bounding Box (12 edges) & 3D Skeleton Rig were rendered (and 2D box was replaced)
local overlays = screenGui:FindFirstChild("Overlays")
local found3DBox = false
local foundSkeletonBone = false
for _, child in ipairs(overlays:GetChildren()) do
    if child.Name == "Box3DOverlay" and child.Visible then
        found3DBox = true
        local edge1 = child:FindFirstChild("Edge3D_1")
        local bone1 = child:FindFirstChild("Bone_1")
        if edge1 and edge1.Visible then found3DBox = true end
        if bone1 and bone1.Visible then foundSkeletonBone = true end
        break
    end
end
assert(found3DBox == true, "3D Bounding Box overlay (12 edges) must be visible on enemies")
assert(foundSkeletonBone == true, "3D Skeleton Rig overlay must be visible on enemies")
assert(overlays:FindFirstChild("CornerBox2D") == nil, "Old 2D Corner Box must be completely replaced by 3D Bounding Box")

-- Verify Silent Aim Snapline is visible & Animated Dual-Ring FOV Circle rotates
local silentSnap = overlays:FindFirstChild("SilentSnapline")
assert(silentSnap ~= nil and silentSnap.Visible == true, "Silent Aim Snapline must lock onto weighted target bone")

local fovCircle = overlays:FindFirstChild("FOVCircle")
assert(fovCircle ~= nil and fovCircle.Visible == true, "FOVCircle must be visible when enabled")
local fovInnerOrbital = fovCircle:FindFirstChild("FOVInnerOrbital")
assert(fovInnerOrbital ~= nil and fovInnerOrbital.Rotation ~= 0, "FOVInnerOrbital must exist and live-rotate inside FOVCircle")

-- Turn OFF Freecam while Silent Aim stays ON -> verify CameraType is Custom and Camera follows character!
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "Visuals_Page" then
        for _, ctrl in ipairs(desc:GetDescendants()) do
            if ctrl.ClassName == "TextButton" and ctrl.Text == "" then
                local rowLabel = ctrl:FindFirstChildOfClass("TextLabel")
                if rowLabel and string.find(rowLabel.Text, "Freecam") then
                    ctrl.MouseButton1Click:Fire()
                end
            end
        end
    end
end
RunService.RenderStepped:Fire(0.016)
assert(workspace.CurrentCamera.CameraType == Enum.CameraType.Custom, "Camera must remain Custom and follow character when Silent Aim is ON and Freecam is OFF")
assert(workspace.CurrentCamera.CameraSubject == myHum, "CameraSubject must remain locked to LocalPlayer Humanoid when Silent Aim is ON")

-- 7. Test Settings Tab Config Save (Required Config Name check + Save & Load Config)
local configNameBox, saveCfgBtn, loadCfgBtn
for _, desc in ipairs(settingsPage:GetDescendants()) do
    if desc.ClassName == "TextBox" and string.find(desc.PlaceholderText, "config name") then configNameBox = desc end
    if desc.ClassName == "TextButton" and desc.Text == "Save Config" then saveCfgBtn = desc end
    if desc.ClassName == "TextButton" and desc.Text == "Load Selected Config" then loadCfgBtn = desc end
end
assert(configNameBox ~= nil and saveCfgBtn ~= nil and loadCfgBtn ~= nil, "Config controls must exist in Settings_Page")

configNameBox.Text = "   "
saveCfgBtn.MouseButton1Click:Fire()
assert(_G.__FILES["CoreXYZ_Data/Config_.json"] == nil, "Saving config with empty name must be rejected")

configNameBox.Text = "MyProConfig"
saveCfgBtn.MouseButton1Click:Fire()
assert(_G.__FILES["CoreXYZ_Data/Config_MyProConfig.json"] ~= nil, "Saving config with valid name must write file")
loadCfgBtn.MouseButton1Click:Fire()

_G.__TEST_PASSED = true
`;

function runLuaChunk(L: any, code: string, label: string) {
  const loadStatus = lauxlib.luaL_loadstring(L, fengari.to_luastring(code));
  if (loadStatus !== lua.LUA_OK) {
    const errMsg = fengari.to_jsstring(lua.lua_tostring(L, -1));
    assert.fail(`Lua syntax/load error in ${label}:\n${errMsg}`);
  }
  const callStatus = lua.lua_pcall(L, 0, 0, 0);
  if (callStatus !== lua.LUA_OK) {
    const errMsg = fengari.to_jsstring(lua.lua_tostring(L, -1));
    assert.fail(`Lua runtime error in ${label}:\n${errMsg}`);
  }
}

test('Core.xyz.lua v4.0 Chef\'s Kiss Edition executes all 7 tabs, exact-fit telemetry pill, 3D bounding box + skeleton rig, multi-method silent aim with weighted body parts, hitbox expander, whitelist, expandable 6-action player cards, swim in air, anti-fling/ragdoll/void, x-ray, freecam, and config manager with zero errors', () => {
  const scriptPath = path.resolve(process.cwd(), 'Core.xyz.lua');
  const coreLuaCode = fs.readFileSync(scriptPath, 'utf8');

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  runLuaChunk(L, ROBLOX_MOCK_PRELUDE, 'ROBLOX_MOCK_PRELUDE');
  runLuaChunk(L, coreLuaCode, 'Core.xyz.lua');
  runLuaChunk(L, ROBLOX_ASSERTIONS_POSTLUDE, 'ROBLOX_ASSERTIONS_POSTLUDE');

  lua.lua_getglobal(L, fengari.to_luastring('__TEST_PASSED'));
  const passed = lua.lua_toboolean(L, -1);
  assert.equal(passed, true, 'Expected __TEST_PASSED to be true');
});

