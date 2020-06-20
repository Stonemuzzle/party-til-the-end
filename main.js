class PartyFavor {
    constructor(array) {
        this.name = array[0]
        this.power = array[1]
        this.cost = array[2]
        this.enabled = array[3]
        this.count = array[4]
        this.passive = array[5]
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
            
            return `${this.name} Power: ${this.power} fun per second`
        }
        else {
            var totalPower = this.power * this.count
            return `${this.name} Power: ${totalPower} fun per click`
        }
    }
}

var gameDataDefaults = {
    funVisible: false,
    currentFun: 0,
    lifetimeFun: 0,
    lifetimeSpentFun: 0,
    version: 1,
    partyFavors: {
        Streamer: ["Streamer", 1, 20, false, 0, true],
        Speaker: ["Speaker", 5, 100, false, 0, true],
        Hype: ["Hype", 1, 10, false, 1, false]
    },
    statusMessages: {
        0: "Longest week ever! I'm ready to party until the end of time, so let's get this party started!",
        1: "Now we're partying!"
    }

}

var gameData = {}
var funPerSecond = 0
var lastAutoPartyTimeStamp = timeStamp()
var oldTimeStamp = timeStamp()
var secondsSinceLastSave = 0

var saveGame = JSON.parse(window.localStorage.getItem("partySave"))
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
    let data = ["Count", "Power", "Fun per second"]
    let thead = table.createTHead()
    let row = thead.insertRow()
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
    var sheet = window.document.styleSheets[0]
    sheet.insertRule('#passivesTable {top: 0px;}', sheet.cssRules.length)
}

function buyPartyFavor(id) {
    if (gameData.currentFun >= partyFavors[id].cost)
    {
        decreaseFun(partyFavors[id].cost)
        partyFavors[id].cost *= 2
        partyFavors[id].count++
        document.getElementById(id).innerHTML = partyFavors[id].getCostLabel()
        document.getElementById(id + "Power").innerHTML = partyFavors[id].getPowerLabel()
        if (partyFavors[id].passive == true) {
            document.getElementById("passivesCellCount" + partyFavors[id].name).innerHTML = id + "s: " + partyFavors[id].count
        }
    }
}

function usePartyFavor(id) 
{
    id = id.substr(3)
    increaseFun(partyFavors[id].power * partyFavors[id].count)
    document.getElementById("totalFun").innerHTML = "Fun: " + gameData.currentFun
}

function capitalizeFirstLetter(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function init()
{
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame

    // Pointless comment because fuck this editor not recognizing the bloody block above
    generatePassivesTable()
    mainGameLoop(timeStamp)
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
        secondsSinceLastSave = 0
        console.log("Game saved")
    }

    for (let [key, value] of Object.entries(partyFavors)) {
        if (gameData.currentFun >= partyFavors[key].cost && partyFavors[key].enabled == false) {
            partyFavors[key].enabled = true
            let table = document.getElementById("passivesTable")
            let row = table.insertRow()
            row.id = "passivesRow" + partyFavors[key].name
            let cellCount = row.insertCell()
            cellCount.id = "passivesCellCount" + partyFavors[key].name
            cellCount.appendChild(document.createTextNode("Streamers: " + partyFavors[key].count))
            let cellPower = row.insertCell()
            cellPower.id = "passivesCellPower" + partyFavors[key].name
            cellPower.appendChild(document.createTextNode(partyFavors[key].getPowerLabel()))
        }

        if (partyFavors[key].enabled == true) {
            document.getElementById("div" + partyFavors[key].name + "Power").style.display = "block"
            document.getElementById("divBuy" + partyFavors[key].name).style.display = "block"
            if (partyFavors[key].passive == true) {
                document.getElementById("div" + partyFavors[key].name + "Count").style.display = "block"
                document.getElementById("divFunPerSecond").style.display = "block"
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
            if (partyFavors[key].passive == true && !isNaN(partyFavors[key].count * partyFavors[key].power))
            {
                increaseFun(partyFavors[key].count * partyFavors[key].power)
                funPerSecond += partyFavors[key].count * partyFavors[key].power
            }
            lastAutoPartyTimeStamp = timeStamp
        }
    } 
    document.getElementById("totalFun").innerHTML = "Fun: " + gameData.currentFun
    document.getElementById("funPerSecond").innerHTML = "Fun/second: " + funPerSecond
    funPerSecond = 0
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
    console.log("Reset message")
    document.getElementById("status").innerHTML = "Longest week ever! I'm ready to party until the end of time, so let's get this party started!"
    document.getElementById("totalFun").innerHTML = "No fun"
    window.location.reload(true)
    window.localStorage.setItem("partySave", JSON.stringify(gameData))
}

window.onload = init