import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar, ShoppingCart, User, Cloud, CloudOff, RefreshCw,
  Plus, X, Check, Search
} from "lucide-react";

const BG = "#0D0D0D";
const SURFACE = "#151515";
const SURFACE_2 = "#1E1E1E";
const BORDER = "#2A2A2A";
const TEXT = "#E8E8E8";
const MUTED = "#8A8A8A";
const ACCENT = "#C8FF00";
const AMBER = "#FFB84D";
const CORAL = "#FF6B5B";
const GREEN = "#7FD66B";
const FONT = "'DM Sans', system-ui, -apple-system, sans-serif";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const SECTION_ORDER = ["Produce", "Meat & Fish", "Dairy & Eggs", "Pantry", "Uncategorized"];

const DEFAULT_PROFILE = {
  daily_calories_kcal: 2400, daily_protein_g: 180,
  daily_carbs_g: 250, daily_fat_g: 70, daily_fiber_g: 35,
};
const TABS = [
  { id: "planner", icon: Calendar, label: "Plan" },
  { id: "shop", icon: ShoppingCart, label: "Shop" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "sync", icon: Cloud, label: "Sync" },
];
const PROFILE_FIELDS = [
  { key: "daily_calories_kcal", label: "Calories", unit: "kcal" },
  { key: "daily_protein_g", label: "Protein", unit: "g" },
  { key: "daily_carbs_g", label: "Carbs", unit: "g" },
  { key: "daily_fat_g", label: "Fat", unit: "g" },
  { key: "daily_fiber_g", label: "Fiber", unit: "g" },
];