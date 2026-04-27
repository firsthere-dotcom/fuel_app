import React from "react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { MUTED, GREEN, AMBER, FONT } from "../constants.js";

export default function DriveStatusBadge({ driveStatus, isSyncing, onClick }) {
  let IconComp, label, color;
  if (isSyncing)                    { IconComp = RefreshCw; label = "Syncing…"; color = MUTED; }
  else if (driveStatus === "drive") { IconComp = Cloud;     label = "Drive";    color = GREEN; }
  else if (driveStatus === "cache") { IconComp = RefreshCw; label = "Cache";    color = AMBER; }
  else                              { IconComp = CloudOff;  label = "Offline";  color = MUTED; }

  return (
    <button
      onClick={onClick}
      style={{ background: "transparent", border: `1px solid ${color}`, borderRadius: 2, padding: "3px 8px", display: "flex", alignItems: "center", gap: 5, color, cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT }}
    >
      <IconComp size={11} className={isSyncing ? "fuel-spin" : ""} />
      {label}
    </button>
  );
}
