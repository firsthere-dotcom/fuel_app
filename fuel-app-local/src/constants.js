import { Calendar, ShoppingCart, User, Cloud, Package, ShoppingBag } from "lucide-react";

export const BG        = "#0D0D0D";
export const SURFACE   = "#151515";
export const SURFACE_2 = "#1E1E1E";
export const BORDER    = "#2A2A2A";
export const TEXT      = "#E8E8E8";
export const MUTED     = "#8A8A8A";
export const ACCENT    = "#C8FF00";
export const AMBER     = "#FFB84D";
export const GREEN     = "#7FD66B";
export const FONT      = "'DM Sans', system-ui, -apple-system, sans-serif";

export const DAYS  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack"];
export const SECTION_ORDER = ["Produce", "Meat & Fish", "Dairy & Eggs", "Pantry", "Uncategorized"];

export const DEFAULT_PROFILE = {
  daily_calories_kcal: 2000,
  daily_protein_g: 100,
  daily_carbs_g: 240,
  daily_fat_g: 70,
  daily_fiber_g: 30,
};

export const TABS = [
  { id: "planner", icon: Calendar,     label: "Plan" },
  { id: "shop",    icon: ShoppingCart, label: "Shop" },
  { id: "cart",    icon: ShoppingBag,  label: "Cart" },
  { id: "stock",   icon: Package,      label: "Stock" },
  { id: "profile", icon: User,         label: "Profile" },
  { id: "sync",    icon: Cloud,        label: "Sync" },
];

export const PROFILE_FIELDS = [
  { key: "daily_calories_kcal", label: "Calories", unit: "kcal" },
  { key: "daily_protein_g",     label: "Protein",  unit: "g" },
  { key: "daily_carbs_g",       label: "Carbs",    unit: "g" },
  { key: "daily_fat_g",         label: "Fat",      unit: "g" },
  { key: "daily_fiber_g",       label: "Fiber",    unit: "g" },
];
