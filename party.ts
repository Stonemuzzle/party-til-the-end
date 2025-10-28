/*************************************************
* Global variables
*************************************************/

interface UpgradeDefault {
    name: string;
    description: string;
    power: number;
    cost: number;
    enabled: boolean;
    index: number;
    plural: string;
    image: string;
    costLabel: string;
}

var clickUpgradesDefaults: Record<string, UpgradeDefault> = {
    Roommate: {
        name: "Roommate",
        description: "More partiers make for MOAR PARTY!",
        power: 1,
        cost: 10,
        enabled: false,
        index: 1,
        plural: "roommates",
        image: "roommate",
        costLabel: "Let your roomie join the party!<br/>Cost: objvarcost Fun",
    }
}

interface PartyFavorDefault {
    name: string;
    description: string;
    power: number;
    cost: number;
    enabled: boolean;
    count?: number;
    index: number;
    plural: string;
    image: string;
    costLabel: string;
    powerLabel: string;
}

var partyFavorsDefaults: Record<string, PartyFavorDefault> = {
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
        plural: "horns",
        image: "horn",
        costLabel: "Buy a Speaker!<br/>Cost: objvarcost Fun",
        powerLabel: "Speaker Power: objvarpower Fun per second",
    }
}

interface PartyData {
    currentFun: number,
    lifetimeFun: number,
    lifetimeSpentFun: number,
    funPerSecond: number,
    lastAutoPartyTimeStamp: number,
    oldTimeStamp: number,
    secondsSinceLastSave: number,
    passiveTableCreated: false,
    lifetimeClicks: number,
    version: number,
    statusMessages: Record<number, string>,
    passivesEnabled: boolean,
    partyClicks: Record<string, number>;
    partyFavors: Record<string, PartyFavor>;
    clickUpgrades: Record<string, Upgrade>;
    // Other properties will be added as we discover them
}

var partyData: PartyData = {
    currentFun: 0,
    lifetimeFun: 0,
    lifetimeSpentFun: 0,
    funPerSecond: 0,
    lastAutoPartyTimeStamp: Date.now(),
    oldTimeStamp: Date.now(),
    secondsSinceLastSave: 0,
    passiveTableCreated: false,
    lifetimeClicks: 0,
    version: 1,
    statusMessages: {
        0: "Longest week ever! I'm ready to party until the end of time, so let's get this party started!",
        1: "Now we're partying!"
    },
    passivesEnabled: false,
    partyClicks: {
        power: 1,
    },
    partyFavors: {},
    clickUpgrades: {}
};


/*************************************************
* Active click functions
*************************************************/

interface Upgrade {
    name: string;
    description: string;
    power: number;
    cost: number;
    index: number;
    plural: string;
    image: string;
    costLabel: string;
    enabled: boolean;
    count: number;
    buttonAdded: boolean;
}

function clickUpgradesInitialization(): void {
    for (let key of Object.keys(clickUpgradesDefaults)) {
            const tempObj: Upgrade = {
            name: clickUpgradesDefaults[key].name,
            description: clickUpgradesDefaults[key].description,
            power: clickUpgradesDefaults[key].power,
            cost: clickUpgradesDefaults[key].cost,
            enabled: clickUpgradesDefaults[key].enabled,
            index: clickUpgradesDefaults[key].index,
            plural: clickUpgradesDefaults[key].plural,
            image: clickUpgradesDefaults[key].image,
            costLabel: clickUpgradesDefaults[key].costLabel,
            count: 0,
            buttonAdded: false
        }

        partyData.clickUpgrades[tempObj.name] = tempObj
    }
}

function increaseFun(amount: number): void {
    partyData.currentFun += amount;
    partyData.lifetimeFun += amount;
}

function decreaseFun(amount: number): void {
    partyData.currentFun -= amount;
    partyData.lifetimeSpentFun += amount;
}

function getPartygoer(key: string): void {
    if (partyData.currentFun >= partyData.clickUpgrades[key].cost)
    {
        decreaseFun(partyData.clickUpgrades[key].cost)
        partyData.clickUpgrades[key].cost *=2
        partyData.clickUpgrades[key].count++
        updateClickPower()
    }
    updateClickUpgradeControls(key)
}

function updateClickPower() {
    let clickBoost = 0
    for (let key of Object.keys(partyData.clickUpgrades)) {
        clickBoost += partyData.clickUpgrades[key].power * partyData.clickUpgrades[key].count
    }
    partyData.partyClicks.power = clickBoost + 1
    document.getElementById("HypePower")!.innerHTML = "Hype Power: " + (clickBoost + 1) + " fun per click"
}

function clickParty(key: string): void {
    key = key.substr(3)
    increaseFun(partyData.partyClicks.power)
    document.getElementById("totalFun")!.innerHTML = "Fun: " + partyData.currentFun
    partyData.lifetimeClicks++
}

function enableClickUpgrade(key: string): void {
    if (partyData.currentFun > partyData.clickUpgrades[key].cost) {
    partyData.clickUpgrades[key].enabled = true
    }
    if (partyData.clickUpgrades[key].enabled == true) {
        if (document.getElementById(key) === null) {
            createControlsClickUpgrade(key)
        }
    }
}

function createControlsClickUpgrade(key: string): void {
    // Add buy button
    let divBuyButton = document.createElement("div")
    divBuyButton.id = "divBuy" + key
    let buyButton = document.createElement("button")
    buyButton.id = key
    buyButton.className = "tooltip"
    buyButton.setAttribute("description", partyData.clickUpgrades[key].description)
    buyButton.setAttribute("onClick", "getPartygoer(this.id)")
    divBuyButton.appendChild(buyButton)

    let buttonGroupPurchase = document.getElementsByClassName("buttonGroupUpgrades")[0]
    if (buttonGroupPurchase.childElementCount > partyData.clickUpgrades[key].index) {
        buttonGroupPurchase.appendChild(divBuyButton)
    } else {
        buttonGroupPurchase.insertBefore(divBuyButton, buttonGroupPurchase.children[partyData.clickUpgrades[key].index])
    }
    partyData.clickUpgrades[key].buttonAdded = true
}

function updateClickUpgradeControls(key: string): void {
    if (document.getElementById(key) !== null) {
        document.getElementById(key)!.innerHTML =
            (partyData.clickUpgrades[key].costLabel).replace("objvarcost", partyData.clickUpgrades[key].cost.toString())
    }
}


/*************************************************
* Party favor functions
*************************************************/

interface PartyFavor {
    name: string;
    description: string;
    power: number;
    cost: number;
    index: number;
    plural: string;
    image: string;
    costLabel: string;
    powerLabel: string;
    enabled: boolean;
    count: number;
    rowAdded: boolean;
    buttonAdded: boolean;
}

function partyFavorInitialization(): void {
    for (let key of Object.keys(partyFavorsDefaults)) {
        const tempObj: PartyFavor = { 
            name: partyFavorsDefaults[key].name,
            description: partyFavorsDefaults[key].description,
            power: partyFavorsDefaults[key].power,
            cost: partyFavorsDefaults[key].cost,
            enabled: partyFavorsDefaults[key].enabled,
            index: partyFavorsDefaults[key].index,
            plural: partyFavorsDefaults[key].plural,
            image: partyFavorsDefaults[key].image,
            costLabel: partyFavorsDefaults[key].costLabel,
            powerLabel: partyFavorsDefaults[key].powerLabel,
            count: 0,
            rowAdded: false,
            buttonAdded: false
        }

        partyData.partyFavors[tempObj.name] = tempObj;
    }
}

function generatePassiveTable(): boolean {
    if (document.getElementById("passivesTable") !== null) {
        var table = document.getElementById("passivesTable") as HTMLTableElement
    } else { return false }

    let data = ["Party favor", "Count", "Power", "Fun/second"]

    let thead = table!.createTHead()
    let row = thead.insertRow()
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
    let divFunPerSecond = document.createElement("div")
    divFunPerSecond.id = "divFunPerSecond"
    divFunPerSecond.style.display = "inline-block"
    let txtFunPerSecond = document.createElement("p")
    txtFunPerSecond.id = "funPerSecond"
    txtFunPerSecond.innerHTML = "Fun/second: 0"
    divFunPerSecond.appendChild(txtFunPerSecond)
    let passiveClass = document.getElementsByClassName("divPassivesTable")[0]
    passiveClass.insertBefore(divFunPerSecond, passiveClass.firstChild)

    return true
}

function buyPartyFavor(key: string): void {
    if (partyData.currentFun >= partyData.partyFavors[key].cost)
    {
        decreaseFun(partyData.partyFavors[key].cost)
        partyData.partyFavors[key].cost *= 2
        partyData.partyFavors[key].count++
    }
    updatePartyFavorControls(key)
    updatePassiveTable(key)
}

function enablePartyFavor(key: string): void {
    if (partyData.currentFun > partyData.partyFavors[key].cost) {
        partyData.partyFavors[key].enabled = true
        partyData.passivesEnabled = true
        var divPassives = document.getElementsByClassName("divPassivesTable") as HTMLCollectionOf<HTMLElement>
        divPassives[0].style.visibility = "visible"
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

function createControlsPartyFavor(key: string): void {
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

function addPassivesRow(key: string): boolean {
    if (document.getElementById("passivesTable") !== null) {
        var table = document.getElementById("passivesTable") as HTMLTableElement
    } else { return false }
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
    cellCount.appendChild(document.createTextNode(partyData.partyFavors[key].count.toString()))
    let cellPower = row.insertCell()
    cellPower.id = "passivesCellPower" + partyData.partyFavors[key].name
    cellPower.appendChild(document.createTextNode(partyData.partyFavors[key].power.toString()))
    let cellRate = row.insertCell()
    cellRate.id = "passivesCellRate" + partyData.partyFavors[key].name
    cellRate.appendChild(document.createTextNode((partyData.partyFavors[key].power * partyData.partyFavors[key].count).toString()))
    partyData.partyFavors[key].rowAdded = true

    return true
}

function updatePassiveTable(key: string): void {
    if (document.getElementById("passivesRow" + partyData.partyFavors[key].name) !== null) {
        document.getElementById("passivesCellPower" + partyData.partyFavors[key].name)!.innerHTML = partyData.partyFavors[key].power.toString()
        document.getElementById("passivesCellCount" + partyData.partyFavors[key].name)!.innerHTML = partyData.partyFavors[key].count.toString()
        document.getElementById("passivesCellRate" + partyData.partyFavors[key].name)!.innerHTML = (partyData.partyFavors[key].power * partyData.partyFavors[key].count).toString()
    }
}

function updatePartyFavorControls(key: string): void {
    if (document.getElementById(key) !== null) {
        document.getElementById(key)!.innerHTML = 
            (partyData.partyFavors[key].costLabel).replace("objvarcost", partyData.partyFavors[key].cost.toString())
    }
}


/*************************************************
* Core game functions
*************************************************/

function init(): void {
    window.requestAnimationFrame

    // Initialize variables
    
    partyFavorInitialization()
    clickUpgradesInitialization()
    generatePassiveTable()
    
    loadGameState()
    mainGameLoop()
}

function mainGameLoop(): void {
    var secondsPassed = (Date.now() - partyData.oldTimeStamp) / 1000
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
    
    var globalID = window.requestAnimationFrame(mainGameLoop)
}

function updateFun()
{
    let timeDiff = Date.now() - partyData.lastAutoPartyTimeStamp
    if ((timeDiff) / 1000 > 1) {
        var funPerSecond = 0;
        for (let key of Object.keys(partyData.partyFavors)) {
            if (!isNaN(partyData.partyFavors[key].count * partyData.partyFavors[key].power) 
              && partyData.partyFavors[key].count > 0) {
                increaseFun((partyData.partyFavors[key].count * partyData.partyFavors[key].power) * Math.floor(timeDiff / 1000));
                funPerSecond += partyData.partyFavors[key].count * partyData.partyFavors[key].power;
                document.getElementById("passivesCellRate" + partyData.partyFavors[key].name)!.innerHTML = (partyData.partyFavors[key].count * partyData.partyFavors[key].power).toString()
            }
            partyData.lastAutoPartyTimeStamp = Date.now()
        }
        document.getElementById("funPerSecond")!.innerHTML = "Fun/second: " + funPerSecond
        funPerSecond = 0
    } 
    
    if (partyData.currentFun == 0) {
        document.getElementById("totalFun")!.innerHTML = "No fun"
    } else {
        document.getElementById("totalFun")!.innerHTML = "Fun: " + partyData.currentFun
    }
}


/*************************************************
* Utility functions
*************************************************/

function saveGameState(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        window.localStorage.setItem("partySave", JSON.stringify(partyData));
        resolve();
    })
    .then(() => {
        console.log("Game saved.");
    })
    .catch((error) => {
        console.log("Error saving game: " + error);
    });
}

function loadGameState(): void {
    // Load save game if available. Otherwise, initialize a new partyData.
    let saveGame = JSON.parse(window.localStorage.getItem("partySave")!) as PartyData | null;
    if (saveGame && partyData.version === saveGame.version) {
        partyData = saveGame;
        generatePassiveTable(); // Call this function if needed
    }
}

function hardReset(): void {
    if (window.localStorage.getItem("partySave")) {
        window.localStorage.removeItem("partySave")
    }
    console.log("Hard reset complete")
    document.getElementById("status")!.innerHTML = "Longest week ever! I'm ready to party until the end of time, so let's get this party started!"
    document.getElementById("totalFun")!.innerHTML = "No fun"
    window.location.reload()
}

window.onload = init
