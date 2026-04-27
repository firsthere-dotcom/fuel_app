import React from "react";
import { BG, MUTED, TEXT, ACCENT, FONT } from "../constants.js";

export default function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: MUTED }}>
      <Icon size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
      <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, marginBottom: action ? 20 : 0 }}>{subtitle}</div>
      {action && (
        <button
          onClick={action.onClick}
          style={{ background: ACCENT, color: BG, border: "none", borderRadius: 2, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
