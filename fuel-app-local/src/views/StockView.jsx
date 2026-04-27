import React, { useState } from "react";
import { Package, X } from "lucide-react";
import { SURFACE, SURFACE_2, BORDER, TEXT, MUTED, ACCENT, GREEN, AMBER, FONT } from "../constants.js";
import EmptyState from "../components/EmptyState.jsx";

function StockQtyInput({ item, onAdjust }) {
  const [draft, setDraft] = useState(String(item.inStockQty));
  const [focused, setFocused] = useState(false);
  React.useEffect(() => { if (!focused) setDraft(String(item.inStockQty)); }, [item.inStockQty, focused]);

  const commit = () => {
    const val = parseFloat(draft);
    if (!isNaN(val) && val >= 0) {
      const packSize = item.inStockQty / item.count;
      onAdjust(item.pid, val / packSize);
    } else {
      setDraft(String(item.inStockQty));
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <input
        type="number"
        min="0"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onFocus={e => { setFocused(true); e.currentTarget.style.borderColor = ACCENT; }}
        onBlur={() => { setFocused(false); commit(); }}
        onKeyDown={e => { if (e.key === "Enter") { e.target.blur(); } if (e.key === "Escape") { setDraft(String(item.inStockQty)); e.target.blur(); } }}
        style={{ width: 70, background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 2, color: ACCENT, fontSize: 12, fontWeight: 700, padding: "3px 6px", textAlign: "right", fontFamily: FONT, fontVariantNumeric: "tabular-nums" }}
      />
      <span style={{ fontSize: 11, color: MUTED }}>{item.packUnit}</span>
    </div>
  );
}

export default function StockView({ checklist, productsById, weekTotals, onRemove, onAdjust, onClearAll }) {
  const stockedItems = Object.entries(checklist.checked)
    .filter(([, count]) => count > 0)
    .map(([pid, count]) => {
      const p = productsById[pid];
      const inStockQty = count * (p?.package_size || 0);
      const neededQty  = weekTotals[pid] || 0;
      const unplanned  = Math.max(0, inStockQty - neededQty);
      return { pid, name: p?.name || pid, count, inStockQty, neededQty, unplanned, packUnit: p?.package_unit || "" };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  if (stockedItems.length === 0) {
    return <EmptyState icon={Package} title="Nothing in stock yet" subtitle="Use the Cart tab to mark items as bought." />;
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>In stock this week</div>
        <button
          onClick={onClearAll}
          style={{ background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 2, color: MUTED, fontSize: 11, fontWeight: 700, padding: "4px 10px", cursor: "pointer", letterSpacing: "0.05em", fontFamily: FONT }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.color = AMBER; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = MUTED; }}
        >
          Clear all
        </button>
      </div>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2 }}>
        {stockedItems.map((item, i) => (
          <div key={item.pid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderBottom: i < stockedItems.length - 1 ? `1px solid ${BORDER}` : "none" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{item.name}</span>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>In stock</div>
                <StockQtyInput item={item} onAdjust={onAdjust} />
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>Unplanned</div>
                <div style={{ fontSize: 12, color: item.unplanned > 0 ? GREEN : MUTED, fontVariantNumeric: "tabular-nums" }}>{item.unplanned}{item.packUnit}</div>
              </div>

              <button
                onClick={() => onRemove(item.pid)}
                style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                onMouseEnter={e => e.currentTarget.style.color = AMBER}
                onMouseLeave={e => e.currentTarget.style.color = MUTED}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
