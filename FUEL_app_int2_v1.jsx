import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar, ShoppingCart, User, Cloud, CloudOff, RefreshCw,
  Plus, X, Check, Search, AlertCircle
} from "lucide-react";

// ─── Color palette (spec §3.1) ────────────────────────────────────────────────
const BG        = "#0D0D0D";
const SURFACE   = "#151515";
const SURFACE_2 = "#1E1E1E";
const BORDER    = "#2A2A2A";
const TEXT      = "#E8E8E8";
const MUTED     = "#8A8A8A";
const ACCENT    = "#C8FF00";
const AMBER     = "#FFB84D";
const CORAL     = "#FF6B5B";
const GREEN     = "#7FD66B";

const FONT = "'DM Sans', system-ui, -apple-system, sans-serif";

const DAYS  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const SECTION_ORDER = ["Produce", "Meat & Fish", "Dairy & Eggs", "Pantry", "Uncategorized"];

// Path segments to walk on Drive (spec §4.1)
const PATH_SEGMENTS = ["FUEL_app", "src", "data_sources"];

const DEFAULT_PROFILE = {
  daily_calories_kcal: 2400,
  daily_protein_g:     180,
  daily_carbs_g:       250,
  daily_fat_g:         70,
  daily_fiber_g:       35,
};

const TABS = [
  { id: "planner", icon: Calendar,     label: "Plan" },
  { id: "shop",    icon: ShoppingCart, label: "Shop" },
  { id: "profile", icon: User,         label: "Profile" },
  { id: "sync",    icon: Cloud,        label: "Sync" },
];

const PROFILE_FIELDS = [
  { key: "daily_calories_kcal", label: "Calories", unit: "kcal" },
  { key: "daily_protein_g",     label: "Protein",  unit: "g" },
  { key: "daily_carbs_g",       label: "Carbs",    unit: "g" },
  { key: "daily_fat_g",         label: "Fat",      unit: "g" },
  { key: "daily_fiber_g",       label: "Fiber",    unit: "g" },
];

// ─── Storage helpers (spec §8.4) ─────────────────────────────────────────────
async function storageGet(key, fallback = null) {
  try {
    const res = await window.storage.get(key);
    return res && res.value ? JSON.parse(res.value) : fallback;
  } catch {
    return fallback;
  }
}

async function storageSet(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ─── Date helpers (spec §7.3) ─────────────────────────────────────────────────
function mondayOf(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Sunday belongs to the PREVIOUS week — its Monday is 6 days earlier
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function currentMondayISO() {
  return isoDate(mondayOf(new Date()));
}

// ─── Time delta formatter (spec §7.4) ─────────────────────────────────────────
function timeDelta(isoStr) {
  if (!isoStr) return "never";
  const diff = Date.now() - new Date(isoStr).getTime();
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ─── Validation helpers (spec §4.3) ──────────────────────────────────────────
function isStr(v) { return typeof v === "string"; }
function isNum(v) { return typeof v === "number" && !isNaN(v); }
function isBool(v) { return typeof v === "boolean"; }

const VALID_STORE_SECTIONS = ["Produce", "Meat & Fish", "Dairy & Eggs", "Pantry"];
const VALID_MEAL_TYPES     = ["Breakfast", "Lunch", "Dinner", "Snack"];

function validateProducts(parsed) {
  if (!parsed || !Array.isArray(parsed.products))
    throw new Error("schema_error: missing 'products' array at root");
  parsed.products.forEach((p, i) => {
    const bad = (f) => { throw new Error(`schema_error: products[${i}] missing or invalid '${f}'`); };
    if (!isStr(p.product_id))              bad("product_id");
    if (!isStr(p.name))                    bad("name");
    if (!isStr(p.category))                bad("category");
    if (!isNum(p.package_size))            bad("package_size");
    if (!isStr(p.package_unit))            bad("package_unit");
    if (!isNum(p.portion_size))            bad("portion_size");
    if (!isStr(p.portion_unit))            bad("portion_unit");
    if (!isNum(p.shelf_life_days))         bad("shelf_life_days");
    if (!isStr(p.shelf_life_note))         bad("shelf_life_note");
    if (!isBool(p.can_freeze))             bad("can_freeze");
    if (!isNum(p.frozen_shelf_life_days))  bad("frozen_shelf_life_days");
    if (!VALID_STORE_SECTIONS.includes(p.store_section)) bad("store_section");
  });
  return parsed.products;
}

function validateRecipes(parsed) {
  if (!parsed || !Array.isArray(parsed.recipes))
    throw new Error("schema_error: missing 'recipes' array at root");
  parsed.recipes.forEach((r, i) => {
    const bad = (f) => { throw new Error(`schema_error: recipes[${i}] missing or invalid '${f}'`); };
    if (!isStr(r.recipe_id))                    bad("recipe_id");
    if (!isStr(r.name))                         bad("name");
    if (!VALID_MEAL_TYPES.includes(r.meal_type)) bad("meal_type");
    if (!isNum(r.prep_time_min))                bad("prep_time_min");
    if (!isNum(r.servings))                     bad("servings");
    if (!r.macros || typeof r.macros !== "object") bad("macros");
    ["calories_kcal", "protein_g", "carbs_g", "fat_g", "fiber_g"].forEach(f => {
      if (!isNum(r.macros[f])) bad(`macros.${f}`);
    });
    if (!Array.isArray(r.ingredients)) bad("ingredients");
    r.ingredients.forEach((ing, j) => {
      if (!isStr(ing.product_id))
        throw new Error(`schema_error: recipes[${i}].ingredients[${j}] missing product_id`);
      if (!isNum(ing.quantity))
        throw new Error(`schema_error: recipes[${i}].ingredients[${j}] missing quantity`);
      if (!isStr(ing.unit))
        throw new Error(`schema_error: recipes[${i}].ingredients[${j}] missing unit`);
    });
    if (!Array.isArray(r.tags)) bad("tags");
  });
  return parsed.recipes;
}

function validateRDAs(parsed) {
  if (!parsed || !Array.isArray(parsed.nutrients))
    throw new Error("schema_error: missing 'nutrients' array at root");
  parsed.nutrients.forEach((n, i) => {
    const bad = (f) => { throw new Error(`schema_error: nutrients[${i}] missing or invalid '${f}'`); };
    if (!isStr(n.nutrient))             bad("nutrient");
    if (!isStr(n.unit))                 bad("unit");
    if (!isNum(n.rda_male_19_50))       bad("rda_male_19_50");
    if (!isNum(n.rda_female_19_50))     bad("rda_female_19_50");
    if (!isNum(n.rda_male_51_plus))     bad("rda_male_51_plus");
    if (!isNum(n.rda_female_51_plus))   bad("rda_female_51_plus");
    if (!isStr(n.notes))                bad("notes");
  });
  return parsed.nutrients;
}

const VALIDATORS = { recipes: validateRecipes, products: validateProducts, rdas: validateRDAs };

// ─── Orphan detection (spec §7.5) ─────────────────────────────────────────────
function findOrphanIngredients(recipes, products) {
  const productIds = new Set(products.map(p => p.product_id));
  const warnings = [];
  recipes.forEach(r => {
    r.ingredients.forEach(ing => {
      if (!productIds.has(ing.product_id)) {
        warnings.push({
          recipe_id:          r.recipe_id,
          recipe_name:        r.name,
          missing_product_id: ing.product_id,
        });
      }
    });
  });
  return warnings;
}

// ─── MCP adapter (spec §2.4) ──────────────────────────────────────────────────
function detectMCPAvailability() {
  if (typeof window.__claude_mcp === "function") return "claude_mcp";
  if (window.mcp_google_drive && typeof window.mcp_google_drive === "object") return "mcp_google_drive";
  return null;
}

async function callDriveAPI(method, params) {
  const adapter = detectMCPAvailability();
  if (!adapter) throw new Error("mcp_unavailable");
  if (adapter === "claude_mcp") {
    return window.__claude_mcp("google-drive", method, params);
  }
  if (typeof window.mcp_google_drive[method] !== "function")
    throw new Error(`Method ${method} not available on mcp_google_drive`);
  return window.mcp_google_drive[method](params);
}

async function walkFolderPath(segments) {
  let parentId = "root";
  for (const segment of segments) {
    const res = await callDriveAPI("files_list", {
      q: `'${parentId}' in parents and name = '${segment}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: "files(id,name)",
    });
    const files = res?.files || [];
    if (files.length === 0) throw new Error(`folder_not_found: ${segment}`);
    parentId = files[0].id;
  }
  return parentId;
}

async function findFile(folderId, filename) {
  const res = await callDriveAPI("files_list", {
    q: `'${folderId}' in parents and name = '${filename}' and trashed = false`,
    fields: "files(id,name,modifiedTime)",
  });
  const files = res?.files || [];
  if (files.length === 0) throw new Error(`file_not_found: ${filename}`);
  return files[0];
}

async function getFileContent(fileId) {
  const res = await callDriveAPI("files_get", { fileId, alt: "media" });
  if (typeof res === "string") return res;
  if (res && typeof res.body === "string") return res.body;
  if (res && typeof res.content === "string") return res.content;
  throw new Error("Unexpected response format from Drive API");
}

// ─── Error classifier (spec §4.4.3) ──────────────────────────────────────────
function classifyError(e) {
  const msg = (e?.message || "").toLowerCase();
  if (msg.startsWith("mcp_unavailable"))
    return { code: "mcp_unavailable", message: "Google Drive MCP connector is not available.", detail: e?.message };
  if (msg.includes("unauthorized") || msg.includes("auth") || msg.includes("403"))
    return { code: "not_connected", message: "Not authorized. Reconnect Google Drive in Claude settings.", detail: e?.message };
  if (msg.includes("rate limit") || msg.includes("429"))
    return { code: "rate_limited", message: "Drive API rate limit reached. Try again in a moment.", detail: e?.message };
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("timeout"))
    return { code: "network_error", message: "Network error contacting Google Drive.", detail: e?.message };
  if (msg.startsWith("folder_not_found"))
    return { code: "folder_not_found", message: `Drive folder not found: ${e?.message?.split(": ")[1] || ""}`, detail: e?.message };
  if (msg.startsWith("file_not_found"))
    return { code: "file_not_found", message: `File not found in Drive: ${e?.message?.split(": ")[1] || ""}`, detail: e?.message };
  if (msg.includes("parse_error") || msg.includes("json"))
    return { code: "parse_error", message: "Response from Drive is not valid JSON.", detail: e?.message };
  if (msg.includes("schema_error") || msg.includes("missing") || msg.includes("invalid"))
    return { code: "schema_error", message: (e?.message || "").replace("schema_error: ", ""), detail: e?.message };
  return { code: "unknown", message: e?.message || "Unknown error.", detail: e?.message };
}

// ─── performSync (spec §4.4.2) ────────────────────────────────────────────────
async function performSync(currentCache) {
  const startedAt = new Date().toISOString();
  const report  = { started_at: startedAt, results: {} };
  const newCache = { ...(currentCache || {}) };

  // MCP not available — mark all files as errored
  if (!detectMCPAvailability()) {
    ["recipes", "products", "rdas"].forEach(key => {
      report.results[key] = {
        status: "error",
        code:    "mcp_unavailable",
        message: "Google Drive MCP connector is not available.",
        detail:  null,
        source: currentCache?.[key] ? "cache" : "none",
        fallback_items_count: currentCache?.[key]?.length || 0,
      };
    });
    report.completed_at = new Date().toISOString();
    newCache.last_synced      = report.completed_at;
    newCache.last_sync_report = report;
    return { report, newCache };
  }

  // Walk folder path — failure blocks all three files
  let folderId;
  try {
    folderId = await walkFolderPath(PATH_SEGMENTS);
  } catch (e) {
    const err = classifyError(e);
    ["recipes", "products", "rdas"].forEach(key => {
      report.results[key] = {
        status: "error",
        ...err,
        source: currentCache?.[key] ? "cache" : "none",
        fallback_items_count: currentCache?.[key]?.length || 0,
      };
    });
    report.completed_at = new Date().toISOString();
    newCache.last_synced      = report.completed_at;
    newCache.last_sync_report = report;
    return { report, newCache };
  }

  // Fetch all three files in parallel
  const fileConfigs = [
    { key: "recipes",  filename: "recipes.json" },
    { key: "products", filename: "products.json" },
    { key: "rdas",     filename: "micro-rdas.json" },
  ];

  await Promise.all(fileConfigs.map(async ({ key, filename }) => {
    const modKey = `${key}_modified`;
    try {
      const fileMeta = await findFile(folderId, filename);

      // Delta optimization — skip re-fetch if modifiedTime unchanged
      if (currentCache?.[modKey] === fileMeta.modifiedTime && currentCache?.[key]) {
        report.results[key] = {
          status: "ok",
          source: "cache",
          items_count: currentCache[key].length,
          modified_time: fileMeta.modifiedTime,
        };
        return;
      }

      const raw = await getFileContent(fileMeta.id);
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("parse_error: response is not valid JSON");
      }

      const items = VALIDATORS[key](parsed);
      newCache[key]    = items;
      newCache[modKey] = fileMeta.modifiedTime;
      report.results[key] = {
        status: "ok",
        source: "drive",
        items_count: items.length,
        modified_time: fileMeta.modifiedTime,
      };
    } catch (e) {
      const err = classifyError(e);
      report.results[key] = {
        status: "error",
        ...err,
        source: currentCache?.[key] ? "cache" : "none",
        fallback_items_count: currentCache?.[key]?.length || 0,
      };
    }
  }));

  // Referential integrity — only if BOTH recipes and products succeeded this sync
  if (report.results.recipes?.status === "ok" && report.results.products?.status === "ok") {
    const r = newCache.recipes  || currentCache?.recipes  || [];
    const p = newCache.products || currentCache?.products || [];
    newCache.orphan_warnings = findOrphanIngredients(r, p);
  }

  report.completed_at       = new Date().toISOString();
  newCache.last_synced      = report.completed_at;
  newCache.last_sync_report = report;
  return { report, newCache };
}

// ─── dayTotals (spec §7.1) ────────────────────────────────────────────────────
function dayTotals(day, weekplan, recipesById) {
  const totals = { kcal: 0, protein: 0 };
  SLOTS.forEach(slot => {
    const assignment = weekplan.slots?.[`${day}-${slot}`];
    if (!assignment?.recipe_id) return;
    const recipe = recipesById[assignment.recipe_id];
    if (!recipe) return; // orphaned slot — skip
    totals.kcal    += recipe.macros.calories_kcal;
    totals.protein += recipe.macros.protein_g;
  });
  return totals;
}

// ─── buildShoppingList (spec §7.2) ────────────────────────────────────────────
function buildShoppingList(weekplan, recipesById, productsById) {
  // Accumulate total quantities per product_id across the whole week
  const totals = {};
  Object.values(weekplan.slots || {}).forEach(assignment => {
    if (!assignment?.recipe_id) return;
    const recipe = recipesById[assignment.recipe_id];
    if (!recipe) return; // orphaned slot — skip
    recipe.ingredients.forEach(ing => {
      if (!totals[ing.product_id]) totals[ing.product_id] = { qty: 0, unit: ing.unit };
      totals[ing.product_id].qty += ing.quantity;
    });
  });

  // Build section buckets
  const buckets = {};
  SECTION_ORDER.forEach(s => { buckets[s] = []; });

  Object.entries(totals).forEach(([productId, { qty, unit }]) => {
    const product = productsById[productId];
    if (product) {
      const packagesNeeded = Math.ceil(qty / product.package_size);
      const totalProvided  = packagesNeeded * product.package_size;
      buckets[product.store_section].push({
        productId, name: product.name,
        packagesNeeded, totalQty: qty, totalProvided, unit,
        section: product.store_section,
      });
    } else {
      buckets["Uncategorized"].push({
        productId, name: `? ${productId}`,
        packagesNeeded: null, totalQty: qty, totalProvided: null, unit,
        section: "Uncategorized",
      });
    }
  });

  // Sort alphabetically, drop empty sections
  const result = {};
  SECTION_ORDER.forEach(s => {
    if (buckets[s].length > 0) {
      result[s] = buckets[s].sort((a, b) => a.name.localeCompare(b.name));
    }
  });
  return result;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FUEL() {
  const [view, setView]             = useState("planner");
  const [loaded, setLoaded]         = useState(false);
  const [weekStart, setWeekStart]   = useState(currentMondayISO());
  const [weekplan, setWeekplan]     = useState({ week_of: weekStart, slots: {} });
  const [checklist, setChecklist]   = useState({ week_of: weekStart, checked: {} });
  const [profile, setProfile]       = useState(DEFAULT_PROFILE);
  const [driveCache, setDriveCache] = useState(null);
  const [isSyncing, setIsSyncing]   = useState(false);
  const [pickerSlot, setPickerSlot] = useState(null);
  const syncLockRef                 = useRef(false);

  // Load all state from storage on mount, handle week rollover (spec §5.5, §8.3)
  useEffect(() => {
    (async () => {
      const ws   = currentMondayISO();
      const plan = await storageGet("weekplan",           { week_of: ws, slots: {} });
      const chk  = await storageGet("shopping-checklist", { week_of: ws, checked: {} });
      const prof = await storageGet("profile",            DEFAULT_PROFILE);
      const cache= await storageGet("drive-cache",        null);

      if (plan.week_of !== ws) { plan.week_of = ws; plan.slots = {}; }
      if (chk.week_of  !== ws) { chk.week_of  = ws; chk.checked = {}; }

      setWeekStart(ws);
      setWeekplan(plan);
      setChecklist(chk);
      setProfile({ ...DEFAULT_PROFILE, ...prof });
      setDriveCache(cache);
      setLoaded(true);
    })();
  }, []);

  // Persist on change — gated by loaded to avoid overwriting with defaults (spec §8.3)
  useEffect(() => { if (loaded) storageSet("weekplan", weekplan); },           [weekplan, loaded]);
  useEffect(() => { if (loaded) storageSet("shopping-checklist", checklist); }, [checklist, loaded]);
  useEffect(() => { if (loaded) storageSet("profile", profile); },              [profile, loaded]);
  useEffect(() => { if (loaded && driveCache) storageSet("drive-cache", driveCache); }, [driveCache, loaded]);

  // Auto-sync once after load (spec §4.4.1, §8.3)
  useEffect(() => {
    if (!loaded) return;
    runSync();
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSync = async () => {
    if (syncLockRef.current) return;
    syncLockRef.current = true;
    setIsSyncing(true);
    try {
      const { newCache } = await performSync(driveCache);
      setDriveCache(newCache);
    } finally {
      syncLockRef.current = false;
      setIsSyncing(false);
    }
  };

  // Derived lookup maps (spec §8.5)
  const recipesById = useMemo(() => {
    const map = {};
    (driveCache?.recipes || []).forEach(r => { map[r.recipe_id] = r; });
    return map;
  }, [driveCache?.recipes]);

  const productsById = useMemo(() => {
    const map = {};
    (driveCache?.products || []).forEach(p => { map[p.product_id] = p; });
    return map;
  }, [driveCache?.products]);

  const activeRecipes = driveCache?.recipes || [];

  const shoppingList = useMemo(
    () => buildShoppingList(weekplan, recipesById, productsById),
    [weekplan, recipesById, productsById]
  );

  const driveStatus = useMemo(() => {
    const results = driveCache?.last_sync_report?.results;
    if (!results) return "unknown";
    const vals = Object.values(results);
    if (vals.every(r => r.source === "drive"))  return "drive";
    if (vals.some(r  => r.source === "cache"))  return "cache";
    return "offline";
  }, [driveCache]);

  // Interaction handlers (spec §9)
  const assignRecipe = (day, slot, recipeId) => {
    setWeekplan(prev => ({
      ...prev,
      slots: { ...prev.slots, [`${day}-${slot}`]: { recipe_id: recipeId } },
    }));
    setPickerSlot(null);
  };

  const clearSlot = (day, slot) => {
    setWeekplan(prev => {
      const slots = { ...prev.slots };
      delete slots[`${day}-${slot}`];
      return { ...prev, slots };
    });
  };

  const toggleChecklist = (productId) => {
    setChecklist(prev => ({
      ...prev,
      checked: { ...prev.checked, [productId]: !prev.checked[productId] },
    }));
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  // Loading screen (spec §8.6)
  if (!loaded) {
    return (
      <div style={{
        background: BG, minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: FONT, color: MUTED, fontSize: 13,
      }}>
        LOADING FUEL…
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: FONT, color: TEXT }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${SURFACE}; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        button:focus-visible { outline: 1px solid ${ACCENT}; outline-offset: 2px; }
        input:focus-visible  { outline: 1px solid ${ACCENT}; outline-offset: 2px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .fuel-spin { animation: spin 1s linear infinite; }
      `}</style>
      <Header
        view={view} setView={setView} weekStart={weekStart}
        driveStatus={driveStatus} isSyncing={isSyncing}
      />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px 80px" }}>
        {view === "planner" && (
          <PlannerView
            weekplan={weekplan} recipesById={recipesById} profile={profile}
            activeRecipes={activeRecipes} weekStart={weekStart}
            onOpenPicker={setPickerSlot} onClearSlot={clearSlot} setView={setView}
          />
        )}
        {view === "shop" && (
          <ShoppingView shoppingList={shoppingList} checklist={checklist} onToggle={toggleChecklist} />
        )}
        {view === "profile" && (
          <ProfileView profile={profile} onUpdate={updateProfile} />
        )}
        {view === "sync" && (
          <SyncView driveCache={driveCache} isSyncing={isSyncing} onSync={runSync} />
        )}
      </main>
      {pickerSlot && (
        <RecipePicker
          slot={pickerSlot} recipes={activeRecipes}
          onSelect={assignRecipe} onClose={() => setPickerSlot(null)}
          onGoToSync={() => { setPickerSlot(null); setView("sync"); }}
        />
      )}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: MUTED }}>
      <Icon size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
      <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, marginBottom: action ? 20 : 0 }}>{subtitle}</div>
      {action && (
        <button onClick={action.onClick} style={{
          background: ACCENT, color: BG, border: "none", borderRadius: 2,
          padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
          fontFamily: FONT,
        }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── DriveStatusBadge (spec §6.6) ────────────────────────────────────────────
function DriveStatusBadge({ driveStatus, isSyncing, onClick }) {
  let IconComp, label, color;
  if (isSyncing) {
    IconComp = RefreshCw; label = "Syncing…"; color = MUTED;
  } else if (driveStatus === "drive") {
    IconComp = Cloud;     label = "Drive";    color = GREEN;
  } else if (driveStatus === "cache") {
    IconComp = RefreshCw; label = "Cache";    color = AMBER;
  } else {
    IconComp = CloudOff;  label = "Offline";  color = MUTED;
  }
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: `1px solid ${color}`, borderRadius: 2,
      padding: "3px 8px", display: "flex", alignItems: "center", gap: 5,
      color, cursor: "pointer", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT,
    }}>
      <IconComp size={11} className={isSyncing ? "fuel-spin" : ""} />
      {label}
    </button>
  );
}

// ─── Header (spec §6.1) ───────────────────────────────────────────────────────
function Header({ view, setView, weekStart, driveStatus, isSyncing }) {
  const d = new Date(weekStart + "T00:00:00");
  const weekLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: SURFACE, borderBottom: `1px solid ${BORDER}`,
      padding: "0 20px",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", height: 52, gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: ACCENT, letterSpacing: "0.05em" }}>FUEL</span>
          <span style={{ fontSize: 11, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Week of {weekLabel}
          </span>
          <DriveStatusBadge driveStatus={driveStatus} isSyncing={isSyncing} onClick={() => setView("sync")} />
        </div>
        <nav style={{ display: "flex", gap: 2 }}>
          {TABS.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setView(id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 2, border: "none",
              background: view === id ? ACCENT : "transparent",
              color: view === id ? BG : MUTED,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: FONT, letterSpacing: "0.05em",
            }}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ─── MealSlot (spec §6.2) ─────────────────────────────────────────────────────
function MealSlot({ day, slot, assignment, recipesById, onOpen, onClear }) {
  const recipe   = assignment?.recipe_id ? recipesById[assignment.recipe_id] : null;
  const isOrphan = assignment?.recipe_id && !recipe;

  if (!assignment?.recipe_id) {
    return (
      <button
        onClick={() => onOpen({ day, slot })}
        style={{
          width: "100%", padding: "10px 12px", border: `1px dashed ${BORDER}`,
          borderRadius: 2, background: "transparent", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          color: MUTED, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT,
        }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE_2}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <Plus size={12} />
        {slot}
      </button>
    );
  }

  if (isOrphan) {
    return (
      <div style={{
        padding: "10px 12px", border: `1px solid ${AMBER}`, borderRadius: 2,
        background: `${AMBER}18`, position: "relative",
      }}>
        <div style={{ fontSize: 10, color: AMBER, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{slot}</div>
        <div style={{ fontSize: 11, color: AMBER }}>Recipe removed — clear and reassign</div>
        <button onClick={e => { e.stopPropagation(); onClear(day, slot); }} style={{
          position: "absolute", top: 6, right: 6,
          background: "transparent", border: "none", color: AMBER, cursor: "pointer", padding: 2,
        }}>
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 2,
      background: SURFACE_2, position: "relative",
    }}>
      <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{slot}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{recipe.name}</div>
      <div style={{ fontSize: 11, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ color: ACCENT }}>{recipe.macros.protein_g}P</span>
        {" · "}{recipe.macros.calories_kcal}kcal{" · "}{recipe.prep_time_min}m
      </div>
      <button
        onClick={e => { e.stopPropagation(); onClear(day, slot); }}
        style={{
          position: "absolute", top: 6, right: 6,
          background: "transparent", border: "none", color: MUTED, cursor: "pointer", padding: 2,
        }}
        onMouseEnter={e => e.currentTarget.style.color = TEXT}
        onMouseLeave={e => e.currentTarget.style.color = MUTED}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─── DayColumn (spec §6.2) ────────────────────────────────────────────────────
function DayColumn({ day, weekStart, weekplan, recipesById, profile, onOpen, onClear }) {
  const totals = dayTotals(day, weekplan, recipesById);
  const dayIdx = DAYS.indexOf(day);
  const d      = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + dayIdx);
  const isToday = isoDate(d) === isoDate(new Date());

  return (
    <div style={{
      border: `1px solid ${isToday ? ACCENT : BORDER}`,
      borderRadius: 2, padding: 14, background: SURFACE,
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isToday && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: BG, background: ACCENT,
              padding: "2px 5px", borderRadius: 2, letterSpacing: "0.08em",
            }}>TODAY</span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 800, color: isToday ? ACCENT : TEXT,
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            {day.slice(0, 3)}
          </span>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
          <div>{totals.kcal} / {profile.daily_calories_kcal} kcal</div>
          <div>{totals.protein}P / {profile.daily_protein_g}P</div>
        </div>
      </div>
      {SLOTS.map(slot => (
        <MealSlot
          key={slot} day={day} slot={slot}
          assignment={weekplan.slots?.[`${day}-${slot}`]}
          recipesById={recipesById}
          onOpen={onOpen} onClear={onClear}
        />
      ))}
    </div>
  );
}

// ─── PlannerView (spec §6.2) ──────────────────────────────────────────────────
function PlannerView({ weekplan, weekStart, recipesById, profile, activeRecipes, onOpenPicker, onClearSlot, setView }) {
  if (activeRecipes.length === 0) {
    return (
      <>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, marginBottom: 24, opacity: 0.25, pointerEvents: "none",
        }}>
          {DAYS.map(day => (
            <div key={day} style={{ border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14, background: SURFACE, minHeight: 180 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {day.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
        <EmptyState
          icon={CloudOff}
          title="No recipes loaded yet"
          subtitle="Connect Google Drive and sync your recipes to start planning."
          action={{ label: "Go to Sync panel", onClick: () => setView("sync") }}
        />
      </>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
      {DAYS.map(day => (
        <DayColumn
          key={day} day={day} weekStart={weekStart}
          weekplan={weekplan} recipesById={recipesById} profile={profile}
          onOpen={onOpenPicker} onClear={onClearSlot}
        />
      ))}
    </div>
  );
}

// ─── RecipePicker (spec §6.7) ─────────────────────────────────────────────────
function RecipePicker({ slot, recipes, onSelect, onClose, onGoToSync }) {
  const { day, slot: slotName } = slot;
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState(slotName); // pre-select matching meal type

  const filtered = recipes.filter(r => {
    const matchFilter = filter === "All" || r.meal_type === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.name.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(4px)", zIndex: 200,
        display: "flex", justifyContent: "center", paddingTop: "5vh",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4,
          width: "100%", maxWidth: 720, maxHeight: "90vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 16px", borderBottom: `1px solid ${BORDER}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: MUTED }}>{day}</span>
            <span style={{ color: MUTED }}> · </span>
            <span style={{ color: ACCENT, fontWeight: 700 }}>{slotName}</span>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: SURFACE_2, borderRadius: 2, padding: "8px 10px" }}>
            <Search size={13} color={MUTED} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recipes or tags…"
              style={{
                background: "transparent", border: "none", color: TEXT,
                fontSize: 13, flex: 1, outline: "none", fontFamily: FONT,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", ...SLOTS].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "4px 10px", borderRadius: 2, cursor: "pointer",
                border: `1px solid ${filter === f ? ACCENT : BORDER}`,
                background: filter === f ? ACCENT : "transparent",
                color: filter === f ? BG : MUTED,
                fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.05em",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* Recipe grid */}
        <div style={{ overflowY: "auto", padding: 16, flex: 1 }}>
          {recipes.length === 0 ? (
            <EmptyState
              icon={CloudOff}
              title="No recipes synced yet"
              subtitle="Open the Sync panel to load your recipes."
              action={{ label: "Go to Sync", onClick: onGoToSync }}
            />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: MUTED, padding: 40, fontSize: 13 }}>
              No recipes match.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {filtered.map(recipe => (
                <button
                  key={recipe.recipe_id}
                  onClick={() => onSelect(day, slotName, recipe.recipe_id)}
                  style={{
                    background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 2,
                    padding: 12, textAlign: "left", cursor: "pointer", fontFamily: FONT,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{recipe.name}</div>
                  <div style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", marginBottom: 8 }}>
                    <span style={{ color: ACCENT }}>{recipe.macros.protein_g}P</span>
                    <span style={{ color: MUTED }}> · {recipe.macros.calories_kcal}kcal · {recipe.prep_time_min}m</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {recipe.tags.slice(0, 3).map(tag => (
                      <span key={tag} style={{
                        fontSize: 9, fontWeight: 700, color: MUTED,
                        border: `1px solid ${BORDER}`, borderRadius: 2,
                        padding: "2px 5px", letterSpacing: "0.08em", textTransform: "uppercase",
                      }}>{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ShoppingItem (spec §6.3) ─────────────────────────────────────────────────
function ShoppingItem({ item, checked, onToggle }) {
  const isUncategorized = item.section === "Uncategorized";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "9px 0", borderBottom: `1px solid ${BORDER}`,
    }}>
      <button
        onClick={() => onToggle(item.productId)}
        style={{
          flexShrink: 0, width: 18, height: 18,
          border: `1px solid ${checked ? ACCENT : BORDER}`,
          borderRadius: 2, background: checked ? ACCENT : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        }}
      >
        {checked && <Check size={11} color={BG} />}
      </button>
      <div style={{ flex: 1, opacity: checked ? 0.5 : 1 }}>
        <div style={{
          fontSize: 13, color: TEXT, fontWeight: 600,
          textDecoration: checked ? "line-through" : "none",
        }}>
          {isUncategorized ? item.name : `${item.packagesNeeded} × ${item.name}`}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          {isUncategorized
            ? "Product not in catalog"
            : `Need ${item.totalQty}${item.unit} · Get ${item.totalProvided}${item.unit}`}
        </div>
      </div>
    </div>
  );
}

// ─── ShoppingView (spec §6.3) ─────────────────────────────────────────────────
function ShoppingView({ shoppingList, checklist, onToggle }) {
  const sections     = Object.keys(shoppingList);
  const allItems     = sections.flatMap(s => shoppingList[s]);
  const checkedCount = allItems.filter(item => checklist.checked[item.productId]).length;

  if (allItems.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No shopping list yet"
        subtitle="Assign meals in the Plan view to generate a list."
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Shopping list
        </div>
        <div style={{ fontSize: 12, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
          {checkedCount} / {allItems.length} items
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {sections.map(section => (
          <div key={section} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase",
              letterSpacing: "0.1em", paddingBottom: 10, borderBottom: `1px solid ${BORDER}`, marginBottom: 4,
            }}>
              {section}
            </div>
            {shoppingList[section].map(item => (
              <ShoppingItem
                key={item.productId} item={item}
                checked={!!checklist.checked[item.productId]}
                onToggle={onToggle}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ProfileView (spec §6.4) ──────────────────────────────────────────────────
function ProfileView({ profile, onUpdate }) {
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
        Daily macro targets
      </div>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PROFILE_FIELDS.map(({ key, label, unit }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <label htmlFor={key} style={{ fontSize: 13, color: TEXT, fontWeight: 600, flex: 1 }}>
                {label} ({unit})
              </label>
              <input
                id={key}
                type="number"
                value={profile[key]}
                onChange={e => onUpdate(key, e.target.value)}
                style={{
                  background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 2,
                  color: TEXT, fontSize: 13, padding: "6px 10px", width: 100,
                  textAlign: "right", fontFamily: FONT, fontVariantNumeric: "tabular-nums",
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: MUTED }}>
          Targets are saved locally. Daily totals in the Plan view compare against these numbers.
        </div>
      </div>
    </div>
  );
}

// ─── SyncFileCard (spec §6.5) ─────────────────────────────────────────────────
function SyncFileCard({ filename, result }) {
  const [showDetail, setShowDetail] = useState(false);

  let statusLabel, statusColor, StatusIcon;
  if (!result) {
    statusLabel = "Not synced"; statusColor = MUTED; StatusIcon = CloudOff;
  } else if (result.status === "ok" && result.source === "drive") {
    statusLabel = "Live from Drive"; statusColor = GREEN; StatusIcon = Cloud;
  } else if (result.status === "ok" && result.source === "cache") {
    statusLabel = "From cache"; statusColor = AMBER; StatusIcon = RefreshCw;
  } else {
    statusLabel = "Not synced"; statusColor = MUTED; StatusIcon = CloudOff;
  }

  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>{filename}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: statusColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          <StatusIcon size={11} />
          {statusLabel}
        </span>
      </div>
      {result && (
        <div style={{ fontSize: 11, color: MUTED }}>
          {result.status === "ok" ? (
            <>{result.items_count} items · Drive file modified {timeDelta(result.modified_time)}</>
          ) : (
            <>
              <span style={{ fontFamily: "monospace", background: SURFACE_2, padding: "1px 5px", borderRadius: 2, color: CORAL, fontSize: 10 }}>
                {result.code || result.error}
              </span>
              {" "}{result.message}
              {result.detail && (
                <div style={{ marginTop: 6 }}>
                  <button
                    onClick={() => setShowDetail(v => !v)}
                    style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", fontSize: 11, textDecoration: "underline", padding: 0, fontFamily: FONT }}
                  >
                    {showDetail ? "Hide" : "Show"} error details
                  </button>
                  {showDetail && (
                    <div style={{ marginTop: 6, fontSize: 10, color: MUTED, fontFamily: "monospace", background: SURFACE_2, padding: 8, borderRadius: 2, wordBreak: "break-all" }}>
                      {result.detail}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SyncView (spec §6.5) ─────────────────────────────────────────────────────
function SyncView({ driveCache, isSyncing, onSync }) {
  const report   = driveCache?.last_sync_report;
  const results  = report?.results;
  const isMCPUnavailable = results && Object.values(results).every(r => r.code === "mcp_unavailable");

  const duration = report?.completed_at && report?.started_at
    ? ((new Date(report.completed_at) - new Date(report.started_at)) / 1000).toFixed(1)
    : null;

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Drive sync
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>
            Last synced: {timeDelta(driveCache?.last_synced)}
          </div>
        </div>
        <button
          onClick={onSync}
          disabled={isSyncing}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
            borderRadius: 2, border: "none", cursor: isSyncing ? "not-allowed" : "pointer",
            background: isSyncing ? SURFACE_2 : ACCENT,
            color: isSyncing ? MUTED : BG,
            fontSize: 12, fontWeight: 700, fontFamily: FONT,
          }}
        >
          <RefreshCw size={13} className={isSyncing ? "fuel-spin" : ""} />
          Sync with Drive
        </button>
      </div>

      {/* MCP unavailable banner */}
      {isMCPUnavailable && (
        <div style={{ border: `1px solid ${BORDER}`, borderRadius: 2, padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <CloudOff size={18} color={MUTED} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Running without Drive integration</div>
            <div style={{ fontSize: 12, color: MUTED }}>No Drive MCP connector detected. Connect the Google Drive MCP in Claude settings to enable sync.</div>
          </div>
        </div>
      )}

      {/* No sync yet — empty state */}
      {!report && !isSyncing && (
        <EmptyState
          icon={Cloud}
          title="No sync attempted yet"
          subtitle="Click Sync with Drive to load your recipes and products."
        />
      )}

      {/* File status cards */}
      {(report || isSyncing) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          <SyncFileCard filename="recipes.json"    result={results?.recipes} />
          <SyncFileCard filename="products.json"   result={results?.products} />
          <SyncFileCard filename="micro-rdas.json" result={results?.rdas} />
        </div>
      )}

      {/* Orphan warnings */}
      {(driveCache?.orphan_warnings?.length > 0) && (
        <div style={{ border: `1px solid ${AMBER}`, borderRadius: 2, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            Recipes with missing ingredients
          </div>
          {driveCache.orphan_warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: TEXT, marginBottom: 6 }}>
              {w.recipe_name} references unknown product:{" "}
              <span style={{ fontFamily: "monospace", color: AMBER }}>{w.missing_product_id}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
            Add the missing product to products.json on Drive, then sync again.
          </div>
        </div>
      )}

      {/* Timing summary */}
      {report && duration && (
        <div style={{ fontSize: 11, color: MUTED }}>
          Sync started at {new Date(report.started_at).toLocaleTimeString()} · completed in {duration}s
        </div>
      )}
    </div>
  );
}
