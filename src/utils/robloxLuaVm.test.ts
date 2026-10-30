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
    return setmetatable({
        Position = pos or Vector3.new(0, 0, 0),
        LookAt = lookAt or Vector3.new(0, 0, -1),
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
    HumanoidStateType = { Jumping = "Jumping" },
    CameraType = { Custom = "Custom" },
}

_G.__ALL_INSTANCES = {}

local function createInstance(className)
    local children = {}
    local inst = {
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
        Size = UDim2.fromOffset(100, 30),
        Position = UDim2.fromOffset(0, 0),
        AbsolutePosition = Vector2.new(10, 10),
        AbsoluteSize = Vector2.new(200, 40),
        Text = "",
        CanCollide = true,
        Health = 100,
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
    }

    function inst:IsA(cls)
        if cls == self.ClassName then return true end
        if cls == "BasePart" and (self.ClassName == "Part" or self.ClassName == "MeshPart") then return true end
        return false
    end

    function inst:GetChildren()
        local copy = {}
        for i, c in ipairs(children) do copy[i] = c end
        return copy
    end

    function inst:GetDescendants()
        local list = {}
        local function walk(node)
            for _, c in ipairs(node:GetChildren()) do
                table.insert(list, c)
                walk(c)
            end
        end
        walk(self)
        return list
    end

    function inst:FindFirstChild(name)
        for _, c in ipairs(children) do
            if c.Name == name then return c end
        end
        return nil
    end

    function inst:FindFirstChildOfClass(cls)
        for _, c in ipairs(children) do
            if c.ClassName == cls then return c end
        end
        return nil
    end

    function inst:WaitForChild(name)
        return self:FindFirstChild(name) or createInstance("Folder")
    end

    function inst:IsDescendantOf(ancestor)
        local cur = self.Parent
        while cur do
            if cur == ancestor then return true end
            cur = cur.Parent
        end
        return false
    end

    function inst:ChangeState(st)
        self.__lastState = st
    end

    function inst:Destroy()
        if self.Parent then
            local pChildren = self.Parent.__rawChildren
            if pChildren then
                for i, c in ipairs(pChildren) do
                    if c == self then
                        table.remove(pChildren, i)
                        break
                    end
                end
            end
        end
        self.Parent = nil
    end

    inst.__rawChildren = children

    local mt = {
        __index = function(t, k)
            return rawget(t, k)
        end,
        __newindex = function(t, k, v)
            if k == "Parent" then
                local oldParent = rawget(t, "Parent")
                if oldParent and oldParent.__rawChildren then
                    for i, c in ipairs(oldParent.__rawChildren) do
                        if c == t then
                            table.remove(oldParent.__rawChildren, i)
                            break
                        end
                    end
                end
                rawset(t, "Parent", v)
                if v and v.__rawChildren then
                    table.insert(v.__rawChildren, t)
                end
            else
                rawset(t, k, v)
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
LocalHRP.Position = Vector3.new(0, 5, 0)
LocalHRP.CanCollide = true
LocalHRP.Parent = LocalChar
local LocalHead = createInstance("Part")
LocalHead.Name = "Head"
LocalHead.Position = Vector3.new(0, 6.5, 0)
LocalHead.CanCollide = false
LocalHead.Parent = LocalChar
local LocalHum = createInstance("Humanoid")
LocalHum.Name = "Humanoid"
LocalHum.WalkSpeed = 16
LocalHum.JumpPower = 50
LocalHum.Health = 100
LocalHum.Parent = LocalChar

local LocalPlayer = createInstance("Player")
LocalPlayer.Name = "FeykHere"
LocalPlayer.Team = "Alpha"
LocalPlayer.Character = LocalChar
LocalPlayer.CharacterAdded = createSignal()
LocalPlayer.Idled = createSignal()

local allPlayers = { LocalPlayer }

-- Spawn 35 enemy players (mix of R15 and R6 rigs) to stress-test the 30-Highlight cap!
for i = 1, 35 do
    local eChar = createInstance("Model")
    eChar.Name = "EnemyChar_" .. i
    local eHRP = createInstance("Part")
    eHRP.Name = "HumanoidRootPart"
    eHRP.Position = Vector3.new((i % 7) * 2, 5, -20 - i)
    eHRP.Parent = eChar

    if i % 2 == 0 then
        -- R6 rig (Torso + Right Arm, no UpperTorso)
        local eTorso = createInstance("Part")
        eTorso.Name = "Torso"
        eTorso.Position = eHRP.Position
        eTorso.Parent = eChar
        local eArm = createInstance("Part")
        eArm.Name = "Right Arm"
        eArm.Position = eHRP.Position
        eArm.Parent = eChar
    else
        -- R15 rig (Head + UpperTorso)
        local eHead = createInstance("Part")
        eHead.Name = "Head"
        eHead.Position = eHRP.Position
        eHead.Parent = eChar
        local eUT = createInstance("Part")
        eUT.Name = "UpperTorso"
        eUT.Position = eHRP.Position
        eUT.Parent = eChar
    end

    local eHum = createInstance("Humanoid")
    eHum.Health = 100
    eHum.Parent = eChar

    local ep = createInstance("Player")
    ep.Name = "Enemy_" .. i
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
    RenderStepped = createSignal(),
    Stepped = createSignal(),
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

local Camera = {
    ViewportSize = Vector2.new(800, 380), -- Simulate mobile Delta Executor landscape screen!
    CFrame = CFrame.new(Vector3.new(0, 5, 0), Vector3.new(0, 5, -10)),
    WorldToViewportPoint = function(self, worldPos)
        return Vector3.new(400 + worldPos.X * 2, 190, 25), true
    end
}

workspace = {
    CurrentCamera = Camera,
    Raycast = function(self, origin, direction, params)
        local firstEnemy = allPlayers[2]
        local part = firstEnemy.Character:FindFirstChild("Head") or firstEnemy.Character:FindFirstChild("Torso") or firstEnemy.Character:FindFirstChild("HumanoidRootPart")
        return {
            Instance = part,
            Position = part.Position,
        }
    end
}

game = {
    Loaded = createSignal(),
    IsLoaded = function() return true end,
    GetService = function(self, name)
        if name == "Players" then return PlayersService end
        if name == "RunService" then return RunService end
        if name == "Teams" then return TeamsService end
        if name == "UserInputService" then return UserInputService end
        if name == "TweenService" then return TweenService end
        if name == "VirtualUser" then return VirtualUser end
        if name == "CoreGui" then return CoreGui end
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

local keyInputBox, unlockBtn, copyKeyBtn, keyFeedback
for _, desc in ipairs(keyCard:GetDescendants()) do
    if desc.ClassName == "TextBox" then keyInputBox = desc end
    if desc.ClassName == "TextButton" and desc.Text == "AUTHORIZE KEY" then unlockBtn = desc end
    if desc.ClassName == "TextButton" and desc.Text == "GET KEY" then copyKeyBtn = desc end
    if desc.ClassName == "TextLabel" and string.find(desc.Text, "Status:") then keyFeedback = desc end
end

-- Wrong key test
keyInputBox.Text = "INVALID"
unlockBtn.MouseButton1Click:Fire()
assert(mainWindow.Visible == false, "MainWindow must remain hidden on wrong key")

-- GET KEY + Authorize test
copyKeyBtn.MouseButton1Click:Fire()
assert(keyInputBox.Text == "FEYKSECURED", "GET KEY should fill FEYKSECURED")
unlockBtn.MouseButton1Click:Fire()

assert(keyCard.Visible == false, "KeyCard must hide after FEYKSECURED")
assert(floatingToggle.Visible == true, "FloatingToggle must be visible")
assert(mainWindow.Visible == true, "MainWindow must be visible")

-- Test Mobile Viewport UIScale auto-scaling (Viewport is 800x380 -> scale < 1)
local mainScale = mainWindow:FindFirstChildOfClass("UIScale")
assert(mainScale ~= nil and mainScale.Scale < 1 and mainScale.Scale >= 0.72, "Mobile UIScale should auto-scale for Delta mobile viewports")

-- Enable all toggles & click all buttons
local allButtons = {}
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.ClassName == "TextButton" then
        table.insert(allButtons, desc)
    end
end
for _, btn in ipairs(allButtons) do
    if btn.Text ~= "—" then
        btn.MouseButton1Click:Fire()
    end
end
_G.__FLUSH_DELAYED()

-- Test Mobile Touch Slider Dragging (locks ScrollingFrame while sliding, unlocks on release)
local combatPage = mainWindow:FindFirstChild("PagesHolder") or mainWindow:GetDescendants()
for _, desc in ipairs(mainWindow:GetDescendants()) do
    if desc.ClassName == "TextButton" and desc.Size.Y.Offset == 6 then
        -- This is a slider track! Simulate mobile Touch drag:
        local touchInput = {
            UserInputType = Enum.UserInputType.Touch,
            UserInputState = Enum.UserInputState.Begin,
            Position = Vector2.new(120, 20),
            Changed = { Connect = function() end }
        }
        desc.InputBegan:Fire(touchInput)
        UserInputService.InputChanged:Fire({
            UserInputType = Enum.UserInputType.Touch,
            Position = Vector2.new(180, 20),
        })
        UserInputService.InputEnded:Fire({
            UserInputType = Enum.UserInputType.Touch,
            Position = Vector2.new(180, 20),
        })
    end
end

-- Run 30 frames of RenderStepped & Stepped with 35 enemies
for frame = 1, 30 do
    RunService.Stepped:Fire()
    RunService.RenderStepped:Fire(1 / 60)
end

-- Verify 30-Highlight engine cap is strictly respected even with 35 enemies!
local highlights = screenGui:FindFirstChild("Highlights")
assert(#highlights:GetChildren() == 30, "Highlights must be capped at 30 even with 35 enemies (got " .. tostring(#highlights:GetChildren()) .. ")")

-- Verify PlayerRemoving cleans up ESP & frees a Highlight slot
local removedEnemy = _G.__ALL_PLAYERS[2]
table.remove(_G.__ALL_PLAYERS, 2)
game:GetService("Players").PlayerRemoving:Fire(removedEnemy)
assert(#highlights:GetChildren() == 29, "PlayerRemoving must destroy that player's Highlight")

-- Next frame should allocate the freed Highlight slot to one of the remaining un-highlighted enemies!
RunService.RenderStepped:Fire(1 / 60)
assert(#highlights:GetChildren() == 30, "Freed Highlight slot should be assigned on next RenderStepped")

-- Test Character Respawn (CharacterAdded)
local newChar = _G.__createInstance("Model")
local newHum = _G.__createInstance("Humanoid")
newHum.Name = "Humanoid"
newHum.WalkSpeed = 16
newHum.JumpPower = 50
newHum.Parent = newChar
game:GetService("Players").LocalPlayer.Character = newChar
game:GetService("Players").LocalPlayer.CharacterAdded:Fire(newChar)

_G.__TEST_PASSED = true
`;

test('Core.xyz.lua executes end-to-end in Lua 5.3 VM with mobile viewport, 35-player ESP stress test, touch sliders, and R6/R15 rigs', () => {
  const scriptPath = path.resolve(process.cwd(), 'Core.xyz.lua');
  const coreLuaCode = fs.readFileSync(scriptPath, 'utf8');

  const fullLuaProgram = `${ROBLOX_MOCK_PRELUDE}\n${coreLuaCode}\n${ROBLOX_ASSERTIONS_POSTLUDE}`;

  const L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);

  const loadStatus = lauxlib.luaL_loadstring(L, fengari.to_luastring(fullLuaProgram));
  if (loadStatus !== lua.LUA_OK) {
    const errMsg = fengari.to_jsstring(lua.lua_tostring(L, -1));
    assert.fail(`Lua syntax/load error in Core.xyz.lua:\n${errMsg}`);
  }

  const callStatus = lua.lua_pcall(L, 0, 0, 0);
  if (callStatus !== lua.LUA_OK) {
    const errMsg = fengari.to_jsstring(lua.lua_tostring(L, -1));
    assert.fail(`Lua runtime error in Core.xyz.lua:\n${errMsg}`);
  }

  lua.lua_getglobal(L, fengari.to_luastring('__TEST_PASSED'));
  const passed = lua.lua_toboolean(L, -1);
  assert.equal(passed, true, 'Expected __TEST_PASSED to be true');
});
