# Party Til The End

A fun, incremental clicker game built with **TypeScript** and **vanilla JavaScript**. Keep the party going forever!

## 🎉 Game Overview

**Party Til The End** is a clicker-style incremental game where you accumulate "Fun" currency to party indefinitely. Generate fun through active clicking and passive income generation, unlock new party items, and watch your fun per second skyrocket!

### Core Gameplay
- **Active Clicking:** Click the party button to generate fun (base: 1 fun/click)
- **Click Upgrades:** Purchase Roommates to increase your click power (+1 fun/click each)
- **Passive Income:** Buy party favors (Streamers, Sparklers, Horns, Speakers) that generate fun automatically
- **Progression:** Items unlock dynamically as you accumulate resources
- **Persistence:** Game progress auto-saves every 15 seconds to browser localStorage

### Available Items

**Click Upgrades:**
- **Roommate** (Cost: 10, Power: +1/click) - "More partiers make for MOAR PARTY!"

**Party Favors (Passive Income):**
- **Streamer** (Cost: 20, Power: 1 fun/sec) - A frilly paper streamer
- **Sparkler** (Cost: 100, Power: 5 fun/sec) - A pretty fire sparkler!
- **Horn** (Cost: 1000, Power: 20 fun/sec) - A loud plastic party horn!
- **Speaker** (Cost: 10000, Power: 50 fun/sec) - A bassy bluetooth speaker!

Note: All item costs **double with each purchase**, creating exponential scaling.

## 🛠️ Development Setup

### Requirements
- **Node.js** (for npm/npx)
- **TypeScript** (installed via npm)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/stonemuzzle/party-til-the-end.git
cd party-til-the-end
```

2. Install dependencies:
```bash
npm install
```

### Development Workflow

#### TypeScript Compilation

The project uses TypeScript for type safety. You need to compile `party.ts` to JavaScript before running the game in the browser.

**One-time compile:**
```bash
npx tsc
```

**Watch mode (recommended during development):**
```bash
npx tsc --watch
```

This will automatically recompile `party.ts` to `party.js` whenever you make changes.

### File Structure

```
party-til-the-end/
├── index.html              # Main HTML entry point
├── party.ts                # TypeScript source code (strict mode)
├── party.js                # Compiled JavaScript (auto-generated)
├── styles.css              # Game UI styling
├── grin-256.jpg            # Party button image asset
├── tsconfig.json           # TypeScript compiler configuration
├── package.json            # Dependencies (TypeScript, Yarn)
└── README.md              # This file
```

### Development Requirements

**Node Modules:**
- `typescript@^5.9.3` - TypeScript compiler
- `yarn@^1.22.22` - Package manager

**Browser APIs Used:**
- `localStorage` - Game state persistence
- `requestAnimationFrame` - Smooth game loop (60 FPS)
- DOM API - Dynamic UI creation and updates

### TypeScript Configuration

The project is configured with:
- **Target:** ES2015 (modern JavaScript compatibility)
- **Mode:** Strict type checking enabled
- **Libraries:** ES2015 + DOM APIs
- **Module System:** ES2020

See `tsconfig.json` for full configuration details.

## 📝 Code Architecture

### Global State (`partyData`)
All game state is stored in a single `PartyData` object:
- `currentFun` - Current fun balance
- `lifetimeFun` - Total fun ever earned
- `lifetimeSpentFun` - Total fun spent on upgrades
- `funPerSecond` - Passive income rate
- `partyClicks` - Click power configuration
- `partyFavors` - Owned passive income items
- `clickUpgrades` - Owned click upgrades

### Key Functions

**Game Loop:**
- `init()` - Initialize game on page load
- `mainGameLoop()` - 60 FPS game loop (called via requestAnimationFrame)
- `updateFun()` - Calculate passive income and update displays

**Click System:**
- `clickParty()` - Handle click button interaction
- `getPartygoer()` - Purchase click upgrades
- `enableClickUpgrade()` - Unlock upgrade button when affordable
- `updateClickPower()` - Recalculate total click power

**Passive System:**
- `buyPartyFavor()` - Purchase passive income items
- `enablePartyFavor()` - Unlock item button when affordable
- `generatePassiveTable()` - Create income table UI
- `updatePassiveTable()` - Update table with current stats

**Persistence:**
- `saveGameState()` - Auto-save game every 15 seconds
- `loadGameState()` - Load saved game on startup
- `hardReset()` - Clear save data and reload game

### Design Patterns

- **Configuration Objects:** `clickUpgradesDefaults` and `partyFavorsDefaults` define item templates
- **Lazy UI Creation:** Buttons/tables created dynamically only when items are affordable
- **Exponential Scaling:** All item costs double per purchase for endless progression
- **Auto-save System:** 15-second interval for localStorage persistence

## 🚀 Deployment

The game is deployed as a static site on **GitHub Pages**. The workflow is automated via `.github/workflows/static.yml`:
- Any push to the `master` branch triggers automatic deployment
- The compiled `party.js` is committed to the repository
- No build step required in production (fully static)

## 🐞 Debugging with VS Code

If you want to debug the game locally using VS Code, a launch configuration is included at `.vscode/launch.json`.

- Open this workspace in VS Code and press F5 (Start Debugging). VS Code will launch a Chrome instance and open `index.html`.
- The configuration runs the `tsc: build` preLaunchTask which compiles `party.ts` to `party.js` before the browser opens. That task is defined in `.vscode/tasks.json` and runs `npx tsc -p tsconfig.json`.
- No static server is required — the app is stateless and uses browser `localStorage`, so opening `index.html` directly in the browser works. Just press F5 and enjoy.
- Source maps are enabled, so breakpoints in `party.ts` should map to the running code in Chrome.

If you prefer automatic TypeScript rebuilds while debugging, run `npx tsc --watch` in a separate terminal before pressing F5.

## 🎮 How to Play

1. Open `index.html` in a web browser
2. Click the party button (grin face) to generate fun
3. As you accumulate fun, upgrade buttons will appear
4. Purchase **Roommates** to increase click power
5. When you have enough fun, **Party Favor** buttons appear
6. Purchase passive income items to generate fun automatically
7. Watch your fun per second grow exponentially!
8. Use "Hard Reset" to clear your save and start over

**Pro Tip:** Let the game run in the background—your passive income keeps accumulating even when you're not actively clicking!

## 📋 Future Development Ideas

- [ ] Add more click upgrades beyond Roommates
- [ ] Add more passive income items
- [ ] Implement active abilities/minigames
- [ ] Add prestige/rebirth system for long-term progression
- [ ] Achievements/milestones system
- [ ] Sound effects and visual feedback
- [ ] Mobile-optimized responsive design
- [ ] Cloud save support

## 🐛 Known Issues / Notes

- TypeScript strict mode is enabled; ensure all new functions have explicit type annotations
- LocalStorage is used for persistence; games won't sync across devices
- No multiplayer/network features
- All costs and rates are hardcoded; consider extracting to a config file for easier balancing

## 📄 License

This project is open source and available under the MIT License.

---

**Let's keep this party going indefinitely! 🎉**
