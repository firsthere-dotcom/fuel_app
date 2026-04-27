import React, { useState } from "react";
import { ShoppingBag, Plus, Minus, Check } from "lucide-react";
import { SURFACE, SURFACE_2, BORDER, TEXT, MUTED, ACCENT, GREEN, BG, FONT, SECTION_ORDER } from "../constants.js";
import EmptyState from "../components/EmptyState.jsx";

function CartRow({ product, stockCount, onBought }) {
  const [qty, setQty] = useState(1);

  const handleBought = () => {
    onBought(product.product_id, qty);
    setQty(1);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{product.name}</div>
        <div style={{ fontSize: 11, color: MUTED }}>{product.package_size}{product.package_unit} per pack</div>
      </div>

      {stockCount > 0 && (
        <div style={{ fontSize: 11, color: ACCENT, fontVariantNumeric: "tabular-nums", minWidth: 56, textAlign: "right" }}>
          {stockCount} in stock
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => setQty(q => Math.max(1, q - 1))}
          style={{ width: 26, height: 26, border: `1px solid ${BORDER}`, borderRadius: 2, background: "transparent", color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}
        >
          <Minus size={12} />
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, minWidth: 20, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{qty}</span>
        <button
          onClick={() => setQty(q => q + 1)}
          style={{ width: 26, height: 26, border: `1px solid ${BORDER}`, borderRadius: 2, background: "transparent", color: MUTED, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}
        >
          <Plus size={12} />
        </button>
      </div>

      <button
        onClick={handleBought}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 2, border: "none", background: ACCENT, color: BG, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT, letterSpacing: "0.05em", whiteSpace: "nowrap" }}
      >
        <Check size={12} /> Bought
      </button>
    </div>
  );
}

export default function CartView({ products, checklist, onBought }) {
  if (!products || products.length === 0) {
    return <EmptyState icon={ShoppingBag} title="No products loaded" subtitle="Check the Sync panel." />;
  }

  const bySection = {};
  SECTION_ORDER.forEach(s => { bySection[s] = []; });
  products.forEach(p => {
    const section = p.store_section || "Uncategorized";
    if (!bySection[section]) bySection[section] = [];
    bySection[section].push(p);
  });

  const sections = SECTION_ORDER.filter(s => bySection[s]?.length > 0);

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
        All products — mark as bought to add to stock
      </div>
      {sections.map(section => (
        <div key={section} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 14px", borderBottom: `1px solid ${BORDER}` }}>
            {section}
          </div>
          {bySection[section].map(product => (
            <CartRow
              key={product.product_id}
              product={product}
              stockCount={checklist.checked?.[product.product_id] || 0}
              onBought={onBought}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
