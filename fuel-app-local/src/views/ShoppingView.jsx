import React from "react";
import { ShoppingCart, Check } from "lucide-react";
import { SURFACE, BORDER, TEXT, MUTED, ACCENT, BG, FONT } from "../constants.js";
import EmptyState from "../components/EmptyState.jsx";

function ShoppingItem({ item, stockCount, onToggle }) {
  const isUncategorized = item.section === "Uncategorized";
  const checked = stockCount > item.rowIndex;
  const remaining = Math.max(0, item.totalQty - stockCount * item.packSize);
  const isFirstUnchecked = !isUncategorized && item.rowIndex === stockCount;
  const subLabel = isUncategorized
    ? "Product not in catalog"
    : isFirstUnchecked
      ? `Need ${remaining}${item.unit} · ${item.packSize}${item.unit} per pack`
      : `${item.packSize}${item.unit} per pack`;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
      <button
        onClick={() => onToggle(item.productId, item.rowIndex)}
        style={{ flexShrink: 0, width: 18, height: 18, border: `1px solid ${checked ? ACCENT : BORDER}`, borderRadius: 2, background: checked ? ACCENT : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
      >
        {checked && <Check size={11} color={BG} />}
      </button>
      <div style={{ flex: 1, opacity: checked ? 0.5 : 1 }}>
        <div style={{ fontSize: 13, color: TEXT, fontWeight: 600, textDecoration: checked ? "line-through" : "none" }}>
          {isUncategorized ? item.name : `1 × ${item.name}`}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>{subLabel}</div>
      </div>
    </div>
  );
}

export default function ShoppingView({ shoppingList, checklist, onToggle }) {
  const sections     = Object.keys(shoppingList);
  const allItems     = sections.flatMap(s => shoppingList[s]);
  const checkedCount = allItems.filter(i => (checklist.checked[i.productId] || 0) > i.rowIndex).length;

  if (allItems.length === 0) {
    return <EmptyState icon={ShoppingCart} title="No shopping list yet" subtitle="Assign meals in the Plan view to generate a list." />;
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>Shopping list</div>
        <div style={{ fontSize: 12, color: MUTED, fontVariantNumeric: "tabular-nums" }}>{checkedCount} / {allItems.length} items</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        {sections.map(section => (
          <div key={section} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.1em", paddingBottom: 10, borderBottom: `1px solid ${BORDER}`, marginBottom: 4 }}>{section}</div>
            {shoppingList[section].map(item => (
              <ShoppingItem key={`${item.productId}-${item.rowIndex}`} item={item} stockCount={checklist.checked[item.productId] || 0} onToggle={onToggle} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
