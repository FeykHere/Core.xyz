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
    fromHSV = function(h, s, v) return { R = h or 1, G = s or 1, B = v or 1 } end,
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
function CFrame.new(pos, lookAt, z, r00, r01, r02, r10, r11, r12, r20, r21, r22)
    local stretchY = 1
    if type(pos) == "number" then
        if r11 ~= nil then
            stretchY = r11
        end
        pos = Vector3.new(pos, lookAt or 0, z or 0)
        lookAt = nil
    end
    return setmetatable({
        Position = pos or Vector3.new(0, 0, 0),
        LookAt = lookAt or Vector3.new(0, 0, -1),
        LookVector = Vector3.new(0, 0, -1),
        RotationY = 0,
        R11 = stretchY,
        Inverse = function(self)
            return self
        end,
        GetComponents = function(self)
            local p = self.Position
            return p.X, p.Y, p.Z, 1, 0, 0, 0, 1, 0, 0, 0, 1
        end,
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
function CFrame.__add(a, v)
    return CFrame.new(Vector3.new(
        a.Position.X + (v.X or 0),
        a.Position.Y + (v.Y or 0),
        a.Position.Z + (v.Z or 0)
    ), a.LookAt)
end
function CFrame.__sub(a, v)
    return CFrame.new(Vector3.new(
        a.Position.X - (v.X or 0),
        a.Position.Y - (v.Y or 0),
        a.Position.Z - (v.Z or 0)
    ), a.LookAt)
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
    ScaleType = { Fit = "Fit", Crop = "Crop", Stretch = "Stretch" },
    RenderPriority = { Camera = { Value = 200 }, Character = { Value = 300 }, First = { Value = 0 }, Last = { Value = 2000 } },
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

    function props:Clone()
        local cloned = createInstance(props.ClassName)
        cloned.Name = props.Name
        cloned.CFrame = props.CFrame
        for _, child in ipairs(children) do
            if child.Clone then
                local cc = child:Clone()
                cc.Parent = cloned
            end
        end
        return cloned
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
            elseif props.ClassName == "MeshPart" and (k == "MeshId" or k == "TextureID") then
                error("Unable to assign property " .. tostring(k) .. ". Script write access is restricted")
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
LocalPlayer.UserId = 12345678
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
    ep.UserId = 1000 + i
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
    __boundSteps = {},
    RenderStepped = createSignal(),
    Stepped = createSignal(),
    BindToRenderStep = function(self, name, priority, fn)
        self.__boundSteps[name] = self.RenderStepped:Connect(fn)
    end,
    UnbindFromRenderStep = function(self, name)
        if self.__boundSteps[name] then
            self.__boundSteps[name]:Disconnect()
            self.__boundSteps[name] = nil
        end
    end,
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

local cameraProps = {
    FieldOfView = 70,
    CameraSubject = LocalHum,
    CameraType = Enum.CameraType.Custom,
    ViewportSize = Vector2.new(800, 380),
    CFrame = CFrame.new(Vector3.new(10, 5, 20), Vector3.new(10, 5, -10)),
    WorldToViewportPoint = function(self, worldPos)
        return Vector3.new(400 + (worldPos.X or 0) * 4, 210 - (worldPos.Y or 0) * 6, 25), true
    end
}
local Camera = setmetatable({}, {
    __index = function(_, k)
        return cameraProps[k]
    end,
    __newindex = function(_, k, v)
        if cameraProps[k] == nil then
            error(tostring(k) .. " is not a valid member of Camera 'Workspace.Camera'")
        end
        cameraProps[k] = v
    end,
})

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
local espPreviewWindow = screenGui:FindFirstChild("CoreESPPreviewWindow")

assert(loaderCard.Visible == false, "LoaderCard should hide after boot sequence")
assert(keyCard.Visible == true, "KeyCard should be visible after boot sequence")
assert(espPreviewWindow == nil, "CoreESPPreviewWindow must be completely removed to eliminate FPS drops")

-- Unlock with GET KEY + AUTHORIZE KEY (and verify Remember Key saves FEYKDEV)
local keyInputBox, unlockBtn, copyKeyBtn
for _, desc in ipairs(keyCard:GetDescendants()) do
    if desc.ClassName == "TextBox" then keyInputBox = desc end
    if desc.ClassName == "TextButton" and desc.Text == "AUTHORIZE KEY" then unlockBtn = desc end
    if desc.ClassName == "TextButton" and desc.Text == "GET KEY" then copyKeyBtn = desc end
end

copyKeyBtn.MouseButton1Click:Fire()
assert(keyInputBox.Text == "FEYKDEV", "GET KEY should fill FEYKDEV")
unlockBtn.MouseButton1Click:Fire()

assert(keyCard.Visible == false, "KeyCard must hide after FEYKDEV")
assert(floatingToggle.Visible == true, "FloatingToggle must be visible")
assert(mainWindow.Visible == true, "MainWindow must be visible")
assert(_G.__FILES["CoreXYZ_Data/SavedKey.txt"] == "FEYKDEV", "Remember Key must persist FEYKDEV to SavedKey.txt")

-- 0. Test Home Tab 3D Avatar Box + Side Profile Info (User, Executor, User ID, Key Time Left) + 3 Test Keys
local homePage
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "Home_Page" then homePage = desc end
end
assert(homePage ~= nil, "Home_Page must exist")

local homeProfileCard = homePage:FindFirstChild("HomeProfileCard")
assert(homeProfileCard ~= nil, "HomeProfileCard must exist in Home_Page")
local homeAvatarBox = homeProfileCard:FindFirstChild("HomeAvatarBox")
local homeInfoPanel = homeProfileCard:FindFirstChild("HomeInfoPanel")
assert(homeAvatarBox ~= nil and homeInfoPanel ~= nil, "HomeAvatarBox and HomeInfoPanel must exist inside HomeProfileCard")
local homeViewport = homeAvatarBox:FindFirstChild("HomeAvatarViewport")
local homeDragZone = homeAvatarBox:FindFirstChild("AvatarRotateDragZone")
assert(homeViewport ~= nil and homeDragZone ~= nil, "HomeAvatarViewport and AvatarRotateDragZone must exist inside HomeAvatarBox")

local infoUser, infoExec, infoUserId, infoKeyTime
for _, desc in ipairs(homeInfoPanel:GetDescendants()) do
    if desc.Name == "Info_User" then infoUser = desc end
    if desc.Name == "Info_Executor" then infoExec = desc end
    if desc.Name == "Info_UserId" then infoUserId = desc end
    if desc.Name == "Info_KeyTime" then infoKeyTime = desc end
end
assert(infoUser and string.find(infoUser.Text, "FeykHere"), "Info_User must display local player username")
assert(infoExec and infoExec.Text ~= "", "Info_Executor must display executor name")
assert(infoUserId and infoUserId.Text == "12345678", "Info_UserId must display LocalPlayer.UserId")
assert(infoKeyTime and infoKeyTime.Text == "Developer", "FEYKDEV key must show 'Developer' in Key Time Left")

-- Test switching between the 3 Key Tiers (FEYKPERM -> Infinite, FEYK24H -> live countdown, FEYKDEV -> Developer)
local permKeyBtn, timedKeyBtn, devKeyBtn
for _, desc in ipairs(homePage:GetDescendants()) do
    if desc.ClassName == "TextButton" then
        if string.find(desc.Text, "FEYKPERM") then permKeyBtn = desc end
        if string.find(desc.Text, "FEYK24H") then timedKeyBtn = desc end
        if string.find(desc.Text, "FEYKDEV") then devKeyBtn = desc end
    end
end
assert(permKeyBtn and timedKeyBtn and devKeyBtn, "All 3 test key options (FEYKDEV, FEYKPERM, FEYK24H) must exist in Home_Page")

permKeyBtn.MouseButton1Click:Fire()
assert(infoKeyTime.Text == "Infinite", "FEYKPERM key must show 'Infinite' in Key Time Left")

timedKeyBtn.MouseButton1Click:Fire()
assert(string.find(infoKeyTime.Text, "h ") ~= nil and string.find(infoKeyTime.Text, "m ") ~= nil, "FEYK24H key must show live countdown (e.g. 23h 59m 59s)")

devKeyBtn.MouseButton1Click:Fire()
assert(infoKeyTime.Text == "Developer", "FEYKDEV key must restore 'Developer'")

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

cpuBtn.MouseButton1Click:Fire()
local widthWith3Metrics = floatingToggle.Size.X.Offset
assert(widthWith3Metrics > widthWith2Metrics, "FloatingToggle width must expand when 3rd metric is added")

gpuBtn.MouseButton1Click:Fire()
assert(string.find(floatLabel.Text, "GPU") == nil, "4th telemetry metric must be rejected (max 3)")

cpuBtn.MouseButton1Click:Fire()
pingBtn.MouseButton1Click:Fire()
fpsBtn.MouseButton1Click:Fire()
assert(floatLabel.Text == "CORE.XYZ", "When 0 metrics selected, FloatLabel shows CORE.XYZ")
assert(floatingToggle.Size.X.Offset <= 95, "FloatingToggle with only CORE.XYZ must have zero empty space on right (<=95px)")

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

fpsBtn.MouseButton1Click:Fire()
pingBtn.MouseButton1Click:Fire()

-- 3. Test Redesigned Players Tab (Avatar Cards + Click-to-Expand 7 Inline Options including Orbit + Click-Again-to-Collapse)
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

-- Click Enemy_3 -> expands to show all 7 options underneath (160px)!
header3.MouseButton1Click:Fire()
card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
assert(actions3.Visible == true and card3.Size.Y.Offset == 160, "Clicking Enemy_3 must expand card to show 7 options (160px)")

-- Verify all 7 buttons exist inside PlayerActions_Enemy_3 and test them
local btnWhitelist = actions3:FindFirstChild("Action_Whitelist")
local btnPrioritize = actions3:FindFirstChild("Action_Prioritize")
local btnSpectate = actions3:FindFirstChild("Action_Spectate")
local btnOrbit = actions3:FindFirstChild("Action_Orbit")
local btnTeleport = actions3:FindFirstChild("Action_Teleport")
local btnCopy = actions3:FindFirstChild("Action_Copy UserName")
local btnFling = actions3:FindFirstChild("Action_Fling")
assert(btnWhitelist and btnPrioritize and btnSpectate and btnOrbit and btnTeleport and btnCopy and btnFling, "All 7 inline player action buttons (including Orbit) must exist")

btnCopy.MouseButton1Click:Fire()
assert(_G.__CLIPBOARD == "Enemy_3", "Copy UserName must copy Enemy_3")

btnTeleport.MouseButton1Click:Fire()
local myHRP = game:GetService("Players").LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
assert(myHRP.Position.Z < -15, "Teleport action must move LocalHRP to Enemy_3")

myHRP.CFrame = CFrame.new(Vector3.new(10, 5, 20))
btnFling.MouseButton1Click:Fire()
assert(myHRP.Position.X == 10 and myHRP.Position.Z == 20, "Fling must return LocalPlayer to exact starting CFrame")

-- Test Orbit (7th button): toggle ON -> step RenderStepped -> verify LocalHRP orbits around Enemy_3 -> toggle OFF
btnOrbit.MouseButton1Click:Fire()
game:GetService("RunService").RenderStepped:Fire(0.05)
local enemy3HRP = _G.__ALL_PLAYERS[4].Character:FindFirstChild("HumanoidRootPart")
local distToEnemy3 = (myHRP.Position - enemy3HRP.Position).Magnitude
assert(distToEnemy3 < 15, "Orbit Player must orbit LocalHRP around target Enemy_3 within OrbitRadius")
-- Turn off Orbit
card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
actions3:FindFirstChild("Action_Orbit").MouseButton1Click:Fire()
myHRP.CFrame = CFrame.new(Vector3.new(10, 5, 20))

-- Toggle Prioritize on Enemy_3
card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
actions3:FindFirstChild("Action_Prioritize").MouseButton1Click:Fire()
card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
assert(actions3.Visible == true, "Enemy_3 card stays expanded after clicking an inline option")

-- Click Enemy_3 header again -> must collapse/close the 7 options!
header3.MouseButton1Click:Fire()
card3, header3, actions3 = findPlayerCardAndActions("Enemy_3")
assert(actions3.Visible == false and card3.Size.Y.Offset == 44, "Clicking Enemy_3 header again must collapse the 7 options")

-- Also Whitelist Enemy_2 via Enemy_2's card to verify Hitbox Expander skips whitelisted players
local _, header2, _ = findPlayerCardAndActions("Enemy_2")
header2.MouseButton1Click:Fire()
local _, _, actions2 = findPlayerCardAndActions("Enemy_2")
actions2:FindFirstChild("Action_Whitelist").MouseButton1Click:Fire()

-- 4. Test World Tab (Instant Interact, Auto-Interact, Per-Game Waypoints, FPS Booster, Uncap FPS, Join Server by JobId)
local worldPage
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "World_Page" then worldPage = desc end
end
assert(worldPage ~= nil, "World_Page must exist")

local waypointBox, customFpsBox, jobIdBox, joinJobBtn
for _, desc in ipairs(worldPage:GetDescendants()) do
    if desc.ClassName == "TextBox" then
        if string.find(desc.PlaceholderText, "SafeZone") then waypointBox = desc end
        if string.find(desc.PlaceholderText, "144") then customFpsBox = desc end
        if string.find(desc.PlaceholderText, "JobId") then jobIdBox = desc end
    end
    if desc.ClassName == "TextButton" and desc.Text == "Join Server by JobId" then
        joinJobBtn = desc
    end
end
assert(jobIdBox ~= nil and joinJobBtn ~= nil, "Server JobId TextBox and Join Server by JobId button must exist in World_Page")

waypointBox.Text = "SafeZone"
customFpsBox.Text = "240"
customFpsBox.FocusLost:Fire(true)
jobIdBox.Text = "job-uuid-9999"
jobIdBox.FocusLost:Fire(true)
joinJobBtn.MouseButton1Click:Fire()
assert(game:GetService("TeleportService").__lastTeleportJob == "job-uuid-9999", "Join Server by JobId must call TeleportToPlaceInstance with entered JobId")

for _, desc in ipairs(worldPage:GetDescendants()) do
    if desc.ClassName == "TextButton" and desc ~= joinJobBtn then
        desc.MouseButton1Click:Fire()
    end
end
_G.__FLUSH_DELAYED()

assert(_G.__FILES["CoreXYZ_Data/Waypoints_55555.json"] ~= nil, "Waypoint must be persisted in PlaceId-specific file")
local chest = workspace:FindFirstChild("ChestPart")
assert(chest.Material == Enum.Material.SmoothPlastic, "FPS Booster must set parts to SmoothPlastic")
assert(chest:FindFirstChildOfClass("ProximityPrompt").HoldDuration == 0, "Instant Interact must set HoldDuration = 0")
assert(_G.__FPS_CAP == 240, "Uncap FPS with Custom FPS 240 must call setfpscap(240)")

-- 5. Test Visuals Tab (ESP Preview Removed + Pro Crosshair Spin/Pulse/Rainbow + Korblox R15 & R6 + Screen Resolution)
local visualsTabBtn, homeTabBtn
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "Visuals_TabBtn" then visualsTabBtn = desc end
    if desc.Name == "Home_TabBtn" then homeTabBtn = desc end
end
assert(visualsTabBtn ~= nil, "Visuals_TabBtn must exist in sidebar")
visualsTabBtn.MouseButton1Click:Fire()
assert(screenGui:FindFirstChild("CoreESPPreviewWindow") == nil, "CoreESPPreviewWindow must remain completely absent")

-- Verify Silent Aim and duplicate Aimbot toggles were removed from Combat_Page, and verify Hitpart/WallCheck/TeamCheck/Whitelist are ordered ABOVE Hitbox Expander
local combatPage
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "Combat_Page" then combatPage = desc end
end
local combatOrderedLabels = {}
local aimbotToggleCount = 0
for _, child in ipairs(combatPage:GetChildren()) do
    for _, desc in ipairs(child:GetDescendants()) do
        if desc.ClassName == "TextLabel" and desc.Text ~= "" then
            table.insert(combatOrderedLabels, desc.Text)
            if string.find(desc.Text, "Aimbot") and child.ClassName == "TextButton" then
                aimbotToggleCount = aimbotToggleCount + 1
            end
        end
    end
end
assert(aimbotToggleCount == 1, "There must be ONLY ONE Aimbot toggle in Combat_Page, found: " .. tostring(aimbotToggleCount))

local function findLabelIndex(labelList, targetText)
    for idx, txt in ipairs(labelList) do
        if txt == targetText then return idx end
    end
    return nil
end

local idxAimbot = findLabelIndex(combatOrderedLabels, "Aimbot")
local idxHitpart = findLabelIndex(combatOrderedLabels, "Hitpart")
local idxWallCheck = findLabelIndex(combatOrderedLabels, "Wall Check")
local idxTeamCheck = findLabelIndex(combatOrderedLabels, "Team Check")
local idxWhitelistCheck = findLabelIndex(combatOrderedLabels, "Whitelist Check")
local idxWhitelistDropdown = findLabelIndex(combatOrderedLabels, "Whitelist Players")
local idxHitboxExpander = findLabelIndex(combatOrderedLabels, "Hitbox Expander")

assert(idxAimbot and idxHitpart and idxWallCheck and idxTeamCheck and idxWhitelistCheck and idxWhitelistDropdown and idxHitboxExpander, "All Combat controls (Aimbot, Hitpart, Wall Check, Team Check, Whitelist Check, Whitelist Players, Hitbox Expander) must exist")
assert(idxAimbot < idxHitboxExpander, "Aimbot toggle must be above Hitbox Expander")
assert(idxHitpart < idxHitboxExpander, "Hitpart dropdown must be above Hitbox Expander")
assert(idxWallCheck < idxHitboxExpander, "Wall Check toggle must be above Hitbox Expander")
assert(idxTeamCheck < idxHitboxExpander, "Team Check toggle must be above Hitbox Expander")
assert(idxWhitelistCheck < idxHitboxExpander, "Whitelist Check toggle must be above Hitbox Expander")
assert(idxWhitelistDropdown < idxHitboxExpander, "Whitelist Players dropdown must be above Hitbox Expander")

-- Enable Combat, Visuals, and Movement toggles (skipping toggles that already default to true)
for _, pageName in ipairs({ "Combat_Page", "Visuals_Page", "Movement_Page" }) do
    for _, desc in ipairs(mainWindow:GetDescendants()) do
        if desc.Name == pageName then
            for _, ctrl in ipairs(desc:GetDescendants()) do
                if ctrl.ClassName == "TextButton" and ctrl.Text == "" then
                    local rowLabel = ctrl:FindFirstChildOfClass("TextLabel")
                    local lText = rowLabel and rowLabel.Text or ""
                    if lText ~= ""
                        and lText ~= "Team Check"
                        and lText ~= "Whitelist Check"
                        and lText ~= "Wall Check"
                        and lText ~= "Crosshair Center Dot"
                        and lText ~= "Stealth Anti-Kick Bypass (99% Undetected)" then
                        ctrl.MouseButton1Click:Fire()
                    end
                end
            end
        end
    end
end

-- Verify Korblox Right Leg properly hides RightLowerLeg & RightFoot (Transparency == 1) and attaches KorbloxPeg + SpecialMesh on R15!
local localChar = game:GetService("Players").LocalPlayer.Character
local rLower = localChar:FindFirstChild("RightLowerLeg")
local rFoot = localChar:FindFirstChild("RightFoot")
local rUpper = localChar:FindFirstChild("RightUpperLeg")
local korbloxPeg = localChar:FindFirstChild("KorbloxPeg")
assert(rLower.Transparency == 1 and rFoot.Transparency == 1, "Korblox must set RightLowerLeg and RightFoot Transparency to 1")
assert(rUpper.Transparency == 1 and korbloxPeg ~= nil, "Korblox must hide read-only R15 RightUpperLeg and attach welded KorbloxPeg")
local korbloxMesh = korbloxPeg:FindFirstChild("KorbloxSpecialMesh")
assert(korbloxMesh ~= nil and string.find(korbloxMesh.MeshId, "101851696") ~= nil, "KorbloxPeg must contain KorbloxSpecialMesh (101851696)")

-- Verify Pro Crosshair Suite (Spin, Pulse, Rainbow, Center Dot, Line Length/Width) dynamically animates across frames!
local overlaysFolder = screenGui:FindFirstChild("Overlays")
local crosshairContainer = overlaysFolder:FindFirstChild("CrosshairContainer")
assert(crosshairContainer ~= nil and crosshairContainer.Visible == true, "CrosshairContainer must exist and be visible when Custom Crosshair is enabled")
local armTop = crosshairContainer:FindFirstChild("ArmTop")
local armBottom = crosshairContainer:FindFirstChild("ArmBottom")
local chDot = crosshairContainer:FindFirstChild("CrosshairDot")
assert(armTop ~= nil and armBottom ~= nil and chDot ~= nil and chDot.Visible == true, "Crosshair arms and CrosshairDot must exist and be visible")

local rotBefore = armTop.Rotation
local colRBefore = armTop.BackgroundColor3.R
local colGBefore = armTop.BackgroundColor3.G
local lenBefore = armTop.Size.Y.Offset
game:GetService("RunService").RenderStepped:Fire(0.22)
local rotAfter = armTop.Rotation
local colRAfter = armTop.BackgroundColor3.R
local colGAfter = armTop.BackgroundColor3.G
local lenAfter = armTop.Size.Y.Offset
assert(rotAfter ~= rotBefore, "Spin Crosshair must dynamically rotate Crosshair arms across frames")
assert(colRAfter ~= colRBefore or colGAfter ~= colGBefore, "Rainbow Crosshair must dynamically cycle arm RGB color across frames")
assert(lenAfter ~= lenBefore, "Crosshair Pulse must dynamically oscillate arm length across frames")

-- Test Screen Resolution Preset dropdown resetting Custom Stretch AND verify Aimbot Locks BOTH Camera AND Character onto Prioritized Enemy_3!
local visualsPage
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "Visuals_Page" then visualsPage = desc end
end
local res1280x1024Btn, res1728x1080Btn
for _, desc in ipairs(visualsPage:GetDescendants()) do
    if desc.ClassName == "TextButton" then
        if desc.Text == "1280x1024" then res1280x1024Btn = desc end
        if desc.Text == "1728x1080" then res1728x1080Btn = desc end
    end
end
assert(res1280x1024Btn ~= nil and res1728x1080Btn ~= nil, "Resolution Preset options (1280x960, 1440x1080, 1280x1024, 1728x1080) must exist")
res1280x1024Btn.MouseButton1Click:Fire()
game:GetService("RunService").RenderStepped:Fire(0.016)
assert(math.abs(workspace.CurrentCamera.CFrame.R11 - 0.70) < 0.02, "Selecting 1280x1024 must reset Custom Stretch and apply 0.70 stretch ratio to Camera CFrame")
res1728x1080Btn.MouseButton1Click:Fire()
game:GetService("RunService").RenderStepped:Fire(0.016)
assert(math.abs(workspace.CurrentCamera.CFrame.R11 - 0.90) < 0.02, "Selecting 1728x1080 must reset Custom Stretch to 0.90 stretch ratio")

-- Verify Aimbot locks LocalPlayer's Character (myHRP.CFrame.LookAt) horizontally toward prioritized Enemy_3 when Spinbot is off!
local spinbotToggleBtn
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.Name == "Movement_Page" then
        for _, ctrl in ipairs(desc:GetDescendants()) do
            if ctrl.ClassName == "TextButton" and ctrl.Text == "" then
                local lbl = ctrl:FindFirstChildOfClass("TextLabel")
                if lbl and lbl.Text == "Spinbot" then
                    spinbotToggleBtn = ctrl
                end
            end
        end
    end
end
assert(spinbotToggleBtn ~= nil, "Spinbot toggle button must exist")
spinbotToggleBtn.MouseButton1Click:Fire() -- Turn Spinbot OFF briefly to test Aimbot Character Lock-In
local freecamToggleBtn
for _, desc in ipairs(visualsPage:GetDescendants()) do
    if desc.ClassName == "TextButton" and desc.Text == "" then
        local lbl = desc:FindFirstChildOfClass("TextLabel")
        if lbl and lbl.Text == "Freecam (Drone Camera)" then
            freecamToggleBtn = desc
        end
    end
end
freecamToggleBtn.MouseButton1Click:Fire() -- Turn Freecam OFF so Camera locks onto target
game:GetService("RunService").RenderStepped:Fire(0.016)
local enemy3Head = _G.__ALL_PLAYERS[4].Character:FindFirstChild("Head")
assert(myHRP.CFrame.LookAt.X == enemy3Head.Position.X and myHRP.CFrame.LookAt.Z == enemy3Head.Position.Z, "Aimbot must rotate LocalPlayer Character (HumanoidRootPart) horizontally toward locked target Enemy_3")
spinbotToggleBtn.MouseButton1Click:Fire() -- Turn Spinbot back ON

homeTabBtn.MouseButton1Click:Fire()

-- Verify X-Ray Vision made ChestPart translucent (0.6) while keeping player parts untouched
assert(math.abs(chest.Transparency - 0.6) < 0.05, "X-Ray Vision must set map part transparency to 0.6")

-- Verify Hitbox Expander expanded Enemy_3 (non-whitelisted) to 10 studs, while Enemy_2 (whitelisted) stayed size 2!
local enemy2HRP = _G.__ALL_PLAYERS[3].Character:FindFirstChild("HumanoidRootPart") -- Enemy_2
assert(enemy3HRP.Size.X == 10, "Hitbox Expander must expand non-whitelisted enemy HumanoidRootPart to 10")
assert(enemy2HRP.Size.X == 2, "Hitbox Expander must ignore whitelisted player Enemy_2")

-- 6. Run 40 frames of Stepped & RenderStepped (tests 3D Bounding Box, Skeleton Rig, Spider Climb, Swim in Air, Anti-Fling, Anti-Ragdoll, Spinbot, Auto-Interact)
local RunService = game:GetService("RunService")
myHRP.Anchored = false
local startYBeforeClimb = myHRP.Position.Y
for frame = 1, 40 do
    RunService.Stepped:Fire(0, 0.1)
    RunService.RenderStepped:Fire(0.06)
end

-- Verify Spider Climb climbed upward when facing a wall/part
assert(myHRP.Position.Y > startYBeforeClimb, "Spider Climb must climb LocalHRP upward when raycast hits a wall in front")

-- Verify Swim in Air put Humanoid into Swimming state
local myHum = game:GetService("Players").LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
assert(myHum.__lastState == Enum.HumanoidStateType.Swimming, "Swim in Air must set Humanoid state to Swimming")

-- Verify Anti-Fling disabled CanCollide on Enemy_3's character parts
assert(enemy3HRP.CanCollide == false, "Anti-Fling must disable CanCollide on other players")

-- Verify Anti-Void catches LocalHRP if dropped to Y = -300 and restores to safe height
myHRP.CFrame = CFrame.new(Vector3.new(10, -300, 20))
RunService.Stepped:Fire(0, 0.016)
assert(myHRP.Position.Y > -50, "Anti-Void must teleport LocalPlayer back to safe ground when falling into void")

-- Verify 3D Bounding Box (12 edges) & 3D Skeleton Rig were rendered
local overlays = screenGui:FindFirstChild("Overlays")
local found3DBox = false
local foundSkeletonBone = false
local pooledOverlayCountBefore = 0
for _, child in ipairs(overlays:GetChildren()) do
    if child.Name == "Box3DOverlay" then
        pooledOverlayCountBefore = pooledOverlayCountBefore + 1
        if child.Visible then
            local edge1 = child:FindFirstChild("Edge3D_1")
            local bone1 = child:FindFirstChild("Bone_1")
            if edge1 and edge1.Visible then found3DBox = true end
            if bone1 and bone1.Visible then foundSkeletonBone = true end
        end
    end
end
assert(found3DBox == true, "3D Bounding Box overlay (12 edges) must be visible on enemies")
assert(foundSkeletonBone == true, "3D Skeleton Rig overlay must be visible on enemies")
assert(pooledOverlayCountBefore == 35, "Object Pool must pre-allocate exact 35 Box3DOverlay containers for the 35 enemies")

-- Verify Zero Per-Frame Instance Allocation (Constraint #3: Memory Safety)
local instanceCountBeforeLoop = #_G.__ALL_INSTANCES
for frame = 1, 20 do
    RunService.RenderStepped:Fire(0.016)
end
local instanceCountAfterLoop = #_G.__ALL_INSTANCES
assert(instanceCountAfterLoop == instanceCountBeforeLoop, "RenderStepped loop must allocate ZERO new instances across 20 frames (100% Object Pooled)")

-- 6B. Test ESP & Hitbox Auto-Refresh on Player Death, Multi-Frame Streaming Respawn, and New Player Joining Mid-Game!
local enemy3Player = _G.__ALL_PLAYERS[4] -- Enemy_3
local enemy3Hum = enemy3Player.Character:FindFirstChildOfClass("Humanoid")

local function findScreenTagForPlayer(plrName)
    for _, child in ipairs(overlays:GetChildren()) do
        if child.Name == "Box3DOverlay" then
            local st = child:FindFirstChild("ScreenNameTag")
            if st and string.find(st.Text or "", plrName) then
                return st, child
            end
        end
    end
    return nil, nil
end

local tagBeforeDeath, overlayBeforeDeath = findScreenTagForPlayer("Enemy_3")
assert(tagBeforeDeath ~= nil and tagBeforeDeath.Visible == true and overlayBeforeDeath.Visible == true, "Enemy_3 ESP must be visible while alive")

-- Kill Enemy_3 (Health = 0) -> ESP must immediately hide on next frame!
enemy3Hum.Health = 0
RunService.RenderStepped:Fire(0.016)
assert(tagBeforeDeath.Visible == false and overlayBeforeDeath.Visible == false, "Enemy_3 ESP must immediately hide when Enemy_3 dies (Health = 0)")

-- Respawn Enemy_3 with a NEW Character Model where HumanoidRootPart & Humanoid stream in 2 frames later!
local respawnedChar = _G.__createInstance("Model")
respawnedChar.Name = "EnemyChar_3_Respawned"
enemy3Player.Character = respawnedChar
-- Frame 1 & 2: Character exists, but HumanoidRootPart & Humanoid have NOT replicated yet!
RunService.RenderStepped:Fire(0.016)
RunService.RenderStepped:Fire(0.016)
assert(overlayBeforeDeath.Visible == false, "Enemy_3 ESP must stay hidden while new character parts are still streaming in")

-- Frame 3: HumanoidRootPart, Head, UpperTorso, and Humanoid finish replicating into respawnedChar!
local newHRP3 = _G.__createInstance("Part")
newHRP3.Name = "HumanoidRootPart"
newHRP3.CFrame = CFrame.new(Vector3.new(6, 5, -18))
newHRP3.Parent = respawnedChar
local newHead3 = _G.__createInstance("Part")
newHead3.Name = "Head"
newHead3.CFrame = CFrame.new(Vector3.new(6, 6.5, -18))
newHead3.Parent = respawnedChar
local newUT3 = _G.__createInstance("Part")
newUT3.Name = "UpperTorso"
newUT3.CFrame = newHRP3.CFrame
newUT3.Parent = respawnedChar
local newHum3 = _G.__createInstance("Humanoid")
newHum3.Health = 100
newHum3.MaxHealth = 100
newHum3.Parent = respawnedChar

RunService.Stepped:Fire(0, 0.5)
RunService.RenderStepped:Fire(0.016)
local tagAfterRespawn, overlayAfterRespawn = findScreenTagForPlayer("Enemy_3")
assert(tagAfterRespawn ~= nil and tagAfterRespawn.Visible == true and overlayAfterRespawn.Visible == true, "Enemy_3 ESP must automatically refresh and become visible as soon as respawned character parts replicate")
assert(overlayAfterRespawn:FindFirstChild("Bone_1").Visible == true, "Enemy_3 Skeleton ESP must automatically re-bind to respawned character bones")
assert(newHRP3.Size.X == 10, "Hitbox Expander must automatically expand respawned Enemy_3's new HumanoidRootPart to 10")

-- Now simulate a brand-new player (Enemy_NewJoin_36) joining mid-game via Players.PlayerAdded!
local newJoinedPlayer = _G.__createInstance("Player")
newJoinedPlayer.Name = "Enemy_NewJoin_36"
newJoinedPlayer.DisplayName = "Newcomer_36"
newJoinedPlayer.UserId = 2036
newJoinedPlayer.Team = "Bravo"
newJoinedPlayer.CharacterAdded = _G.__createInstance("Part").MouseButton1Click
table.insert(_G.__ALL_PLAYERS, newJoinedPlayer)
game:GetService("Players").PlayerAdded:Fire(newJoinedPlayer)

-- Initially character is empty Model on frame 1
local newJoinChar = _G.__createInstance("Model")
newJoinChar.Name = "NewJoinChar_36"
newJoinedPlayer.Character = newJoinChar
RunService.RenderStepped:Fire(0.016)

-- Frame 2: HumanoidRootPart, Head, Torso, and Humanoid replicate into NewJoinChar_36
local njHRP = _G.__createInstance("Part")
njHRP.Name = "HumanoidRootPart"
njHRP.CFrame = CFrame.new(Vector3.new(4, 5, -22))
njHRP.Parent = newJoinChar
local njHead = _G.__createInstance("Part")
njHead.Name = "Head"
njHead.CFrame = CFrame.new(Vector3.new(4, 6.5, -22))
njHead.Parent = newJoinChar
local njTorso = _G.__createInstance("Part")
njTorso.Name = "Torso"
njTorso.CFrame = njHRP.CFrame
njTorso.Parent = newJoinChar
local njHum = _G.__createInstance("Humanoid")
njHum.Health = 95
njHum.MaxHealth = 100
njHum.Parent = newJoinChar

RunService.Stepped:Fire(0, 0.5)
RunService.RenderStepped:Fire(0.016)

local njTag, njOverlay = findScreenTagForPlayer("Enemy_NewJoin_36")
assert(njTag ~= nil and njTag.Visible == true and njOverlay.Visible == true, "Newly joined player Enemy_NewJoin_36 must automatically get live ESP without toggling ESP off/on")
assert(njHRP.Size.X == 10, "Newly joined player Enemy_NewJoin_36 must automatically get expanded hitbox")

-- Verify Zero Restricted Engine Telemetry Calls (No VirtualUser or Set3dRenderingEnabled)
game:GetService("Players").LocalPlayer.Idled:Fire()
assert(game:GetService("VirtualUser").__clicks == 0, "Anti-AFK must not invoke monitored VirtualUser service")
assert(RunService.__3dRenderEnabled == true, "Script must not invoke restricted RunService:Set3dRenderingEnabled")

-- Verify Single-Ring FOV Circle has NO tick markers and NO inner orbital ring
local fovCircle = overlays:FindFirstChild("FOVCircle")
assert(fovCircle ~= nil and fovCircle.Visible == true, "FOVCircle must be visible when enabled")
assert(fovCircle:FindFirstChild("FOVInnerOrbital") == nil, "FOVCircle must be a single clean ring with no inner orbital ring or tick markers")
assert(overlays:FindFirstChild("SilentSnapline") == nil, "SilentSnapline must be removed")

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

test('Core.xyz.lua v4.4 Stealth & Object-Pooled Edition executes Home 3D Avatar Box + 3 Key Tiers, Right-Side Dock-Locked Live ESP Preview, Pre-Allocated Object Pool (0 per-frame allocations), Passive Viewport Targeting, Pro Crosshair Suite, and Zero Restricted Telemetry Calls with zero errors', () => {
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


