import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { SURFACE, BORDER, TEXT, MUTED, ACCENT, GREEN, BG, FONT } from "../constants.js";

export default function IngredientModal({ recipe, productsById, checklist, onClose }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const handleKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const lines = recipe.ingredients.map(ing => {
    const name = productsById[ing.product_id]?.name || ing.product_id;
    return `${ing.quantity} ${ing.unit} — ${name}`;
  });

  const handleCopy = () => {
    const text = `${recipe.name}\n\n${lines.join("\n")}`;
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 300, display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, width: "100%", maxWidth: 480, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{recipe.name}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
              <span style={{ color: ACCENT }}>{recipe.macros.protein_g}P</span>{" · "}{recipe.macros.calories_kcal}kcal{" · "}{recipe.prep_time_min}m
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", padding: 4 }}><X size={16} /></button>
        </div>
        <div style={{ overflowY: "auto", padding: "12px 16px", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Ingredients</div>
          {recipe.ingredients.map(ing => {
            const name    = productsById[ing.product_id]?.name || ing.product_id;
            const inStock = (checklist?.checked?.[ing.product_id] || 0) >= 1;
            return (
              <div key={ing.product_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderBottom: `1px solid ${BORDER}`, opacity: inStock ? 0.45 : 1 }}>
                <span style={{ fontSize: 13, color: inStock ? MUTED : TEXT, textDecoration: inStock ? "line-through" : "none" }}>{name}</span>
                <span style={{ fontSize: 11, color: MUTED, fontVariantNumeric: "tabular-nums", marginLeft: 12, flexShrink: 0 }}>{ing.quantity} {ing.unit}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <button
            onClick={handleCopy}
            style={{ width: "100%", background: copied ? GREEN : "transparent", border: `1px solid ${copied ? GREEN : BORDER}`, borderRadius: 2, padding: "8px 0", fontSize: 11, fontWeight: 700, color: copied ? BG : MUTED, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT, transition: "background 0.15s, color 0.15s" }}
          >
            {copied ? "Copied!" : "Copy ingredient list"}
          </button>
        </div>
      </div>
    </div>
  );
}
