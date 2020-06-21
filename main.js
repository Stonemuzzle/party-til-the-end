class PartyFavor {
    constructor(array) {
        this.name = array[0]
        this.power = array[1]
        this.cost = array[2]
        this.enabled = array[3]
        this.count = array[4]
        this.passive = array[5]
        this.index = array[6]
    }
    getCostLabel() {
        if (this.passive == true) {
            return `Buy a ${this.name}!<br/>Cost: ${this.cost} Fun`
        }
        else {
            return `More ${this.name}!<br/>Cost: ${this.cost} Fun`
        }
    }

    getPowerLabel() {
        if (this.passive == true) {
            
            return `${this.name} Power: ${this.power} Fun per second`
        }
        else {
            var totalPower = this.power * this.count
            return `${this.name} Power: ${totalPower} fun per click`
        }
    }
}

var gameDataDefaults = {
    currentFun: 0,
    lifetimeFun: 0,
    lifetimeSpentFun: 0,
    version: 1,
    partyFavors: {
        Streamer: ["Streamer", 1, 20, false, 0, true, 1],
        Speaker: ["Speaker", 5, 100, false, 0, true, 2],
        Hype: ["Hype", 1, 10, false, 1, false, 1]
    },
    partyFavorValues: ["name","power","cost","enabled","count","passive","index"],
    statusMessages: {
        0: "Longest week ever! I'm ready to party until the end of time, so let's get this party started!",
        1: "Now we're partying!"
    },
    passivesEnabled: false,
    totalClicks: 0
}

var gameData = {}
var funPerSecond = 0
var lastAutoPartyTimeStamp = timeStamp()
var oldTimeStamp = timeStamp()
var secondsSinceLastSave = 0

var saveGame = JSON.parse(window.localStorage.getItem("partySave"))
console.log(saveGame)
if (saveGame)
{
    if (gameData.version == saveGame.version)
    {
        gameData = saveGame
    }
    else
    {
        for (var key in gameDataDefaults)
        {
            if (typeof saveGame[key]!== "undefined")
            {
                gameData[key] = saveGame[key]
            }
            else
            {
                gameData[key] = gameDataDefaults[key]
            }
        }
    }
}
else
{
    var gameData = gameDataDefaults
}

var partyFavors = {}
for (let [key, value] of Object.entries(gameData.partyFavors))
{
    partyFavors[key] = new PartyFavor(value)
}


function generatePassivesTable() {
    let table = document.getElementById("passivesTable")
    let data = ["Party favor", "Count", "Power", "Fun/second"]

    let thead = table.createTHead()
    let row = thead.insertRow()
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function addPassivesRow(key) {
    let table = document.getElementById("passivesTable")
    if (table.rows.length > partyFavors[key].index) {
        var row = table.insertRow(partyFavors[key].index)
        console.log("indexed")
    } else {
        var row = table.insertRow()
        console.log("Not indexed")
    }
    row.id = "passivesRow" + partyFavors[key].name
    let cellName = row.insertCell()
    cellName.id = "passivesCellName" + partyFavors[key].name
    cellName.appendChild(document.createTextNode(partyFavors[key].name))
    let cellCount = row.insertCell()
    cellCount.id = "passivesCellCount" + partyFavors[key].name
    cellCount.appendChild(document.createTextNode(partyFavors[key].count))
    let cellPower = row.insertCell()
    cellPower.id = "passivesCellPower" + partyFavors[key].name
    cellPower.appendChild(document.createTextNode(partyFavors[key].power))
    let cellRate = row.insertCell()
    cellRate.id = "passivesCellRate" + partyFavors[key].name
    cellRate.appendChild(document.createTextNode(partyFavors[key].power * partyFavors[key].count))
}

function buyPartyFavor(id) {
    if (gameData.currentFun >= partyFavors[id].cost)
    {
        if (partyFavors[id].passive == true) {
            let table = document.getElementById("passivesTable")
            if (table.rows.length == 0) {
                generatePassivesTable()
                gameData.passivesEnabled = true
            }
            if (partyFavors[id].count == 0) {
                addPassivesRow(id)
            }
            document.getElementById("passivesCellPower" + partyFavors[id].name).innerHTML = partyFavors[id].power
            document.getElementById("passivesCellCount" + partyFavors[id].name).innerHTML = partyFavors[id].count + 1
            document.getElementById("passivesCellRate" + partyFavors[id].name).innerHTML = partyFavors[id].power * (partyFavors[id].count + 1)
        }
        else {
            document.getElementById(partyFavors[id].name + "Power").innerHTML = partyFavors[id].getPowerLabel()
        }
    decreaseFun(partyFavors[id].cost)
    partyFavors[id].cost *= 2
    gameData.partyFavors[id][getPartyFavorIndex("cost")] = partyFavors[id].cost
    partyFavors[id].count++
    gameData.partyFavors[id][getPartyFavorIndex("count")] = partyFavors[id].count
    document.getElementById(id).innerHTML = partyFavors[id].getCostLabel()
    }
}

function getPartyFavorIndex(name) {   
    return gameData.partyFavorValues.findIndex(function (element) {return element == name})
}

function updatePartyFavor(name, value) {

}

function init()
{
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame

    // Pointless comment because fuck this editor not recognizing the bloody block above
    if (gameData.passivesEnabled == true) {
        generatePassivesTable()
        for (let [key, value] of Object.entries(gameData.partyFavors))
        {
            if (gameData.partyFavors[key][getPartyFavorIndex("enabled")] == true 
            && gameData.partyFavors[key][getPartyFavorIndex("passive")] == true) {
                addPassivesRow(key)
            }
            if (gameData.partyFavors[key][getPartyFavorIndex("enabled")] == true) {
                document.getElementById("divBuy" + partyFavors[key].name).style.display = "block"
                document.getElementById(key).innerHTML = partyFavors[key].getCostLabel()
                if (partyFavors[key].passive == true) {
                    document.getElementById("divFunPerSecond").style.display = "inline-block"
                } else {
                    document.getElementById("div" + partyFavors[key].name + "Power").style.display = "inline-block"
                    document.getElementById(partyFavors[key].name + "Power").innerHTML = partyFavors[key].getPowerLabel()
                }
            }
        }
    }
    mainGameLoop(timeStamp)
}

function usePartyFavor(id) 
{
    id = id.substr(3)
    increaseFun(partyFavors[id].power * partyFavors[id].count)
    document.getElementById("totalFun").innerHTML = "Fun: " + gameData.currentFun
    gameData.totalClicks++
}

function capitalizeFirstLetter(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function mainGameLoop(timeStamp)
{
    secondsPassed = (timeStamp - oldTimeStamp) / 1000
    oldTimeStamp = timeStamp
    if (!isNaN(secondsSinceLastSave + secondsPassed))
    {
        secondsSinceLastSave += secondsPassed
    }

    if (secondsSinceLastSave >= 15)
    {
        window.localStorage.setItem("partySave", JSON.stringify(gameData))
        console.log("Game saved.")
        secondsSinceLastSave = 0
    }

    // Populate passive table
    for (let [key, value] of Object.entries(partyFavors)) {
        if (gameData.currentFun >= partyFavors[key].cost 
          && partyFavors[key].enabled == false) {
            partyFavors[key].enabled = true
            gameData.partyFavors[key][getPartyFavorIndex("enabled")] = true
            document.getElementById("divBuy" + partyFavors[key].name).style.display = "block"
            if (partyFavors[key].passive == true) {
                document.getElementById("divFunPerSecond").style.display = "inline-block"
            } else {
                document.getElementById("div" + partyFavors[key].name + "Power").style.display = "inline-block"
            }
        }
    }

    updateFun(timeStamp)
    
    globalID = window.requestAnimationFrame(mainGameLoop)
}

function updateFun(timeStamp)
{
    if ((timeStamp - lastAutoPartyTimeStamp) / 1000 > 1)
    {
        for (let [key, value] of Object.entries(partyFavors)) {
            if (partyFavors[key].passive == true 
              && !isNaN(partyFavors[key].count * partyFavors[key].power) 
              && partyFavors[key].count > 0)
            {
                increaseFun(partyFavors[key].count * partyFavors[key].power)
                funPerSecond += partyFavors[key].count * partyFavors[key].power
                document.getElementById("passivesCellRate" + partyFavors[key].name).innerHTML = partyFavors[key].count * partyFavors[key].power
            }
            lastAutoPartyTimeStamp = timeStamp
        }
        document.getElementById("funPerSecond").innerHTML = "Fun/second: " + funPerSecond
        funPerSecond = 0
    } 
    
    if (gameData.currentFun == 0) {
        document.getElementById("totalFun").innerHTML = "No fun"
    } else {
        document.getElementById("totalFun").innerHTML = "Fun: " + gameData.currentFun
    }
}

function increaseFun(amount) {
    gameData.currentFun += amount
    gameData.lifetimeFun += amount
}

function decreaseFun(amount) {
    gameData.currentFun -= amount
    gameData.lifetimeSpentFun += amount
}

function timeStamp()
{
    return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}

function hardReset()
{
    if (window.localStorage.getItem("partySave"))
    {
        window.localStorage.removeItem("partySave")
    }
    gameData = gameDataDefaults
    console.log("Hard reset complete")
    document.getElementById("status").innerHTML = "Longest week ever! I'm ready to party until the end of time, so let's get this party started!"
    document.getElementById("totalFun").innerHTML = "No fun"
    window.location.reload(true)
    window.localStorage.setItem("partySave", JSON.stringify(gameData))
}

window.onload = init