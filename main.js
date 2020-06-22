var partyData = {}

/*
 * Game functions
 */

var clickUpgradesDefaults = {
    Hype: {
        name: "Hype",
        description: "More excitement makes for MOAR PARTY!",
        power: 1,
        cost: 10,
        enabled: false,
        index: 1,
        plural: "hype",
        image: "hype",
        costLabel: "Party harder!<br/>Cost: objvarcost Fun",
    }
}

var partyFavorsDefaults = {
    Streamer: {
		name: "Streamer",
		description: "A frilly paper streamer",
		power: 1,
		cost: 20,
		enabled: false,
		index: 1,
		plural: "streamers",
		image: "streamer",
		costLabel: "Buy a Streamer!<br/>Cost: objvarcost Fun",
		powerLabel: "Streamer Power: objvarpower Fun per second",
	},
	
	Sparkler: {
		name: "Sparkler",
		description: "A pretty fire sparkler!",
		power: 5,
		cost: 100,
		enabled: false,
		index: 2,
		plural: "sparklers",
		image: "sparkler",
		costLabel: "Buy a Sparkler!<br/>Cost: objvarcost Fun",
		powerLabel: "Sparkler Power: objvarpower Fun per second",
	},
	
	Horn: {
		name: "Horn",
		description: "A loud plastic party horn!",
		power: 20,
		cost: 1000,
		enabled: false,
		count: 0,
		index: 3,
		plural: "horns",
		image: "horn",
		costLabel: "Buy a Horn!<br/>Cost: objvarcost Fun",
		powerLabel: "Horn Power: objvarpower Fun per second",
	},
	
	Speaker: {
		name: "Speaker",
		description: "A bassy bluetooth speaker!",
		power: 50,
		cost: 10000,
		enabled: false,
		count: 0,
		index: 4,
		costLabel: "Buy a Speaker!<br/>Cost: objvarcost Fun",
		powerLabel: "Speaker Power: objvarpower Fun per second",
		
		costLabel: function() {
            return "Buy a " + this.name + "!<br/>Cost: " + this.cost + " Fun"
		},
		powerLabel: function() {
			return this.name + " Power: " + this.power + " Fun per second"
		},
	}
}

function init() {
    window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame

    // Initialize variables

    partyData.funPerSecond = 0
    partyData.lastAutoPartyTimeStamp = Date.now()
    partyData.oldTimeStamp = Date.now()
    partyData.secondsSinceLastSave = 0
    partyData.passiveTableCreated = false
    partyData.currentFun = 0
    partyData.lifetimeFun = 0
    partyData.lifetimeSpentFun = 0
    partyData.lifetimeClicks = 0
    partyData.version = 1
    partyData.statusMessages = {
        0: "Longest week ever! I'm ready to party until the end of time, so let's get this party started!",
        1:"Now we're partying!"
    }
    partyData.passivesEnabled = false
    partyData.partyClicks = {
		power: 1,
    }
    partyData.partyFavors = {}
    partyData.clickUpgrades = {}
    
    partyFavorInitialization()
    clickUpgradesInitialization()
    generatePassiveTable()
    
    loadGameState()
    mainGameLoop()
}

function clickUpgradesInitialization()
{
    for (let key of Object.keys(clickUpgradesDefaults)) {
        let tempObj = {}
        tempObj.name = clickUpgradesDefaults[key].name
        tempObj.description = clickUpgradesDefaults[key].description
		tempObj.power = clickUpgradesDefaults[key].power
		tempObj.cost = clickUpgradesDefaults[key].cost
		tempObj.enabled = clickUpgradesDefaults[key].enabled
		tempObj.index = clickUpgradesDefaults[key].index
		tempObj.plural = clickUpgradesDefaults[key].plural
        tempObj.image = clickUpgradesDefaults[key].image
        tempObj.costLabel = clickUpgradesDefaults[key].costLabel
        tempObj.enabled = false
        tempObj.count = 0

        partyData.clickUpgrades[tempObj.name] = tempObj
    }
}

function partyFavorInitialization()
{
    for (let key of Object.keys(partyFavorsDefaults)) {
        let tempObj = {}
        tempObj.name = partyFavorsDefaults[key].name
        tempObj.description = partyFavorsDefaults[key].description
		tempObj.power = partyFavorsDefaults[key].power
		tempObj.cost = partyFavorsDefaults[key].cost
		tempObj.enabled = partyFavorsDefaults[key].enabled
		tempObj.index = partyFavorsDefaults[key].index
		tempObj.plural = partyFavorsDefaults[key].plural
        tempObj.image = partyFavorsDefaults[key].image
        tempObj.costLabel = partyFavorsDefaults[key].costLabel
        tempObj.powerLabel = partyFavorsDefaults[key].powerLabel
        tempObj.enabled = false
        tempObj.count = 0

        partyData.partyFavors[tempObj.name] = tempObj
    }
}

function generatePassiveTable() {
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
    let divFunPerSecond = document.createElement("div")
    divFunPerSecond.id = "divFunPerSecond"
    let txtFunPerSecond = document.createElement("p")
    txtFunPerSecond.id = "funPerSecond"
    divFunPerSecond.appendChild(txtFunPerSecond)
    let passiveClass = document.getElementsByClassName("divPassivesTable")[0]
    passiveClass.insertBefore(divFunPerSecond, passiveClass.firstChild)
    document.getElementById("funPerSecond").innerHTML = "Fun/second: 0"
    document.getElementById("divFunPerSecond").style.display = "inline-block"
}

function buyPartyFavor(key) {
    if (partyData.currentFun >= partyData.partyFavors[key].cost)
    {
        decreaseFun(partyData.partyFavors[key].cost)
        partyData.partyFavors[key].cost *= 2
        partyData.partyFavors[key].count++
    }
}

function buyClickUpgrade(key) {
    if (partyData.currentFun >= partyData.clickUpgrades[key].cost)
    {
        decreaseFun(partyData.clickUpgrades[key].cost)
        partyData.clickUpgrades[key].cost *=2
        partyData.clickUpgrades[key].count++
        updateClickPower()
    }
}

function updateClickPower() {
    let clickBoost = 0
    for (let key of Object.keys(partyData.clickUpgrades)) {
        clickBoost += partyData.clickUpgrades[key].power * partyData.clickUpgrades[key].count
    }
    partyData.partyClicks.power = clickBoost + 1
    document.getElementById("HypePower").innerHTML = "Hype Power: " + (clickBoost + 1) + " fun per click"
}

function getPartyFavorIndex(name) {   
    return partyData.partyFavorValues.findIndex(function (element) {return element == name})
}

function updatePartyFavor(name, value) {
    
}

function createPartyFavors(key) {
    if (partyData.partyFavors[key].rowAdded == false
    && partyData.partyFavors[key].enabled == true) {
        addPassivesRow(key)
        partyData.partyFavors[key].rowAdded = true
    }

    if (partyData.partyFavors[key].buttonAdded == false && partyData.partyFavors[key].enabled == true) {
        let divBuyButton = document.createElement("div")
        divBuyButton.id = "divBuy" + key
        let buyButton = document.createElement("button")
        buyButton.id = key
        buyButton.setAttribute("onClick", "buyPartyFavor(this.id)")
        divBuyButton.appendChild(buyButton)
        let buttonGroupPurchase = document.getElementsByClassName("buttonGroupPurchase")[0]
        if (buttonGroupPurchase.childElementCount > partyData.partyFavors[key].index) {
            buttonGroupPurchase.appendChild(divBuyButton)
        } else {
            buttonGroupPurchase.insertBefore(divBuyButton, buttonGroupPurchase.children[partyData.partyFavors[key].index])
        }
        partyData.partyFavors[key].buttonAdded = true
    }
}

function clickParty(key) {
    key = key.substr(3)
    increaseFun(partyData.partyClicks.power)
    document.getElementById("totalFun").innerHTML = "Fun: " + partyData.currentFun
    partyData.lifetimeClicks++
}

function enablePartyFavor(key) {
    if (partyData.currentFun > partyData.partyFavors[key].cost) {
        partyData.partyFavors[key].enabled = true
        partyData.passivesEnabled = true
        document.getElementsByClassName("divPassivesTable")[0].style.visibility = "visible"
    }
    if (partyData.partyFavors[key].enabled == true) {
        if (document.getElementById("passivesTable") === null) {
            generatePassiveTable()
        }
        if (document.getElementById("passivesRow" + partyData.partyFavors[key].name) === null) {
            createControlsPartyFavor(key)
            addPassivesRow(key)
        }
    }
}

function enableClickUpgrade(key) {
    if (partyData.currentFun > partyData.clickUpgrades[key].cost) {
    partyData.clickUpgrades[key].enabled = true
    }
    if (partyData.clickUpgrades[key].enabled == true) {
        if (document.getElementById([key]) === null) {
            createControlsClickUpgrade(key)
        }
    }
}

function createControlsPartyFavor(key) {
    // Add buy button
    let divBuyButton = document.createElement("div")
    divBuyButton.id = "divBuy" + key
    let buyButton = document.createElement("button")
    buyButton.id = key
    buyButton.setAttribute("onClick", "buyPartyFavor(this.id)")
    divBuyButton.appendChild(buyButton)
    let buttonGroupPurchase = document.getElementsByClassName("buttonGroupPurchase")[0]
    if (buttonGroupPurchase.childElementCount > partyData.partyFavors[key].index) {
        buttonGroupPurchase.appendChild(divBuyButton)
    } else {
        buttonGroupPurchase.insertBefore(divBuyButton, buttonGroupPurchase.children[partyData.partyFavors[key].index])
    }
    partyData.partyFavors[key].buttonAdded = true
}

function createControlsClickUpgrade(key) {
    // Add buy button
    let divBuyButton = document.createElement("div")
    divBuyButton.id = "divBuy" + key
    let buyButton = document.createElement("button")
    buyButton.id = key
    buyButton.setAttribute("onClick", "buyClickUpgrade(this.id)")
    divBuyButton.appendChild(buyButton)
    let buttonGroupPurchase = document.getElementsByClassName("buttonGroupUpgrades")[0]
    if (buttonGroupPurchase.childElementCount > partyData.clickUpgrades[key].index) {
        buttonGroupPurchase.appendChild(divBuyButton)
    } else {
        buttonGroupPurchase.insertBefore(divBuyButton, buttonGroupPurchase.children[partyData.clickUpgrades[key].index])
    }
    partyData.clickUpgrades[key].buttonAdded = true
}

function addPassivesRow(key) {
    let table = document.getElementById("passivesTable")
    if (table.rows.length > partyData.partyFavors[key].index) {
        var row = table.insertRow(partyData.partyFavors[key].index)
        console.log("indexed")
    } else {
        var row = table.insertRow()
    }
    row.id = "passivesRow" + partyData.partyFavors[key].name
    let cellName = row.insertCell()
    cellName.id = "passivesCellName" + partyData.partyFavors[key].name
    cellName.appendChild(document.createTextNode(partyData.partyFavors[key].name))
    let cellCount = row.insertCell()
    cellCount.id = "passivesCellCount" + partyData.partyFavors[key].name
    cellCount.appendChild(document.createTextNode(partyData.partyFavors[key].count))
    let cellPower = row.insertCell()
    cellPower.id = "passivesCellPower" + partyData.partyFavors[key].name
    cellPower.appendChild(document.createTextNode(partyData.partyFavors[key].power))
    let cellRate = row.insertCell()
    cellRate.id = "passivesCellRate" + partyData.partyFavors[key].name
    cellRate.appendChild(document.createTextNode(partyData.partyFavors[key].power * partyData.partyFavors[key].count))
    partyData.partyFavors[key].rowAdded = true
}

function updatePassiveTable(key) {
    if (document.getElementById("passivesRow" + partyData.partyFavors[key].name) !== null) {
        document.getElementById("passivesCellPower" + partyData.partyFavors[key].name).innerHTML = partyData.partyFavors[key].power
        document.getElementById("passivesCellCount" + partyData.partyFavors[key].name).innerHTML = partyData.partyFavors[key].count
        document.getElementById("passivesCellRate" + partyData.partyFavors[key].name).innerHTML = partyData.partyFavors[key].power * partyData.partyFavors[key].count
    }
}

function updatePartyFavorControls(key) {
    if (document.getElementById(key) !== null) {
        document.getElementById(key).innerHTML = 
            (partyData.partyFavors[key].costLabel).replace("objvarcost", partyData.partyFavors[key].cost)
    }
}

function updateClickUpgradeControls(key) {
    if (document.getElementById(key) !== null) {
        document.getElementById(key).innerHTML = 
            (partyData.clickUpgrades[key].costLabel).replace("objvarcost", partyData.clickUpgrades[key].cost)
    }
}

function mainGameLoop()
{
    secondsPassed = (Date.now() - partyData.oldTimeStamp) / 1000
    partyData.oldTimeStamp = Date.now()
    if (!isNaN(partyData.secondsSinceLastSave + secondsPassed)) {
        partyData.secondsSinceLastSave += secondsPassed
    }

    if (partyData.secondsSinceLastSave >= 15) {
        saveGameState()
        partyData.secondsSinceLastSave = 0
    }

    for (let key of Object.keys(partyData.clickUpgrades)) {
        enableClickUpgrade(key)
        updateClickUpgradeControls(key)
    }
    updateClickPower()

    for (let key of Object.keys(partyData.partyFavors)) {
        enablePartyFavor(key)
        updatePassiveTable(key)
        updatePartyFavorControls(key)
    }
    
    updateFun()
    
    globalID = window.requestAnimationFrame(mainGameLoop)
}

function updateFun()
{
    let timeDiff = Date.now() - partyData.lastAutoPartyTimeStamp
    if ((timeDiff) / 1000 > 1) {
        for (let key of Object.keys(partyData.partyFavors)) {
            if (!isNaN(partyData.partyFavors[key].count * partyData.partyFavors[key].power) 
              && partyData.partyFavors[key].count > 0) {
                increaseFun((partyData.partyFavors[key].count * partyData.partyFavors[key].power) * Math.floor(timeDiff / 1000))
                funPerSecond += partyData.partyFavors[key].count * partyData.partyFavors[key].power
                document.getElementById("passivesCellRate" + partyData.partyFavors[key].name).innerHTML = partyData.partyFavors[key].count * partyData.partyFavors[key].power
            }
            partyData.lastAutoPartyTimeStamp = Date.now()
        }
        document.getElementById("funPerSecond").innerHTML = "Fun/second: " + funPerSecond
        funPerSecond = 0
    } 
    
    if (partyData.currentFun == 0) {
        document.getElementById("totalFun").innerHTML = "No fun"
    } else {
        document.getElementById("totalFun").innerHTML = "Fun: " + partyData.currentFun
    }
}

function increaseFun(amount) {
    partyData.currentFun += amount
    partyData.lifetimeFun += amount
}

function decreaseFun(amount) {
    partyData.currentFun -= amount
    partyData.lifetimeSpentFun += amount
}


/*
 * Utility functions
 */

function saveGameState() {
    let saveState = new Promise(function(resolve, reject) {
        window.localStorage.setItem("partySave", JSON.stringify(partyData))
        resolve("Game saved.")
    })
    saveState
        .then(function(resolve) {
            console.log(resolve)
        })
        .catch(function(reject) {
            console.log("Error saving game: " + reject)
        })
}

function loadGameState() {
    // Load save game if available. Otherise, initialize a new partyData.
    let saveGame = JSON.parse(window.localStorage.getItem("partySave"))
    if (saveGame) {
        if (partyData.version == saveGame.version) {
            partyData = saveGame
        }
        generatePassiveTable
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function hardReset() {
    if (window.localStorage.getItem("partySave")) {
        window.localStorage.removeItem("partySave")
    }
    console.log("Hard reset complete")
    document.getElementById("status").innerHTML = "Longest week ever! I'm ready to party until the end of time, so let's get this party started!"
    document.getElementById("totalFun").innerHTML = "No fun"
    window.location.reload(true)
}

window.onload = init