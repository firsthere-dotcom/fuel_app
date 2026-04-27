import React, { useState, useEffect, useMemo } from "react";
import { BG, SURFACE, BORDER, TEXT, FONT, DEFAULT_PROFILE } from "./constants.js";
import { currentMondayISO } from "./utils/date.js";
import { storageGet, storageSet } from "./utils/storage.js";
import { findOrphanIngredients, buildShoppingList } from "./utils/shopping.js";
import SEED_PRODUCTS from "./data/products.json";
import SEED_RECIPES  from "./data/recipes.json";
import SEED_RDAS     from "./data/rdas.json";

import Header       from "./components/Header.jsx";
import PlannerView  from "./views/PlannerView.jsx";
import ShoppingView from "./views/ShoppingView.jsx";
import CartView     from "./views/CartView.jsx";
import StockView    from "./views/StockView.jsx";
import ProfileView  from "./views/ProfileView.jsx";
import SyncView     from "./views/SyncView.jsx";
import RecipePicker from "./views/RecipePicker.jsx";

export default function App() {
  const [view, setView]             = useState("planner");
  const [loaded, setLoaded]         = useState(false);
  const [weekStart, setWeekStart]   = useState(currentMondayISO());
  const [weekplan, setWeekplan]     = useState({ week_of: weekStart, slots: {} });
  const [checklist, setChecklist]   = useState({ week_of: weekStart, checked: {} });
  const [profile, setProfile]       = useState(DEFAULT_PROFILE);
  const [driveCache, setDriveCache] = useState(null);
  const [pickerSlot, setPickerSlot] = useState(null);

  useEffect(() => {
    (async () => {
      const ws   = currentMondayISO();
      const plan = await storageGet("weekplan",            { week_of: ws, slots: {} });
      const chk  = await storageGet("shopping-checklist", { week_of: ws, checked: {} });
      const prof = await storageGet("profile",             DEFAULT_PROFILE);

      if (plan.week_of !== ws) { plan.week_of = ws; plan.slots = {}; }
      if (chk.week_of  !== ws) { chk.week_of  = ws; chk.checked = {}; }
      Object.keys(chk.checked).forEach(k => {
        if (chk.checked[k] === true)  chk.checked[k] = 1;
        if (chk.checked[k] === false) chk.checked[k] = 0;
      });

      const now = new Date().toISOString();
      const cache = {
        recipes: SEED_RECIPES, products: SEED_PRODUCTS, rdas: SEED_RDAS,
        last_synced: now,
        orphan_warnings: findOrphanIngredients(SEED_RECIPES, SEED_PRODUCTS),
        last_sync_report: {
          started_at: now, completed_at: now,
          results: {
            recipes:  { status: "ok", source: "drive", items_count: SEED_RECIPES.length,  modified_time: now },
            products: { status: "ok", source: "drive", items_count: SEED_PRODUCTS.length, modified_time: now },
            rdas:     { status: "ok", source: "drive", items_count: SEED_RDAS.length,     modified_time: now },
          },
        },
      };

      setWeekStart(ws);
      setWeekplan(plan);
      setChecklist(chk);
      setProfile({ ...DEFAULT_PROFILE, ...prof });
      setDriveCache(cache);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) storageSet("weekplan", weekplan); },            [weekplan, loaded]);
  useEffect(() => { if (loaded) storageSet("shopping-checklist", checklist); }, [checklist, loaded]);
  useEffect(() => { if (loaded) storageSet("profile", profile); },              [profile, loaded]);

  const recipesById  = useMemo(() => Object.fromEntries((driveCache?.recipes  || []).map(r => [r.recipe_id,  r])), [driveCache?.recipes]);
  const productsById = useMemo(() => Object.fromEntries((driveCache?.products || []).map(p => [p.product_id, p])), [driveCache?.products]);
  const activeRecipes = driveCache?.recipes || [];
  const shoppingList  = useMemo(() => buildShoppingList(weekplan, recipesById, productsById), [weekplan, recipesById, productsById]);

  const weekTotals = useMemo(() => {
    const totals = {};
    Object.values(weekplan.slots || {}).forEach(a => {
      if (!a?.recipe_id) return;
      const r = recipesById[a.recipe_id];
      if (!r) return;
      r.ingredients.forEach(ing => {
        totals[ing.product_id] = (totals[ing.product_id] || 0) + ing.quantity;
      });
    });
    return totals;
  }, [weekplan, recipesById]);

  const driveStatus = useMemo(() => {
    const results = driveCache?.last_sync_report?.results;
    if (!results) return "unknown";
    const vals = Object.values(results);
    if (vals.every(r => r.source === "drive")) return "drive";
    if (vals.some(r  => r.source === "cache")) return "cache";
    return "offline";
  }, [driveCache]);

  const assignRecipe = (day, slot, recipeId) => {
    setWeekplan(prev => ({ ...prev, slots: { ...prev.slots, [`${day}-${slot}`]: { recipe_id: recipeId } } }));
    setPickerSlot(null);
  };
  const clearSlot = (day, slot) => {
    setWeekplan(prev => { const s = { ...prev.slots }; delete s[`${day}-${slot}`]; return { ...prev, slots: s }; });
  };
  const toggleEaten = (day, slot) => {
    setWeekplan(prev => {
      const key = `${day}-${slot}`;
      const existing = prev.slots[key] || {};
      return { ...prev, slots: { ...prev.slots, [key]: { ...existing, eaten: !existing.eaten } } };
    });
  };
  const toggleChecklist = (pid, index) => {
    setChecklist(prev => {
      const cur  = prev.checked[pid] || 0;
      const next = cur > index ? index : index + 1;
      return { ...prev, checked: { ...prev.checked, [pid]: next } };
    });
  };
  const addToStock = (pid, qty) => {
    setChecklist(prev => ({
      ...prev,
      checked: { ...prev.checked, [pid]: (prev.checked[pid] || 0) + qty },
    }));
  };
  const removeFromStock = pid => setChecklist(prev => ({ ...prev, checked: { ...prev.checked, [pid]: 0 } }));
  const adjustStock     = (pid, count) => setChecklist(prev => ({ ...prev, checked: { ...prev.checked, [pid]: count } }));
  const clearStock      = ()  => setChecklist(prev => ({ ...prev, checked: {} }));
  const updateProfile   = (field, value) => setProfile(prev => ({ ...prev, [field]: Number(value) || 0 }));

  if (!loaded) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#8A8A8A", fontSize: 13 }}>
        LOADING FUEL…
      </div>
    );
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: FONT, color: TEXT }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${SURFACE}; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        button:focus-visible, input:focus-visible { outline: 1px solid #C8FF00; outline-offset: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fuel-spin { animation: spin 1s linear infinite; }
      `}</style>

      <Header view={view} setView={setView} weekStart={weekStart} driveStatus={driveStatus} isSyncing={false} />

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px 80px" }}>
        {view === "planner" && <PlannerView weekplan={weekplan} weekStart={weekStart} recipesById={recipesById} productsById={productsById} checklist={checklist} profile={profile} activeRecipes={activeRecipes} onOpenPicker={setPickerSlot} onClearSlot={clearSlot} onToggleEaten={toggleEaten} setView={setView} />}
        {view === "shop"    && <ShoppingView shoppingList={shoppingList} checklist={checklist} onToggle={toggleChecklist} />}
        {view === "cart"    && <CartView products={driveCache?.products || []} checklist={checklist} onBought={addToStock} />}
        {view === "stock"   && <StockView checklist={checklist} productsById={productsById} weekTotals={weekTotals} onRemove={removeFromStock} onAdjust={adjustStock} onClearAll={clearStock} />}
        {view === "profile" && <ProfileView profile={profile} onUpdate={updateProfile} />}
        {view === "sync"    && <SyncView driveCache={driveCache} isSyncing={false} />}
      </main>

      {pickerSlot && (
        <RecipePicker
          slot={pickerSlot}
          recipes={activeRecipes}
          productsById={productsById}
          checklist={checklist}
          weekTotals={weekTotals}
          onSelect={assignRecipe}
          onClose={() => setPickerSlot(null)}
          onGoToSync={() => { setPickerSlot(null); setView("sync"); }}
        />
      )}
    </div>
  );
}
