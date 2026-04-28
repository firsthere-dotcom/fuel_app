import React from "react";
import { SURFACE, BORDER, ACCENT, MUTED, BG, FONT, TABS } from "../constants.js";
import DriveStatusBadge from "./DriveStatusBadge.jsx";

export default function Header({ view, setView, weekStart, driveStatus, isSyncing }) {
  const d = new Date(weekStart + "T00:00:00");
  const weekLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "0 20px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", height: 52, gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: ACCENT, letterSpacing: "0.05em" }}>FUEL</span>
          <span style={{ fontSize: 11, color: MUTED, letterSpacing: "0.08em", textTransform: "uppercase" }}>Week of {weekLabel}</span>
          <DriveStatusBadge driveStatus={driveStatus} isSyncing={isSyncing} onClick={() => setView("sync")} />
        </div>
        <nav style={{ display: "flex", gap: 2 }}>
          {TABS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 2, border: "none", background: view === id ? ACCENT : "transparent", color: view === id ? BG : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT, letterSpacing: "0.05em" }}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
