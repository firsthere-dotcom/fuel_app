# FUEL App — Setup Instructions

## What this app is
A local meal planning and stock tracking app. It runs entirely on your computer — no internet connection needed after setup, no accounts, no cloud.

---

## What you need before starting

### 1. Node.js (version 18 or higher)
This is the engine that runs the app.

**Check if you already have it:**
```bash
node --version
```
If you see a number like `v18.x.x` or higher, you're good.

**If not installed:** Download from https://nodejs.org — pick the "LTS" version.

### 2. The project folder
You need the `fuel-app-local` folder. It should contain:
```
fuel-app-local/
├── src/
├── index.html
├── package.json
└── vite.config.js
```

---

## First-time setup (do this once)

Open Terminal, navigate to the project folder, and install dependencies:

```bash
cd path/to/fuel-app-local
npm install
```

This downloads all the libraries the app needs (~130 packages). It takes about 30 seconds and creates a `node_modules` folder. You only need to do this once per machine.

---

## Running the app

Every time you want to use the app:

```bash
cd path/to/fuel-app-local
npm run dev
```

Then open your browser and go to:
```
http://localhost:5173
```

To stop the app, go back to Terminal and press `Ctrl + C`.

---

## Where data lives

| Data | Location |
|---|---|
| Products | `src/data/products.json` |
| Recipes | `src/data/recipes.json` |
| RDAs | `src/data/rdas.json` |
| Stock & meal plan | Browser localStorage (survives reloads, tied to this browser) |

**Important:** stock counts and meal plans are saved in the browser, not in files. If you switch browsers or clear browser data, that state is lost. The JSON files are the source of truth for products and recipes.

---

## Migrating to a new computer

1. Copy the entire `fuel-app-local` folder to the new machine
2. Delete the `node_modules` folder if it came along (it's large and machine-specific)
3. Install Node.js if needed (see above)
4. Run `npm install` in the project folder
5. Run `npm run dev` and open `http://localhost:5173`

Note: stock counts and meal plan data will not transfer — those live in the browser on the old machine.

---

## Quick reference

| Task | Command |
|---|---|
| Start app | `npm run dev` |
| Stop app | `Ctrl + C` in Terminal |
| Install after fresh copy | `npm install` |
| Check Node version | `node --version` |
