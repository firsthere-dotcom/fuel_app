import React, { useState, useMemo } from "react";
import { X, Search, CloudOff } from "lucide-react";
import { SURFACE, SURFACE_2, BORDER, TEXT, MUTED, ACCENT, AMBER, BG, FONT, SLOTS } from "../constants.js";
import EmptyState from "../components/EmptyState.jsx";
import IngredientModal from "../components/IngredientModal.jsx";

export default function RecipePicker({ slot, recipes, productsById, checklist, weekTotals, onSelect, onClose, onGoToSync }) {
  const { day, slot: slotName } = slot;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(slotName);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [viewingRecipe, setViewingRecipe] = useState(null);

  const sources = useMemo(() => {
    const s = new Set(recipes.map(r => r.source).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [recipes]);

  const filtered = recipes.filter(r => {
    const matchFilter = filter === "All" || r.meal_type.includes(filter);
    const matchSource = sourceFilter === "All" || r.source === sourceFilter;
    const q = search.toLowerCase();
    return matchFilter && matchSource && (!q || r.name.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)));
  });

  const hasSurplus = recipe => recipe.ingredients.some(ing => {
    const stockedPacks = checklist.checked?.[ing.product_id] ?? 0;
    const p = productsById[ing.product_id];
    if (!p || stockedPacks === 0) return false;
    return (stockedPacks * p.package_size) > (weekTotals[ing.product_id] ?? 0);
  });

  const sorted = useMemo(
    () => filtered.map(r => ({ recipe: r, hasStock: hasSurplus(r) })).sort((a, b) => b.hasStock - a.hasStock),
    [filtered, checklist, weekTotals, productsById]
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", justifyContent: "center", paddingTop: "5vh" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, width: "100%", maxWidth: 720, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: MUTED }}>{day}</span>
            <span style={{ color: MUTED }}> · </span>
            <span style={{ color: ACCENT, fontWeight: 700 }}>{slotName}</span>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", padding: 4 }}><X size={16} /></button>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: SURFACE_2, borderRadius: 2, padding: "8px 10px" }}>
            <Search size={13} color={MUTED} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes or tags…" style={{ background: "transparent", border: "none", color: TEXT, fontSize: 13, flex: 1, outline: "none", fontFamily: FONT }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {["All", ...SLOTS].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 10px", borderRadius: 2, cursor: "pointer", border: `1px solid ${filter === f ? ACCENT : BORDER}`, background: filter === f ? ACCENT : "transparent", color: filter === f ? BG : MUTED, fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.05em" }}>{f}</button>
            ))}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowSourceDropdown(p => !p)}
                style={{ padding: "4px 10px", borderRadius: 2, cursor: "pointer", border: `1px solid ${sourceFilter !== "All" ? AMBER : BORDER}`, background: sourceFilter !== "All" ? AMBER : "transparent", color: sourceFilter !== "All" ? BG : MUTED, fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.05em" }}
              >
                {sourceFilter === "All" ? "Source ▾" : `${sourceFilter} ▾`}
              </button>
              {showSourceDropdown && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, zIndex: 10, minWidth: 160 }}>
                  {sources.map(s => (
                    <button key={s} onClick={() => { setSourceFilter(s); setShowSourceDropdown(false); }}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: sourceFilter === s ? SURFACE_2 : "transparent", border: "none", color: sourceFilter === s ? ACCENT : TEXT, fontSize: 12, fontFamily: FONT, cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = SURFACE_2}
                      onMouseLeave={e => e.currentTarget.style.background = sourceFilter === s ? SURFACE_2 : "transparent"}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: 16, flex: 1 }}>
          {recipes.length === 0 ? (
            <EmptyState icon={CloudOff} title="No recipes synced yet" subtitle="Check the Sync panel." action={{ label: "Go to Sync", onClick: onGoToSync }} />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: MUTED, padding: 40, fontSize: 13 }}>No recipes match.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {sorted.map(({ recipe, hasStock }) => (
                  <div key={recipe.recipe_id} style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 12, fontFamily: FONT, position: "relative", cursor: "pointer" }}
                    onClick={() => setViewingRecipe(recipe)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
                    onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                  >
                    {hasStock && <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, background: AMBER, borderRadius: 1, display: "block", pointerEvents: "none" }} />}
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{recipe.name}</div>
                    <div style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", marginBottom: 6 }}>
                      <span style={{ color: ACCENT }}>{recipe.macros.protein_g}P</span>
                      <span style={{ color: MUTED }}> · {recipe.macros.calories_kcal}kcal · {recipe.prep_time_min}m</span>
                    </div>
                    {recipe.source && <div style={{ fontSize: 10, color: MUTED, marginBottom: 6, letterSpacing: "0.02em" }}>{recipe.source}</div>}
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
                      {recipe.tags.slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontSize: 9, fontWeight: 700, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 2, padding: "2px 5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{tag}</span>
                      ))}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); onSelect(day, slotName, recipe.recipe_id); }}
                      style={{ width: "100%", background: ACCENT, border: "none", borderRadius: 2, padding: "6px 0", fontSize: 11, fontWeight: 700, color: BG, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT }}
                    >
                      Add to {slotName}
                    </button>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {viewingRecipe && <IngredientModal recipe={viewingRecipe} productsById={productsById} checklist={checklist} onClose={() => setViewingRecipe(null)} />}
    </div>
  );
}
