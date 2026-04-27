import React from "react";
import { SURFACE, SURFACE_2, BORDER, TEXT, MUTED, FONT, PROFILE_FIELDS } from "../constants.js";

export default function ProfileView({ profile, onUpdate }) {
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Daily macro targets</div>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PROFILE_FIELDS.map(({ key, label, unit }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <label htmlFor={key} style={{ fontSize: 13, color: TEXT, fontWeight: 600, flex: 1 }}>{label} ({unit})</label>
              <input
                id={key}
                type="number"
                value={profile[key]}
                onChange={e => onUpdate(key, e.target.value)}
                style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 2, color: TEXT, fontSize: 13, padding: "6px 10px", width: 100, textAlign: "right", fontFamily: FONT, fontVariantNumeric: "tabular-nums" }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: MUTED }}>Targets are saved locally. Daily totals in the Plan view compare against these numbers.</div>
      </div>
    </div>
  );
}
