# FUEL App — Architecture

## What it is
A local-only React meal planning and stock tracking app. No backend, no accounts. Data lives in JSON files (recipes, products, RDAs) and browser localStorage (week plan, stock state, profile). Built with Vite + React.

---

## File structure

```
src/
  main.jsx          — entry point, mounts App
  App.jsx           — root component: all state, all handlers
  constants.js      — design tokens, tab config, slot/day lists, default profile
  utils/
    date.js         — mondayOf(), isoDate(), currentMondayISO(), timeDelta()
    storage.js      — localStorage wrappers (storageGet / storageSet, async-shaped but sync)
    shopping.js     — buildShoppingList(), dayTotals(), findOrphanIngredients()
  data/
    products.json   — product catalog (source of truth, edit directly to add items)
    recipes.json    — recipe catalog
    rdas.json       — recommended daily allowances for micronutrients
  components/
    Header.jsx          — sticky nav bar with tab switcher and week label
    DriveStatusBadge.jsx — status pill in header
    EmptyState.jsx      — reusable empty/zero-state block
    IngredientModal.jsx — modal showing a recipe's ingredients with in-stock state and copy button; shared by RecipePicker and PlannerView
  views/
    PlannerView.jsx — 7-column week grid; each cell is a MealSlot
    ShoppingView.jsx — shopping list grouped by store section, per-pack checkboxes
    CartView.jsx    — full product catalog with qty picker and "Bought" button
    StockView.jsx   — items currently in stock with editable qty and unplanned surplus
    ProfileView.jsx — editable daily macro targets
    SyncView.jsx    — read-only data status panel (shows what JSON files loaded)
    RecipePicker.jsx — modal overlay for assigning a recipe to a planner slot
docs/
  architecture.md   — this file
```

---

## State (all in App.jsx)

| State | Type | Persisted | Description |
|---|---|---|---|
| `weekplan` | `{ week_of, slots: { "Day-Slot": { recipe_id, eaten? } } }` | localStorage `weekplan` | Which recipe is assigned to each day/slot, and whether it was eaten |
| `checklist` | `{ week_of, checked: { [product_id]: number } }` | localStorage `shopping-checklist` | Pack count per product. 0 = not in stock. Resets each week. |
| `profile` | `{ daily_calories_kcal, daily_protein_g, ... }` | localStorage `profile` | User's macro targets |
| `driveCache` | object | none (rebuilt on load from JSON files) | Holds recipes, products, rdas, and last sync report |
| `weekStart` | ISO date string | — | Monday of current week, recalculated on load |
| `pickerSlot` | `{ day, slot }` or null | — | Controls RecipePicker modal visibility |

**Important:** `checklist.checked[pid]` is a **pack count** (integer), not a boolean. The Shop view uses it as an index to tick individual pack rows. The Stock view converts it to a quantity via `count * package_size`.

---

## Derived/computed values (useMemo in App.jsx)

| Name | What it is |
|---|---|
| `recipesById` | `Map<recipe_id, recipe>` from driveCache |
| `productsById` | `Map<product_id, product>` from driveCache |
| `activeRecipes` | flat array from driveCache |
| `shoppingList` | `{ [section]: ShoppingItem[] }` — ingredients for the whole week, grouped by store section, expanded per-pack |
| `weekTotals` | `{ [product_id]: total_qty }` — aggregate ingredient quantities across all planned meals |
| `driveStatus` | `"drive" | "cache" | "offline"` — derived from sync report |

---

## Data flow: the shopping/stock pipeline

```
recipes.json + weekplan
        ↓
   buildShoppingList()        → shoppingList (grouped by section, one row per pack)
        ↓
   ShoppingView               → checklist.checked[pid] increments as packs are ticked
        ↓
   CartView ("Bought" btn)    → addToStock(pid, qty) — also increments checklist.checked[pid]
        ↓
   StockView                  → reads checklist + productsById + weekTotals to show surplus
```

The same `checklist.checked` object drives both Shop (per-pack tick state) and Stock (in-stock quantity). They share state, which is intentional.

---

## Handlers (all defined in App.jsx)

| Handler | What it does |
|---|---|
| `assignRecipe(day, slot, recipeId)` | Sets `weekplan.slots["Day-Slot"]` |
| `clearSlot(day, slot)` | Removes a slot from weekplan |
| `toggleEaten(day, slot)` | Toggles `eaten` boolean on a slot (persisted in weekplan) |
| `toggleChecklist(pid, index)` | Increments or decrements pack count in checklist (Shop view) |
| `addToStock(pid, qty)` | Adds qty packs to checklist.checked (Cart "Bought" button) |
| `adjustStock(pid, count)` | Sets exact pack count in checklist (Stock view qty input) |
| `removeFromStock(pid)` | Sets checklist.checked[pid] = 0 |
| `clearStock()` | Resets entire checklist.checked to {} |
| `updateProfile(field, value)` | Updates one macro target in profile |

---

## Key data shapes

**Product** (from products.json):
```json
{
  "product_id": "oats",
  "name": "Oats (1kg)",
  "category": "Pantry",
  "store_section": "Pantry",
  "package_size": 1000,
  "package_unit": "g",
  "portion_size": 80,
  "portion_unit": "g"
}
```

**Recipe** (from recipes.json):
```json
{
  "recipe_id": "overnight-oats",
  "name": "Overnight Oats",
  "source": "...",
  "meal_type": ["Breakfast"],
  "prep_time_min": 5,
  "servings": 1,
  "macros": { "calories_kcal": 450, "protein_g": 35, "carbs_g": 52, "fat_g": 9, "fiber_g": 7 },
  "ingredients": [{ "product_id": "oats", "quantity": 80, "unit": "g" }],
  "tags": ["high-protein", "vegetarian"]
}
```

**Weekplan slot key:** `"Monday-Breakfast"`, `"Tuesday-Dinner"`, etc. Days from `DAYS` constant, slots from `SLOTS` constant.

---

## Design system

All styles are inline. No CSS modules or Tailwind. Tokens live in `constants.js`:

| Token | Value | Role |
|---|---|---|
| `BG` | `#0D0D0D` | page background |
| `SURFACE` | `#151515` | card/panel background |
| `SURFACE_2` | `#1E1E1E` | input/nested background |
| `BORDER` | `#2A2A2A` | borders |
| `TEXT` | `#E8E8E8` | primary text |
| `MUTED` | `#8A8A8A` | secondary text, icons |
| `ACCENT` | `#C8FF00` | lime green — primary action, today highlight |
| `AMBER` | `#FFB84D` | warnings, destructive hover states |
| `GREEN` | `#7FD66B` | positive/in-stock indicators |
| `FONT` | DM Sans | all text |

---

## Tabs and routing

No router. `view` state in App.jsx controls which view renders. Tab order: Plan → Shop → Cart → Stock → Profile → Sync.

Week resets automatically: on load, if stored `week_of` doesn't match the current Monday, state is cleared for that week (plan and checklist reset; profile is kept).
