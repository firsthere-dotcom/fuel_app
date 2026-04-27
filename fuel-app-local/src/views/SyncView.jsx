import React from "react";
import { Cloud, CloudOff } from "lucide-react";
import { SURFACE, BORDER, TEXT, MUTED, ACCENT, GREEN, AMBER } from "../constants.js";
import { timeDelta } from "../utils/date.js";

export default function SyncView({ driveCache }) {
  const report  = driveCache?.last_sync_report;
  const results = report?.results;
  const files   = [
    { key: "recipes",  filename: "recipes.json" },
    { key: "products", filename: "products.json" },
    { key: "rdas",     filename: "micro-rdas.json" },
  ];

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em" }}>Data status</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Last synced: {timeDelta(driveCache?.last_synced)}</div>
        </div>
      </div>
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 2, padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Cloud size={18} color={GREEN} style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Data source</div>
          <div style={{ fontSize: 12, color: MUTED }}>Data is loaded from <span style={{ color: ACCENT, fontFamily: "monospace" }}>src/data/*.json</span> files. Edit them directly to add products or recipes.</div>
        </div>
      </div>
      {files.map(({ key, filename }) => {
        const result = results?.[key];
        const ok = result?.status === "ok";
        return (
          <div key={key} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ok ? 6 : 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: TEXT, fontFamily: "monospace" }}>{filename}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, color: ok ? GREEN : MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {ok ? <Cloud size={11} /> : <CloudOff size={11} />}
                {ok ? "Loaded" : "Not loaded"}
              </span>
            </div>
            {ok && <div style={{ fontSize: 11, color: MUTED }}>{result.items_count} items · synced {timeDelta(result.modified_time)}</div>}
          </div>
        );
      })}
      {driveCache?.orphan_warnings?.length > 0 && (
        <div style={{ border: `1px solid ${AMBER}`, borderRadius: 2, padding: 14, marginTop: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Recipes with missing ingredients</div>
          {driveCache.orphan_warnings.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: TEXT, marginBottom: 6 }}>
              {w.recipe_name} — unknown product: <span style={{ fontFamily: "monospace", color: AMBER }}>{w.missing_product_id}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Edit the JSON files in src/data/ to fix missing products.</div>
        </div>
      )}
    </div>
  );
}
