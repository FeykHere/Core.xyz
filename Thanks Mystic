if getgenv().MystrixHub then
    if MystrixHub.ConnectionController and MystrixHub.ConnectionController.Connections then
        for k, v1 in next, MystrixHub.ConnectionController.Connections, nil do
            pcall(
                function()
                    v1:Disconnect()
                end
            )
            MystrixHub.ConnectionController.Connections[k] = nil
        end
    end
    if MystrixHub.TasksController and MystrixHub.TasksController.Tasks then
        for k1, v2 in next, MystrixHub.TasksController.Tasks, nil do
            pcall(
                function()
                    task.cancel(v2)
                end
            )
            MystrixHub.TasksController.Tasks[k1] = nil
        end
    end
    if MystrixHub.UIController then
        local UIController = MystrixHub.UIController
        if UIController.FPSConnection then
            pcall(
                function()
                    UIController.FPSConnection:Disconnect()
                end
            )
        end
        if UIController.PingConnection then
            pcall(
                function()
                    UIController.PingConnection:Disconnect()
                end
            )
        end
        if UIController.BGWatcher then
            pcall(
                function()
                    UIController.BGWatcher:Disconnect()
                end
            )
        end
    end
    pcall(
        function()
            for _, v1 in ipairs(cloneref(game:GetService("CoreGui")):GetChildren()) do
                if v1.Name == "WindUI" then
                    v1:Destroy()
                end
            end
        end
    )
    getgenv().MystrixHub = nil
    getgenv().WindUI = nil
    task.wait(0.2)
end
local v3 = setmetatable(
    {},
    {
        __index = function(_, arg2)
            return cloneref(game:GetService(arg2))
        end,
    }
)
local Players = v3.Players
local RunService = v3.RunService
local HttpService = v3.HttpService
local MarketplaceService = v3.MarketplaceService
local CoreGui = v3.CoreGui
local LocalPlayer = Players.LocalPlayer
local v4 = syn and syn.request or http_request or request
makefolder("WindUI")
makefolder("WindUI/BikeForEggs")
local v5 = getgenv()
local tbl = {
    Version = "v1.0", Discord = "46JkThWjPB", Logo = "rbxassetid://85997568026025",
    FolderName = "BikeForEggs", FolderPath = "WindUI/BikeForEggs",
    ExecDataFile = "WindUI/NebulAuth_ExecData.json", GameName = "Unknown Game",
    ServerName = "Mystrix Hub", MemberCount = "Fetching...", OnlineCount = "Fetching...",
}
local tbl1 = {
    BaseURL = "https://api.nebulauth.com",
    ApiToken = "mk_at_mqRNTHJ9GG0Xc7A1pWPb_OoCpshPMW-OSymq1encWnk",
    SigningSecret = "mk_sig_0GCXObajBi8W5Sv4PjJkvrieyXBOAiwehA-iD94OMHA", UseKeySystem = false,
}
tbl1.KeyResult = nil
tbl1.KeyError = nil
local tbl2 = {}
tbl2.CachedOffset = nil
tbl2.LastSync = 0
local tbl3 = {Player = LocalPlayer, PlayerGui = LocalPlayer.PlayerGui}
tbl3.HWID = nil
local tbl4 = {}
tbl4.Window = nil
tbl4.WindUI = nil
tbl4.Tabs = {}
tbl4.Drops = {}
tbl4.VersionTag = nil
tbl4.FPSTag = nil
tbl4.PingTag = nil
tbl4.FPSConnection = nil
tbl4.PingConnection = nil
tbl4.BGWatcher = nil
tbl4.WinBG = nil
tbl4.BGTransparency = 0.15
tbl4.CurrentTheme = "Crimson"
tbl4.ThemeFirstLoad = true
tbl4.ThemeAccents = {
    Sky = Color3.fromHex("#00d4ff"), Dark = Color3.fromHex("#6c63ff"),
    Light = Color3.fromHex("#ff6b6b"), Rose = Color3.fromHex("#f43f5e"),
    Plant = Color3.fromHex("#65a30d"), Red = Color3.fromHex("#ef4444"),
    Indigo = Color3.fromHex("#6366f1"), Violet = Color3.fromHex("#8b5cf6"),
    Amber = Color3.fromHex("#f59e0b"), Emerald = Color3.fromHex("#10b981"),
    Midnight = Color3.fromHex("#1e293b"), Crimson = Color3.fromHex("#e11d48"),
    Mellowsi = Color3.fromHex("#f472b6"), Rainbow = Color3.fromHex("#ff0080"),
    ["Monokai Pro"] = Color3.fromHex("#fc9867"), ["Cotton Candy"] = Color3.fromHex("#ec4899"),
}
tbl4.CurrentAccent = Color3.fromHex("#6c63ff")
local tbl5 = {Cache = {}}
tbl5.SelectedConfig = nil
tbl5.NameInput = "MystrixHub"
tbl5.LastConfigFile = "WindUI/BikeForEggs/LastConfig.txt"
tbl5.AutoLoadFile = "WindUI/BikeForEggs/AutoLoad.txt"
tbl5.Dropdown = nil
tbl5.ImportData = ""
local tbl6 = {
    StatusText = "Verified", KeyIdText = "N/A", KeyLabelText = "N/A", ExpiryText = "N/A",
    TimeLeftText = "Unlimited", HwidDisplay = "N/A", ResetText = "No", ExecCountStr = "INF",
}
local tbl7 = {Enabled = false, Running = false}
tbl7.Loop = nil
tbl7.SpecificEggNames = {}
tbl7.SelectedRarities = {}
tbl7.SelectedAreas = {}
tbl7.AreasNameById = {}
tbl7.EggLookup = {}
tbl7.FailCounts = {}
tbl7.LastTargetUid = nil
local tbl8 = {SelectedEggCategories = {}, SelectedPetCategories = {}, AutoEggsRunning = false}
tbl8.AutoEggsLoop = nil
tbl8.AutoPetsRunning = false
tbl8.AutoPetsLoop = nil
tbl8.Deps = {}
local tbl9 = {AutoTrailRunning = false}
tbl9.AutoTrailLoop = nil
tbl9.AutoBikeRunning = false
tbl9.AutoBikeLoop = nil
tbl9.AutoTreadmillRunning = false
tbl9.AutoTreadmillLoop = nil
tbl9.AutoPlotRunning = false
tbl9.AutoPlotLoop = nil
local tbl10 = {HatchSelectedEggs = {"All"}, PlaceSelectedEggs = {"Best"}, AutoHatchRunning = false}
tbl10.AutoHatchLoop = nil
tbl10.AutoPlaceRunning = false
tbl10.AutoPlaceLoop = nil
tbl10.AutoTreadmillRunning = false
tbl10.AutoTreadmillLoop = nil
tbl10.AutoClaimRunning = false
tbl10.AutoClaimLoop = nil
tbl10.AutoPlaceBestPetsRunning = false
tbl10.AutoPlaceBestPetsLoop = nil
v5.MystrixHub = {
    Meta = tbl, Auth = tbl1, TimeController = tbl2, PlayerController = tbl3, UIController = tbl4,
    ConfigController = tbl5, KeyDisplay = tbl6, FarmController = tbl7, SellController = tbl8,
    ShopController = tbl9, PlotController = tbl10, ConnectionController = {Connections = {}},
    TasksController = {Tasks = {}}, Functions = {},
}
local v6 = MystrixHub
v6.ConnectionController.Insert = function(arg1)
    table.insert(MystrixHub.ConnectionController.Connections, arg1)
end
v6.TasksController.Insert = function(arg1)
    table.insert(MystrixHub.TasksController.Tasks, arg1)
end
v6.Functions.HexToBytes = function(arg1)
    return (arg1:gsub(
        "..",
        function(arg1)
            return string.char(tonumber(arg1, 16))
        end
    ))
end
v6.Functions.BytesToHex = function(arg1)
    return (arg1:gsub(
        ".",
        function(arg1)
            return string.format("%02x", string.byte(arg1))
        end
    ))
end
v6.Functions.IsHex = function(arg1, arg2)
    if not arg1 then
        return false
    end
    if arg2 and #arg1 ~= arg2 then
        return false
    end
    return arg1:match("^[0-9a-fA-F]+$") ~= nil
end
v6.Functions.NormaliseSHA256 = function(arg1)
    if not arg1 or arg1 == "" then
        return nil
    end
    if #arg1 == 64 and MystrixHub.Functions.IsHex(arg1, 64) then
        return MystrixHub.Functions.HexToBytes(arg1)
    end
    if #arg1 == 32 then
        return arg1
    end
    if MystrixHub.Functions.IsHex(arg1) then
        return MystrixHub.Functions.HexToBytes(arg1)
    end
    return arg1
end
v6.Functions.SHA256Bytes = function(arg1)
    local v1, v2 = pcall(
        function()
            return crypt and crypt.hash and crypt.hash(arg1, "sha256")
        end
    )
    if v1 and v2 and v2 ~= "" then
        local v3 = MystrixHub.Functions.NormaliseSHA256(v2)
        if v3 then
            return v3
        end
    end
    local v4, v5 = pcall(
        function()
            return HttpService:SHA256(arg1)
        end
    )
    if v4 and v5 and v5 ~= "" then
        local v6 = MystrixHub.Functions.NormaliseSHA256(v5)
        if v6 then
            return v6
        end
    end
    local v7, v8 = pcall(
        function()
            return crypto and crypto.sha256 and crypto.sha256(arg1)
        end
    )
    if v7 and v8 and v8 ~= "" then
        local v9 = MystrixHub.Functions.NormaliseSHA256(v8)
        if v9 then
            return v9
        end
    end
    return nil
end
v6.Functions.SHA256 = function(arg1)
    local v1 = MystrixHub.Functions.SHA256Bytes(arg1)
    if not v1 then
        return ""
    end
    return MystrixHub.Functions.BytesToHex(v1)
end
v6.Functions.HMACSHA256 = function(arg1, arg2)
    local v1 = #arg1 > 64 and MystrixHub.Functions.SHA256Bytes(arg1) or arg1
    if not v1 then
        return ""
    end
    while #v1 < 64 do
        v1 = v1 .. "\0"
    end
    local tbl = {}
    local tbl1 = {}
    for i = 1, 64 do
        local v2 = string.byte(v1, i)
        tbl[i] = string.char(bit32.bxor(v2, 54))
        tbl1[i] = string.char(bit32.bxor(v2, 92))
    end
    local v3 = MystrixHub.Functions.SHA256Bytes(table.concat(tbl) .. arg2)
    if not v3 then
        return ""
    end
    return MystrixHub.Functions.SHA256(table.concat(tbl1) .. v3)
end
v6.Functions.CleanKey = function(arg1)
    if not arg1 then
        return ""
    end
    return (tostring(arg1):match("^%s*(.-)%s*$"):gsub("[%z\1-\8\11\12\14-\31\127]", ""):gsub(
        "​", ""
    ):gsub(" ", ""):gsub("\239\187\191", ""):gsub("[^%w%-_]", ""))
end
v6.Functions.MakeRawRequest = function(arg1, arg2, arg3, arg4)
    local tbl = {Url = arg1, Method = arg2 or "GET"}
    if arg3 then
        tbl.Headers = arg3
    end
    if arg4 then
        tbl.Body = arg4
    end
    if v4 then
        local v1, v2 = pcall(v4, tbl)
        if v1 and v2 then
            return v2
        end
    end
    if syn and syn.request then
        local v3, v5 = pcall(syn.request, tbl)
        if v3 and v5 then
            return v5
        end
    end
    if http and http.request then
        local v6, v7 = pcall(http.request, tbl)
        if v6 and v7 then
            return v7
        end
    end
    if http_request then
        local v8, v9 = pcall(http_request, tbl)
        if v8 and v9 then
            return v9
        end
    end
    return nil
end
v6.Functions.TryParseUnixMs = function(arg1)
    if not (arg1 and arg1.Body) then
        return nil
    end
    local v1, v2 = pcall(
        function()
            return HttpService:JSONDecode(arg1.Body)
        end
    )
    if not v1 or not v2 then
        return nil
    end
    if v2.unixtime then
        return math.floor(v2.unixtime * 1000)
    end
    if v2.now then
        return math.floor(v2.now * 1000)
    end
    if v2.dateTime then
        local v3, v4 = pcall(
            function()
                return DateTime.fromIsoDate(v2.dateTime)
            end
        )
        if v3 and v4 then
            return v4.UnixTimestampMillis
        end
    end
    if v2.utc_datetime then
        local v5, v6 = pcall(
            function()
                return DateTime.fromIsoDate(v2.utc_datetime)
            end
        )
        if v5 and v6 then
            return v6.UnixTimestampMillis
        end
    end
    return nil
end
v6.Functions.TryParseDateHeader = function(arg1)
    if not (arg1 and arg1.Headers) then
        return nil
    end
    local v1 = arg1.Headers.date or arg1.Headers.Date
    if not v1 then
        return nil
    end
    local v2, v3, v4, v5, v6, v7 = v1:match("(%d+) (%a+) (%d+) (%d+):(%d+):(%d+)")
    local tbl = {
        Jan = 1, Feb = 2, Mar = 3, Apr = 4, May = 5, Jun = 6, Jul = 7, Aug = 8, Sep = 9, Oct = 10,
        Nov = 11, Dec = 12,
    }
    if v2 and v3 and v4 and tbl[v3] then
        local v8, v9 = pcall(
            os.time,
            {
                year = tonumber(v4), month = tbl[v3], day = tonumber(v2), hour = tonumber(v5),
                min = tonumber(v6), sec = tonumber(v7),
            }
        )
        if v8 then
            return v9 * 1000
        end
    end
    return nil
end
v6.Functions.SyncServerTime = function()
    local TimeController = MystrixHub.TimeController
    if TimeController.CachedOffset ~= nil and os.time() - TimeController.LastSync < 60 then
        return true
    end
    for _, v1 in ipairs(
        {
            "https://worldtimeapi.org/api/timezone/Etc/UTC",
            "https://timeapi.io/api/Time/current/zone?timeZone=UTC",
        }
    ) do
        local v2, v3 = pcall(
            MystrixHub.Functions.MakeRawRequest, v1, "GET", {Accept = "application/json"}, nil
        )
        if v2 and v3 then
            local v4 = MystrixHub.Functions.TryParseUnixMs(v3)
            if v4 then
                TimeController.CachedOffset = v4 - DateTime.now().UnixTimestampMillis
                TimeController.LastSync = os.time()
                return true
            end
        end
    end
    for _, v5 in ipairs(
        {"https://www.google.com/", "https://www.roblox.com/", "https://discord.com/"}
    ) do
        local v6, v7 = pcall(MystrixHub.Functions.MakeRawRequest, v5, "GET", nil, nil)
        if v6 and v7 then
            local v8 = MystrixHub.Functions.TryParseDateHeader(v7)
            if v8 then
                TimeController.CachedOffset = v8 - DateTime.now().UnixTimestampMillis
                TimeController.LastSync = os.time()
                return true
            end
        end
    end
    TimeController.CachedOffset = 0
    TimeController.LastSync = os.time()
    return false
end
v6.Functions.GetAccurateTimestampMs = function(arg1)
    local TimeController = MystrixHub.TimeController
    if TimeController.CachedOffset == nil then
        MystrixHub.Functions.SyncServerTime()
    end
    return tostring(
        DateTime.now().UnixTimestampMillis + (TimeController.CachedOffset or 0) + (arg1 or 0)
    )
end
v6.Functions.GetHWID = function()
    local str
    for _, v1 in ipairs(
        {
            function()
                return gethwid and gethwid()
            end,
            function()
                return game:GetService("RbxAnalyticsService"):GetClientId()
            end,
            function()
                return game:GetService("UserIdService"):GetUserId()
            end,
        }
    ) do
        local v2, v3 = pcall(v1)
        if v2 and v3 and v3 ~= "" then
            str = tostring(v3)
            break
        end
    end
    if not str or str == "" then
        str = MystrixHub.Functions.SHA256(
            "USER_" .. (LocalPlayer and LocalPlayer.UserId or 0) .. "_" .. game.PlaceId
        ):sub(1, 32)
    end
    return str
end
v6.Functions.Farm_GetAssets = function()
    local Directory = game:GetService("ReplicatedStorage"):FindFirstChild("Directory")
    local v1 = Directory and Directory:FindFirstChild("Assets")
    if not v1 or not v1:IsA("ModuleScript") then
        return nil
    end
    local v2, v3 = pcall(require, v1)
    if v2 and type(v3) == "table" and type(v3.Directory) == "table" then
        return v3
    end
    return nil
end
v6.Functions.Farm_GetEggCmds = function()
    local Library = game:GetService("ReplicatedStorage"):FindFirstChild("Library")
    local v1 = Library and Library:FindFirstChild("Client")
    local v2 = v1 and v1:FindFirstChild("EggCmds")
    if not v2 or not v2:IsA("ModuleScript") then
        return nil
    end
    local v3, v4 = pcall(require, v2)
    if v3 and type(v4) == "table" then
        return v4
    end
    return nil
end
v6.Functions.Farm_GetPlotCmds = function()
    local Library = game:GetService("ReplicatedStorage"):FindFirstChild("Library")
    local v1 = Library and Library:FindFirstChild("Client")
    local v2 = v1 and v1:FindFirstChild("PlotCmds")
    if not v2 or not v2:IsA("ModuleScript") then
        return nil
    end
    local v3, v4 = pcall(require, v2)
    if v3 and type(v4) == "table" then
        return v4
    end
    return nil
end
v6.Functions.Farm_GetRarityName = function(arg1, arg2)
    local v1 = arg2 or MystrixHub.Functions.Farm_GetAssets()
    if not v1 or not v1.Directory[arg1] then
        return "Unknown", 0
    end
    local Rarity = v1.Directory[arg1].Rarity
    if type(Rarity) ~= "table" then
        return "Unknown", 0
    end
    return
        Rarity.DisplayName or Rarity._id or Rarity.Name or "Unknown",
        tonumber(Rarity.RarityNumber) or 0
end
v6.Functions.Farm_GetEggsList = function()
    local v1 = MystrixHub.Functions.Farm_GetAssets()
    if not v1 then
        return {}
    end
    local Assets = game:GetService("ReplicatedStorage"):FindFirstChild("Assets")
    local v2 = Assets and Assets:FindFirstChild("Models")
    local v3 = v2 and v2:FindFirstChild("Eggs")
    local tbl = {}
    for k, v4 in pairs(v1.Directory) do
        if type(k) == "string" and type(v4) == "table" and type(v4.Rarity) == "table" then
            local flag = true
            if v3 then
                flag = v3:FindFirstChild(k) ~= nil
            end
            if flag then
                local num = tonumber(v4.Rarity.RarityNumber)
                table.insert(
                    tbl,
                    {
                        Name = k,
                        Rarity = v4.Rarity.DisplayName or v4.Rarity._id or v4.Rarity.Name or "Unknown",
                        RarityNum = num or 0,
                    }
                )
            end
        end
    end
    table.sort(
        tbl,
        function(arg1, arg2)
            if arg1.RarityNum ~= arg2.RarityNum then
                return arg1.RarityNum > arg2.RarityNum
            end
            return arg1.Name < arg2.Name
        end
    )
    local tbl1 = {}
    local tbl2 = {}
    for _, v5 in ipairs(tbl) do
        local v6 = "[" .. v5.Rarity .. "] " .. v5.Name
        table.insert(tbl1, v6)
        tbl2[v6] = v5.Name
    end
    MystrixHub.FarmController.EggLookup = tbl2
    return tbl1
end
v6.Functions.Farm_GetRaritiesList = function()
    local v1 = MystrixHub.Functions.Farm_GetAssets()
    if not v1 then
        return {}
    end
    local tbl = {}
    for _, v2 in pairs(v1.Directory) do
        if type(v2) == "table" and type(v2.Rarity) == "table" then
            local v3 = tonumber(v2.Rarity.RarityNumber) or 0
            local v4 = v2.Rarity.DisplayName or v2.Rarity._id or v2.Rarity.Name
            if type(v4) == "string" and v4 ~= "" then
                if not tbl[v4] or v3 > tbl[v4] then
                    tbl[v4] = v3
                end
            end
        end
    end
    local tbl1 = {}
    for k, v5 in pairs(tbl) do
        table.insert(tbl1, {Name = k, RarityNum = v5})
    end
    table.sort(
        tbl1,
        function(arg1, arg2)
            if arg1.RarityNum ~= arg2.RarityNum then
                return arg1.RarityNum > arg2.RarityNum
            end
            return arg1.Name < arg2.Name
        end
    )
    local tbl2 = {}
    for _, v6 in ipairs(tbl1) do
        table.insert(tbl2, v6.Name)
    end
    return tbl2
end
v6.Functions.Farm_GetAreasList = function()
    local Directory = game:GetService("ReplicatedStorage"):FindFirstChild("Directory")
    local v1 = Directory and Directory:FindFirstChild("Areas")
    local v2 = MystrixHub.Functions.Farm_GetAssets()
    local tbl = {}
    local tbl1 = {}
    if v1 and v1:IsA("ModuleScript") then
        local v3, v4 = pcall(require, v1)
        if v3 and type(v4) == "table" and type(v4.Directory) == "table" then
            for k, v5 in pairs(v4.Directory) do
                if type(k) == "string" and type(v5) == "table" then
                    local v6 = v5.DisplayName or k
                    local num = 0
                    if type(v5.DropTable) == "table" then
                        for _, v7 in ipairs(v5.DropTable) do
                            if type(v7) == "table" and v7[1] then
                                local v8 = v7[1]
                                if type(v8) == "string" and v2 and v2.Directory[v8] then
                                    local Rarity = v2.Directory[v8].Rarity
                                    if type(Rarity) == "table" then
                                        local v9 = tonumber(Rarity.RarityNumber) or 0
                                        if v9 > num then
                                            num = v9
                                        end
                                    end
                                end
                            end
                        end
                    end
                    table.insert(tbl, {Id = k, Name = v6, RarityNum = num})
                    tbl1[k] = true
                end
            end
        end
    end
    local v10 = MystrixHub.Functions.Farm_GetEggCmds()
    if v10 then
        local v11, v12 = pcall(
            function()
                return v10.GetAreaEggSnapshot()
            end
        )
        if v11 and type(v12) == "table" and type(v12.Records) == "table" then
            for _, v13 in ipairs(v12.Records) do
                if type(v13.AreaId) == "string" and not tbl1[v13.AreaId] then
                    tbl1[v13.AreaId] = true
                    table.insert(tbl, {Id = v13.AreaId, Name = v13.AreaId, RarityNum = 0})
                end
            end
        end
    end
    table.sort(
        tbl,
        function(arg1, arg2)
            if arg1.RarityNum ~= arg2.RarityNum then
                return arg1.RarityNum > arg2.RarityNum
            end
            return arg1.Name < arg2.Name
        end
    )
    local tbl2 = {}
    local tbl3 = {}
    for _, v14 in ipairs(tbl) do
        tbl2[v14.Id] = v14.Name
        table.insert(tbl3, v14.Name)
    end
    MystrixHub.FarmController.AreasNameById = tbl2
    return tbl3
end
v6.Functions.Farm_IsCarrying = function()
    local Character = LocalPlayer.Character
    if not Character then
        return false
    end
    for _, v1 in ipairs(Character:GetChildren()) do
        if v1:IsA("Tool") and v1:GetAttribute("AreaEggCarryVisual") == true then
            return true
        end
    end
    return false
end
v6.Functions.Farm_Teleport = function(arg1)
    local Character = LocalPlayer.Character
    local v1 = Character and Character:FindFirstChild("HumanoidRootPart")
    if not v1 then
        return false
    end
    local LookVector = v1.CFrame.LookVector
    return (pcall(
        function()
            v1.CFrame = CFrame.new(arg1, arg1 + LookVector)
            v1.AssemblyLinearVelocity = Vector3.zero
            v1.AssemblyAngularVelocity = Vector3.zero
        end
    ))
end
v6.Functions.Farm_FindEggModel = function(arg1)
    if not arg1 then
        return nil
    end
    local v1 = workspace:FindFirstChild(arg1)
    if v1 and v1:IsA("Model") then
        return v1
    end
    local AreaEggSlotsClient = workspace:FindFirstChild("AreaEggSlotsClient")
    if AreaEggSlotsClient then
        local v2 = AreaEggSlotsClient:FindFirstChild(arg1)
        if v2 and v2:IsA("Model") then
            return v2
        end
    end
    return nil
end
v6.Functions.Farm_FindBestTarget = function()
    local FarmController = MystrixHub.FarmController
    FarmController.FailCounts = FarmController.FailCounts or {}
    local v1 = MystrixHub.Functions.Farm_GetEggCmds()
    if not v1 then
        return nil
    end
    local v2, v3 = pcall(
        function()
            return v1.GetAreaEggSnapshot()
        end
    )
    if not v2 or type(v3) ~= "table" or type(v3.Records) ~= "table" then
        return nil
    end
    local v4 = MystrixHub.Functions.Farm_GetAssets()
    local tbl = {}
    for _, v5 in ipairs(v3.Records) do
        if v5.Uid and v5.AssetCategory and v5.CarrierUserId == nil then
            if v5.State == "Slot" or v5.State == "Dropped" then
                local _, v6 = MystrixHub.Functions.Farm_GetRarityName(v5.AssetCategory, v4)
                table.insert(tbl, {Record = v5, RarityNum = v6, Uid = v5.Uid})
            end
        end
    end
    if #tbl == 0 then
        return nil
    end
    local tbl1 = {}
    local v7 = tbl1
    for _, v8 in ipairs(tbl) do
        if (FarmController.FailCounts[v8.Uid] or 0) < 2 then
            table.insert(tbl1, v8)
        end
    end
    if #tbl1 == 0 then
        FarmController.FailCounts = {}
        v7 = tbl
    end
    local function func(arg1)
        if #arg1 == 0 then
            return nil
        end
        local v1 = arg1[1]
        for i = 2, #arg1 do
            local v2 = arg1[i]
            if v2.RarityNum > v1.RarityNum then
                v1 = v2
            elseif v2.RarityNum == v1.RarityNum and tostring(v2.Uid) < tostring(v1.Uid) then
                v1 = v2
            end
        end
        return v1
    end
    if #FarmController.SpecificEggNames > 0 then
        local tbl2 = {}
        for _, v9 in ipairs(FarmController.SpecificEggNames) do
            if type(v9) == "string" then
                tbl2[v9] = true
            end
        end
        local tbl3 = {}
        for _, v10 in ipairs(v7) do
            if tbl2[v10.Record.AssetCategory] then
                table.insert(tbl3, v10)
            end
        end
        if #tbl3 > 0 then
            return (func(tbl3))
        end
    end
    if #FarmController.SelectedRarities > 0 then
        local tbl4 = {}
        for _, v11 in ipairs(FarmController.SelectedRarities) do
            if type(v11) == "string" then
                tbl4[v11] = true
            end
        end
        local tbl5 = {}
        for _, v12 in ipairs(v7) do
            if tbl4[MystrixHub.Functions.Farm_GetRarityName(v12.Record.AssetCategory, v4)] then
                table.insert(tbl5, v12)
            end
        end
        if #tbl5 > 0 then
            return (func(tbl5))
        end
    end
    if #FarmController.SelectedAreas > 0 then
        local tbl6 = {}
        for _, v13 in ipairs(FarmController.SelectedAreas) do
            if type(v13) == "string" then
                tbl6[v13] = true
            end
        end
        local tbl7 = {}
        for _, v14 in ipairs(v7) do
            local AreaId = v14.Record.AreaId
            local v15 = FarmController.AreasNameById[AreaId] or AreaId
            if v15 and tbl6[v15] then
                table.insert(tbl7, v14)
            end
        end
        if #tbl7 > 0 then
            return (func(tbl7))
        end
    end
    return nil
end
v6.Functions.Farm_StealEgg = function(arg1)
    if not arg1 or not arg1.Uid then
        return false
    end
    local FarmController = MystrixHub.FarmController
    FarmController.FailCounts = FarmController.FailCounts or {}
    local v1 = MystrixHub.Functions.Farm_GetEggCmds()
    if not v1 then
        return false
    end
    local v2, v3 = pcall(
        function()
            return v1.GetAreaEggSnapshot()
        end
    )
    if not v2 or type(v3) ~= "table" then
        return false
    end
    local v7
    local flag = false
    for _, v4 in ipairs(v3.Records) do
        if v4.Uid == arg1.Uid then
            if v4.CarrierUserId == nil and (v4.State == "Slot" or v4.State == "Dropped") then
                flag = true
                if v4.BottomCFrame then
                    local v5, v6 = pcall(
                        function()
                            return v4.BottomCFrame.Position
                        end
                    )
                    if v5 and v6 then
                        v7 = v6
                    end
                end
            end
            break
        end
    end
    if not flag then
        FarmController.FailCounts[arg1.Uid] = 999
        return false
    end
    if not v7 then
        local v8 = MystrixHub.Functions.Farm_FindEggModel(arg1.Uid)
        if v8 then
            local v9, v10 = pcall(
                function()
                    return v8:GetPivot().Position
                end
            )
            if v9 and v10 then
                v7 = v10
            end
        end
    end
    if not v7 then
        return false
    end
    FarmController.LastTargetUid = arg1.Uid
    MystrixHub.Functions.Farm_Teleport(v7 + Vector3.new(0, 2, 0))
    pcall(
        function()
            v1.RequestCarryAreaEgg(arg1.Uid)
        end
    )
    local v11 = MystrixHub.Functions.Farm_FindEggModel(arg1.Uid)
    if v11 and fireproximityprompt then
        local CarryAreaEgg = v11:FindFirstChild("CarryAreaEgg", true)
        if CarryAreaEgg and CarryAreaEgg:IsA("ProximityPrompt") then
            pcall(fireproximityprompt, CarryAreaEgg)
        end
    end
    local v12 = tick() + 1
    while tick() < v12 do
        if MystrixHub.Functions.Farm_IsCarrying() then
            FarmController.FailCounts[arg1.Uid] = nil
            return true
        end
        task.wait(0.03)
    end
    MystrixHub.Functions.Farm_Teleport(v7 + Vector3.new(0, 2, 0))
    pcall(
        function()
            v1.RequestCarryAreaEgg(arg1.Uid)
        end
    )
    if v11 and fireproximityprompt then
        local CarryAreaEgg1 = v11:FindFirstChild("CarryAreaEgg", true)
        if CarryAreaEgg1 and CarryAreaEgg1:IsA("ProximityPrompt") then
            pcall(fireproximityprompt, CarryAreaEgg1)
        end
    end
    local v13 = tick() + 0.5
    while tick() < v13 do
        if MystrixHub.Functions.Farm_IsCarrying() then
            FarmController.FailCounts[arg1.Uid] = nil
            return true
        end
        task.wait(0.03)
    end
    if not MystrixHub.Functions.Farm_IsCarrying() then
        FarmController.FailCounts[arg1.Uid] = (FarmController.FailCounts[arg1.Uid] or 0) + 1
    end
    return MystrixHub.Functions.Farm_IsCarrying()
end
v6.Functions.Farm_ReturnToBase = function()
    local v1 = MystrixHub.Functions.Farm_GetPlotCmds()
    if not v1 then
        return false
    end
    local v2, v3 = pcall(
        function()
            return v1.GetPlotData()
        end
    )
    if not v2 or type(v3) ~= "table" then
        return false
    end
    local Position
    if v3.PetArea and v3.PetArea.Position then
        Position = v3.PetArea.Position
    elseif v3.CenterPoint and v3.CenterPoint.CFrame then
        Position = v3.CenterPoint.CFrame.Position
    elseif v3.CenterPoint and v3.CenterPoint.Position then
        Position = v3.CenterPoint.Position
    end
    if not Position then
        return false
    end
    MystrixHub.Functions.Farm_Teleport(Position + Vector3.new(0, 5, 0))
    task.wait(0.03)
    if MystrixHub.Functions.Farm_IsCarrying() then
        MystrixHub.Functions.Farm_Teleport(Position + Vector3.new(0, 5, 0))
    end
    return true
end
v6.Functions.Farm_WaitClaim = function()
    local v1 = tick() + 2.5
    while tick() < v1 do
        if not MystrixHub.Functions.Farm_IsCarrying() then
            return true
        end
        task.wait(0.03)
    end
    return not MystrixHub.Functions.Farm_IsCarrying()
end
v6.Functions.Farm_RunOnce = function()
    if not MystrixHub.FarmController.Enabled then
        return false, "disabled"
    end
    if MystrixHub.Functions.Farm_IsCarrying() then
        local v1 = MystrixHub
        v1.Functions.Farm_ReturnToBase()
        v1.Functions.Farm_WaitClaim()
        return true, "claimed"
    end
    local v2 = MystrixHub.Functions.Farm_FindBestTarget()
    if not v2 then
        return false, "no target"
    end
    if MystrixHub.Functions.Farm_StealEgg(v2.Record) then
        local v3 = MystrixHub
        v3.Functions.Farm_ReturnToBase()
        v3.Functions.Farm_WaitClaim()
        return true, "stolen"
    end
    return false, "steal failed"
end
v6.Functions.StartAutoFarm = function()
    local FarmController = MystrixHub.FarmController
    if FarmController.Running then
        return
    end
    FarmController.FailCounts = {}
    FarmController.Enabled = true
    FarmController.Running = true
    FarmController.Loop = task.spawn(
        function()
            while FarmController.Enabled do
                local v1, v2 = pcall(MystrixHub.Functions.Farm_RunOnce)
                if not v1 then
                    task.wait(0.2)
                elseif v2 == false then
                    task.wait(0.1)
                end
                task.wait(0.03)
            end
            FarmController.Running = false
        end
    )
    MystrixHub.TasksController.Insert(FarmController.Loop)
end
v6.Functions.StopAutoFarm = function()
    local FarmController = MystrixHub.FarmController
    FarmController.Enabled = false
    FarmController.Running = false
    FarmController.FailCounts = {}
    FarmController.LastTargetUid = nil
    if FarmController.Loop then
        task.cancel(FarmController.Loop)
        FarmController.Loop = nil
    end
end
v6.Functions.Sell_LoadDeps = function()
    local Deps = MystrixHub.SellController.Deps
    if Deps.Save and Deps.Network and Deps.EggItemUtil and Deps.AssetItemSerialization and Deps.GetPriceValueForItem then
        return Deps
    end
    local Library = game:GetService("ReplicatedStorage"):FindFirstChild("Library")
    local v1 = Library and Library:FindFirstChild("Client")
    local v2 = Library and Library:FindFirstChild("Util")
    if not Deps.Save and v1 then
        local Save = v1:FindFirstChild("Save")
        if Save and Save:IsA("ModuleScript") then
            local v3, v4 = pcall(require, Save)
            if v3 and type(v4) == "table" and type(v4.Get) == "function" then
                Deps.Save = v4
            end
        end
    end
    if not Deps.Network and v1 then
        local Network = v1:FindFirstChild("Network")
        if Network and Network:IsA("ModuleScript") then
            local v5, v6 = pcall(require, Network)
            if v5 and type(v6) == "table" then
                Deps.Network = v6
            end
        end
    end
    if not Deps.EggItemUtil and v2 then
        local EggItemUtil = v2:FindFirstChild("EggItemUtil")
        if EggItemUtil and EggItemUtil:IsA("ModuleScript") then
            local v7, v8 = pcall(require, EggItemUtil)
            if v7 and type(v8) == "table" then
                Deps.EggItemUtil = v8
            end
        end
    end
    if not Deps.AssetItemSerialization and v2 then
        local AssetItemSerialization = v2:FindFirstChild("AssetItemSerialization")
        if AssetItemSerialization and AssetItemSerialization:IsA("ModuleScript") then
            local v9, v10 = pcall(require, AssetItemSerialization)
            if v9 and type(v10) == "table" then
                Deps.AssetItemSerialization = v10
            end
        end
    end
    if not Deps.GetPriceValueForItem and v2 then
        local GetPriceValueForItem = v2:FindFirstChild("GetPriceValueForItem")
        if GetPriceValueForItem and GetPriceValueForItem:IsA("ModuleScript") then
            local v11, v12 = pcall(require, GetPriceValueForItem)
            if v11 and type(v12) == "function" then
                Deps.GetPriceValueForItem = v12
            end
        end
    end
    return Deps
end
v6.Functions.Sell_GetSellableEggs = function()
    local v1 = MystrixHub.Functions.Sell_LoadDeps()
    if not v1.Save or not v1.EggItemUtil then
        return {}
    end
    local v2, v3 = pcall(
        function()
            return v1.Save.Get()
        end
    )
    if not v2 or type(v3) ~= "table" then
        return {}
    end
    local v4 = v3.EggInventory or {}
    local v5 = MystrixHub.Functions.Farm_GetAssets()
    local tbl = {}
    for k, v6 in pairs(v4) do
        if type(v6) == "table" and v6.Placement == nil then
            local v7, v8 = pcall(
                function()
                    return v1.EggItemUtil.DeserializeSavedEgg(v6)
                end
            )
            if v7 and type(v8) == "table" then
                local AssetCategory = v8.AssetCategory
                local v9, v10 = pcall(
                    function()
                        return v1.EggItemUtil.GetSellPrice(v8)
                    end
                )
                local str = "Unknown"
                local num = 0
                if v5 and v5.Directory[AssetCategory] then
                    local Rarity = v5.Directory[AssetCategory].Rarity
                    if type(Rarity) == "table" then
                        str = Rarity.DisplayName or Rarity._id or Rarity.Name or "Unknown"
                        num = tonumber(Rarity.RarityNumber) or 0
                    end
                end
                table.insert(
                    tbl,
                    {
                        uid = k, category = AssetCategory, price = v9 and math.floor(v10) or 0,
                        rarity = str, rarityNum = num,
                    }
                )
            end
        end
    end
    return tbl
end
v6.Functions.Sell_GetSellablePets = function()
    local v1 = MystrixHub.Functions.Sell_LoadDeps()
    if not v1.Save or not v1.AssetItemSerialization or not v1.GetPriceValueForItem then
        return {}
    end
    local v2, v3 = pcall(
        function()
            return v1.Save.Get()
        end
    )
    if not v2 or type(v3) ~= "table" then
        return {}
    end
    local v4 = v3.Inventory or {}
    local v5 = v3.EquippedAssets or {}
    local v6 = v3.FavoriteAssets or {}
    local v7 = MystrixHub.Functions.Farm_GetAssets()
    local v8 = LocalPlayer:GetAttribute("VIP") and 2 or 1
    local tbl = {}
    for k, v9 in pairs(v4) do
        if type(v9) == "table" then
            if not table.find(v5, k) and not v6[k] then
                local v10, v11 = pcall(
                    function()
                        return v1.AssetItemSerialization.Deserialize(v9)
                    end
                )
                if v10 and type(v11) == "table" then
                    if not v11.IsFavorite and not v11.InFuse then
                        local Category = v11.Category
                        local v12, v13 = pcall(
                            function()
                                return v1.GetPriceValueForItem(v9) * 1.33 * v8
                            end
                        )
                        local str = "Unknown"
                        local num = 0
                        if v7 and v7.Directory[Category] then
                            local Rarity = v7.Directory[Category].Rarity
                            if type(Rarity) == "table" then
                                str = Rarity.DisplayName or Rarity._id or Rarity.Name or "Unknown"
                                num = tonumber(Rarity.RarityNumber) or 0
                            end
                        end
                        table.insert(
                            tbl,
                            {uid = k, category = Category, price = v12 and math.floor(v13) or 0, rarity = str, rarityNum = num}
                        )
                    end
                end
            end
        end
    end
    return tbl
end
v6.Functions.Sell_GetAllEggCategories = function()
    local v1 = MystrixHub.Functions.Farm_GetAssets()
    if not v1 then
        return {}, {}
    end
    local tbl = {}
    for k, v2 in pairs(v1.Directory) do
        if type(k) == "string" and type(v2) == "table" and v2.Egg ~= nil and type(v2.Rarity) == "table" then
            local num = tonumber(v2.Rarity.RarityNumber)
            table.insert(
                tbl,
                {
                    name = k,
                    rarity = v2.Rarity.DisplayName or v2.Rarity._id or v2.Rarity.Name or "Unknown",
                    rarityNum = num or 0,
                }
            )
        end
    end
    table.sort(
        tbl,
        function(arg1, arg2)
            if arg1.rarityNum ~= arg2.rarityNum then
                return arg1.rarityNum > arg2.rarityNum
            end
            return arg1.name < arg2.name
        end
    )
    local tbl1 = {}
    local tbl2 = {}
    for _, v3 in ipairs(tbl) do
        local v4 = "[" .. v3.rarity .. "] " .. v3.name
        table.insert(tbl1, v4)
        tbl2[v4] = v3.name
    end
    return tbl1, tbl2
end
v6.Functions.Sell_GetAllPetCategories = function()
    local v1 = MystrixHub.Functions.Farm_GetAssets()
    if not v1 then
        return {}, {}
    end
    local tbl = {}
    for k, v2 in pairs(v1.Directory) do
        if type(k) == "string" and type(v2) == "table" and v2.Egg == nil and type(v2.Rarity) == "table" then
            if v2.DisplayName ~= nil or v2.Icon ~= nil then
                local num = tonumber(v2.Rarity.RarityNumber)
                table.insert(
                    tbl,
                    {
                        name = k,
                        rarity = v2.Rarity.DisplayName or v2.Rarity._id or v2.Rarity.Name or "Unknown",
                        rarityNum = num or 0,
                    }
                )
            end
        end
    end
    table.sort(
        tbl,
        function(arg1, arg2)
            if arg1.rarityNum ~= arg2.rarityNum then
                return arg1.rarityNum > arg2.rarityNum
            end
            return arg1.name < arg2.name
        end
    )
    local tbl1 = {}
    local tbl2 = {}
    for _, v3 in ipairs(tbl) do
        local v4 = "[" .. v3.rarity .. "] " .. v3.name
        table.insert(tbl1, v4)
        tbl2[v4] = v3.name
    end
    return tbl1, tbl2
end
v6.Functions.Sell_FilterByCategories = function(arg1, arg2)
    if not arg1 or #arg1 == 0 then
        return {}
    end
    if not arg2 or #arg2 == 0 then
        return {}
    end
    local tbl = {}
    for _, v1 in ipairs(arg2) do
        if type(v1) == "string" then
            local v2 = v1:match("^%[[^%]]+%]%s*(.+)$")
            if v2 and v2 ~= "" then
                tbl[v2] = true
            end
        end
    end
    local tbl1 = {}
    for _, v3 in ipairs(arg1) do
        if tbl[v3.category] then
            table.insert(tbl1, v3)
        end
    end
    return tbl1
end
v6.Functions.Sell_Items = function(arg1, arg2)
    if not arg1 or #arg1 == 0 then
        return false
    end
    local v1 = MystrixHub.Functions.Sell_LoadDeps()
    if not v1.Network then
        return false
    end
    local Network = v1.Network
    if not Network.NET_MAP or not Network.NET_MAP.AssetInventory then
        return false
    end
    local AssetInventory = Network.NET_MAP.AssetInventory
    if arg2 == "Pet" then
        pcall(
            function()
                Network.Fire(AssetInventory.SELL_ALL_ASSETS, arg1)
            end
        )
    else
        for _, v2 in ipairs(arg1) do
            pcall(
                function()
                    Network.Fire(AssetInventory.SELL_ASSET, v2)
                end
            )
        end
    end
    return true
end
v6.Functions.Sell_SafeSell = function(arg1, arg2)
    if not arg1 or #arg1 == 0 then
        return false
    end
    return MystrixHub.Functions.Sell_Items(arg1, arg2)
end
v6.Functions.Sell_GetHeldItem = function()
    local Character = LocalPlayer.Character
    if not Character then
        return nil
    end
    local Tool = Character:FindFirstChildOfClass("Tool")
    if not Tool then
        return nil
    end
    local Attribute = Tool:GetAttribute("ItemType")
    local Attribute1 = Tool:GetAttribute("UID")
    if not Attribute1 then
        return nil
    end
    if Attribute == "AssetEgg" then
        return {uid = Attribute1, mode = "Egg"}
    end
    if Attribute == "Asset" then
        return {uid = Attribute1, mode = "Pet"}
    end
    return nil
end
v6.Functions.Sell_HeldEgg = function()
    local v1 = MystrixHub.Functions.Sell_GetHeldItem()
    if not v1 or v1.mode ~= "Egg" then
        return false, "no held egg"
    end
    local Character = LocalPlayer.Character
    local v2 = Character and Character:FindFirstChildOfClass("Humanoid")
    if v2 then
        pcall(
            function()
                v2:UnequipTools()
            end
        )
    end
    task.wait(0.15)
    return MystrixHub.Functions.Sell_SafeSell({v1.uid}, "Egg")
end
v6.Functions.Sell_HeldPet = function()
    local v1 = MystrixHub.Functions.Sell_GetHeldItem()
    if not v1 or v1.mode ~= "Pet" then
        return false, "no held pet"
    end
    local Character = LocalPlayer.Character
    local v2 = Character and Character:FindFirstChildOfClass("Humanoid")
    if v2 then
        pcall(
            function()
                v2:UnequipTools()
            end
        )
    end
    task.wait(0.15)
    return MystrixHub.Functions.Sell_SafeSell({v1.uid}, "Pet")
end
v6.Functions.Sell_AllEggs = function()
    local v1 = MystrixHub.Functions.Sell_GetSellableEggs()
    if #v1 == 0 then
        return 0
    end
    local tbl = {}
    for _, v2 in ipairs(v1) do
        table.insert(tbl, v2.uid)
    end
    MystrixHub.Functions.Sell_SafeSell(tbl, "Egg")
    return #tbl
end
v6.Functions.Sell_AllPets = function()
    local v1 = MystrixHub.Functions.Sell_GetSellablePets()
    if #v1 == 0 then
        return 0
    end
    local tbl = {}
    for _, v2 in ipairs(v1) do
        table.insert(tbl, v2.uid)
    end
    MystrixHub.Functions.Sell_SafeSell(tbl, "Pet")
    return #tbl
end
v6.Functions.Sell_SelectedEggs = function()
    local SelectedEggCategories = MystrixHub.SellController.SelectedEggCategories
    if not SelectedEggCategories or #SelectedEggCategories == 0 then
        return 0
    end
    local v1 = MystrixHub
    local v2 = v1.Functions.Sell_GetSellableEggs()
    local v3 = v1.Functions.Sell_FilterByCategories(v2, SelectedEggCategories)
    if #v3 == 0 then
        return 0
    end
    local tbl = {}
    for _, v4 in ipairs(v3) do
        table.insert(tbl, v4.uid)
    end
    MystrixHub.Functions.Sell_SafeSell(tbl, "Egg")
    return #tbl
end
v6.Functions.Sell_SelectedPets = function()
    local SelectedPetCategories = MystrixHub.SellController.SelectedPetCategories
    if not SelectedPetCategories or #SelectedPetCategories == 0 then
        return 0
    end
    local v1 = MystrixHub
    local v2 = v1.Functions.Sell_GetSellablePets()
    local v3 = v1.Functions.Sell_FilterByCategories(v2, SelectedPetCategories)
    if #v3 == 0 then
        return 0
    end
    local tbl = {}
    for _, v4 in ipairs(v3) do
        table.insert(tbl, v4.uid)
    end
    MystrixHub.Functions.Sell_SafeSell(tbl, "Pet")
    return #tbl
end
v6.Functions.Sell_StartAutoEggs = function()
    local SellController = MystrixHub.SellController
    if SellController.AutoEggsLoop then
        return
    end
    SellController.AutoEggsRunning = true
    SellController.AutoEggsLoop = task.spawn(
        function()
            while SellController.AutoEggsRunning do
                local SelectedEggCategories = SellController.SelectedEggCategories
                if SelectedEggCategories and #SelectedEggCategories > 0 then
                    local v1 = MystrixHub
                    local v2 = v1.Functions.Sell_GetSellableEggs()
                    local v3 = v1.Functions.Sell_FilterByCategories(v2, SelectedEggCategories)
                    if #v3 > 0 then
                        local tbl = {}
                        for _, v4 in ipairs(v3) do
                            table.insert(tbl, v4.uid)
                        end
                        MystrixHub.Functions.Sell_Items(tbl, "Egg")
                    end
                end
                task.wait(1)
            end
            SellController.AutoEggsLoop = nil
            SellController.AutoEggsRunning = false
        end
    )
    MystrixHub.TasksController.Insert(SellController.AutoEggsLoop)
end
v6.Functions.Sell_StopAutoEggs = function()
    local SellController = MystrixHub.SellController
    SellController.AutoEggsRunning = false
    if SellController.AutoEggsLoop then
        task.cancel(SellController.AutoEggsLoop)
        SellController.AutoEggsLoop = nil
    end
end
v6.Functions.Sell_StartAutoPets = function()
    local SellController = MystrixHub.SellController
    if SellController.AutoPetsLoop then
        return
    end
    SellController.AutoPetsRunning = true
    SellController.AutoPetsLoop = task.spawn(
        function()
            while SellController.AutoPetsRunning do
                local SelectedPetCategories = SellController.SelectedPetCategories
                if SelectedPetCategories and #SelectedPetCategories > 0 then
                    local v1 = MystrixHub
                    local v2 = v1.Functions.Sell_GetSellablePets()
                    local v3 = v1.Functions.Sell_FilterByCategories(v2, SelectedPetCategories)
                    if #v3 > 0 then
                        local tbl = {}
                        for _, v4 in ipairs(v3) do
                            table.insert(tbl, v4.uid)
                        end
                        MystrixHub.Functions.Sell_Items(tbl, "Pet")
                    end
                end
                task.wait(1)
            end
            SellController.AutoPetsLoop = nil
            SellController.AutoPetsRunning = false
        end
    )
    MystrixHub.TasksController.Insert(SellController.AutoPetsLoop)
end
v6.Functions.Sell_StopAutoPets = function()
    local SellController = MystrixHub.SellController
    SellController.AutoPetsRunning = false
    if SellController.AutoPetsLoop then
        task.cancel(SellController.AutoPetsLoop)
        SellController.AutoPetsLoop = nil
    end
end
v6.Functions.Shop_GetSaveModule = function()
    local Library = game:GetService("ReplicatedStorage"):FindFirstChild("Library")
    local v1 = Library and Library:FindFirstChild("Client")
    local v2 = v1 and v1:FindFirstChild("Save")
    if not v2 or not v2:IsA("ModuleScript") then
        return nil
    end
    local v3, v4 = pcall(require, v2)
    if v3 and type(v4) == "table" and type(v4.Get) == "function" then
        return v4
    end
    return nil
end
v6.Functions.Shop_GetNetworkModule = function()
    local Library = game:GetService("ReplicatedStorage"):FindFirstChild("Library")
    local v1 = Library and Library:FindFirstChild("Client")
    local v2 = v1 and v1:FindFirstChild("Network")
    if not v2 or not v2:IsA("ModuleScript") then
        return nil
    end
    local v3, v4 = pcall(require, v2)
    if v3 and type(v4) == "table" then
        return v4
    end
    return nil
end
v6.Functions.Shop_GetTrailsData = function()
    local Directory = game:GetService("ReplicatedStorage"):FindFirstChild("Directory")
    local v1 = Directory and Directory:FindFirstChild("Trails")
    if not v1 or not v1:IsA("ModuleScript") then
        return nil
    end
    local v2, v3 = pcall(require, v1)
    if v2 and type(v3) == "table" and type(v3.Directory) == "table" then
        return v3
    end
    return nil
end
v6.Functions.Shop_GetBikeCatalog = function()
    local OurBikeSystem = game:GetService("ReplicatedStorage"):FindFirstChild("OurBikeSystem")
    if not OurBikeSystem then
        return nil
    end
    local v1 = OurBikeSystem:FindFirstChild("Catalog") or OurBikeSystem:WaitForChild("Catalog", 5)
    if not v1 or not v1:IsA("ModuleScript") then
        return nil
    end
    local v2, v3 = pcall(require, v1)
    if v2 and type(v3) == "table" and #v3 > 0 then
        return v3
    end
    return nil
end
v6.Functions.Shop_GetBikeShopRequest = function()
    local OurBikeSystem = game:GetService("ReplicatedStorage"):FindFirstChild("OurBikeSystem")
    if not OurBikeSystem then
        return nil
    end
    local v1 = OurBikeSystem:FindFirstChild("ShopRequest") or OurBikeSystem:WaitForChild(
        "ShopRequest", 5
    )
    if v1 and v1:IsA("RemoteFunction") then
        return v1
    end
    return nil
end
v6.Functions.Shop_GetBaseUpgradeClient = function()
    local Library = game:GetService("ReplicatedStorage"):FindFirstChild("Library")
    local v1 = Library and Library:FindFirstChild("Client")
    local v2 = v1 and v1:FindFirstChild("BaseUpgradeClient")
    if not v2 or not v2:IsA("ModuleScript") then
        return nil
    end
    local v3, v4 = pcall(require, v2)
    if v3 and type(v4) == "table" then
        return v4
    end
    return nil
end
v6.Functions.Shop_GetTreadmillClient = function()
    local PlayerScripts = LocalPlayer:FindFirstChild("PlayerScripts")
    local v1 = PlayerScripts and PlayerScripts:FindFirstChild("GUI")
    local v2 = v1 and v1:FindFirstChild("TreadmillUpgrade")
    local v3 = v2 and v2:FindFirstChild("Client")
    if not v3 or not v3:IsA("ModuleScript") then
        return nil
    end
    local v4, v5 = pcall(require, v3)
    if v4 and type(v5) == "table" then
        return v5
    end
    return nil
end
v6.Functions.Shop_WaitSaveLoaded = function()
    local v1 = MystrixHub.Functions.Shop_GetSaveModule()
    if not v1 then
        return false
    end
    if type(v1.IsLocalDataLoaded) == "function" then
        local v2, v3 = pcall(
            function()
                return v1.IsLocalDataLoaded()
            end
        )
        if v2 and not v3 then
            if v1.LoadedStats then
                pcall(
                    function()
                        v1.LoadedStats:Wait()
                    end
                )
            end
        end
    end
    return true
end
v6.Functions.Shop_BuyBestTrail = function()
    local v1 = MystrixHub
    local v2 = v1.Functions.Shop_GetTrailsData()
    local v3 = v1.Functions.Shop_GetSaveModule()
    local v4 = v1.Functions.Shop_GetNetworkModule()
    if not v2 or not v3 or not v4 then
        return false, "missing"
    end
    if not v4.NET_MAP or not v4.NET_MAP.Trails then
        return false, "no netmap"
    end
    local v5, v6 = pcall(
        function()
            return v3.Get()
        end
    )
    if not v5 or type(v6) ~= "table" then
        return false, "no save"
    end
    local v7 = tonumber(v6.Money) or 0
    local v8 = v6.TrailInventory or {}
    local EquippedTrail = v6.EquippedTrail
    local num = 0
    local v11
    for k, v9 in pairs(v8) do
        if v9 and v2.Directory[k] then
            local v10 = tonumber(v2.Directory[k].SpeedMultiplier) or 1
            if v10 > num then
                num = v10
                v11 = k
            end
        end
    end
    local tbl
    local v12 = num
    for k1, v13 in pairs(v2.Directory) do
        if type(k1) == "string" and type(v13) == "table" then
            if v13.DisplayInShop and not v13.RobuxOnly then
                if not v8[k1] then
                    local v14 = tonumber(v13.Price) or 0
                    local v15 = tonumber(v13.SpeedMultiplier) or 1
                    if v14 > 0 and v14 <= v7 and v15 > v12 then
                        v12 = v15
                        tbl = {Id = k1, Data = v13, Speed = v15}
                    end
                end
            end
        end
    end
    local Trails = v4.NET_MAP.Trails
    if tbl then
        pcall(
            function()
                v4.Invoke(Trails.REQUEST_PURCHASE, tbl.Id)
            end
        )
        task.wait(0.35)
        pcall(
            function()
                v4.Invoke(Trails.REQUEST_SELECT, tbl.Id)
            end
        )
        return true, "bought " .. tbl.Id
    end
    if v11 and EquippedTrail ~= v11 then
        pcall(
            function()
                v4.Invoke(Trails.REQUEST_SELECT, v11)
            end
        )
        return true, "equipped " .. v11
    end
    return false, "up to date"
end
v6.Functions.Shop_BuyBestBike = function()
    local v1 = MystrixHub
    local v2 = v1.Functions.Shop_GetBikeCatalog()
    local v3 = v1.Functions.Shop_GetBikeShopRequest()
    local v4 = v1.Functions.Shop_GetSaveModule()
    if not v2 or not v3 then
        return false, "missing"
    end
    local num = 0
    if v4 then
        local v5, v6 = pcall(
            function()
                return v4.Get()
            end
        )
        if v5 and type(v6) == "table" then
            num = tonumber(v6.Money) or 0
        end
    end
    local v7, v8 = pcall(
        function()
            return v3:InvokeServer("State")
        end
    )
    if not v7 or type(v8) ~= "table" then
        return false, "state failed"
    end
    local v9 = v8.Owned or {}
    local v10 = v8.Equipped or "Bicycle"
    if type(v8.Money) == "number" and v8.Money > num then
        num = v8.Money
    end
    local tbl = {}
    for _, v11 in ipairs(v2) do
        if type(v11) == "table" and type(v11.Id) == "string" then
            if not v11.AdminOnly and not v11.RobuxOnly then
                table.insert(tbl, v11)
            end
        end
    end
    if #tbl == 0 then
        return false, "no cash bikes"
    end
    table.sort(
        tbl,
        function(arg1, arg2)
            return (tonumber(arg1.SpeedMultiplier) or 1) > (tonumber(arg2.SpeedMultiplier) or 1)
        end
    )
    local num1 = 1
    for _, v12 in ipairs(tbl) do
        if v9[v12.Id] == true then
            local v13 = tonumber(v12.SpeedMultiplier) or 1
            if v13 > num1 then
                num1 = v13
            end
        end
    end
    for _, v14 in ipairs(tbl) do
        local v15 = tonumber(v14.SpeedMultiplier) or 1
        local v16 = tonumber(v14.Price) or 0
        if v9[v14.Id] ~= true and v15 > num1 and v16 > 0 and v16 <= num then
            local v17, v18 = pcall(
                function()
                    return v3:InvokeServer("Buy", v14.Id)
                end
            )
            if v17 and type(v18) == "table" and v18.Ok then
                WindUI:Notify(
                    {Title = "Bike Shop", Content = "Bought: " .. v14.Id, Duration = 3, Icon = "circle-check"}
                )
                return true, "bought " .. v14.Id
            end
            task.wait(0.2)
        end
    end
    local Id
    local num2 = 1
    for _, v19 in ipairs(tbl) do
        if v9[v19.Id] == true then
            local v20 = tonumber(v19.SpeedMultiplier) or 1
            if v20 > num2 then
                num2 = v20
                Id = v19.Id
            end
        end
    end
    if Id and v10 ~= Id then
        if pcall(
            function()
                return v3:InvokeServer("Equip", Id)
            end
        ) then
            return true, "equipped " .. Id
        end
    end
    return false, "up to date"
end
v6.Functions.Shop_UpgradeTreadmill = function()
    local v1 = MystrixHub
    local v2 = v1.Functions.Shop_GetTreadmillClient()
    local v3 = v1.Functions.Shop_GetSaveModule()
    if not v2 or not v3 then
        return false, "missing"
    end
    local v4, v5 = pcall(
        function()
            return v3.Get()
        end
    )
    if not v4 or type(v5) ~= "table" then
        return false, "no save"
    end
    local flag = false
    pcall(
        function()
            flag = v2.CanAffordNext(v5)
        end
    )
    if not flag then
        return false, "cannot afford or max"
    end
    if pcall(
        function()
            v2.RequestCashUpgrade()
        end
    ) then
        return true, "requested"
    end
    return false, "request failed"
end
v6.Functions.Shop_UpgradePlot = function()
    local v1 = MystrixHub
    local v2 = v1.Functions.Shop_GetBaseUpgradeClient()
    local v3 = v1.Functions.Shop_GetSaveModule()
    if not v2 or not v3 then
        return false, "missing"
    end
    local v4, v5 = pcall(
        function()
            return v3.Get()
        end
    )
    if not v4 or type(v5) ~= "table" then
        return false, "no save"
    end
    local flag = false
    pcall(
        function()
            flag = v2.CanAffordNext(v5)
        end
    )
    if not flag then
        return false, "cannot afford or max"
    end
    if pcall(
        function()
            v2.RequestCashUpgrade()
        end
    ) then
        return true, "requested"
    end
    return false, "request failed"
end
v6.Functions.Shop_StartAutoTrail = function()
    local ShopController = MystrixHub.ShopController
    if ShopController.AutoTrailLoop then
        return
    end
    ShopController.AutoTrailRunning = true
    local v1 = MystrixHub
    v1.Functions.Shop_WaitSaveLoaded()
    ShopController.AutoTrailLoop = task.spawn(
        function()
            while ShopController.AutoTrailRunning do
                pcall(MystrixHub.Functions.Shop_BuyBestTrail)
                task.wait(3)
            end
            ShopController.AutoTrailLoop = nil
            ShopController.AutoTrailRunning = false
        end
    )
    v1.TasksController.Insert(ShopController.AutoTrailLoop)
end
v6.Functions.Shop_StopAutoTrail = function()
    local ShopController = MystrixHub.ShopController
    ShopController.AutoTrailRunning = false
    if ShopController.AutoTrailLoop then
        task.cancel(ShopController.AutoTrailLoop)
        ShopController.AutoTrailLoop = nil
    end
end
v6.Functions.Shop_StartAutoBike = function()
    local ShopController = MystrixHub.ShopController
    if ShopController.AutoBikeLoop then
        return
    end
    ShopController.AutoBikeRunning = true
    ShopController.AutoBikeLoop = task.spawn(
        function()
            while ShopController.AutoBikeRunning do
                pcall(MystrixHub.Functions.Shop_BuyBestBike)
                task.wait(3)
            end
            ShopController.AutoBikeLoop = nil
            ShopController.AutoBikeRunning = false
        end
    )
    MystrixHub.TasksController.Insert(ShopController.AutoBikeLoop)
end
v6.Functions.Shop_StopAutoBike = function()
    local ShopController = MystrixHub.ShopController
    ShopController.AutoBikeRunning = false
    if ShopController.AutoBikeLoop then
        task.cancel(ShopController.AutoBikeLoop)
        ShopController.AutoBikeLoop = nil
    end
end
v6.Functions.Shop_StartAutoTreadmill = function()
    local ShopController = MystrixHub.ShopController
    if ShopController.AutoTreadmillLoop then
        return
    end
    ShopController.AutoTreadmillRunning = true
    local v1 = MystrixHub
    v1.Functions.Shop_WaitSaveLoaded()
    ShopController.AutoTreadmillLoop = task.spawn(
        function()
            while ShopController.AutoTreadmillRunning do
                local v1, v2 = pcall(MystrixHub.Functions.Shop_UpgradeTreadmill)
                if v1 and v2 == false then
                    task.wait(3)
                else
                    task.wait(2)
                end
            end
            ShopController.AutoTreadmillLoop = nil
            ShopController.AutoTreadmillRunning = false
        end
    )
    v1.TasksController.Insert(ShopController.AutoTreadmillLoop)
end
v6.Functions.Shop_StopAutoTreadmill = function()
    local ShopController = MystrixHub.ShopController
    ShopController.AutoTreadmillRunning = false
    if ShopController.AutoTreadmillLoop then
        task.cancel(ShopController.AutoTreadmillLoop)
        ShopController.AutoTreadmillLoop = nil
    end
end
v6.Functions.Shop_StartAutoPlot = function()
    local ShopController = MystrixHub.ShopController
    if ShopController.AutoPlotLoop then
        return
    end
    ShopController.AutoPlotRunning = true
    local v1 = MystrixHub
    v1.Functions.Shop_WaitSaveLoaded()
    ShopController.AutoPlotLoop = task.spawn(
        function()
            while ShopController.AutoPlotRunning do
                local v1, v2 = pcall(MystrixHub.Functions.Shop_UpgradePlot)
                if v1 and v2 == false then
                    task.wait(3)
                else
                    task.wait(2)
                end
            end
            ShopController.AutoPlotLoop = nil
            ShopController.AutoPlotRunning = false
        end
    )
    v1.TasksController.Insert(ShopController.AutoPlotLoop)
end
v6.Functions.Shop_StopAutoPlot = function()
    local ShopController = MystrixHub.ShopController
    ShopController.AutoPlotRunning = false
    if ShopController.AutoPlotLoop then
        task.cancel(ShopController.AutoPlotLoop)
        ShopController.AutoPlotLoop = nil
    end
end
v6.Functions.Plot_GetNetworkRemote = function(arg1)
    local Network = game:GetService("ReplicatedStorage"):FindFirstChild("Network")
    if not Network then
        return nil
    end
    local v1 = Network:FindFirstChild(arg1)
    if not v1 then
        return nil
    end
    if v1:IsA("RemoteFunction") or v1:IsA("RemoteEvent") then
        return v1
    end
    return nil
end
v6.Functions.Plot_GetPlacedEggRenderer = function()
    local Library = game:GetService("ReplicatedStorage"):FindFirstChild("Library")
    local v1 = Library and Library:FindFirstChild("Client")
    local v2 = v1 and v1:FindFirstChild("Eggs")
    local v3 = v2 and v2:FindFirstChild("PlacedEggRenderer")
    if not v3 or not v3:IsA("ModuleScript") then
        return nil
    end
    local v4, v5 = pcall(require, v3)
    if v4 and type(v5) == "table" and type(v5.ActivateLocalEgg) == "function" then
        return v5
    end
    return nil
end
v6.Functions.Plot_GetPolicyModule = function()
    local Library = game:GetService("ReplicatedStorage"):FindFirstChild("Library")
    local v1 = Library and Library:FindFirstChild("Client")
    local v2 = v1 and v1:FindFirstChild("Eggs")
    local v3 = v2 and v2:FindFirstChild("PlacedEggGrowthPresentationPolicy")
    if not v3 or not v3:IsA("ModuleScript") then
        return nil
    end
    local v4, v5 = pcall(require, v3)
    if v4 and type(v5) == "table" and type(v5.IsReady) == "function" then
        return v5
    end
    return nil
end
v6.Functions.Plot_GetEggsList = function()
    local tbl = {"All"}
    for _, v1 in ipairs(MystrixHub.Functions.Farm_GetEggsList()) do
        table.insert(tbl, v1)
    end
    return tbl
end
v6.Functions.Plot_GetEggsListForPlace = function()
    local tbl = {"Best"}
    for _, v1 in ipairs(MystrixHub.Functions.Farm_GetEggsList()) do
        table.insert(tbl, v1)
    end
    return tbl
end
v6.Functions.Plot_ParseSelection = function(arg1)
    local tbl = {}
    for _, v1 in ipairs(arg1 or {}) do
        if type(v1) == "string" then
            if v1 == "All" or v1 == "Best" then
                table.insert(tbl, v1)
            else
                local v2 = v1:match("^%[[^%]]+%]%s*(.+)$")
                if v2 and v2 ~= "" then
                    table.insert(tbl, v2)
                end
            end
        end
    end
    return tbl
end
v6.Functions.Plot_MatchesSelection = function(arg1, arg2)
    local v1 = MystrixHub.Functions.Plot_ParseSelection(arg2)
    if #v1 == 0 then
        return false
    end
    for _, v2 in ipairs(v1) do
        if v2 == "All" or v2 == "Best" then
            return true
        end
        if v2 == arg1 then
            return true
        end
    end
    return false
end
v6.Functions.Plot_GetEggTools = function()
    local tbl = {}
    local tbl1 = {}
    local Backpack = LocalPlayer:FindFirstChild("Backpack")
    for _, v1 in ipairs({Backpack, LocalPlayer.Character}) do
        if v1 then
            for _, v2 in ipairs(v1:GetChildren()) do
                if v2:IsA("Tool") and not tbl1[v2] then
                    local Attribute = v2:GetAttribute("ItemType")
                    local Attribute1 = v2:GetAttribute("UID")
                    if Attribute == "AssetEgg" and type(Attribute1) == "string" and Attribute1 ~= "" then
                        tbl1[v2] = true
                        table.insert(tbl, v2)
                    end
                end
            end
        end
    end
    return tbl
end
v6.Functions.Plot_GetEggToolCategory = function(arg1)
    if not arg1 then
        return nil
    end
    local Attribute = arg1:GetAttribute("EggVisualRecord")
    if type(Attribute) == "string" and Attribute ~= "" then
        local v1, v2 = pcall(
            function()
                return HttpService:JSONDecode(Attribute)
            end
        )
        if v1 and type(v2) == "table" and v2.AssetCategory then
            return v2.AssetCategory
        end
    end
    local v3 = arg1.Name:match("^([^%[]+)")
    return v3 and v3:match("^%s*(.-)%s*$")
end
v6.Functions.Plot_GetCategoryScore = function(arg1, arg2)
    local v1 = arg2 or MystrixHub.Functions.Farm_GetAssets()
    if not v1 or not v1.Directory[arg1] then
        return 0, 0
    end
    local Rarity = v1.Directory[arg1].Rarity
    if type(Rarity) ~= "table" then
        return 0, 0
    end
    return tonumber(Rarity.RarityNumber) or 0, tonumber(v1.Directory[arg1].Luck) or 0
end
v6.Functions.Plot_GetPlacedEggPositions = function(arg1)
    local tbl = {}
    local v1 = MystrixHub.Functions.Farm_GetEggCmds()
    if not v1 or not arg1 or not arg1.CenterPoint then
        return tbl
    end
    local v2, v3 = pcall(
        function()
            return v1.GetOwnerRuntimeRecords(LocalPlayer.UserId)
        end
    )
    if not v2 or type(v3) ~= "table" then
        return tbl
    end
    for _, v4 in pairs(v3) do
        if v4.Placement and v4.Placement.LocalCFrame then
            local LocalCFrame = v4.Placement.LocalCFrame
            if typeof(LocalCFrame) == "CFrame" then
                local Position = (arg1.CenterPoint.CFrame * LocalCFrame).Position
                table.insert(tbl, Vector3.new(Position.X, 0, Position.Z))
            end
        end
    end
    return tbl
end
v6.Functions.Plot_CountPlacedEggs = function()
    local v1 = MystrixHub.Functions.Farm_GetEggCmds()
    if not v1 then
        return 0
    end
    local v2, v3 = pcall(
        function()
            return v1.GetOwnerRuntimeRecords(LocalPlayer.UserId)
        end
    )
    if not v2 or type(v3) ~= "table" then
        return 0
    end
    local num = 0
    for _, v4 in pairs(v3) do
        if v4.Placement then
            num = num + 1
        end
    end
    return num
end
v6.Functions.Plot_GetFreePlacement = function(arg1)
    if not arg1 or not arg1.PetArea or not arg1.CenterPoint then
        return nil
    end
    local PetArea = arg1.PetArea
    if not PetArea:IsA("BasePart") then
        return nil
    end
    local v1 = MystrixHub.Functions.Plot_GetPlacedEggPositions(arg1)
    local Size = PetArea.Size
    local CFrame1 = PetArea.CFrame
    local v2 = math.max(math.floor((Size.X - 4) / 4), 1)
    local v3 = math.max(math.floor((Size.Z - 4) / 4), 1)
    for i = 0, v3 - 1 do
        for i1 = 0, v2 - 1 do
            local Position = (CFrame1 * CFrame.new(
                -((v2 - 1) * 4) / 2 + i1 * 4, Size.Y / 2, -((v3 - 1) * 4) / 2 + i * 4
            )).Position
            local flag = false
            for _, v4 in ipairs(v1) do
                local v5 = Position.X - v4.X
                local v6 = Position.Z - v4.Z
                if math.sqrt(v5 * v5 + v6 * v6) < 3.4 then
                    flag = true
                    break
                end
            end
            if not flag then
                return arg1.CenterPoint.CFrame:ToObjectSpace(CFrame.new(Position))
            end
        end
    end
    return nil
end
v6.Functions.Plot_PlaceEggTool = function(arg1, arg2)
    if not arg1 then
        return false, "no tool"
    end
    if not arg1.Parent then
        return false, "tool destroyed"
    end
    if not arg2 then
        return false, "no plot"
    end
    local Attribute = arg1:GetAttribute("UID")
    if type(Attribute) ~= "string" or Attribute == "" then
        return false, "bad uid"
    end
    local v1 = MystrixHub
    local v2 = v1.Functions.Plot_GetNetworkRemote("Eggs: RequestPlaceEgg")
    local v3 = v1.Functions.Plot_GetNetworkRemote("Eggs: RequestEquipTool")
    if not v2 then
        return false, "no place remote"
    end
    if not v3 then
        return false, "no equip remote"
    end
    local v4 = MystrixHub.Functions.Plot_GetFreePlacement(arg2)
    if not v4 then
        return false, "no space"
    end
    local Character = LocalPlayer.Character
    if not Character then
        return false, "no character"
    end
    local Humanoid = Character:FindFirstChildOfClass("Humanoid")
    if not Humanoid or Humanoid.Health <= 0 then
        return false, "no humanoid"
    end
    pcall(
        function()
            Humanoid:UnequipTools()
        end
    )
    task.wait(0.1)
    local v5, v6 = pcall(
        function()
            return v3:InvokeServer(Attribute)
        end
    )
    if not v5 then
        return false, "equip invoke error"
    end
    if v6 ~= true then
        return false, "equip rejected: " .. tostring(v6)
    end
    local v9
    local v7 = tick() + 2.5
    while tick() < v7 do
        for _, v8 in ipairs(Character:GetChildren()) do
            if v8:IsA("Tool") and v8:GetAttribute("ItemType") == "AssetEgg" and v8:GetAttribute(
                "UID"
            ) == Attribute then
                v9 = v8
                break
            end
        end
        if v9 then
            break
        end
        task.wait(0.05)
    end
    if not v9 then
        return false, "tool did not appear in character"
    end
    task.wait(0.2)
    local v10, v11 = pcall(
        function()
            return v2:InvokeServer({Uid = Attribute, LocalCFrame = v4})
        end
    )
    task.wait(0.15)
    if v9.Parent == Character then
        pcall(
            function()
                Humanoid:UnequipTools()
            end
        )
    end
    if not v10 then
        return false, "place invoke error"
    end
    if v11 ~= true then
        return false, "place rejected: " .. tostring(v11)
    end
    return true, "placed"
end
v6.Functions.Plot_EquipBestPets = function()
    local v1 = MystrixHub.Functions.Plot_GetNetworkRemote("Backpack: EquipBest")
    if not v1 then
        return false, "no EquipBest remote"
    end
    local v2, v3 = pcall(
        function()
            return v1:InvokeServer()
        end
    )
    if not v2 then
        return false, "invoke error"
    end
    if v3 ~= true then
        return false, "server rejected: " .. tostring(v3)
    end
    return true, "equipped"
end
v6.Functions.Plot_StartAutoPlaceBestPets = function()
    local PlotController = MystrixHub.PlotController
    if PlotController.AutoPlaceBestPetsLoop then
        return
    end
    PlotController.AutoPlaceBestPetsRunning = true
    PlotController.AutoPlaceBestPetsLoop = task.spawn(
        function()
            task.wait(2)
            while PlotController.AutoPlaceBestPetsRunning do
                pcall(MystrixHub.Functions.Plot_EquipBestPets)
                task.wait(30)
            end
            PlotController.AutoPlaceBestPetsLoop = nil
            PlotController.AutoPlaceBestPetsRunning = false
        end
    )
    MystrixHub.TasksController.Insert(PlotController.AutoPlaceBestPetsLoop)
end
v6.Functions.Plot_StopAutoPlaceBestPets = function()
    local PlotController = MystrixHub.PlotController
    PlotController.AutoPlaceBestPetsRunning = false
    if PlotController.AutoPlaceBestPetsLoop then
        task.cancel(PlotController.AutoPlaceBestPetsLoop)
        PlotController.AutoPlaceBestPetsLoop = nil
    end
end
v6.Functions.Plot_HatchOne = function(arg1)
    if not arg1 then
        return false, "no uid"
    end
    local v1 = MystrixHub
    local v2 = v1.Functions.Plot_GetNetworkRemote("Eggs: RequestHatchEgg")
    local v3 = v1.Functions.Plot_GetNetworkRemote("Eggs: RequestCompleteHatchEgg")
    if not v2 then
        return false, "no hatch remote"
    end
    local v4, v5 = pcall(
        function()
            return v2:InvokeServer(arg1)
        end
    )
    if not v4 or not v5 then
        return false, "hatch rejected"
    end
    task.wait(0.35)
    if v3 then
        pcall(
            function()
                return v3:InvokeServer(arg1)
            end
        )
    end
    return true
end
v6.Functions.Plot_RunHatchOnce = function()
    local v1 = MystrixHub
    local PlotController = v1.PlotController
    local v2 = v1.Functions.Farm_GetEggCmds()
    local v3 = v1.Functions.Plot_GetPolicyModule()
    if not v2 or not v3 then
        return false, "missing"
    end
    local v4, v5 = pcall(
        function()
            return v2.GetOwnerRuntimeRecords(LocalPlayer.UserId)
        end
    )
    if not v4 or type(v5) ~= "table" then
        return false, "no records"
    end
    local tbl = {}
    for k, v6 in pairs(v5) do
        if v6.Placement and MystrixHub.Functions.Plot_MatchesSelection(
            v6.AssetCategory, PlotController.HatchSelectedEggs
        ) then
            local flag = false
            pcall(
                function()
                    flag = v3.IsReady(v6)
                end
            )
            if flag then
                table.insert(tbl, k)
            end
        end
    end
    if #tbl == 0 then
        return false, "no ready"
    end
    for _, v7 in ipairs(tbl) do
        if MystrixHub.Functions.Plot_HatchOne(v7) then
            return true, "hatched"
        end
    end
    return false, "hatch failed"
end
v6.Functions.Plot_RunPlaceOnce = function()
    local v1 = MystrixHub
    local PlotController = v1.PlotController
    local v2 = v1.Functions.Farm_GetPlotCmds()
    if not v2 then
        return false, "no plotCmds"
    end
    local v3, v4 = pcall(
        function()
            return v2.GetPlotData()
        end
    )
    if not v3 or type(v4) ~= "table" then
        return false, "no plot"
    end
    local v5 = MystrixHub.Functions.Plot_CountPlacedEggs()
    if v5 >= 10 then
        return false, "plot full (" .. v5 .. ")"
    end
    local v6 = MystrixHub.Functions.Sell_LoadDeps()
    if not v6.Save or not v6.EggItemUtil then
        return false, "no save deps"
    end
    local v7, v8 = pcall(
        function()
            return v6.Save.Get()
        end
    )
    if not v7 or type(v8) ~= "table" then
        return false, "no save"
    end
    local v9 = v8.EggInventory or {}
    local v10 = MystrixHub.Functions.Farm_GetAssets()
    local flag = false
    local tbl = {}
    for _, v11 in ipairs(MystrixHub.Functions.Plot_ParseSelection(PlotController.PlaceSelectedEggs)) do
        if v11 == "Best" or v11 == "All" then
            flag = true
        else
            tbl[v11] = true
        end
    end
    local tbl1 = {}
    for k, v12 in pairs(v9) do
        if type(v12) == "table" and v12.Placement == nil then
            local v13, v14 = pcall(
                function()
                    return v6.EggItemUtil.DeserializeSavedEgg(v12)
                end
            )
            if v13 and type(v14) == "table" then
                local AssetCategory = v14.AssetCategory
                if AssetCategory and (flag or tbl[AssetCategory]) then
                    local v15, v16 = MystrixHub.Functions.Plot_GetCategoryScore(AssetCategory, v10)
                    table.insert(tbl1, {uid = k, cat = AssetCategory, score = v15, luck = v16})
                end
            end
        end
    end
    if #tbl1 == 0 then
        return false, "no matching unplaced eggs"
    end
    table.sort(
        tbl1,
        function(arg1, arg2)
            if arg1.score ~= arg2.score then
                return arg1.score > arg2.score
            end
            if arg1.luck ~= arg2.luck then
                return arg1.luck > arg2.luck
            end
            return arg1.cat < arg2.cat
        end
    )
    local v17 = tbl1[1]
    local v18 = MystrixHub.Functions.Plot_GetFreePlacement(v4)
    if not v18 then
        return false, "no free spot"
    end
    local v19 = MystrixHub
    local v20 = v19.Functions.Plot_GetNetworkRemote("Eggs: RequestEquipTool")
    local v21 = v19.Functions.Plot_GetNetworkRemote("Eggs: RequestPlaceEgg")
    if not v20 then
        return false, "no equip remote"
    end
    if not v21 then
        return false, "no place remote"
    end
    local Character = LocalPlayer.Character
    local v22 = Character and Character:FindFirstChildOfClass("Humanoid")
    if not v22 then
        return false, "no humanoid"
    end
    pcall(
        function()
            v22:UnequipTools()
        end
    )
    task.wait(0.15)
    local v23, v24 = pcall(
        function()
            return v20:InvokeServer(v17.uid)
        end
    )
    if not v23 then
        return false, "equip error: " .. tostring(v24)
    end
    if not v24 then
        return false, "equip rejected"
    end
    local v25 = tick() + 4
    local flag1 = false
    while tick() < v25 do
        for _, v26 in ipairs(Character:GetChildren()) do
            if v26:IsA("Tool") and v26:GetAttribute("ItemType") == "AssetEgg" and v26:GetAttribute(
                "UID"
            ) == v17.uid then
                flag1 = true
                break
            end
        end
        if flag1 then
            break
        end
        task.wait(0.05)
    end
    if not flag1 then
        pcall(
            function()
                v22:UnequipTools()
            end
        )
        return false, "tool not in character after 4s"
    end
    task.wait(0.2)
    local v27, v28 = pcall(
        function()
            return v21:InvokeServer({Uid = v17.uid, LocalCFrame = v18})
        end
    )
    task.wait(0.15)
    pcall(
        function()
            v22:UnequipTools()
        end
    )
    if not v27 then
        return false, "place error: " .. tostring(v28)
    end
    if not v28 then
        return false, "place rejected"
    end
    return true, "placed " .. v17.cat
end
v6.Functions.Plot_GetTreadmillPart = function()
    local v1 = MystrixHub.Functions.Farm_GetPlotCmds()
    if not v1 then
        return nil
    end
    local v2, v3 = pcall(
        function()
            return v1.GetPlotData()
        end
    )
    if not v2 or type(v3) ~= "table" or not v3.PlotFolder then
        return nil
    end
    local TreadmillBottom = v3.PlotFolder:FindFirstChild("TreadmillBottom")
    if TreadmillBottom and TreadmillBottom:IsA("BasePart") then
        return TreadmillBottom
    end
    local TreadmillBottom1 = v3.PlotFolder:FindFirstChild("TreadmillBottom", true)
    if TreadmillBottom1 and TreadmillBottom1:IsA("BasePart") then
        return TreadmillBottom1
    end
    return nil
end
v6.Functions.Plot_EquipTreadmill = function()
    local v1 = MystrixHub.Functions.Plot_GetTreadmillPart()
    if not v1 then
        return false, "no TreadmillBottom"
    end
    local Character = LocalPlayer.Character
    local v2 = Character and Character:FindFirstChild("HumanoidRootPart")
    if not v2 then
        return false, "no character"
    end
    local v3 = v1.Position + Vector3.new(0, v1.Size.Y / 2 + 3, 0)
    local LookVector = v2.CFrame.LookVector
    pcall(
        function()
            v2.CFrame = CFrame.new(v3, v3 + LookVector)
            v2.AssemblyLinearVelocity = Vector3.zero
            v2.AssemblyAngularVelocity = Vector3.zero
        end
    )
    task.wait(0.3)
    local v4 = MystrixHub.Functions.Shop_GetNetworkModule()
    if v4 and v4.NET_MAP and v4.NET_MAP.Treadmills then
        pcall(
            function()
                v4.Invoke(v4.NET_MAP.Treadmills.REQUEST_EQUIP_STATIC)
            end
        )
    end
    return true
end
v6.Functions.Plot_ExitTreadmill = function()
    local v1 = MystrixHub.Functions.Shop_GetNetworkModule()
    if v1 and v1.NET_MAP and v1.NET_MAP.Treadmills then
        pcall(
            function()
                v1.Invoke(v1.NET_MAP.Treadmills.REQUEST_UNEQUIP)
            end
        )
    end
    task.wait(0.2)
    local v2 = MystrixHub.Functions.Farm_GetPlotCmds()
    if v2 then
        local v3, v4 = pcall(
            function()
                return v2.GetPlotData()
            end
        )
        if v3 and type(v4) == "table" then
            local v5 = v4.PetArea or v4.CenterPoint
            if v5 and v5.Position then
                local Character = LocalPlayer.Character
                local v6 = Character and Character:FindFirstChild("HumanoidRootPart")
                if v6 then
                    local v7 = v5.Position + Vector3.new(0, 5, 0)
                    local LookVector = v6.CFrame.LookVector
                    pcall(
                        function()
                            v6.CFrame = CFrame.new(v7, v7 + LookVector)
                            v6.AssemblyLinearVelocity = Vector3.zero
                            v6.AssemblyAngularVelocity = Vector3.zero
                        end
                    )
                end
            end
        end
    end
    return true
end
v6.Functions.Plot_ClaimIndexRewards = function()
    local v1 = MystrixHub.Functions.Shop_GetNetworkModule()
    if not v1 or not v1.NET_MAP or not v1.NET_MAP.Index then
        return false
    end
    local Index = v1.NET_MAP.Index
    if not Index.REQUEST_CLAIM_ALL then
        return false
    end
    local v2, v3 = pcall(
        function()
            return v1.Invoke(Index.REQUEST_CLAIM_ALL)
        end
    )
    return v2 and v3
end
v6.Functions.Plot_StartAutoHatch = function()
    local PlotController = MystrixHub.PlotController
    if PlotController.AutoHatchLoop then
        return
    end
    PlotController.AutoHatchRunning = true
    PlotController.AutoHatchLoop = task.spawn(
        function()
            while PlotController.AutoHatchRunning do
                local v1, v2 = pcall(MystrixHub.Functions.Plot_RunHatchOnce)
                if v1 and v2 then
                    task.wait(0.6)
                else
                    task.wait(0.4)
                end
            end
            PlotController.AutoHatchLoop = nil
        end
    )
    MystrixHub.TasksController.Insert(PlotController.AutoHatchLoop)
end
v6.Functions.Plot_StopAutoHatch = function()
    local PlotController = MystrixHub.PlotController
    PlotController.AutoHatchRunning = false
    if PlotController.AutoHatchLoop then
        task.cancel(PlotController.AutoHatchLoop)
        PlotController.AutoHatchLoop = nil
    end
end
v6.Functions.Plot_StartAutoPlace = function()
    local PlotController = MystrixHub.PlotController
    if PlotController.AutoPlaceLoop then
        return
    end
    PlotController.AutoPlaceRunning = true
    PlotController.AutoPlaceLoop = task.spawn(
        function()
            while PlotController.AutoPlaceRunning do
                local v1, v2 = pcall(MystrixHub.Functions.Plot_RunPlaceOnce)
                if v1 and v2 then
                    task.wait(1.2)
                else
                    task.wait(1)
                end
            end
            PlotController.AutoPlaceLoop = nil
        end
    )
    MystrixHub.TasksController.Insert(PlotController.AutoPlaceLoop)
end
v6.Functions.Plot_StopAutoPlace = function()
    local PlotController = MystrixHub.PlotController
    PlotController.AutoPlaceRunning = false
    if PlotController.AutoPlaceLoop then
        task.cancel(PlotController.AutoPlaceLoop)
        PlotController.AutoPlaceLoop = nil
    end
end
v6.Functions.Plot_StartAutoTreadmill = function()
    local PlotController = MystrixHub.PlotController
    if PlotController.AutoTreadmillLoop then
        return
    end
    PlotController.AutoTreadmillRunning = true
    PlotController.AutoTreadmillLoop = task.spawn(
        function()
            while PlotController.AutoTreadmillRunning do
                pcall(MystrixHub.Functions.Plot_EquipTreadmill)
                task.wait(2)
            end
            pcall(MystrixHub.Functions.Plot_ExitTreadmill)
            PlotController.AutoTreadmillLoop = nil
        end
    )
    MystrixHub.TasksController.Insert(PlotController.AutoTreadmillLoop)
end
v6.Functions.Plot_StopAutoTreadmill = function()
    local PlotController = MystrixHub.PlotController
    PlotController.AutoTreadmillRunning = false
    if PlotController.AutoTreadmillLoop then
        task.cancel(PlotController.AutoTreadmillLoop)
        PlotController.AutoTreadmillLoop = nil
    end
    pcall(MystrixHub.Functions.Plot_ExitTreadmill)
end
v6.Functions.Plot_StartAutoClaim = function()
    local PlotController = MystrixHub.PlotController
    if PlotController.AutoClaimLoop then
        return
    end
    PlotController.AutoClaimRunning = true
    PlotController.AutoClaimLoop = task.spawn(
        function()
            while PlotController.AutoClaimRunning do
                pcall(MystrixHub.Functions.Plot_ClaimIndexRewards)
                task.wait(3)
            end
            PlotController.AutoClaimLoop = nil
        end
    )
    MystrixHub.TasksController.Insert(PlotController.AutoClaimLoop)
end
v6.Functions.Plot_StopAutoClaim = function()
    local PlotController = MystrixHub.PlotController
    PlotController.AutoClaimRunning = false
    if PlotController.AutoClaimLoop then
        task.cancel(PlotController.AutoClaimLoop)
        PlotController.AutoClaimLoop = nil
    end
end
v6.Functions.BuildAndSendRequest = function(arg1, arg2, arg3)
    local v1 = MystrixHub.Functions.GetAccurateTimestampMs(arg3)
    local v2 = HttpService:GenerateGUID(false):gsub("-", "")
    local v3 = "POST\n/keys/verify\n" .. v1 .. "\n" .. v2 .. "\n" .. arg2
    local v4 = MystrixHub
    local v5 = v4.Functions.HMACSHA256(v4.Auth.SigningSecret, v3)
    local MakeRawRequest = v4.Functions.MakeRawRequest
    local v6 = v4.Auth.BaseURL .. "/api/v1/keys/verify"
    local v7 = MystrixHub
    return MakeRawRequest(
        v6, "POST",
        {
            ["Content-Type"] = "application/json", Authorization = "Bearer " .. v7.Auth.ApiToken,
            ["X-Timestamp"] = v1, ["X-Nonce"] = v2, ["X-Signature"] = v5, ["X-Body-Sha256"] = arg2,
            ["X-Hwid"] = v7.Functions.GetHWID() or "",
        }, arg1
    )
end
v6.Functions.VerifyKey = function(arg1)
    local v1 = MystrixHub.Functions.CleanKey(arg1)
    if not v1 or #v1 < 10 then
        return false, "INVALID_KEY"
    end
    local v2 = MystrixHub.Functions.GetHWID()
    local tbl = {key = v1, requestId = HttpService:GenerateGUID(false):gsub("-", "")}
    if v2 and v2 ~= "" then
        tbl.hwid = v2
    end
    local v3 = HttpService:JSONEncode(tbl)
    local v4 = MystrixHub
    local v5 = v4.Functions.SHA256(v3)
    local v6 = v4.Functions.BuildAndSendRequest(v3, v5, 0)
    local v7 = v6 and v6.StatusCode
    local v8 = v6 and v6.Body
    if v7 == 401 then
        MystrixHub.TimeController.CachedOffset = nil
        MystrixHub.TimeController.LastSync = 0
        MystrixHub.Functions.SyncServerTime()
        for _, v9 in ipairs({0, 30000, -30000, 60000, -60000}) do
            local v10 = MystrixHub.Functions.BuildAndSendRequest(v3, v5, v9)
            local v11 = v10 and v10.StatusCode
            v8 = v10 and v10.Body
            if v11 ~= 401 then
                break
            end
        end
    end
    if not v8 then
        return false, "NETWORK_ERROR"
    end
    local v12, v13 = pcall(
        function()
            return HttpService:JSONDecode(v8)
        end
    )
    if not v12 then
        return false, "NETWORK_ERROR"
    end
    if v13 and v13.valid then
        return
            true,
            {
                keyId = v13.keyId, label = v13.label or "Key", validUntil = v13.validUntil,
                expiresIn = v13.expiresIn, hwid = v13.hwid, hwidReset = v13.hwidReset or false,
                uses = v13.uses or v13.executionCount or nil,
            }
    end
    local v14 = v13 and v13.reason or "INVALID_KEY"
    if v14 == "HWID_MISMATCH" then
        if v13 and v13.expired then
            v14 = "EXPIRED"
        elseif v13 and v13.validUntil then
            local v15, v16 = pcall(
                function()
                    return DateTime.fromIsoDate(v13.validUntil)
                end
            )
            if v15 and v16 and v16.UnixTimestamp < os.time() then
                v14 = "EXPIRED"
            end
        end
    end
    return false, v14
end
v6.Functions.FormatTimeRemaining = function(arg1)
    if arg1 <= 0 then
        return "Expired"
    end
    local v1 = math.floor(arg1 / 86400)
    local v2 = math.floor(arg1 % 86400 / 3600)
    local v3 = math.floor(arg1 % 3600 / 60)
    if v1 > 0 then
        return v1 .. "d " .. v2 .. "h remaining"
    end
    if v2 > 0 then
        return v2 .. "h " .. v3 .. "m remaining"
    end
    if v3 > 0 then
        return v3 .. "m remaining"
    end
    return "Less than a minute"
end
v6.Functions.FormatExpiry = function(arg1)
    if not arg1 then
        return nil, nil
    end
    local v1, v2 = pcall(
        function()
            return DateTime.fromIsoDate(arg1)
        end
    )
    if not (v1 and v2) then
        return nil, nil
    end
    local v3 = os.date("*t", v2.UnixTimestamp)
    return
        string.format("%02d/%02d/%d at %02d:%02d UTC", v3.month, v3.day, v3.year, v3.hour, v3.min),
        v2.UnixTimestamp - os.time()
end
v6.Functions.GetFriendlyError = function(arg1)
    return ({
        INVALID_KEY = "The key entered is invalid. Please double-check and try again.",
        EXPIRED = "This key has expired. Get a new one from the Discord server.",
        REVOKED = "This key has been revoked. Please contact support on Discord.",
        NOT_FOUND = "Key not found in the system. Did you enter it correctly?",
        HWID_REQUIRED = "HWID verification required. Please restart the game.",
        HWID_MISMATCH = "Key is expired or linked to another device. Get a new key from Discord or Website.",
        NETWORK_ERROR = "Network error. Check your connection and try again.",
        TIMESTAMP_ERROR = "Time sync error. Check your device date and time settings.",
        RATE_LIMITED = "Too many attempts. Please wait a few minutes and try again.",
    })[arg1] or "Verification failed: " .. tostring(arg1)
end
v6.Functions.GetExecData = function()
    local tbl = {lastKeyId = "", count = 0}
    pcall(
        function()
            if isfile and readfile and isfile(MystrixHub.Meta.ExecDataFile) then
                local v1, v2 = pcall(
                    function()
                        return HttpService:JSONDecode(readfile(MystrixHub.Meta.ExecDataFile))
                    end
                )
                if v1 and v2 then
                    tbl = v2
                end
            end
        end
    )
    return tbl
end
v6.Functions.SaveExecData = function(arg1)
    pcall(
        function()
            if writefile then
                writefile(MystrixHub.Meta.ExecDataFile, HttpService:JSONEncode(arg1))
            end
        end
    )
end
v6.Functions.IncrementExecCount = function(arg1)
    local v1 = MystrixHub.Functions.GetExecData()
    if v1.lastKeyId == arg1 then
        v1.count = (v1.count or 0) + 1
    else
        v1.count = 1
        v1.lastKeyId = arg1
    end
    MystrixHub.Functions.SaveExecData(v1)
    return v1.count
end
v6.Functions.FetchDiscordInfo = function()
    local v1, v2 = pcall(
        MystrixHub.Functions.MakeRawRequest,
        "https://discord.com/api/v9/invites/" .. MystrixHub.Meta.Discord .. "?with_counts=true",
        "GET", {Accept = "application/json"}, nil
    )
    if v1 and v2 and v2.Body then
        local v3, v4 = pcall(
            function()
                return HttpService:JSONDecode(v2.Body)
            end
        )
        if v3 and v4 then
            if v4.guild and v4.guild.name then
                MystrixHub.Meta.ServerName = v4.guild.name
            end
            MystrixHub.Meta.MemberCount = v4.approximate_member_count and tostring(
                v4.approximate_member_count
            ) or "N/A"
            MystrixHub.Meta.OnlineCount = v4.approximate_presence_count and tostring(
                v4.approximate_presence_count
            ) or "N/A"
            return true
        end
    end
    MystrixHub.Meta.MemberCount = "Unavailable"
    MystrixHub.Meta.OnlineCount = "Unavailable"
    return false
end
v6.Functions.ApplyTransparency = function()
    if MystrixHub.UIController.WinBG then
        local v1 = MystrixHub
        v1.UIController.WinBG.ImageTransparency = v1.UIController.BGTransparency
    end
end
v6.Functions.StartBGWatcher = function()
    if MystrixHub.UIController.BGWatcher then
        local v1 = MystrixHub
        v1.UIController.BGWatcher:Disconnect()
        v1.UIController.BGWatcher = nil
    end
    if not MystrixHub.UIController.WinBG then
        return
    end
    local v2 = MystrixHub
    v2.UIController.BGWatcher = v2.UIController.WinBG:GetPropertyChangedSignal("ImageTransparency"):Connect(
        function()
            local v1 = MystrixHub.UIController.WinBG.ImageTransparency ~= 1
            if v1 then
                local v2 = MystrixHub
                v1 = v2.UIController.WinBG.ImageTransparency ~= v2.UIController.BGTransparency
            end
            if v1 then
                local v3 = MystrixHub
                v3.UIController.WinBG.ImageTransparency = v3.UIController.BGTransparency
            end
        end
    )
end
v6.Functions.DestroyFPSTag = function()
    if MystrixHub.UIController.FPSTag then
        pcall(
            function()
                MystrixHub.UIController.FPSTag:Destroy()
            end
        )
        MystrixHub.UIController.FPSTag = nil
    end
    if MystrixHub.UIController.FPSConnection then
        local v1 = MystrixHub
        v1.UIController.FPSConnection:Disconnect()
        v1.UIController.FPSConnection = nil
    end
end
v6.Functions.CreateFPSTag = function()
    local v1 = MystrixHub
    v1.Functions.DestroyFPSTag()
    local v2 = MystrixHub
    v1.UIController.FPSTag = v1.UIController.Window:Tag(
        {Title = "FPS: --", Color = v2.UIController.CurrentAccent}
    )
    local v3 = tick()
    local num = 0
    v2.UIController.FPSConnection = RunService.RenderStepped:Connect(
        function()
            num = num + 1
            local v1 = tick()
            if v1 - v3 >= 1 then
                local v2 = math.floor(num / (v1 - v3))
                MystrixHub.UIController.FPSTag:SetTitle("FPS: " .. v2)
                num = 0
                v3 = v1
            end
        end
    )
end
v6.Functions.DestroyPingTag = function()
    if MystrixHub.UIController.PingTag then
        pcall(
            function()
                MystrixHub.UIController.PingTag:Destroy()
            end
        )
        MystrixHub.UIController.PingTag = nil
    end
    if MystrixHub.UIController.PingConnection then
        local v1 = MystrixHub
        v1.UIController.PingConnection:Disconnect()
        v1.UIController.PingConnection = nil
    end
end
v6.Functions.CreatePingTag = function()
    local v1 = MystrixHub
    v1.Functions.DestroyPingTag()
    local v2 = MystrixHub
    v1.UIController.PingTag = v1.UIController.Window:Tag(
        {Title = "Ping: --", Color = v2.UIController.CurrentAccent}
    )
    v2.UIController.PingConnection = RunService.RenderStepped:Connect(
        function()
            local v1, v2 = pcall(
                function()
                    return math.floor(v3.Stats.Network.ServerStatsItem["Data Ping"]:GetValue())
                end
            )
            if v1 and v2 then
                MystrixHub.UIController.PingTag:SetTitle("Ping: " .. v2 .. "ms")
            end
        end
    )
end
v6.Functions.UpdateTagAccents = function(arg1)
    local v1 = MystrixHub
    v1.UIController.CurrentAccent = arg1
    if v1.UIController.VersionTag then
        MystrixHub.UIController.VersionTag:SetColor(arg1)
    end
    if MystrixHub.UIController.FPSTag then
        MystrixHub.UIController.FPSTag:SetColor(arg1)
    end
    if MystrixHub.UIController.PingTag then
        MystrixHub.UIController.PingTag:SetColor(arg1)
    end
end
v6.ConfigController.GetAllConfigNames = function()
    local tbl = {}
    local v1, v2 = pcall(
        function()
            return MystrixHub.UIController.Window.ConfigManager:AllConfigs()
        end
    )
    if v1 and v2 then
        for _, v3 in ipairs(v2) do
            table.insert(tbl, v3)
        end
    end
    if #tbl == 0 then
        table.insert(tbl, "No configs found")
    end
    return tbl
end
v6.ConfigController.SaveLastConfigName = function(arg1)
    pcall(
        function()
            if writefile then
                writefile(MystrixHub.ConfigController.LastConfigFile, arg1)
            end
        end
    )
end
v6.ConfigController.LoadLastConfigName = function()
    local v1, v2 = pcall(
        function()
            if readfile and isfile and isfile(MystrixHub.ConfigController.LastConfigFile) then
                return readfile(MystrixHub.ConfigController.LastConfigFile)
            end
            return nil
        end
    )
    if v1 and v2 and v2 ~= "" then
        return v2
    end
    return nil
end
v6.ConfigController.GetAutoLoadSetting = function()
    local v1, v2 = pcall(
        function()
            if readfile and isfile and isfile(MystrixHub.ConfigController.AutoLoadFile) then
                return readfile(MystrixHub.ConfigController.AutoLoadFile) == "true"
            end
            return false
        end
    )
    return v1 and v2 or false
end
v6.ConfigController.SetAutoLoadSetting = function(arg1)
    pcall(
        function()
            if writefile then
                writefile(MystrixHub.ConfigController.AutoLoadFile, arg1 and "true" or "false")
            end
        end
    )
end
v6.ConfigController.GetConfig = function(arg1)
    if MystrixHub.ConfigController.Cache[arg1] then
        return MystrixHub.ConfigController.Cache[arg1]
    end
    local v1 = MystrixHub
    local v2 = v1.UIController.Window.ConfigManager:CreateConfig(arg1)
    v1.ConfigController.Cache[arg1] = v2
    return v2
end
v6.Functions.AttemptAutoLoad = function()
    local v1 = MystrixHub.ConfigController.GetAutoLoadSetting()
    if v1 then
        v1 = MystrixHub.ConfigController.LoadLastConfigName()
        if v1 and v1 ~= "" then
            task.spawn(
                function()
                    task.wait(0.5)
                    local v2 = MystrixHub.ConfigController.GetConfig(v1)
                    local v3, v4 = pcall(
                        function()
                            v2:Load()
                        end
                    )
                    if v3 then
                        task.wait(0.1)
                        MystrixHub.Functions.SyncDropdownsToState()
                        WindUI:Notify(
                            {Title = "Auto Load", Content = "Loaded last config: " .. v1, Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Auto Load Failed", Content = tostring(v4), Duration = 3, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end
    end
end
v6.Auth.RawKey = nil
local tbl11 = {Running = false}
tbl11.Loop = nil
tbl11.ConfirmCount = 0
v6.KeyValidation = tbl11
v6.Functions.FetchKeyFromDisk = function()
    local v1
    pcall(
        function()
            for _, v2 in ipairs({"WindUI/BikeForEggs", "WindUI/BikeForEggs", "WindUI"}) do
                local v3, v4 = pcall(listfiles, v2)
                if v3 and v4 then
                    for _, v5 in ipairs(v4) do
                        if tostring(v5):match("%.key$") then
                            local v6, v7 = pcall(readfile, v5)
                            if v6 and v7 and v7 ~= "" then
                                v1 = v7:match("^%s*(.-)%s*$")
                                if v1 and v1 ~= "" then
                                    return
                                end
                            end
                        end
                    end
                end
            end
        end
    )
    return v1 and v1 ~= "" and v1 or nil
end
MystrixHub.Functions.FetchKeyFromAPI = function()
    local RawKey
    if MystrixHub.Auth.RawKey and MystrixHub.Auth.RawKey ~= "" then
        RawKey = MystrixHub.Auth.RawKey
    else
        RawKey = MystrixHub.Functions.FetchKeyFromDisk()
    end
    if not RawKey or RawKey == "" then
        return nil, "NO_KEY_FOUND"
    end
    local v1, v2 = MystrixHub.Functions.VerifyKey(RawKey)
    if v1 and type(v2) == "table" then
        return v2, nil
    end
    return nil, tostring(v2)
end
MystrixHub.Functions.IsKeyExpired = function(arg1, arg2)
    if arg2 == "EXPIRED" then
        return true
    end
    if arg2 == "REVOKED" then
        return true
    end
    if arg2 == "NOT_FOUND" then
        return true
    end
    if arg1 and arg1.validUntil then
        local v1, v2 = pcall(
            function()
                return DateTime.fromIsoDate(arg1.validUntil)
            end
        )
        if v1 and v2 then
            return v2.UnixTimestamp < os.time()
        end
    end
    if arg1 and arg1.expiresIn then
        return arg1.expiresIn <= 0
    end
    return false
end
MystrixHub.Functions.UpdateKeyInfoFromResult = function(arg1)
    if not arg1 then
        return
    end
    if arg1.validUntil then
        local v1, v2 = pcall(
            function()
                return DateTime.fromIsoDate(arg1.validUntil)
            end
        )
        if v1 and v2 then
            local v3 = v2.UnixTimestamp - os.time()
            MystrixHub.KeyDisplay.TimeLeftText = v3 > 0 and MystrixHub.Functions.FormatTimeRemaining(
                v3
            ) or "Expired"
            local v4 = MystrixHub.Functions.FormatExpiry(arg1.validUntil)
            if v4 then
                MystrixHub.KeyDisplay.ExpiryText = v4
            end
        end
    elseif arg1.expiresIn then
        MystrixHub.KeyDisplay.TimeLeftText = arg1.expiresIn > 0 and MystrixHub.Functions.FormatTimeRemaining(
            arg1.expiresIn
        ) or "Expired"
    end
    pcall(
        function()
            if KeyInfoParagraph then
                KeyInfoParagraph:SetDesc(
                    "Key Label: " .. MystrixHub.KeyDisplay.KeyLabelText .. "\nKey ID: " .. MystrixHub.KeyDisplay.KeyIdText .. "\nTime Left: " .. MystrixHub.KeyDisplay.TimeLeftText .. "\nExecutions: " .. MystrixHub.KeyDisplay.ExecCountStr
                )
            end
        end
    )
end
MystrixHub.Functions.StartKeyValidation = function()
    if MystrixHub.KeyValidation.Running then
        return
    end
    MystrixHub.KeyValidation.Running = true
    MystrixHub.KeyValidation.Loop = task.spawn(
        function()
            task.wait(10)
            while MystrixHub.KeyValidation.Running do
                local v1, v2 = MystrixHub.Functions.FetchKeyFromAPI()
                if v2 == "NETWORK_ERROR" then
                    task.wait(10)
                else
                    if v1 then
                        MystrixHub.KeyValidation.ConfirmCount = 0
                        MystrixHub.Functions.UpdateKeyInfoFromResult(v1)
                    end
                    if MystrixHub.Functions.IsKeyExpired(v1, v2) then
                        for i = 1, 5 do
                            WindUI:Notify(
                                {
                                    Title = "Key Validation",
                                    Content = string.format(
                                        "Your key has Expired! (%d out of 5)", i
                                    ), Duration = 9, Icon = "triangle-alert",
                                }
                            )
                            task.wait(10)
                            local v3, v4 = MystrixHub.Functions.FetchKeyFromAPI()
                            if v4 ~= "NETWORK_ERROR" and v3 then
                                MystrixHub.Functions.UpdateKeyInfoFromResult(v3)
                            end
                            if not MystrixHub.Functions.IsKeyExpired(v3, v4) then
                                MystrixHub.KeyValidation.ConfirmCount = 0
                                break
                            end
                            if i == 5 then
                                local str = "Key Expired!"
                                if v4 == "REVOKED" then
                                    str = "Key Revoked!"
                                end
                                if v4 == "NOT_FOUND" then
                                    str = "Key Deleted from Server!"
                                end
                                if v4 == "NO_KEY_FOUND" then
                                    str = "No Key Found!"
                                end
                                WindUI:Notify(
                                    {
                                        Title = "Key Validation",
                                        Content = "All 5 checks failed. Reason: " .. str .. " You will be kicked in a minute!",
                                        Duration = 60, Icon = "circle-x",
                                    }
                                )
                                task.wait(60)
                                MystrixHub.KeyValidation.Running = false
                                LocalPlayer:Kick(str)
                                return
                            end
                        end
                    else
                        MystrixHub.KeyValidation.ConfirmCount = 0
                    end
                    task.wait(10)
                end
            end
        end
    )
end
if MystrixHub.Auth.UseKeySystem then
    task.spawn(
        function()
            while MystrixHub.Auth.KeyResult == nil do
                task.wait(1)
            end
            MystrixHub.Functions.StartKeyValidation()
        end
    )
end
local v7 = MystrixHub
v7.Functions.SyncDropdownsToState = function()
    local Drops = MystrixHub.UIController.Drops
    local function func(arg1)
        local v1 = arg1
        local tbl = {}
        if type(arg1) ~= "table" then
            if type(arg1) == "string" then
                v1 = {arg1}
            else
                return tbl
            end
        end
        for _, v2 in ipairs(v1) do
            if type(v2) == "string" then
                local v3 = v2:match("^%[[^%]]+%]%s*(.+)$")
                if v3 and v3 ~= "" then
                    table.insert(tbl, v3)
                end
            end
        end
        return tbl
    end
    local function func1(arg1)
        local tbl = {}
        if type(arg1) == "table" then
            for _, v1 in ipairs(arg1) do
                if type(v1) == "string" and v1 ~= "" then
                    table.insert(tbl, v1)
                end
            end
        elseif type(arg1) == "string" and arg1 ~= "" then
            table.insert(tbl, arg1)
        end
        return tbl
    end
    if Drops.Theme and Drops.Theme.Value then
        WindUI:SetTheme(Drops.Theme.Value)
        local v1 = MystrixHub.UIController.ThemeAccents[Drops.Theme.Value] or Color3.fromHex(
            "#FFFFFF"
        )
        local v2 = MystrixHub
        v2.Functions.UpdateTagAccents(v1)
        v2.UIController.CurrentTheme = Drops.Theme.Value
    end
    if Drops.FarmSpecificEggs and Drops.FarmSpecificEggs.Value then
        MystrixHub.FarmController.SpecificEggNames = func(Drops.FarmSpecificEggs.Value)
    end
    if Drops.FarmRarities and Drops.FarmRarities.Value then
        MystrixHub.FarmController.SelectedRarities = func1(Drops.FarmRarities.Value)
    end
    if Drops.FarmAreas and Drops.FarmAreas.Value then
        MystrixHub.FarmController.SelectedAreas = func1(Drops.FarmAreas.Value)
    end
    if Drops.SellEggs and Drops.SellEggs.Value then
        MystrixHub.SellController.SelectedEggCategories = func1(Drops.SellEggs.Value)
    end
    if Drops.SellPets and Drops.SellPets.Value then
        MystrixHub.SellController.SelectedPetCategories = func1(Drops.SellPets.Value)
    end
    if Drops.PlotHatchEggs and Drops.PlotHatchEggs.Value then
        MystrixHub.PlotController.HatchSelectedEggs = func1(Drops.PlotHatchEggs.Value)
    end
    if Drops.PlotPlaceEggs and Drops.PlotPlaceEggs.Value then
        MystrixHub.PlotController.PlaceSelectedEggs = func1(Drops.PlotPlaceEggs.Value)
    end
end
pcall(
    function()
        local ProductInfo = MarketplaceService:GetProductInfo(game.PlaceId)
        MystrixHub.Meta.GameName = ProductInfo.Name or "Unknown Game"
    end
)
v7.PlayerController.HWID = v7.Functions.GetHWID()
v7.Functions.SyncServerTime()
v7.DiscordInfoReady = false
task.spawn(
    function()
        local v1 = MystrixHub
        v1.Functions.FetchDiscordInfo()
        v1.DiscordInfoReady = true
    end
)
getgenv().WindUI = loadstring(
    game:HttpGet(
        "https://raw.githubusercontent.com/ummarxfarooq/WindUI/refs/heads/main/dist/main.lua"
    )
)()
local v8 = WindUI
MystrixHub.UIController.WindUI = v8
v8:AddTheme(
    {
        Name = "Monokai Pro", Accent = Color3.fromHex("#fc9867"),
        Outline = Color3.fromHex("#78dce8"), Placeholder = Color3.fromHex("#6f6f6f"),
        Button = Color3.fromHex("#ab9df2"), ElementBackground = Color3.fromHex("#323039"),
        Dialog = Color3.fromHex("#1e1e1e"), Text = Color3.fromHex("#fcfcfa"),
        Background = Color3.fromHex("#191622"), Icon = Color3.fromHex("#a9dc76"),
    }
)
WindUI:AddTheme(
    {
        Name = "Cotton Candy", Accent = Color3.fromHex("#ec4899"),
        Outline = Color3.fromHex("#f9a8d4"), Placeholder = Color3.fromHex("#8a5fd3"),
        Button = Color3.fromHex("#d946ef"), Icon = Color3.fromHex("#06b6d4"),
        Dialog = Color3.fromHex("#2d1b3d"), Text = Color3.fromHex("#fdf2f8"),
        Background = Color3.fromHex("#1a0b2e"), Slider = Color3.fromHex("#d946ef"),
        ElementBackground = Color3.fromHex("#312643"),
    }
)
local v9 = MystrixHub
MystrixHub.UIController.Window = WindUI:CreateWindow(
    {
        Title = "Mystrix Hub - " .. v9.Meta.GameName, Icon = "chess-queen", Author = "Czm",
        Folder = v9.Meta.FolderName, Theme = "Crimson", Size = UDim2.fromOffset(850, 560),
        MinSize = Vector2.new(560, 350), MaxSize = Vector2.new(850, 560), Transparent = true,
        Resizable = true, SideBarWidth = 200, BackgroundImageTransparency = 0.9,
        HideSearchBar = false, ScrollBarEnabled = true, User = {Enabled = true, Anonymous = false},
        KeySystem = v9.Auth.UseKeySystem and {
            Title = "Authentication Required", Note = "Enter Your Key to Continue!", SaveKey = true,
            URL = "https://mystrixhub.alexrule49.workers.dev/",
            Thumbnail = {Image = MystrixHub.Meta.Logo, Width = 200},
            KeyValidator = function(arg1)
                local v1, v2 = MystrixHub.Functions.VerifyKey(arg1)
                if v1 then
                    local v3 = MystrixHub
                    v3.Auth.KeyResult = v2
                    v3.Auth.KeyError = nil
                    local v4 = MystrixHub
                    v4.Auth.RawKey = v4.Functions.CleanKey(arg1)
                    return true
                end
                if type(v2) == "table" and v2.hwidReset then
                    local v5 = MystrixHub
                    v5.Auth.KeyResult = v2
                    v5.Auth.KeyError = "HWID_RESET"
                    local v6 = MystrixHub
                    v6.Auth.RawKey = v6.Functions.CleanKey(arg1)
                    return true
                end
                MystrixHub.Auth.KeyResult = nil
                local v7 = MystrixHub
                v7.Auth.KeyError = v2
                return false, v7.Functions.GetFriendlyError(v2)
            end,
        } or nil,
    }
)
MystrixHub.UIController.Window:EditOpenButton(
    {
        Title = "Mystrix Hub", CornerRadius = UDim.new(0, 16), StrokeThickness = 2,
        Color = ColorSequence.new(Color3.fromHex("#00d4ff"), Color3.fromHex("#0091ff")),
        OnlyMobile = false, Enabled = true, Draggable = true,
    }
)
if MystrixHub.Auth.KeyResult and MystrixHub.Auth.KeyResult.keyId then
    local v10 = MystrixHub
    local v11 = v10.Functions.IncrementExecCount(v10.Auth.KeyResult.keyId)
    v10.KeyDisplay.ExecCountStr = tostring(v11)
end
task.spawn(
    function()
        task.wait(0.5)
        pcall(
            function()
                for _, v1 in ipairs(CoreGui:GetChildren()) do
                    local v2, v3 = pcall(
                        function()
                            return v1.WindUI.Window.Frame.Background
                        end
                    )
                    if v2 and v3 then
                        local v4 = MystrixHub
                        v4.UIController.WinBG = v3
                        v4.Functions.ApplyTransparency()
                        v4.Functions.StartBGWatcher()
                        break
                    end
                end
            end
        )
    end
)
local v12 = MystrixHub
local v13 = MystrixHub
v12.UIController.VersionTag = v12.UIController.Window:Tag(
    {Title = v13.Meta.Version, Color = v13.UIController.CurrentAccent}
)
if v13.Auth.KeyResult then
    local v14 = MystrixHub
    v14.KeyDisplay.KeyIdText = v14.Auth.KeyResult.keyId or "N/A"
    local v15 = MystrixHub
    v15.KeyDisplay.KeyLabelText = v15.Auth.KeyResult.label or "Standard"
    if MystrixHub.Auth.KeyResult.validUntil then
        local v16 = MystrixHub
        local v17, v18 = v16.Functions.FormatExpiry(v16.Auth.KeyResult.validUntil)
        v16.KeyDisplay.ExpiryText = v17 or "N/A"
        MystrixHub.KeyDisplay.TimeLeftText = v18 and v18 > 0 and MystrixHub.Functions.FormatTimeRemaining(
            v18
        ) or "Expired"
    elseif MystrixHub.Auth.KeyResult.expiresIn then
        MystrixHub.KeyDisplay.ExpiryText = "Server-provided"
        local v19 = MystrixHub
        v19.KeyDisplay.TimeLeftText = v19.Functions.FormatTimeRemaining(
            v19.Auth.KeyResult.expiresIn
        )
    end
    local hwid = MystrixHub.Auth.KeyResult.hwid
    if hwid and hwid ~= "" then
        MystrixHub.KeyDisplay.HwidDisplay = hwid:sub(1, 20) .. (#hwid > 20 and "..." or "")
    end
    if MystrixHub.Auth.KeyResult.hwidReset then
        MystrixHub.KeyDisplay.ResetText = "Reset detected"
        MystrixHub.KeyDisplay.StatusText = "Verified (HWID Reset)"
    end
else
    MystrixHub.KeyDisplay.StatusText = "Issue detected"
    local HWID = MystrixHub.PlayerController.HWID
    if HWID then
        MystrixHub.KeyDisplay.HwidDisplay = HWID:sub(1, 20) .. (#HWID > 20 and "..." or "")
    end
end
local v20 = MystrixHub
v20.UIController.Tabs.Home = v20.UIController.Window:Tab({Title = "Home", Icon = "house"})
local v21 = MystrixHub
v21.UIController.Tabs.Plot = v21.UIController.Window:Tab({Title = "Plot", Icon = "map"})
local v22 = MystrixHub
v22.UIController.Tabs.Farm = v22.UIController.Window:Tab({Title = "Farm", Icon = "egg"})
local v23 = MystrixHub
v23.UIController.Tabs.Sell = v23.UIController.Window:Tab({Title = "Sell", Icon = "coins"})
local v24 = MystrixHub
v24.UIController.Tabs.Shop = v24.UIController.Window:Tab({Title = "Shop", Icon = "shopping-cart"})
local v25 = MystrixHub
v25.UIController.Tabs.Settings = v25.UIController.Window:Tab(
    {Title = "Settings", Icon = "settings"}
)
MystrixHub.UIController.Tabs.Home:Select()
local v26 = tick()
while not MystrixHub.DiscordInfoReady and tick() - v26 < 5 do
    task.wait(0.1)
end
local v27 = MystrixHub.UIController.Tabs.Home:Section(
    {Title = "Discord", Icon = "geist:logo-discord", Box = true, Opened = true}
)
local v28 = MystrixHub
v27:Paragraph(
    {
        Title = v28.Meta.ServerName, Image = v28.Meta.Logo, ImageSize = 75,
        Desc = "Members: " .. v28.Meta.MemberCount .. "\nOnline: " .. v28.Meta.OnlineCount,
        Locked = false,
        Buttons = {
            {
                Title = "Copy Invite", Icon = "link",
                Callback = function()
                    if setclipboard then
                        setclipboard("https://discord.gg/" .. MystrixHub.Meta.Discord)
                    end
                    WindUI:Notify(
                        {
                            Title = "Copied", Content = "Invite link copied to clipboard.",
                            Duration = 3, Icon = "clipboard-check",
                        }
                    )
                end,
            },
        },
    }
)
local v29 = v28.UIController.Tabs.Home:Section(
    {Title = "Key Info", Icon = "sfsymbols:key2OnRing", Box = true, Opened = true}
)
local v30 = MystrixHub
local v31 = v29:Paragraph(
    {
        Title = "Authentication",
        Desc = "Key Label: " .. v28.KeyDisplay.KeyLabelText .. "\nKey ID: " .. v28.KeyDisplay.KeyIdText .. "\nTime Left: " .. MystrixHub.KeyDisplay.TimeLeftText .. "\nExecutions: " .. v30.KeyDisplay.ExecCountStr,
        Locked = false, Buttons = {},
    }
)
task.spawn(
    function()
        while true do
            task.wait(60)
            if MystrixHub.Auth.KeyResult and MystrixHub.Auth.KeyResult.validUntil then
                local v1, v2 = pcall(
                    function()
                        return DateTime.fromIsoDate(MystrixHub.Auth.KeyResult.validUntil)
                    end
                )
                if v1 and v2 then
                    local v3 = v2.UnixTimestamp - os.time()
                    MystrixHub.KeyDisplay.TimeLeftText = v3 > 0 and MystrixHub.Functions.FormatTimeRemaining(
                        v3
                    ) or "Expired"
                else
                    MystrixHub.KeyDisplay.TimeLeftText = "Expired"
                end
            end
            local v4 = "Key Label: " .. MystrixHub.KeyDisplay.KeyLabelText .. "\nKey ID: " .. MystrixHub.KeyDisplay.KeyIdText .. "\nTime Left: " .. MystrixHub.KeyDisplay.TimeLeftText .. "\nExecutions: " .. MystrixHub.KeyDisplay.ExecCountStr
            pcall(
                function()
                    v31:SetDesc(v4)
                end
            )
        end
    end
)
v30.UIController.Tabs.Home:Section(
    {Title = "Update", Icon = "solar:moon-fog-outline", Box = true, Opened = true}
):Paragraph(
    {
        Title = "UPDATED — " .. v30.Meta.Version,
        Desc = "-> For Suggestions and Bug Reports, Please Join the Discord Server!",
        Locked = false, Buttons = {},
    }
)
local v32 = v30.UIController.Tabs.Farm:Section(
    {Title = "Auto Farm", Icon = "sprout", Box = true, Opened = true}
)
local v33 = v30.Functions.Farm_GetEggsList()
local v34 = v30.Functions.Farm_GetRaritiesList()
local v35 = v30.Functions.Farm_GetAreasList()
v32:Divider({Title = "Specific Eggs"})
v30.UIController.Drops.FarmSpecificEggs = v32:Dropdown(
    {
        Title = "Select", Icon = "egg", SearchBarEnabled = true, Values = v33, Multi = true,
        AllowNone = true, Value = {}, Flag = "FarmSpecificEggs_List",
        Callback = function(arg1)
            local tbl = {}
            if type(arg1) == "table" then
                for _, v1 in ipairs(arg1) do
                    if type(v1) == "string" then
                        local v2 = v1:match("^%[[^%]]+%]%s*(.+)$")
                        if v2 and v2 ~= "" then
                            table.insert(tbl, v2)
                        end
                    end
                end
            elseif type(arg1) == "string" then
                local v3 = arg1:match("^%[[^%]]+%]%s*(.+)$")
                if v3 and v3 ~= "" then
                    table.insert(tbl, v3)
                end
            end
            MystrixHub.FarmController.SpecificEggNames = tbl
        end,
    }
)
v32:Divider({Title = "Rarity"})
v30.UIController.Drops.FarmRarities = v32:Dropdown(
    {
        Title = "Select", Icon = "gem", SearchBarEnabled = true, Values = v34, Multi = true,
        AllowNone = true, Value = {}, Flag = "FarmRarities_List",
        Callback = function(arg1)
            local tbl = {}
            if type(arg1) == "table" then
                for _, v1 in ipairs(arg1) do
                    if type(v1) == "string" and v1 ~= "" then
                        table.insert(tbl, v1)
                    end
                end
            elseif type(arg1) == "string" and arg1 ~= "" then
                table.insert(tbl, arg1)
            end
            MystrixHub.FarmController.SelectedRarities = tbl
        end,
    }
)
v32:Divider({Title = "Areas"})
v30.UIController.Drops.FarmAreas = v32:Dropdown(
    {
        Title = "Select", Icon = "map", SearchBarEnabled = true, Values = v35, Multi = true,
        AllowNone = true, Value = {}, Flag = "FarmAreas_List",
        Callback = function(arg1)
            local tbl = {}
            if type(arg1) == "table" then
                for _, v1 in ipairs(arg1) do
                    if type(v1) == "string" and v1 ~= "" then
                        table.insert(tbl, v1)
                    end
                end
            elseif type(arg1) == "string" and arg1 ~= "" then
                table.insert(tbl, arg1)
            end
            MystrixHub.FarmController.SelectedAreas = tbl
        end,
    }
)
v32:Divider({Title = "Start Farm"})
v32:Toggle(
    {
        Title = "Auto Farm", Value = false, Flag = "Farm_AutoFarm",
        Callback = function(arg1)
            if arg1 then
                local FarmController = MystrixHub.FarmController
                if #FarmController.SpecificEggNames == 0 and #FarmController.SelectedRarities == 0 and #FarmController.SelectedAreas == 0 then
                    WindUI:Notify(
                        {Title = "Farm", Content = "Select at least one filter first!", Duration = 3, Icon = "circle-alert"}
                    )
                    return
                end
                MystrixHub.Functions.StartAutoFarm()
            else
                MystrixHub.Functions.StopAutoFarm()
            end
        end,
    }
)
local v36 = v30.Functions.Sell_GetAllEggCategories()
local v37 = v30.Functions.Sell_GetAllPetCategories()
local v38 = v30.UIController.Tabs.Sell:Section(
    {Title = "Eggs", Icon = "egg", Box = true, Opened = true}
)
v30.UIController.Drops.SellEggs = v38:Dropdown(
    {
        Title = "Select Eggs", Icon = "egg", SearchBarEnabled = true, Values = v36, Multi = true,
        AllowNone = true, Value = {}, Flag = "SellEggs_List",
        Callback = function(arg1)
            local tbl = {}
            if type(arg1) == "table" then
                for _, v1 in ipairs(arg1) do
                    if type(v1) == "string" and v1 ~= "" then
                        table.insert(tbl, v1)
                    end
                end
            elseif type(arg1) == "string" and arg1 ~= "" then
                table.insert(tbl, arg1)
            end
            MystrixHub.SellController.SelectedEggCategories = tbl
        end,
    }
)
local v39 = v38:HStack()
local v40 = v39:VStack()
local v41 = v39:VStack()
v40:Toggle(
    {
        Title = "Auto Sell", Value = false, Flag = "SellEggs_Auto",
        Callback = function(arg1)
            if arg1 then
                if #MystrixHub.SellController.SelectedEggCategories == 0 then
                    WindUI:Notify(
                        {Title = "Sell", Content = "Select at least one egg first!", Duration = 3, Icon = "circle-alert"}
                    )
                    return
                end
                MystrixHub.Functions.Sell_StartAutoEggs()
            else
                MystrixHub.Functions.Sell_StopAutoEggs()
            end
        end,
    }
)
v41:Button(
    {
        Title = "Sell", Icon = "coins",
        Callback = function()
            task.spawn(
                function()
                    local v1 = MystrixHub.Functions.Sell_SelectedEggs()
                    if v1 > 0 then
                        WindUI:Notify(
                            {Title = "Sell", Content = "Sold " .. v1 .. " egg(s).", Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Sell", Content = "No matching eggs to sell.", Duration = 3, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end,
    }
)
v38:Button(
    {
        Title = "Sell Held Egg", Icon = "hand",
        Callback = function()
            task.spawn(
                function()
                    if MystrixHub.Functions.Sell_HeldEgg() then
                        WindUI:Notify(
                            {Title = "Sell", Content = "Sold held egg.", Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Sell", Content = "You are not holding an egg.", Duration = 3, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end,
    }
)
v38:Button(
    {
        Title = "Sell All Eggs", Icon = "trash",
        Callback = function()
            task.spawn(
                function()
                    local v1 = MystrixHub.Functions.Sell_AllEggs()
                    if v1 > 0 then
                        WindUI:Notify(
                            {Title = "Sell", Content = "Sold " .. v1 .. " egg(s).", Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Sell", Content = "No eggs to sell.", Duration = 3, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end,
    }
)
local v42 = v30.UIController.Tabs.Sell:Section(
    {Title = "Pets", Icon = "paw-print", Box = true, Opened = true}
)
v30.UIController.Drops.SellPets = v42:Dropdown(
    {
        Title = "Select Pets", Icon = "paw-print", SearchBarEnabled = true, Values = v37,
        Multi = true, AllowNone = true, Value = {}, Flag = "SellPets_List",
        Callback = function(arg1)
            local tbl = {}
            if type(arg1) == "table" then
                for _, v1 in ipairs(arg1) do
                    if type(v1) == "string" and v1 ~= "" then
                        table.insert(tbl, v1)
                    end
                end
            elseif type(arg1) == "string" and arg1 ~= "" then
                table.insert(tbl, arg1)
            end
            MystrixHub.SellController.SelectedPetCategories = tbl
        end,
    }
)
local v43 = v42:HStack()
local v44 = v43:VStack()
local v45 = v43:VStack()
v44:Toggle(
    {
        Title = "Auto Sell", Value = false, Flag = "SellPets_Auto",
        Callback = function(arg1)
            if arg1 then
                if #MystrixHub.SellController.SelectedPetCategories == 0 then
                    WindUI:Notify(
                        {Title = "Sell", Content = "Select at least one pet first!", Duration = 3, Icon = "circle-alert"}
                    )
                    return
                end
                MystrixHub.Functions.Sell_StartAutoPets()
            else
                MystrixHub.Functions.Sell_StopAutoPets()
            end
        end,
    }
)
v45:Button(
    {
        Title = "Sell", Icon = "coins",
        Callback = function()
            task.spawn(
                function()
                    local v1 = MystrixHub.Functions.Sell_SelectedPets()
                    if v1 > 0 then
                        WindUI:Notify(
                            {Title = "Sell", Content = "Sold " .. v1 .. " pet(s).", Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Sell", Content = "No matching pets to sell.", Duration = 3, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end,
    }
)
v42:Button(
    {
        Title = "Sell Held Pet", Icon = "hand",
        Callback = function()
            task.spawn(
                function()
                    if MystrixHub.Functions.Sell_HeldPet() then
                        WindUI:Notify(
                            {Title = "Sell", Content = "Sold held pet.", Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Sell", Content = "You are not holding a pet.", Duration = 3, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end,
    }
)
v42:Button(
    {
        Title = "Sell All Pets", Icon = "trash",
        Callback = function()
            task.spawn(
                function()
                    local v1 = MystrixHub.Functions.Sell_AllPets()
                    if v1 > 0 then
                        WindUI:Notify(
                            {Title = "Sell", Content = "Sold " .. v1 .. " pet(s).", Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Sell", Content = "No pets to sell.", Duration = 3, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end,
    }
)
local v46 = v30.UIController.Tabs.Shop:Section(
    {Title = "Buy", Icon = "shopping-bag", Box = true, Opened = true}
)
v46:Divider({Title = "Trails"})
v46:Toggle(
    {
        Title = "Auto Buy Best", Value = false, Flag = "Shop_AutoTrail",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Shop_StartAutoTrail()
            else
                MystrixHub.Functions.Shop_StopAutoTrail()
            end
        end,
    }
)
v46:Divider({Title = "Bikes"})
v46:Toggle(
    {
        Title = "Auto Buy Best", Value = false, Flag = "Shop_AutoBike",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Shop_StartAutoBike()
            else
                MystrixHub.Functions.Shop_StopAutoBike()
            end
        end,
    }
)
local v47 = MystrixHub.UIController.Tabs.Shop:Section(
    {Title = "Upgrades", Icon = "circle-arrow-up", Box = true, Opened = true}
)
v47:Divider({Title = "Treadmill"})
v47:Toggle(
    {
        Title = "Auto Upgrade", Value = false, Flag = "Shop_AutoTreadmill",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Shop_StartAutoTreadmill()
            else
                MystrixHub.Functions.Shop_StopAutoTreadmill()
            end
        end,
    }
)
v47:Divider({Title = "Plot"})
v47:Toggle(
    {
        Title = "Auto Upgrade", Value = false, Flag = "Shop_AutoPlot",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Shop_StartAutoPlot()
            else
                MystrixHub.Functions.Shop_StopAutoPlot()
            end
        end,
    }
)
local v48 = MystrixHub.UIController.Tabs.Plot:Section(
    {Title = "Hatch", Icon = "egg", Box = true, Opened = true}
)
local v49 = MystrixHub
local v50 = v49.Functions.Plot_GetEggsList()
v49.UIController.Drops.PlotHatchEggs = v48:Dropdown(
    {
        Title = "Eggs", Icon = "egg", SearchBarEnabled = true, Values = v50, Multi = true,
        AllowNone = true, Value = {"All"}, Flag = "PlotHatchEggs_List",
        Callback = function(arg1)
            local tbl = {}
            if type(arg1) == "table" then
                for _, v1 in ipairs(arg1) do
                    if type(v1) == "string" and v1 ~= "" then
                        table.insert(tbl, v1)
                    end
                end
            elseif type(arg1) == "string" and arg1 ~= "" then
                table.insert(tbl, arg1)
            end
            MystrixHub.PlotController.HatchSelectedEggs = tbl
        end,
    }
)
local v51 = v48:HStack()
local v52 = v51:VStack()
local v53 = v51:VStack()
v52:Toggle(
    {
        Title = "Auto Hatch", Value = false, Flag = "Plot_AutoHatch",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Plot_StartAutoHatch()
            else
                MystrixHub.Functions.Plot_StopAutoHatch()
            end
        end,
    }
)
v53:Button(
    {
        Title = "Hatch", Icon = "egg",
        Callback = function()
            task.spawn(
                function()
                    local num = 0
                    for _ = 1, 20 do
                        local v1, v2 = pcall(MystrixHub.Functions.Plot_RunHatchOnce)
                        if v1 and v2 then
                            num = num + 1
                            task.wait(0.6)
                        else
                            break
                        end
                    end
                    if num > 0 then
                        WindUI:Notify(
                            {Title = "Hatch", Content = "Hatched " .. num .. " egg(s).", Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Hatch", Content = "No ready eggs to hatch.", Duration = 3, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end,
    }
)
local v54 = MystrixHub.UIController.Tabs.Plot:Section(
    {Title = "Place", Icon = "map-pin", Box = true, Opened = true}
)
v54:Divider({Title = "Eggs"})
local v55 = MystrixHub
local v56 = v55.Functions.Plot_GetEggsListForPlace()
v55.UIController.Drops.PlotPlaceEggs = v54:Dropdown(
    {
        Title = "Eggs", Icon = "egg", SearchBarEnabled = true, Values = v56, Multi = true,
        AllowNone = true, Value = {"Best"}, Flag = "PlotPlaceEggs_List",
        Callback = function(arg1)
            local tbl = {}
            if type(arg1) == "table" then
                for _, v1 in ipairs(arg1) do
                    if type(v1) == "string" and v1 ~= "" then
                        table.insert(tbl, v1)
                    end
                end
            elseif type(arg1) == "string" and arg1 ~= "" then
                table.insert(tbl, arg1)
            end
            MystrixHub.PlotController.PlaceSelectedEggs = tbl
        end,
    }
)
local v57 = v54:HStack()
local v58 = v57:VStack()
local v59 = v57:VStack()
v58:Toggle(
    {
        Title = "Auto Place", Value = false, Flag = "Plot_AutoPlace",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Plot_StartAutoPlace()
            else
                MystrixHub.Functions.Plot_StopAutoPlace()
            end
        end,
    }
)
v59:Button(
    {
        Title = "Place", Icon = "map-pin",
        Callback = function()
            task.spawn(
                function()
                    local num = 0
                    local v4
                    for _ = 1, 10 do
                        local v1, v2, v3 = pcall(MystrixHub.Functions.Plot_RunPlaceOnce)
                        if not v1 then
                            v4 = "error: " .. tostring(v2)
                        else
                            if v2 then
                                num = num + 1
                                task.wait(1.2)
                                continue
                            end
                            v4 = tostring(v3 or "unknown")
                        end
                        break
                    end
                    if num > 0 then
                        WindUI:Notify(
                            {Title = "Place", Content = "Placed " .. num .. " egg(s).", Duration = 3, Icon = "circle-check"}
                        )
                    else
                        WindUI:Notify(
                            {Title = "Place Failed", Content = v4 or "no reason", Duration = 5, Icon = "circle-alert"}
                        )
                    end
                end
            )
        end,
    }
)
v54:Divider({Title = "Pets"})
v54:Toggle(
    {
        Title = "Auto Place Best Pets", Value = false, Flag = "Plot_AutoPlaceBestPets",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Plot_StartAutoPlaceBestPets()
            else
                MystrixHub.Functions.Plot_StopAutoPlaceBestPets()
            end
        end,
    }
)
MystrixHub.UIController.Tabs.Plot:Section(
    {Title = "Treadmill", Icon = "activity", Box = true, Opened = true}
):Toggle(
    {
        Title = "Auto Treadmill", Value = false, Flag = "Plot_AutoTreadmill",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Plot_StartAutoTreadmill()
            else
                MystrixHub.Functions.Plot_StopAutoTreadmill()
            end
        end,
    }
)
MystrixHub.UIController.Tabs.Plot:Section(
    {Title = "Rewards", Icon = "gift", Box = true, Opened = true}
):Toggle(
    {
        Title = "Auto Claim Index Rewards", Value = false, Flag = "Plot_AutoClaim",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.Plot_StartAutoClaim()
            else
                MystrixHub.Functions.Plot_StopAutoClaim()
            end
        end,
    }
)
local v60 = MystrixHub.UIController.Tabs.Settings:HStack()
local v61 = v60:VStack()
local v62 = v60:VStack()
local v63 = v61:Section({Title = "Appearance", Icon = "palette", Box = true, Opened = true})
MystrixHub.UIController.Drops.Theme = v63:Dropdown(
    {
        Title = "Theme", Icon = "swatch-book",
        Values = {
            "Sky", "Dark", "Light", "Rose", "Plant", "Red", "Indigo", "Violet", "Amber", "Emerald",
            "Midnight", "Crimson", "Mellowsi", "Monokai Pro", "Cotton Candy", "Rainbow",
        }, Value = "Crimson", Flag = "UI_Theme",
        Callback = function(arg1)
            WindUI:SetTheme(arg1)
            local v1 = MystrixHub
            v1.UIController.CurrentTheme = arg1
            local v2 = v1.UIController.ThemeAccents[arg1] or Color3.fromHex("#FFFFFF")
            local v3 = MystrixHub
            v3.Functions.UpdateTagAccents(v2)
            if not v3.UIController.ThemeFirstLoad then
                WindUI:Notify(
                    {Title = "Theme Changed", Content = arg1, Duration = 2, Icon = "palette"}
                )
            end
            MystrixHub.UIController.ThemeFirstLoad = false
        end,
    }
)
v63:Slider(
    {
        Title = "Transparency", Value = {Min = 0, Max = 0.99, Default = 0.15}, Step = 0.01,
        Flag = "Background_Transparency",
        Callback = function(arg1)
            local v1 = MystrixHub
            v1.UIController.BGTransparency = arg1
            if v1.UIController.WinBG then
                MystrixHub.Functions.ApplyTransparency()
            else
                pcall(
                    function()
                        for _, v1 in ipairs(CoreGui:GetChildren()) do
                            local v2, v3 = pcall(
                                function()
                                    return v1.WindUI.Window.Frame.Background
                                end
                            )
                            if v2 and v3 then
                                local v4 = MystrixHub
                                v4.UIController.WinBG = v3
                                v4.Functions.ApplyTransparency()
                                v4.Functions.StartBGWatcher()
                                break
                            end
                        end
                    end
                )
            end
        end,
    }
)
v63:Toggle(
    {
        Title = "Show User", Value = true, Flag = "Show_User",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.UIController.Window.User:Enable()
            else
                MystrixHub.UIController.Window.User:Disable()
            end
        end,
    }
)
v63:Toggle(
    {
        Title = "Show FPS", Value = false, Flag = "Show_FPS",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.CreateFPSTag()
            else
                MystrixHub.Functions.DestroyFPSTag()
            end
        end,
    }
)
v63:Toggle(
    {
        Title = "Show Ping", Value = false, Flag = "Show_Ping",
        Callback = function(arg1)
            if arg1 then
                MystrixHub.Functions.CreatePingTag()
            else
                MystrixHub.Functions.DestroyPingTag()
            end
        end,
    }
)
v61:Section({Title = "Keybinds", Icon = "keyboard", Box = true, Opened = true}):Keybind(
    {
        Title = "Toggle UI", Icon = "keyboard", Value = "J", Flag = "ToggleUI_Key",
        Callback = function(arg1)
            MystrixHub.UIController.Window:SetToggleKey(Enum.KeyCode[arg1])
        end,
    }
)
local v64 = v61:Section({Title = "Misc", Icon = "shield-check", Box = true, Opened = true})
local VirtualUser = game:GetService("VirtualUser")
local flag = false
v64:Toggle(
    {
        Title = "Anti AFK", Value = false, Flag = "AntiAFK",
        Callback = function(arg1)
            if arg1 then
                if flag then
                    return
                end
                flag = true
                task.spawn(
                    function()
                        while flag do
                            VirtualUser:CaptureController()
                            VirtualUser:ClickButton2(Vector2.new())
                            task.wait(60)
                        end
                    end
                )
            else
                flag = false
            end
        end,
    }
)
v64:Toggle(
    {
        Title = "Infinite Jump", Value = false, Flag = "InfJump",
        Callback = function(arg1)
            if arg1 then
                if MystrixHub.InfJumpConn then
                    MystrixHub.InfJumpConn:Disconnect()
                end
                MystrixHub.InfJumpConn = game:GetService("UserInputService").JumpRequest:Connect(
                    function()
                        local Character = LocalPlayer.Character
                        if not Character then
                            return
                        end
                        local Humanoid = Character:FindFirstChildOfClass("Humanoid")
                        if not Humanoid then
                            return
                        end
                        local State = Humanoid:GetState()
                        if State == Enum.HumanoidStateType.Freefall or State == Enum.HumanoidStateType.Jumping then
                            Humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
                        end
                    end
                )
            elseif MystrixHub.InfJumpConn then
                MystrixHub.InfJumpConn:Disconnect()
                MystrixHub.InfJumpConn = nil
            end
        end,
    }
)
v64:Toggle(
    {
        Title = "Quick Interact", Value = false, Flag = "QuickInteract",
        Callback = function(arg1)
            if arg1 then
                local v1 = MystrixHub
                v1.PromptBackup = v1.PromptBackup or {}
                local PromptBackup = MystrixHub.PromptBackup
                MystrixHub.QuickInteractConn = workspace.DescendantAdded:Connect(
                    function(arg1)
                        if arg1:IsA("ProximityPrompt") then
                            PromptBackup[arg1] = {
                                hold = arg1.HoldDuration, line = arg1.RequiresLineOfSight
                            }
                            arg1.HoldDuration = 0
                            arg1.RequiresLineOfSight = false
                        end
                    end
                )
                for _, v2 in ipairs(workspace:GetDescendants()) do
                    if v2:IsA("ProximityPrompt") then
                        PromptBackup[v2] = {hold = v2.HoldDuration, line = v2.RequiresLineOfSight}
                        v2.HoldDuration = 0
                        v2.RequiresLineOfSight = false
                    end
                end
            else
                if MystrixHub.QuickInteractConn then
                    MystrixHub.QuickInteractConn:Disconnect()
                    MystrixHub.QuickInteractConn = nil
                end
                local PromptBackup1 = MystrixHub.PromptBackup
                if PromptBackup1 then
                    for k, v3 in pairs(PromptBackup1) do
                        pcall(
                            function()
                                k.HoldDuration = v3.hold
                                k.RequiresLineOfSight = v3.line
                            end
                        )
                    end
                    table.clear(PromptBackup1)
                end
            end
        end,
    }
)
local v65 = v61:Section({Title = "Performance", Icon = "cpu", Box = true, Opened = true})
v65:Toggle(
    {
        Title = "Hide Players", Value = false, Flag = "HidePlayers",
        Callback = function(arg1)
            local function func(arg1)
                local Character = arg1.Character
                if not Character then
                    return
                end
                for _, v1 in ipairs(Character:GetDescendants()) do
                    if v1:IsA("BasePart") or v1:IsA("Decal") or v1:IsA("Texture") then
                        v1.LocalTransparencyModifier = 1
                    elseif v1:IsA("BillboardGui") or v1:IsA("SurfaceGui") then
                        v1.Enabled = false
                    end
                end
            end
            local function func1(arg1)
                local Character = arg1.Character
                if not Character then
                    return
                end
                for _, v1 in ipairs(Character:GetDescendants()) do
                    if v1:IsA("BasePart") or v1:IsA("Decal") or v1:IsA("Texture") then
                        v1.LocalTransparencyModifier = 0
                    elseif v1:IsA("BillboardGui") or v1:IsA("SurfaceGui") then
                        v1.Enabled = true
                    end
                end
            end
            if arg1 then
                local tbl = {}
                local function func2(arg1)
                    if arg1 == LocalPlayer then
                        return
                    end
                    if tbl[arg1] then
                        tbl[arg1]:Disconnect()
                    end
                    func(arg1)
                    tbl[arg1] = arg1.CharacterAdded:Connect(
                        function()
                            func(arg1)
                        end
                    )
                end
                for _, v1 in ipairs(Players:GetPlayers()) do
                    func2(v1)
                end
                MystrixHub.HidePlayersStuff = {
                    Players.PlayerAdded:Connect(func2),
                    Players.PlayerRemoving:Connect(
                        function(arg1)
                            if tbl[arg1] then
                                tbl[arg1]:Disconnect()
                                tbl[arg1] = nil
                            end
                        end
                    ), tbl, func1,
                }
            elseif MystrixHub.HidePlayersStuff then
                local HidePlayersStuff = MystrixHub.HidePlayersStuff
                pcall(
                    function()
                        HidePlayersStuff[1]:Disconnect()
                    end
                )
                pcall(
                    function()
                        HidePlayersStuff[2]:Disconnect()
                    end
                )
                for _, v2 in pairs(HidePlayersStuff[3]) do
                    pcall(
                        function()
                            v2:Disconnect()
                        end
                    )
                end
                for _, v3 in ipairs(Players:GetPlayers()) do
                    if v3 ~= LocalPlayer then
                        pcall(
                            function()
                                HidePlayersStuff[4](v3)
                            end
                        )
                    end
                end
                MystrixHub.HidePlayersStuff = nil
            end
        end,
    }
)
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "MystrixBlackScreen"
screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
screenGui.IgnoreGuiInset = true
screenGui.Parent = LocalPlayer.PlayerGui
local frame = Instance.new("Frame")
frame.BackgroundColor3 = Color3.new(0, 0, 0)
frame.BorderSizePixel = 0
frame.Size = UDim2.fromScale(1, 1)
frame.Parent = screenGui
screenGui.Enabled = false
v65:Toggle(
    {
        Title = "Reduce CPU Usage", Value = false, Flag = "ReduceCPU",
        Callback = function(arg1)
            screenGui.Enabled = arg1
        end,
    }
)
v65:Slider(
    {
        Title = "FPS Cap", Value = {Min = 10, Max = 240, Default = 240}, Step = 10, Flag = "FpsCap",
        Callback = function(arg1)
            pcall(
                function()
                    if setfpscap then
                        setfpscap(arg1)
                    elseif setfps then
                        setfps(arg1)
                    elseif syn and syn.set_fps_cap then
                        syn.set_fps_cap(arg1)
                    end
                end
            )
        end,
    }
)
v65:Button(
    {
        Title = "Anti Lag",
        Callback = function()
            local screenGui = Instance.new("ScreenGui")
            screenGui.Name = "BlackScreen"
            screenGui.ResetOnSpawn = false
            screenGui.DisplayOrder = 2147483647
            screenGui.IgnoreGuiInset = true
            screenGui.Parent = CoreGui
            local frame = Instance.new("Frame")
            frame.Size = UDim2.new(1, 0, 1, 0)
            frame.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
            frame.BorderSizePixel = 0
            frame.Parent = screenGui
            local frame1 = Instance.new("Frame")
            frame1.Size = UDim2.new(0, 300, 0, 24)
            frame1.Position = UDim2.new(0.5, -150, 0.5, -12)
            frame1.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
            frame1.BorderSizePixel = 0
            frame1.Parent = screenGui
            local frame2 = Instance.new("Frame")
            frame2.Size = UDim2.new(0, 0, 1, 0)
            frame2.BackgroundColor3 = Color3.fromRGB(0, 255, 100)
            frame2.BorderSizePixel = 0
            frame2.Parent = frame1
            local textLabel = Instance.new("TextLabel")
            textLabel.Size = UDim2.new(1, 0, 0, 20)
            textLabel.Position = UDim2.new(0, 0, 1, 10)
            textLabel.BackgroundTransparency = 1
            textLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
            textLabel.TextSize = 14
            textLabel.Font = Enum.Font.SourceSans
            textLabel.Text = "0%"
            textLabel.Parent = screenGui
            task.spawn(
                function()
                    pcall(
                        function()
                            loadstring(
                                game:HttpGet(
                                    "https://raw.githubusercontent.com/imisury/antilag/refs/heads/main/antilag"
                                )
                            )()
                        end
                    )
                end
            )
            local v1 = tick()
            while tick() - v1 < 6.5 do
                local v2 = tick() - v1
                local v3 = math.min(v2 / 6.5, 1)
                frame2.Size = UDim2.new(v3, 0, 1, 0)
                textLabel.Text = string.format("%d%%", math.floor(v3 * 100))
                task.wait()
            end
            frame2.Size = UDim2.new(1, 0, 1, 0)
            textLabel.Text = "100%"
            task.wait(0.5)
            screenGui:Destroy()
        end,
    }
)
local v66 = v62:Section({Title = "Config", Icon = "save", Box = true, Opened = true})
v66:Input(
    {
        Title = "Config Name", Icon = "pencil", Placeholder = "MystrixHub",
        Callback = function(arg1)
            MystrixHub.ConfigController.NameInput = arg1 and arg1 ~= "" and arg1 or "MystrixHub"
        end,
    }
)
v66:Button(
    {
        Title = "Save Config", Icon = "save",
        Callback = function()
            task.spawn(
                function()
                    local v1 = MystrixHub
                    local v2 = v1.ConfigController.GetConfig(v1.ConfigController.NameInput)
                    local v3, v4 = pcall(
                        function()
                            v2:Save()
                        end
                    )
                    if v3 then
                        local v5 = MystrixHub
                        v5.ConfigController.SaveLastConfigName(v5.ConfigController.NameInput)
                    end
                    WindUI:Notify(
                        {
                            Title = v3 and "Config Saved" or "Save Failed",
                            Content = v3 and "Saved as: " .. MystrixHub.ConfigController.NameInput or tostring(
                                v4
                            ), Duration = 3, Icon = v3 and "circle-check" or "circle-alert",
                        }
                    )
                    if v3 and MystrixHub.ConfigController.Dropdown then
                        local v6 = MystrixHub
                        v6.ConfigController.Dropdown:Refresh(
                            v6.ConfigController.GetAllConfigNames()
                        )
                    end
                end
            )
        end,
    }
)
v66:Divider()
local v67 = MystrixHub
local v68 = v67.ConfigController.GetAllConfigNames()
v67.ConfigController.Dropdown = v66:Dropdown(
    {
        Title = "Select Config", Icon = "folder-open", Values = v68, Multi = false,
        Value = v68[1] or "No configs found",
        Callback = function(arg1)
            MystrixHub.ConfigController.SelectedConfig = arg1 ~= "No configs found" and arg1 or nil
        end,
    }
)
v66:Button(
    {
        Title = "Refresh Config List", Icon = "refresh-cw",
        Callback = function()
            local v1 = MystrixHub
            v1.ConfigController.Dropdown:Refresh(v1.ConfigController.GetAllConfigNames())
            WindUI:Notify(
                {
                    Title = "Refreshed", Content = "Config list has been updated!", Duration = 2,
                    Icon = "circle-check",
                }
            )
        end,
    }
)
v66:Button(
    {
        Title = "Load Selected Config", Icon = "folder-open",
        Callback = function()
            if not MystrixHub.ConfigController.SelectedConfig then
                WindUI:Notify(
                    {
                        Title = "No Config Selected",
                        Content = "Please select a config from the dropdown first!", Duration = 3,
                        Icon = "circle-alert",
                    }
                )
                return
            end
            WindUI:Notify(
                {
                    Title = "Loading Config",
                    Content = "Loading: " .. MystrixHub.ConfigController.SelectedConfig .. ", please wait...",
                    Duration = 3, Icon = "loader",
                }
            )
            task.spawn(
                function()
                    local v1 = MystrixHub
                    local v2 = v1.ConfigController.GetConfig(v1.ConfigController.SelectedConfig)
                    local v3, v4 = pcall(
                        function()
                            v2:Load()
                        end
                    )
                    if v3 then
                        task.wait(0.1)
                        local v5 = MystrixHub
                        v5.Functions.SyncDropdownsToState()
                        v5.ConfigController.SaveLastConfigName(v5.ConfigController.SelectedConfig)
                    end
                    WindUI:Notify(
                        {
                            Title = v3 and "Config Loaded" or "Load Failed",
                            Content = v3 and "Loaded: " .. MystrixHub.ConfigController.SelectedConfig or tostring(
                                v4
                            ), Duration = 3, Icon = v3 and "circle-check" or "circle-alert",
                        }
                    )
                end
            )
        end,
    }
)
v66:Button(
    {
        Title = "Delete Selected Config", Icon = "trash",
        Callback = function()
            if not MystrixHub.ConfigController.SelectedConfig then
                WindUI:Notify(
                    {
                        Title = "No Config Selected",
                        Content = "Please select a config from the dropdown first!", Duration = 3,
                        Icon = "circle-alert",
                    }
                )
                return
            end
            task.spawn(
                function()
                    local v1 = MystrixHub
                    local v2 = v1.ConfigController.GetConfig(v1.ConfigController.SelectedConfig)
                    local v3, v4 = pcall(
                        function()
                            v2:Delete()
                        end
                    )
                    WindUI:Notify(
                        {
                            Title = v3 and "Config Deleted" or "Delete Failed",
                            Content = v3 and "Deleted: " .. MystrixHub.ConfigController.SelectedConfig or tostring(
                                v4
                            ), Duration = 3, Icon = v3 and "circle-check" or "circle-alert",
                        }
                    )
                    if v3 then
                        local v5 = MystrixHub
                        v5.ConfigController.Cache[v5.ConfigController.SelectedConfig] = nil
                        if v5.ConfigController.LoadLastConfigName() == v5.ConfigController.SelectedConfig then
                            pcall(
                                function()
                                    if writefile then
                                        writefile(MystrixHub.ConfigController.LastConfigFile, "")
                                    end
                                end
                            )
                        end
                        MystrixHub.ConfigController.SelectedConfig = nil
                        local v6 = MystrixHub
                        v6.ConfigController.Dropdown:Refresh(
                            v6.ConfigController.GetAllConfigNames()
                        )
                    end
                end
            )
        end,
    }
)
v66:Divider()
local v69 = MystrixHub
v66:Toggle(
    {
        Title = "Enable Auto Load", Value = v69.ConfigController.GetAutoLoadSetting(),
        Flag = "AutoLoad_Config",
        Callback = function(arg1)
            MystrixHub.ConfigController.SetAutoLoadSetting(arg1)
            WindUI:Notify(
                {
                    Title = "Auto Load " .. (arg1 and "Enabled" or "Disabled"),
                    Content = arg1 and "Last config will load on execute." or "Auto load turned off",
                    Duration = 2, Icon = arg1 and "circle-check" or "info",
                }
            )
        end,
    }
)
v66:Button(
    {
        Title = "Load Last Config", Icon = "folder-open",
        Callback = function()
            local v1 = MystrixHub.ConfigController.LoadLastConfigName()
            if not v1 or v1 == "" then
                WindUI:Notify(
                    {
                        Title = "No Last Config", Content = "You haven't saved any config yet.",
                        Duration = 3, Icon = "circle-alert",
                    }
                )
                return
            end
            WindUI:Notify(
                {Title = "Loading Last Config", Content = "Loading: " .. v1 .. "...", Duration = 2, Icon = "loader"}
            )
            task.spawn(
                function()
                    local v2 = MystrixHub.ConfigController.GetConfig(v1)
                    local v3, v4 = pcall(
                        function()
                            v2:Load()
                        end
                    )
                    if v3 then
                        task.wait(0.1)
                        local v5 = MystrixHub
                        v5.Functions.SyncDropdownsToState()
                        v5.ConfigController.SaveLastConfigName(v1)
                    end
                    WindUI:Notify(
                        {
                            Title = v3 and "Config Loaded" or "Load Failed",
                            Content = v3 and "Loaded: " .. v1 or tostring(v4), Duration = 3,
                            Icon = v3 and "circle-check" or "circle-alert",
                        }
                    )
                end
            )
        end,
    }
)
v66:Divider()
v66:Button(
    {
        Title = "Export Config", Icon = "upload",
        Callback = function()
            task.spawn(
                function()
                    local SelectedConfig = MystrixHub.ConfigController.SelectedConfig
                    if not SelectedConfig or SelectedConfig == "" or SelectedConfig == "No configs found" then
                        WindUI:Notify(
                            {
                                Title = "Export Failed",
                                Content = "Please select a config from the dropdown first!",
                                Duration = 3, Icon = "circle-alert",
                            }
                        )
                        return
                    end
                    local v1 = MystrixHub.Meta.FolderPath .. "/Config/" .. SelectedConfig .. ".json"
                    local v2 = MystrixHub.Meta.FolderPath .. "/Configs/" .. SelectedConfig .. ".json"
                    local v3
                    if isfile and isfile(v1) then
                        v3 = v1
                    elseif isfile and isfile(v2) then
                        v3 = v2
                    else
                        local v4, v5 = pcall(readfile, v1)
                        if v4 and v5 and v5 ~= "" then
                            v3 = v1
                        else
                            local v6, v7 = pcall(readfile, v2)
                            if v6 and v7 and v7 ~= "" then
                                v3 = v2
                            end
                        end
                    end
                    if not v3 then
                        WindUI:Notify(
                            {
                                Title = "Export Failed",
                                Content = "Config file not found. Make sure you've saved it at least once.",
                                Duration = 4, Icon = "circle-alert",
                            }
                        )
                        return
                    end
                    local v10
                    local v8, v9 = pcall(readfile, v3)
                    if v8 and v9 and v9 ~= "" then
                        v10 = v9
                    end
                    if not v10 then
                        WindUI:Notify(
                            {
                                Title = "Export Failed",
                                Content = "Could not read config file content.", Duration = 3,
                                Icon = "circle-alert",
                            }
                        )
                        return
                    end
                    local v11 = HttpService:JSONEncode(
                        {mhub = true, v = MystrixHub.Meta.Version, name = SelectedConfig, data = v10}
                    )
                    if setclipboard then
                        setclipboard(v11)
                        WindUI:Notify(
                            {
                                Title = "Config Exported!",
                                Content = "'" .. SelectedConfig .. "' copied to clipboard.",
                                Duration = 4, Icon = "clipboard-check",
                            }
                        )
                    else
                        WindUI:Notify(
                            {
                                Title = "No Clipboard",
                                Content = "Your executor does not support setclipboard().",
                                Duration = 3, Icon = "circle-alert",
                            }
                        )
                    end
                end
            )
        end,
    }
)
v66:Input(
    {
        Title = "Import Config", Icon = "clipboard",
        Placeholder = "Paste exported config string here...", Flag = "ImportConfigInput",
        Callback = function(arg1)
            MystrixHub.ConfigController.ImportData = arg1 or ""
        end,
    }
)
v66:Button(
    {
        Title = "Import Config", Icon = "download",
        Callback = function()
            task.spawn(
                function()
                    local v1 = MystrixHub.ConfigController.ImportData or ""
                    if v1 == "" then
                        WindUI:Notify(
                            {
                                Title = "Import Failed",
                                Content = "Paste a config string into the input above first!",
                                Duration = 3, Icon = "circle-alert",
                            }
                        )
                        return
                    end
                    local v2, v3 = pcall(
                        function()
                            return HttpService:JSONDecode(v1)
                        end
                    )
                    if not v2 or type(v3) ~= "table" or not v3.mhub or not v3.data or not v3.name then
                        WindUI:Notify(
                            {
                                Title = "Invalid Config",
                                Content = "That doesn't look like a valid Mystrix Hub config!",
                                Duration = 4, Icon = "circle-alert",
                            }
                        )
                        return
                    end
                    local str = tostring(v3.name)
                    pcall(
                        function()
                            makefolder("WindUI")
                        end
                    )
                    pcall(
                        function()
                            makefolder(MystrixHub.Meta.FolderPath)
                        end
                    )
                    local v4 = MystrixHub.Meta.FolderPath .. "/Config"
                    pcall(
                        function()
                            makefolder(v4)
                        end
                    )
                    if not pcall(writefile, v4 .. "/" .. str .. ".json", v3.data) then
                        WindUI:Notify(
                            {
                                Title = "Import Failed",
                                Content = "Could not write config file to disk!", Duration = 3,
                                Icon = "circle-alert",
                            }
                        )
                        return
                    end
                    task.wait(0.5)
                    local v5 = MystrixHub
                    v5.ConfigController.Cache[str] = nil
                    local v6 = v5.ConfigController.GetConfig(str)
                    local v7, v8 = pcall(
                        function()
                            v6:Load()
                        end
                    )
                    if v7 then
                        task.wait(0.1)
                        local v9 = MystrixHub
                        v9.Functions.SyncDropdownsToState()
                        v9.ConfigController.SaveLastConfigName(str)
                        pcall(
                            function()
                                local v1 = MystrixHub
                                v1.ConfigController.Dropdown:Refresh(
                                    v1.ConfigController.GetAllConfigNames()
                                )
                                local v2 = MystrixHub
                                v2.ConfigController.Dropdown.Value = str
                                v2.ConfigController.SelectedConfig = str
                            end
                        )
                        WindUI:Notify(
                            {
                                Title = "Config Imported & Loaded!",
                                Content = "Successfully applied: " .. str, Duration = 5,
                                Icon = "circle-check",
                            }
                        )
                    else
                        WindUI:Notify(
                            {
                                Title = "Import Failed to Apply",
                                Content = "File written but could not be loaded.\nError: " .. tostring(
                                    v8
                                ), Duration = 5, Icon = "circle-alert",
                            }
                        )
                    end
                end
            )
        end,
    }
)
if v69.Auth.KeyError == "HWID_RESET" then
    WindUI:Notify(
        {
            Title = "HWID Reset Detected", Content = "Your key has been re-linked to this device.",
            Duration = 6, Icon = "shield-alert",
        }
    )
elseif MystrixHub.Auth.KeyError then
    local v70 = MystrixHub
    WindUI:Notify(
        {
            Title = "Key Warning", Content = v70.Functions.GetFriendlyError(v70.Auth.KeyError),
            Duration = 6, Icon = "triangle-alert",
        }
    )
end
MystrixHub.Functions.AttemptAutoLoad()
