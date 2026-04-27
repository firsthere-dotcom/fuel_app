import React, { useState } from "react";
import { Plus, X, Check, CloudOff } from "lucide-react";
import { BG, SURFACE, SURFACE_2, BORDER, TEXT, MUTED, ACCENT, AMBER, GREEN, FONT, DAYS, SLOTS } from "../constants.js";
import { isoDate } from "../utils/date.js";
import { dayTotals } from "../utils/shopping.js";
import EmptyState from "../components/EmptyState.jsx";
import IngredientModal from "../components/IngredientModal.jsx";

function MealSlot({ day, slot, assignment, recipesById, onOpen, onClear, onToggleEaten, onViewIngredients }) {
  const recipe   = assignment?.recipe_id ? recipesById[assignment.recipe_id] : null;
  const isOrphan = assignment?.recipe_id && !recipe;
  const eaten    = assignment?.eaten || false;

  if (!assignment?.recipe_id) {
    return (
      <button
        onClick={() => onOpen({ day, slot })}
        style={{ width: "100%", padding: "10px 12px", border: `1px dashed ${BORDER}`, borderRadius: 2, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE_2}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <Plus size={12} />{slot}
      </button>
    );
  }

  if (isOrphan) {
    return (
      <div style={{ padding: "10px 12px", border: `1px solid ${AMBER}`, borderRadius: 2, background: `${AMBER}18`, position: "relative" }}>
        <div style={{ fontSize: 10, color: AMBER, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{slot}</div>
        <div style={{ fontSize: 11, color: AMBER }}>Recipe removed — clear and reassign</div>
        <button onClick={e => { e.stopPropagation(); onClear(day, slot); }} style={{ position: "absolute", top: 6, right: 6, background: "transparent", border: "none", color: AMBER, cursor: "pointer", padding: 2 }}><X size={12} /></button>
      </div>
    );
  }

  return (
    <div
      onClick={() => onViewIngredients(recipe)}
      style={{ padding: "10px 12px", border: `1px solid ${eaten ? GREEN : BORDER}`, borderRadius: 2, background: SURFACE_2, position: "relative", opacity: eaten ? 0.6 : 1, cursor: "pointer" }}
      onMouseEnter={e => { if (!eaten) e.currentTarget.style.borderColor = MUTED; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = eaten ? GREEN : BORDER; }}
    >
      <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{slot}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4, textDecoration: eaten ? "line-through" : "none" }}>{recipe.name}</div>
      <div style={{ fontSize: 11, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ color: ACCENT }}>{recipe.macros.protein_g}P</span>{" · "}{recipe.macros.calories_kcal}kcal{" · "}{recipe.prep_time_min}m
      </div>
      <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4 }}>
        <button
          onClick={e => { e.stopPropagation(); onToggleEaten(day, slot); }}
          title={eaten ? "Mark as not eaten" : "Mark as eaten"}
          style={{ width: 20, height: 20, border: `1px solid ${eaten ? GREEN : BORDER}`, borderRadius: 2, background: eaten ? GREEN : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          onMouseEnter={e => { if (!eaten) e.currentTarget.style.borderColor = GREEN; }}
          onMouseLeave={e => { if (!eaten) e.currentTarget.style.borderColor = BORDER; }}
        >
          <Check size={11} color={eaten ? BG : MUTED} />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onClear(day, slot); }}
          style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", padding: 2 }}
          onMouseEnter={e => e.currentTarget.style.color = TEXT}
          onMouseLeave={e => e.currentTarget.style.color = MUTED}
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

function DayColumn({ day, weekStart, weekplan, recipesById, profile, onOpen, onClear, onToggleEaten, onViewIngredients }) {
  const totals = dayTotals(day, weekplan, recipesById);
  const dayIdx = DAYS.indexOf(day);
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + dayIdx);
  const isToday = isoDate(d) === isoDate(new Date());

  return (
    <div style={{ border: `1px solid ${isToday ? ACCENT : BORDER}`, borderRadius: 2, padding: 14, background: SURFACE, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isToday && <span style={{ fontSize: 9, fontWeight: 700, color: BG, background: ACCENT, padding: "2px 5px", borderRadius: 2, letterSpacing: "0.08em" }}>TODAY</span>}
          <span style={{ fontSize: 11, fontWeight: 800, color: isToday ? ACCENT : TEXT, textTransform: "uppercase", letterSpacing: "0.1em" }}>{day.slice(0, 3)}</span>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
          <div>{totals.kcal} / {profile.daily_calories_kcal} kcal</div>
          <div>{totals.protein}P / {profile.daily_protein_g}P</div>
        </div>
      </div>
      {SLOTS.map(slot => (
        <MealSlot key={slot} day={day} slot={slot} assignment={weekplan.slots?.[`${day}-${slot}`]} recipesById={recipesById} onOpen={onOpen} onClear={onClear} onToggleEaten={onToggleEaten} onViewIngredients={onViewIngredients} />
      ))}
    </div>
  );
}

export default function PlannerView({ weekplan, weekStart, recipesById, productsById, checklist, profile, activeRecipes, onOpenPicker, onClearSlot, onToggleEaten, setView }) {
  const [viewingRecipe, setViewingRecipe] = useState(null);

  if (activeRecipes.length === 0) {
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24, opacity: 0.25, pointerEvents: "none" }}>
          {DAYS.map(day => (
            <div key={day} style={{ border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14, background: SURFACE, minHeight: 180 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.1em" }}>{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>
        <EmptyState icon={CloudOff} title="No recipes loaded yet" subtitle="Check the Sync panel." action={{ label: "Go to Sync panel", onClick: () => setView("sync") }} />
      </>
    );
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {DAYS.map(day => (
          <DayColumn key={day} day={day} weekStart={weekStart} weekplan={weekplan} recipesById={recipesById} profile={profile} onOpen={onOpenPicker} onClear={onClearSlot} onToggleEaten={onToggleEaten} onViewIngredients={setViewingRecipe} />
        ))}
      </div>
      {viewingRecipe && <IngredientModal recipe={viewingRecipe} productsById={productsById} checklist={checklist} onClose={() => setViewingRecipe(null)} />}
    </>
  );
}
