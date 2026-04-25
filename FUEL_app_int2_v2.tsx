import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar, ShoppingCart, User, Cloud, CloudOff, RefreshCw,
  Plus, X, Check, Search
} from "lucide-react";

const BG        = "#0D0D0D";
const SURFACE   = "#151515";
const SURFACE_2 = "#1E1E1E";
const BORDER    = "#2A2A2A";
const TEXT      = "#E8E8E8";
const MUTED     = "#8A8A8A";
const ACCENT    = "#C8FF00";
const AMBER     = "#FFB84D";
const CORAL     = "#FF6B5B";
const GREEN     = "#7FD66B";
const FONT = "'DM Sans', system-ui, -apple-system, sans-serif";

const DAYS  = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SLOTS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const SECTION_ORDER = ["Produce", "Meat & Fish", "Dairy & Eggs", "Pantry", "Uncategorized"];

const DEFAULT_PROFILE = {
  daily_calories_kcal: 2400, daily_protein_g: 180,
  daily_carbs_g: 250, daily_fat_g: 70, daily_fiber_g: 35,
};
const TABS = [
  { id: "planner", icon: Calendar,     label: "Plan" },
  { id: "shop",    icon: ShoppingCart, label: "Shop" },
  { id: "profile", icon: User,         label: "Profile" },
  { id: "sync",    icon: Cloud,        label: "Sync" },
];
const PROFILE_FIELDS = [
  { key: "daily_calories_kcal", label: "Calories", unit: "kcal" },
  { key: "daily_protein_g",     label: "Protein",  unit: "g" },
  { key: "daily_carbs_g",       label: "Carbs",    unit: "g" },
  { key: "daily_fat_g",         label: "Fat",      unit: "g" },
  { key: "daily_fiber_g",       label: "Fiber",    unit: "g" },
];

// ─── Seed data (injected from Drive via chat) ─────────────────────────────────
const SEED_RECIPES = [{"recipe_id":"egg-feta-wrap","name":"Egg & Feta Wrap","meal_type":["Breakfast"],"prep_time_min":5,"servings":1,"macros":{"calories_kcal":385,"protein_g":26,"carbs_g":25,"fat_g":21,"fiber_g":1.9},"ingredients":[{"product_id":"wrap","quantity":1,"unit":"wrap"},{"product_id":"eggs","quantity":3,"unit":"eggs"},{"product_id":"spinach","quantity":50,"unit":"g"},{"product_id":"feta-cheese","quantity":20,"unit":"g"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"}],"tags":["high-protein","quick","vegetarian"]},{"recipe_id":"high-protein-spread","name":"High Protein Spread","meal_type":["Breakfast"],"prep_time_min":5,"servings":4,"macros":{"calories_kcal":236,"protein_g":25,"carbs_g":8,"fat_g":12,"fiber_g":1.9},"ingredients":[{"product_id":"boiled-eggs","quantity":6,"unit":"eggs"},{"product_id":"avocado","quantity":100,"unit":"g"},{"product_id":"cottage-cheese-0-percent","quantity":600,"unit":"g"},{"product_id":"spring-onions","quantity":1,"unit":"handful"},{"product_id":"salt-and-pepper","quantity":1,"unit":"tbsp"},{"product_id":"lime","quantity":1,"unit":"squeeze"}],"tags":["high-protein","quick","vegetarian","no-cook"]},{"recipe_id":"protein-pancakes","name":"Protein Pancakes","meal_type":["Breakfast"],"prep_time_min":5,"servings":4,"macros":{"calories_kcal":350,"protein_g":30,"carbs_g":30,"fat_g":10,"fiber_g":5.0},"ingredients":[{"product_id":"eggs","quantity":2,"unit":"eggs"},{"product_id":"banana","quantity":1,"unit":"banana"},{"product_id":"oats","quantity":30,"unit":"g"},{"product_id":"whey-protein","quantity":30,"unit":"g"},{"product_id":"honey","quantity":10,"unit":"g"},{"product_id":"berries","quantity":100,"unit":"g"},{"product_id":"baking-powder","quantity":1,"unit":"tsp"},{"product_id":"cinnamon","quantity":1,"unit":"dash"},{"product_id":"vanilla-extract","quantity":1,"unit":"dash"}],"tags":["high-protein","quick","vegetarian"]},{"recipe_id":"feta-egg-tray-bake-with-pitta","name":"Feta & Egg Tray Bake With Pitta","meal_type":["Breakfast"],"prep_time_min":10,"servings":5,"macros":{"calories_kcal":390,"protein_g":31,"carbs_g":45,"fat_g":13,"fiber_g":2.0},"ingredients":[{"product_id":"eggs","quantity":4,"unit":"eggs"},{"product_id":"egg-whites","quantity":350,"unit":"g"},{"product_id":"low-fat-sausages","quantity":350,"unit":"g"},{"product_id":"feta-cheese","quantity":150,"unit":"g"},{"product_id":"cherry-tomatoes","quantity":100,"unit":"g"},{"product_id":"spinach","quantity":100,"unit":"g"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"paprika","quantity":1,"unit":"to taste"},{"product_id":"pitta-bread","quantity":5,"unit":"pittas"}],"tags":["high-protein","batch-friendly","bake","vegetarian-swap"]},{"recipe_id":"high-protein-frittata","name":"High Protein Frittata","meal_type":["Breakfast"],"prep_time_min":10,"servings":8,"macros":{"calories_kcal":113,"protein_g":10,"carbs_g":2,"fat_g":7,"fiber_g":2.5},"ingredients":[{"product_id":"eggs","quantity":6,"unit":"eggs"},{"product_id":"feta-cheese","quantity":75,"unit":"g"},{"product_id":"parmesan-cheese","quantity":50,"unit":"g"},{"product_id":"cottage-cheese-0-percent","quantity":150,"unit":"g"},{"product_id":"tomatoes","quantity":200,"unit":"g"},{"product_id":"courgette","quantity":200,"unit":"g"},{"product_id":"spinach","quantity":1,"unit":"handful"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"}],"tags":["high-protein","batch-friendly","bake","vegetarian"]},{"recipe_id":"chia-seed-pudding","name":"Chia Seed Pudding","meal_type":["Snack"],"prep_time_min":5,"servings":1,"macros":{"calories_kcal":370,"protein_g":30,"carbs_g":39,"fat_g":12,"fiber_g":10.0},"ingredients":[{"product_id":"chia-seeds","quantity":30,"unit":"g"},{"product_id":"honey","quantity":20,"unit":"g"},{"product_id":"whey-protein","quantity":30,"unit":"g"},{"product_id":"almond-milk","quantity":200,"unit":"ml"},{"product_id":"berries","quantity":100,"unit":"g"}],"tags":["high-protein","quick","no-cook","vegetarian"]},{"recipe_id":"high-protein-overnight-oats","name":"High Protein Overnight Oats","meal_type":["Snack"],"prep_time_min":5,"servings":1,"macros":{"calories_kcal":372,"protein_g":27,"carbs_g":30,"fat_g":13,"fiber_g":9.1},"ingredients":[{"product_id":"oats","quantity":30,"unit":"g"},{"product_id":"chia-seeds","quantity":15,"unit":"g"},{"product_id":"whey-protein","quantity":30,"unit":"g"},{"product_id":"almond-milk","quantity":300,"unit":"ml"},{"product_id":"berries","quantity":100,"unit":"g"}],"tags":["high-protein","quick","no-cook","vegetarian"]},{"recipe_id":"smoothie-bowl","name":"Smoothie Bowl","meal_type":["Snack"],"prep_time_min":5,"servings":1,"macros":{"calories_kcal":358,"protein_g":38,"carbs_g":35,"fat_g":7,"fiber_g":5.8},"ingredients":[{"product_id":"whey-protein","quantity":30,"unit":"g"},{"product_id":"banana","quantity":1,"unit":"banana"},{"product_id":"strawberries","quantity":100,"unit":"g"},{"product_id":"greek-yogurt-0-percent","quantity":100,"unit":"g"},{"product_id":"almond-milk","quantity":100,"unit":"ml"},{"product_id":"nuts-or-chia-seeds","quantity":10,"unit":"g"}],"tags":["high-protein","quick","vegetarian"]},{"recipe_id":"boursin-chicken-orzo-bake","name":"Boursin Chicken Orzo Bake","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":4,"macros":{"calories_kcal":528,"protein_g":40,"carbs_g":42,"fat_g":21,"fiber_g":2.9},"ingredients":[{"product_id":"orzo","quantity":200,"unit":"g"},{"product_id":"chicken-breast","quantity":420,"unit":"g"},{"product_id":"boursin-cheese","quantity":150,"unit":"g"},{"product_id":"parmesan-cheese","quantity":50,"unit":"g"},{"product_id":"cherry-tomatoes","quantity":500,"unit":"g"},{"product_id":"spinach","quantity":200,"unit":"g"},{"product_id":"stock","quantity":400,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake","vegetarian-swap"]},{"recipe_id":"orzo-bake-with-parmesan-chicken","name":"Orzo Bake with Parmesan & Chicken","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":5,"macros":{"calories_kcal":502,"protein_g":45,"carbs_g":57,"fat_g":14,"fiber_g":6.0},"ingredients":[{"product_id":"orzo","quantity":200,"unit":"g"},{"product_id":"chicken","quantity":400,"unit":"g"},{"product_id":"chickpeas","quantity":240,"unit":"g"},{"product_id":"asparagus","quantity":150,"unit":"g"},{"product_id":"red-onion","quantity":150,"unit":"g"},{"product_id":"mushrooms","quantity":150,"unit":"g"},{"product_id":"spinach","quantity":100,"unit":"g"},{"product_id":"sundried-tomatoes","quantity":80,"unit":"g"},{"product_id":"parmesan-cheese","quantity":150,"unit":"g"},{"product_id":"garlic-cloves","quantity":2,"unit":"cloves"},{"product_id":"paprika","quantity":1,"unit":"tbsp"},{"product_id":"chicken-stock","quantity":400,"unit":"ml"}],"tags":["high-protein","meal-prep","bake","vegetarian-swap"]},{"recipe_id":"salmon-butterbeans-rice","name":"Salmon Butterbeans & Rice","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":4,"macros":{"calories_kcal":511,"protein_g":39,"carbs_g":42,"fat_g":16,"fiber_g":5.0},"ingredients":[{"product_id":"rice","quantity":150,"unit":"g"},{"product_id":"salmon-fillet","quantity":500,"unit":"g"},{"product_id":"butter-beans","quantity":240,"unit":"g"},{"product_id":"tenderstem-broccoli","quantity":200,"unit":"g"},{"product_id":"spinach","quantity":200,"unit":"g"},{"product_id":"garlic-paste","quantity":1,"unit":"tbsp"},{"product_id":"miso-paste","quantity":1,"unit":"tbsp"},{"product_id":"light-coconut-milk","quantity":200,"unit":"ml"},{"product_id":"vegetable-stock","quantity":200,"unit":"ml"},{"product_id":"lemon","quantity":1,"unit":"lemon"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake","omega-3"]},{"recipe_id":"harissa-chicken-quinoa-bake","name":"Harissa Chicken Quinoa Bake","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":5,"macros":{"calories_kcal":535,"protein_g":42,"carbs_g":48,"fat_g":16,"fiber_g":7.7},"ingredients":[{"product_id":"quinoa","quantity":250,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"halloumi","quantity":150,"unit":"g"},{"product_id":"chickpeas","quantity":240,"unit":"g"},{"product_id":"sundried-tomatoes","quantity":150,"unit":"g"},{"product_id":"red-pepper","quantity":1,"unit":"pepper"},{"product_id":"courgette","quantity":1,"unit":"courgette"},{"product_id":"spinach","quantity":100,"unit":"g"},{"product_id":"vegetable-stock","quantity":450,"unit":"ml"},{"product_id":"harissa-paste","quantity":90,"unit":"g"},{"product_id":"salt","quantity":1,"unit":"tsp"},{"product_id":"pepper","quantity":1,"unit":"tsp"},{"product_id":"paprika","quantity":1,"unit":"tsp"},{"product_id":"cumin","quantity":1,"unit":"tsp"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"creamy-chicken-chorizo-pasta-bake","name":"Creamy Chicken & Chorizo Pasta Bake","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":5,"macros":{"calories_kcal":516,"protein_g":40,"carbs_g":40,"fat_g":19,"fiber_g":3.2},"ingredients":[{"product_id":"pasta","quantity":250,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"chorizo","quantity":50,"unit":"g"},{"product_id":"cream-cheese","quantity":165,"unit":"g"},{"product_id":"onion","quantity":1,"unit":"onion"},{"product_id":"spinach","quantity":1,"unit":"handful"},{"product_id":"sundried-tomatoes","quantity":100,"unit":"g"},{"product_id":"cherry-tomatoes","quantity":200,"unit":"g"},{"product_id":"parmesan-cheese","quantity":70,"unit":"g"},{"product_id":"chicken-stock","quantity":500,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"garlic-powder","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"thai-green-chicken-curry","name":"Thai Green Chicken Curry","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":4,"macros":{"calories_kcal":523,"protein_g":42,"carbs_g":55,"fat_g":14,"fiber_g":2.4},"ingredients":[{"product_id":"rice","quantity":200,"unit":"g"},{"product_id":"chicken-breast","quantity":600,"unit":"g"},{"product_id":"broccoli","quantity":200,"unit":"g"},{"product_id":"mixed-peppers","quantity":2,"unit":"peppers"},{"product_id":"light-coconut-milk","quantity":400,"unit":"ml"},{"product_id":"thai-green-paste","quantity":170,"unit":"g"},{"product_id":"water","quantity":150,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"mediterranean-chicken-halloumi","name":"Mediterranean Chicken with Halloumi","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":5,"macros":{"calories_kcal":480,"protein_g":38,"carbs_g":44,"fat_g":16,"fiber_g":5.7},"ingredients":[{"product_id":"rice","quantity":250,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"halloumi","quantity":150,"unit":"g"},{"product_id":"cherry-tomatoes","quantity":300,"unit":"g"},{"product_id":"sundried-tomatoes","quantity":80,"unit":"g"},{"product_id":"jarred-artichokes","quantity":80,"unit":"g"},{"product_id":"green-olives","quantity":80,"unit":"g"},{"product_id":"spinach","quantity":1,"unit":"handful"},{"product_id":"chickpeas","quantity":120,"unit":"g"},{"product_id":"light-coconut-milk","quantity":200,"unit":"ml"},{"product_id":"lemon","quantity":1,"unit":"lemon"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"paprika","quantity":1,"unit":"to taste"},{"product_id":"water","quantity":350,"unit":"ml"}],"tags":["high-protein","meal-prep","bake","vegetarian-swap"]},{"recipe_id":"lemon-chicken-potato-chickpeas","name":"Lemon Chicken Potato & Chickpeas","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":518,"protein_g":37,"carbs_g":50,"fat_g":22,"fiber_g":7.0},"ingredients":[{"product_id":"baby-potatoes","quantity":750,"unit":"g"},{"product_id":"chicken-thighs","quantity":600,"unit":"g"},{"product_id":"chickpeas","quantity":240,"unit":"g"},{"product_id":"peppers","quantity":2,"unit":"peppers"},{"product_id":"olive-oil","quantity":25,"unit":"ml"},{"product_id":"garlic-cloves","quantity":4,"unit":"cloves"},{"product_id":"lemons","quantity":2,"unit":"lemons"},{"product_id":"paprika","quantity":1,"unit":"tbsp"},{"product_id":"rosemary","quantity":1,"unit":"tbsp"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"chicken-fajita-feta-rice","name":"Chicken Fajita Feta Rice","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":471,"protein_g":46,"carbs_g":57,"fat_g":9,"fiber_g":7.3},"ingredients":[{"product_id":"rice","quantity":200,"unit":"g"},{"product_id":"chicken","quantity":400,"unit":"g"},{"product_id":"feta-cheese","quantity":100,"unit":"g"},{"product_id":"peppers","quantity":2,"unit":"peppers"},{"product_id":"onions","quantity":2,"unit":"onions"},{"product_id":"tomatoes","quantity":6,"unit":"tomatoes"},{"product_id":"garlic","quantity":1,"unit":"tbsp"},{"product_id":"mixed-beans","quantity":1,"unit":"tin"},{"product_id":"fajita-seasoning","quantity":1,"unit":"to taste"},{"product_id":"water","quantity":500,"unit":"ml"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"creamy-cheddar-sour-cream-chicken","name":"Creamy Cheddar Sour Cream Chicken","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":523,"protein_g":41,"carbs_g":39,"fat_g":15,"fiber_g":3.5},"ingredients":[{"product_id":"rice","quantity":200,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"cheddar-cheese","quantity":100,"unit":"g"},{"product_id":"mixed-peppers","quantity":2,"unit":"peppers"},{"product_id":"tomatoes","quantity":250,"unit":"g"},{"product_id":"red-onion","quantity":1,"unit":"onion"},{"product_id":"lime","quantity":1,"unit":"lime"},{"product_id":"sour-cream","quantity":170,"unit":"g"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"cumin","quantity":1,"unit":"to taste"},{"product_id":"paprika","quantity":1,"unit":"to taste"},{"product_id":"water","quantity":350,"unit":"ml"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"cheesy-pasta-meatballs","name":"Cheesy Pasta Meatballs","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":5,"macros":{"calories_kcal":523,"protein_g":39,"carbs_g":46,"fat_g":20,"fiber_g":3.6},"ingredients":[{"product_id":"pasta","quantity":250,"unit":"g"},{"product_id":"beef-mince-5-percent","quantity":500,"unit":"g"},{"product_id":"parmesan-cheese","quantity":100,"unit":"g"},{"product_id":"cream-cheese","quantity":160,"unit":"g"},{"product_id":"peppers","quantity":2,"unit":"peppers"},{"product_id":"cherry-tomatoes","quantity":100,"unit":"g"},{"product_id":"tomato-sauce","quantity":1,"unit":"jar"},{"product_id":"oregano","quantity":2,"unit":"tbsp"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"water","quantity":350,"unit":"ml"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"cheesy-tuna-pasta-bake","name":"Cheesy Tuna Pasta Bake","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":5,"macros":{"calories_kcal":518,"protein_g":39,"carbs_g":38,"fat_g":20,"fiber_g":4.8},"ingredients":[{"product_id":"pasta","quantity":200,"unit":"g"},{"product_id":"canned-tuna","quantity":4,"unit":"tins"},{"product_id":"sweetcorn","quantity":150,"unit":"g"},{"product_id":"onion","quantity":150,"unit":"g"},{"product_id":"mozzarella","quantity":125,"unit":"g"},{"product_id":"boursin-or-cream-cheese","quantity":150,"unit":"g"},{"product_id":"low-fat-cheddar","quantity":100,"unit":"g"},{"product_id":"chopped-tomatoes","quantity":2,"unit":"tins"},{"product_id":"basil","quantity":1,"unit":"handful"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"oregano","quantity":1,"unit":"to taste"},{"product_id":"water","quantity":200,"unit":"ml"}],"tags":["high-protein","meal-prep","bake","pantry-friendly"]},{"recipe_id":"potato-meatball-vegetables","name":"Potato & Meatball Vegetables","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":523,"protein_g":41,"carbs_g":39,"fat_g":15,"fiber_g":6.6},"ingredients":[{"product_id":"potatoes","quantity":800,"unit":"g"},{"product_id":"beef-mince-5-percent","quantity":650,"unit":"g"},{"product_id":"carrot","quantity":250,"unit":"g"},{"product_id":"peas","quantity":250,"unit":"g"},{"product_id":"egg","quantity":1,"unit":"egg"},{"product_id":"olive-oil","quantity":20,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"oregano","quantity":1,"unit":"to taste"},{"product_id":"paprika","quantity":1,"unit":"to taste"},{"product_id":"rosemary","quantity":1,"unit":"to taste"},{"product_id":"beef-stock","quantity":200,"unit":"ml"},{"product_id":"tomato-puree","quantity":1,"unit":"tbsp"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"one-pan-mexican-chicken-burritos","name":"One Pan Mexican Chicken Burritos","meal_type":["Lunch","Dinner"],"prep_time_min":20,"servings":6,"macros":{"calories_kcal":518,"protein_g":40,"carbs_g":62,"fat_g":13,"fiber_g":8.0},"ingredients":[{"product_id":"wraps","quantity":6,"unit":"wraps"},{"product_id":"rice","quantity":100,"unit":"g"},{"product_id":"chicken","quantity":600,"unit":"g"},{"product_id":"cheddar-cheese","quantity":100,"unit":"g"},{"product_id":"peppers","quantity":2,"unit":"peppers"},{"product_id":"onion","quantity":100,"unit":"g"},{"product_id":"tomato-sauce","quantity":1,"unit":"jar"},{"product_id":"fajita-mix","quantity":1,"unit":"pack"},{"product_id":"kidney-beans","quantity":240,"unit":"g"},{"product_id":"water","quantity":350,"unit":"ml"},{"product_id":"salsa","quantity":1,"unit":"optional"},{"product_id":"jalapenos","quantity":1,"unit":"optional"}],"tags":["high-protein","meal-prep","bake","vegetarian-swap"]},{"recipe_id":"tomato-pasta-meatballs","name":"Tomato Pasta Meatballs","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":518,"protein_g":37,"carbs_g":50,"fat_g":22,"fiber_g":6.4},"ingredients":[{"product_id":"pasta","quantity":250,"unit":"g"},{"product_id":"beef-mince-5-percent","quantity":400,"unit":"g"},{"product_id":"parmesan-cheese","quantity":100,"unit":"g"},{"product_id":"mozzarella","quantity":125,"unit":"g"},{"product_id":"onion","quantity":100,"unit":"g"},{"product_id":"pepper","quantity":100,"unit":"g"},{"product_id":"mushrooms","quantity":150,"unit":"g"},{"product_id":"spinach","quantity":1,"unit":"handful"},{"product_id":"chopped-tomatoes","quantity":2,"unit":"tins"},{"product_id":"beef-stock","quantity":400,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper-seasoning","quantity":1,"unit":"to taste"},{"product_id":"oregano","quantity":1,"unit":"to taste"},{"product_id":"garlic-granules","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"three-cheese-spaghetti-bake","name":"3 Cheese Spaghetti Bake","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":5,"macros":{"calories_kcal":530,"protein_g":33,"carbs_g":37,"fat_g":28,"fiber_g":4.0},"ingredients":[{"product_id":"spaghetti","quantity":200,"unit":"g"},{"product_id":"tomato-sauce","quantity":400,"unit":"g"},{"product_id":"mozzarella","quantity":375,"unit":"g"},{"product_id":"parmesan-cheese","quantity":200,"unit":"g"},{"product_id":"tomatoes","quantity":300,"unit":"g"},{"product_id":"mushrooms","quantity":300,"unit":"g"},{"product_id":"basil","quantity":1,"unit":"optional"},{"product_id":"water","quantity":300,"unit":"ml"}],"tags":["high-protein","meal-prep","bake","vegetarian"]},{"recipe_id":"chicken-chorizo-paella-bake","name":"Chicken Chorizo Paella Bake","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":490,"protein_g":37,"carbs_g":52,"fat_g":15,"fiber_g":4.2},"ingredients":[{"product_id":"rice","quantity":200,"unit":"g"},{"product_id":"chicken","quantity":400,"unit":"g"},{"product_id":"chorizo","quantity":100,"unit":"g"},{"product_id":"peppers","quantity":2,"unit":"peppers"},{"product_id":"onions","quantity":2,"unit":"onions"},{"product_id":"plum-tomatoes","quantity":300,"unit":"g"},{"product_id":"peas","quantity":100,"unit":"g"},{"product_id":"runner-beans","quantity":100,"unit":"g"},{"product_id":"paprika","quantity":1,"unit":"to taste"},{"product_id":"garlic-granules","quantity":1,"unit":"to taste"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"chicken-stock-with-saffron","quantity":500,"unit":"ml"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"chicken-chorizo-orzo-pasta","name":"Chicken Chorizo Orzo Pasta","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":5,"macros":{"calories_kcal":512,"protein_g":38,"carbs_g":42,"fat_g":22,"fiber_g":2.7},"ingredients":[{"product_id":"orzo","quantity":250,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"chorizo","quantity":100,"unit":"g"},{"product_id":"cream-cheese","quantity":150,"unit":"g"},{"product_id":"mixed-peppers","quantity":2,"unit":"peppers"},{"product_id":"cherry-tomatoes","quantity":200,"unit":"g"},{"product_id":"spinach","quantity":100,"unit":"g"},{"product_id":"paprika","quantity":2,"unit":"tsp"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"chicken-stock","quantity":500,"unit":"ml"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"creamy-veggie-chicken-pasta","name":"Creamy Veggie Chicken Pasta","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":5,"macros":{"calories_kcal":530,"protein_g":40,"carbs_g":39,"fat_g":23,"fiber_g":3.7},"ingredients":[{"product_id":"pasta","quantity":250,"unit":"g"},{"product_id":"chicken","quantity":400,"unit":"g"},{"product_id":"carrot","quantity":200,"unit":"g"},{"product_id":"courgette","quantity":200,"unit":"g"},{"product_id":"single-cream","quantity":200,"unit":"ml"},{"product_id":"parmesan-cheese","quantity":80,"unit":"g"},{"product_id":"cheddar-cheese","quantity":100,"unit":"g"},{"product_id":"chorizo","quantity":40,"unit":"g"}],"tags":["high-protein","meal-prep","bake","vegetarian-swap"]},{"recipe_id":"mozzarella-gnocchi-meatballs","name":"Mozzarella Gnocchi Meatballs","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":5,"macros":{"calories_kcal":505,"protein_g":41,"carbs_g":35,"fat_g":21,"fiber_g":2.9},"ingredients":[{"product_id":"gnocchi","quantity":500,"unit":"g"},{"product_id":"beef-meatballs-5-percent","quantity":500,"unit":"g"},{"product_id":"light-mozzarella","quantity":260,"unit":"g"},{"product_id":"parmesan-cheese","quantity":80,"unit":"g"},{"product_id":"tomatoes","quantity":200,"unit":"g"},{"product_id":"courgette","quantity":200,"unit":"g"},{"product_id":"spinach","quantity":1,"unit":"handful"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"truffle-pesto","quantity":50,"unit":"g"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"baked-feta-tomato-chicken-pasta","name":"Baked Feta Tomato Chicken Pasta","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":5,"macros":{"calories_kcal":510,"protein_g":37,"carbs_g":31,"fat_g":26,"fiber_g":3.7},"ingredients":[{"product_id":"pasta","quantity":200,"unit":"g"},{"product_id":"chicken-thighs-skinless","quantity":600,"unit":"g"},{"product_id":"feta-cheese","quantity":150,"unit":"g"},{"product_id":"cherry-tomatoes","quantity":600,"unit":"g"},{"product_id":"garlic-cloves","quantity":6,"unit":"cloves"},{"product_id":"spinach","quantity":1,"unit":"handful"},{"product_id":"parmesan-cheese","quantity":50,"unit":"g"},{"product_id":"basil-leaves","quantity":5,"unit":"leaves"},{"product_id":"olive-oil","quantity":20,"unit":"g"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"paprika","quantity":1,"unit":"to taste"},{"product_id":"onion-powder","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake","vegetarian-swap"]},{"recipe_id":"one-box-chicken-cous-cous","name":"One Box Chicken Cous Cous","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":468,"protein_g":36,"carbs_g":41,"fat_g":17,"fiber_g":3.5},"ingredients":[{"product_id":"cous-cous","quantity":200,"unit":"g"},{"product_id":"chicken","quantity":350,"unit":"g"},{"product_id":"feta-cheese","quantity":250,"unit":"g"},{"product_id":"spinach","quantity":100,"unit":"g"},{"product_id":"tomato","quantity":200,"unit":"g"},{"product_id":"cucumber","quantity":100,"unit":"g"},{"product_id":"lemon","quantity":1,"unit":"large lemon"},{"product_id":"boiling-water","quantity":250,"unit":"ml"}],"tags":["high-protein","quick","no-cook","meal-prep","vegetarian-swap"]},{"recipe_id":"green-orzo-cream-chicken","name":"Green Orzo Cream Chicken","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":510,"protein_g":42,"carbs_g":34,"fat_g":20,"fiber_g":4.0},"ingredients":[{"product_id":"orzo","quantity":250,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"cream-cheese-or-boursin","quantity":150,"unit":"g"},{"product_id":"broccoli","quantity":200,"unit":"g"},{"product_id":"aubergine","quantity":200,"unit":"g"},{"product_id":"spinach","quantity":1,"unit":"handful"},{"product_id":"parmesan-cheese","quantity":100,"unit":"g"},{"product_id":"chicken-stock","quantity":500,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"garlic-powder","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"red-pesto-chicken-rice","name":"Red Pesto Chicken & Rice","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":4,"macros":{"calories_kcal":480,"protein_g":38,"carbs_g":38,"fat_g":14,"fiber_g":3.5},"ingredients":[{"product_id":"rice","quantity":200,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"cherry-tomatoes","quantity":300,"unit":"g"},{"product_id":"peppers","quantity":2,"unit":"peppers"},{"product_id":"courgette","quantity":200,"unit":"g"},{"product_id":"red-pesto","quantity":150,"unit":"g"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"water","quantity":350,"unit":"ml"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"one-box-chicken-quinoa","name":"One Box Chicken Quinoa","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":4,"macros":{"calories_kcal":495,"protein_g":40,"carbs_g":45,"fat_g":17,"fiber_g":7.0},"ingredients":[{"product_id":"quinoa","quantity":200,"unit":"g"},{"product_id":"sweet-potato","quantity":100,"unit":"g"},{"product_id":"chicken-breast","quantity":400,"unit":"g"},{"product_id":"halloumi","quantity":100,"unit":"g"},{"product_id":"mixed-beans","quantity":125,"unit":"g"},{"product_id":"olives","quantity":165,"unit":"g"},{"product_id":"mushrooms","quantity":200,"unit":"g"},{"product_id":"tomatoes","quantity":200,"unit":"g"},{"product_id":"lemon","quantity":1,"unit":"large lemon"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"water","quantity":400,"unit":"ml"}],"tags":["high-protein","meal-prep","vegetarian-swap"]},{"recipe_id":"salmon-lentils-rice","name":"Salmon, Lentils & Rice","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":4,"macros":{"calories_kcal":520,"protein_g":41,"carbs_g":42,"fat_g":19,"fiber_g":6.0},"ingredients":[{"product_id":"rice","quantity":150,"unit":"g"},{"product_id":"salmon-fillet","quantity":500,"unit":"g"},{"product_id":"beans-tinned","quantity":240,"unit":"g"},{"product_id":"lentils-tinned","quantity":240,"unit":"g"},{"product_id":"spinach","quantity":100,"unit":"g"},{"product_id":"light-coconut-milk","quantity":200,"unit":"ml"},{"product_id":"vegetable-stock","quantity":200,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"paprika","quantity":1,"unit":"to taste"},{"product_id":"garlic-powder","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake","omega-3"]},{"recipe_id":"white-sauce-chicken-chorizo-pasta","name":"White Sauce Chicken Chorizo Pasta","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":5,"macros":{"calories_kcal":513,"protein_g":44,"carbs_g":38,"fat_g":20,"fiber_g":3.0},"ingredients":[{"product_id":"pasta","quantity":200,"unit":"g"},{"product_id":"rotisserie-chicken","quantity":280,"unit":"g"},{"product_id":"chorizo","quantity":80,"unit":"g"},{"product_id":"parmesan-cheese","quantity":100,"unit":"g"},{"product_id":"white-sauce","quantity":450,"unit":"g"},{"product_id":"broccoli","quantity":150,"unit":"g"},{"product_id":"onion","quantity":100,"unit":"g"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"italian-seasoning","quantity":1,"unit":"to taste"},{"product_id":"chicken-stock","quantity":500,"unit":"ml"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"tomato-gnocchi-bake-with-sausage","name":"Tomato Gnocchi Bake with Sausage","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":5,"macros":{"calories_kcal":512,"protein_g":40,"carbs_g":39,"fat_g":19,"fiber_g":3.7},"ingredients":[{"product_id":"gnocchi","quantity":700,"unit":"g"},{"product_id":"low-fat-sausages","quantity":500,"unit":"g"},{"product_id":"chorizo","quantity":100,"unit":"g"},{"product_id":"light-mozzarella","quantity":250,"unit":"g"},{"product_id":"cherry-tomatoes","quantity":200,"unit":"g"},{"product_id":"aubergine","quantity":200,"unit":"g"},{"product_id":"spinach","quantity":100,"unit":"g"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"vegetable-stock","quantity":200,"unit":"ml"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"creamy-mushroom-chicken-bake","name":"Creamy Mushroom Chicken Bake","meal_type":["Lunch","Dinner"],"prep_time_min":10,"servings":4,"macros":{"calories_kcal":540,"protein_g":47,"carbs_g":38,"fat_g":21,"fiber_g":2.7},"ingredients":[{"product_id":"orzo","quantity":200,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"boursin-cheese","quantity":150,"unit":"g"},{"product_id":"parmesan-cheese","quantity":100,"unit":"g"},{"product_id":"mushrooms","quantity":300,"unit":"g"},{"product_id":"courgette","quantity":1,"unit":"courgette"},{"product_id":"capers","quantity":50,"unit":"g"},{"product_id":"stock-or-bone-broth","quantity":400,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake","vegetarian-swap"]},{"recipe_id":"caramelised-chicken-pasta","name":"Caramelised Chicken Pasta","meal_type":["Lunch","Dinner"],"prep_time_min":15,"servings":4,"macros":{"calories_kcal":490,"protein_g":40,"carbs_g":42,"fat_g":17,"fiber_g":4.4},"ingredients":[{"product_id":"pasta","quantity":200,"unit":"g"},{"product_id":"chicken-breast","quantity":500,"unit":"g"},{"product_id":"cream-cheese","quantity":150,"unit":"g"},{"product_id":"sundried-tomatoes","quantity":80,"unit":"g"},{"product_id":"onions","quantity":250,"unit":"g"},{"product_id":"garlic-bulb","quantity":1,"unit":"bulb"},{"product_id":"olive-oil","quantity":1,"unit":"tbsp"},{"product_id":"balsamic-vinegar","quantity":100,"unit":"ml"},{"product_id":"salt","quantity":1,"unit":"to taste"},{"product_id":"pepper","quantity":1,"unit":"to taste"},{"product_id":"paprika","quantity":1,"unit":"to taste"},{"product_id":"italian-seasoning","quantity":1,"unit":"to taste"}],"tags":["high-protein","meal-prep","bake"]},{"recipe_id":"chocolate-banana-bread","name":"Chocolate Banana Bread","meal_type":["Snack"],"prep_time_min":5,"servings":10,"macros":{"calories_kcal":125,"protein_g":10,"carbs_g":16,"fat_g":3,"fiber_g":1.9},"ingredients":[{"product_id":"oats","quantity":75,"unit":"g"},{"product_id":"eggs","quantity":2,"unit":"eggs"},{"product_id":"bananas","quantity":3,"unit":"bananas"},{"product_id":"honey","quantity":40,"unit":"g"},{"product_id":"whey-protein","quantity":90,"unit":"g"},{"product_id":"dark-chocolate","quantity":20,"unit":"g"},{"product_id":"cocoa-powder","quantity":1,"unit":"tsp"},{"product_id":"baking-soda","quantity":1,"unit":"tsp"}],"tags":["high-protein","batch-friendly","vegetarian"]},{"recipe_id":"ice-cream-protein-bites","name":"Ice Cream Protein Bites","meal_type":["Snack"],"prep_time_min":5,"servings":5,"macros":{"calories_kcal":144,"protein_g":19,"carbs_g":10,"fat_g":3,"fiber_g":1.5},"ingredients":[{"product_id":"greek-yogurt-0-percent","quantity":450,"unit":"g"},{"product_id":"whey-protein","quantity":60,"unit":"g"},{"product_id":"berries","quantity":100,"unit":"g"},{"product_id":"honey","quantity":1,"unit":"tbsp"},{"product_id":"dark-chocolate","quantity":20,"unit":"g"}],"tags":["high-protein","vegetarian","frozen","no-cook"]},{"recipe_id":"microwave-protein-pot","name":"Microwave Protein Pot","meal_type":["Snack"],"prep_time_min":5,"servings":1,"macros":{"calories_kcal":137,"protein_g":21,"carbs_g":14,"fat_g":2,"fiber_g":2.4},"ingredients":[{"product_id":"whey-protein","quantity":15,"unit":"g"},{"product_id":"greek-yogurt-0-percent","quantity":50,"unit":"g"},{"product_id":"egg","quantity":1,"unit":"egg"},{"product_id":"berries","quantity":100,"unit":"g"}],"tags":["high-protein","quick","vegetarian"]},{"recipe_id":"five-minute-mince-tortilla-wrap","name":"5 Minute Mince Tortilla Wrap","meal_type":["Snack"],"prep_time_min":5,"servings":1,"macros":{"calories_kcal":290,"protein_g":28,"carbs_g":23,"fat_g":10,"fiber_g":2.9},"ingredients":[{"product_id":"tortilla","quantity":1,"unit":"tortilla"},{"product_id":"beef-mince-5-percent","quantity":100,"unit":"g"},{"product_id":"parmesan-cheese","quantity":1,"unit":"tbsp"},{"product_id":"lettuce","quantity":1,"unit":"handful"},{"product_id":"tomato","quantity":1,"unit":"handful"},{"product_id":"garlic-sauce","quantity":1,"unit":"optional"}],"tags":["high-protein","quick"]},{"recipe_id":"banana-date-protein-bake","name":"Banana Date Protein Bake","meal_type":["Snack"],"prep_time_min":10,"servings":8,"macros":{"calories_kcal":156,"protein_g":9,"carbs_g":26,"fat_g":3,"fiber_g":4.0},"ingredients":[{"product_id":"oats","quantity":75,"unit":"g"},{"product_id":"almond-milk","quantity":150,"unit":"ml"},{"product_id":"bananas","quantity":3,"unit":"bananas"},{"product_id":"dates","quantity":100,"unit":"g"},{"product_id":"honey","quantity":20,"unit":"g"},{"product_id":"whey-protein","quantity":90,"unit":"g"},{"product_id":"dark-chocolate","quantity":20,"unit":"g"},{"product_id":"baking-soda","quantity":1,"unit":"tsp"}],"tags":["high-protein","batch-friendly","vegetarian"]},{"recipe_id":"peanut-butter-banana-bread","name":"Peanut Butter Banana Bread","meal_type":["Snack"],"prep_time_min":10,"servings":6,"macros":{"calories_kcal":201,"protein_g":14,"carbs_g":17,"fat_g":8,"fiber_g":2.3},"ingredients":[{"product_id":"oats","quantity":60,"unit":"g"},{"product_id":"semi-skimmed-milk","quantity":150,"unit":"ml"},{"product_id":"bananas","quantity":2,"unit":"bananas"},{"product_id":"peanut-butter","quantity":60,"unit":"g"},{"product_id":"whey-protein","quantity":70,"unit":"g"},{"product_id":"dark-chocolate","quantity":20,"unit":"g"},{"product_id":"baking-powder","quantity":1,"unit":"tsp"},{"product_id":"cinnamon","quantity":1,"unit":"dash"},{"product_id":"cacao","quantity":1,"unit":"dash"}],"tags":["high-protein","batch-friendly","vegetarian"]},{"recipe_id":"cottage-cheese-ice-cream","name":"Cottage Cheese Ice Cream","meal_type":["Snack"],"prep_time_min":5,"servings":6,"macros":{"calories_kcal":165,"protein_g":21,"carbs_g":8,"fat_g":2,"fiber_g":0.8},"ingredients":[{"product_id":"cottage-cheese-0-percent","quantity":900,"unit":"g"},{"product_id":"vanilla-whey-protein","quantity":60,"unit":"g"},{"product_id":"honey","quantity":30,"unit":"g"},{"product_id":"dark-chocolate","quantity":30,"unit":"g"}],"tags":["high-protein","vegetarian","frozen","no-cook"]}];

const SEED_PRODUCTS = [{"product_id":"eggs-6","name":"Eggs (6 pack)","category":"Dairy & Eggs","package_size":6,"package_unit":"eggs","portion_size":2,"portion_unit":"eggs","shelf_life_days":21,"shelf_life_note":"refrigerated","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Dairy & Eggs"},{"product_id":"eggs-12","name":"Eggs (12 pack)","category":"Dairy & Eggs","package_size":12,"package_unit":"eggs","portion_size":2,"portion_unit":"eggs","shelf_life_days":21,"shelf_life_note":"refrigerated","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Dairy & Eggs"},{"product_id":"greek-yogurt-500g","name":"Greek yogurt (500g)","category":"Dairy & Eggs","package_size":500,"package_unit":"g","portion_size":170,"portion_unit":"g","shelf_life_days":10,"shelf_life_note":"refrigerated, sealed","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Dairy & Eggs"},{"product_id":"cottage-cheese-250g","name":"Cottage cheese (250g)","category":"Dairy & Eggs","package_size":250,"package_unit":"g","portion_size":125,"portion_unit":"g","shelf_life_days":7,"shelf_life_note":"refrigerated","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Dairy & Eggs"},{"product_id":"chicken-breast-750g","name":"Chicken breast (750g)","category":"Meat & Fish","package_size":750,"package_unit":"g","portion_size":180,"portion_unit":"g","shelf_life_days":3,"shelf_life_note":"refrigerated, raw","can_freeze":true,"frozen_shelf_life_days":120,"store_section":"Meat & Fish"},{"product_id":"salmon-fillet-400g","name":"Salmon fillet (400g)","category":"Meat & Fish","package_size":400,"package_unit":"g","portion_size":150,"portion_unit":"g","shelf_life_days":2,"shelf_life_note":"refrigerated, raw","can_freeze":true,"frozen_shelf_life_days":90,"store_section":"Meat & Fish"},{"product_id":"lean-beef-500g","name":"Lean ground beef (500g)","category":"Meat & Fish","package_size":500,"package_unit":"g","portion_size":150,"portion_unit":"g","shelf_life_days":2,"shelf_life_note":"refrigerated, raw","can_freeze":true,"frozen_shelf_life_days":90,"store_section":"Meat & Fish"},{"product_id":"ground-turkey-500g","name":"Ground turkey (500g)","category":"Meat & Fish","package_size":500,"package_unit":"g","portion_size":150,"portion_unit":"g","shelf_life_days":2,"shelf_life_note":"refrigerated, raw","can_freeze":true,"frozen_shelf_life_days":90,"store_section":"Meat & Fish"},{"product_id":"canned-tuna-3pk","name":"Canned tuna (3-pack)","category":"Pantry","package_size":3,"package_unit":"cans","portion_size":1,"portion_unit":"cans","shelf_life_days":1095,"shelf_life_note":"3 years unopened","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Pantry"},{"product_id":"avocado-2pk","name":"Avocado (2 pack)","category":"Produce","package_size":2,"package_unit":"avocados","portion_size":1,"portion_unit":"avocados","shelf_life_days":4,"shelf_life_note":"ripe, refrigerated","can_freeze":true,"frozen_shelf_life_days":90,"store_section":"Produce"},{"product_id":"sweet-potato-1kg","name":"Sweet potato (1kg)","category":"Produce","package_size":1000,"package_unit":"g","portion_size":200,"portion_unit":"g","shelf_life_days":21,"shelf_life_note":"cool, dry place","can_freeze":true,"frozen_shelf_life_days":180,"store_section":"Produce"},{"product_id":"brown-rice-1kg","name":"Brown rice (1kg)","category":"Pantry","package_size":1000,"package_unit":"g","portion_size":80,"portion_unit":"g","shelf_life_days":540,"shelf_life_note":"18 months dry","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Pantry"},{"product_id":"pasta-whole-500g","name":"Whole wheat pasta (500g)","category":"Pantry","package_size":500,"package_unit":"g","portion_size":85,"portion_unit":"g","shelf_life_days":720,"shelf_life_note":"2 years dry","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Pantry"},{"product_id":"oats-1kg","name":"Oats (1kg)","category":"Pantry","package_size":1000,"package_unit":"g","portion_size":60,"portion_unit":"g","shelf_life_days":720,"shelf_life_note":"2 years dry","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Pantry"},{"product_id":"protein-powder-1kg","name":"Protein powder (1kg)","category":"Pantry","package_size":1000,"package_unit":"g","portion_size":30,"portion_unit":"g","shelf_life_days":365,"shelf_life_note":"1 year sealed","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Pantry"},{"product_id":"spinach-200g","name":"Spinach (200g)","category":"Produce","package_size":200,"package_unit":"g","portion_size":60,"portion_unit":"g","shelf_life_days":5,"shelf_life_note":"refrigerated","can_freeze":true,"frozen_shelf_life_days":180,"store_section":"Produce"},{"product_id":"broccoli-500g","name":"Broccoli (500g)","category":"Produce","package_size":500,"package_unit":"g","portion_size":150,"portion_unit":"g","shelf_life_days":7,"shelf_life_note":"refrigerated","can_freeze":true,"frozen_shelf_life_days":270,"store_section":"Produce"},{"product_id":"lentils-500g","name":"Lentils (500g dried)","category":"Pantry","package_size":500,"package_unit":"g","portion_size":70,"portion_unit":"g","shelf_life_days":730,"shelf_life_note":"2 years dry","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Pantry"},{"product_id":"almonds-200g","name":"Almonds (200g)","category":"Pantry","package_size":200,"package_unit":"g","portion_size":30,"portion_unit":"g","shelf_life_days":180,"shelf_life_note":"6 months sealed","can_freeze":true,"frozen_shelf_life_days":365,"store_section":"Pantry"},{"product_id":"olive-oil-750ml","name":"Olive oil (750ml)","category":"Pantry","package_size":750,"package_unit":"ml","portion_size":10,"portion_unit":"ml","shelf_life_days":540,"shelf_life_note":"18 months sealed","can_freeze":false,"frozen_shelf_life_days":0,"store_section":"Pantry"},{"product_id":"bananas-6","name":"Bananas (bunch of 6)","category":"Produce","package_size":6,"package_unit":"bananas","portion_size":1,"portion_unit":"bananas","shelf_life_days":5,"shelf_life_note":"room temperature","can_freeze":true,"frozen_shelf_life_days":60,"store_section":"Produce"}];

const SEED_RDAS = [{"nutrient":"Iron","unit":"mg","rda_male_19_50":11,"rda_female_19_50":16,"rda_male_51_plus":11,"rda_female_51_plus":11,"notes":"Pre-menopausal females need more"},{"nutrient":"Calcium","unit":"mg","rda_male_19_50":1000,"rda_female_19_50":1000,"rda_male_51_plus":1000,"rda_female_51_plus":1000,"notes":""},{"nutrient":"Vitamin D","unit":"mcg","rda_male_19_50":15,"rda_female_19_50":15,"rda_male_51_plus":15,"rda_female_51_plus":15,"notes":"Assumes minimal sun exposure"},{"nutrient":"Vitamin B12","unit":"mcg","rda_male_19_50":4,"rda_female_19_50":4,"rda_male_51_plus":4,"rda_female_51_plus":4,"notes":""},{"nutrient":"Vitamin C","unit":"mg","rda_male_19_50":110,"rda_female_19_50":95,"rda_male_51_plus":110,"rda_female_51_plus":95,"notes":""},{"nutrient":"Zinc","unit":"mg","rda_male_19_50":9.4,"rda_female_19_50":7.5,"rda_male_51_plus":9.4,"rda_female_51_plus":7.5,"notes":"Based on mixed phytate diet"},{"nutrient":"Magnesium","unit":"mg","rda_male_19_50":350,"rda_female_19_50":300,"rda_male_51_plus":350,"rda_female_51_plus":300,"notes":""},{"nutrient":"Omega-3","unit":"g","rda_male_19_50":0.25,"rda_female_19_50":0.25,"rda_male_51_plus":0.25,"rda_female_51_plus":0.25,"notes":""},{"nutrient":"Potassium","unit":"mg","rda_male_19_50":3500,"rda_female_19_50":3500,"rda_male_51_plus":3500,"rda_female_51_plus":3500,"notes":""}];

// ─── Storage helpers ──────────────────────────────────────────────────────────
async function storageGet(key, fallback = null) {
  try { const r = await window.storage.get(key); return r?.value ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function storageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); return true; } catch { return false; }
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function mondayOf(date = new Date()) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day)); return d;
}
function isoDate(d) { return d.toISOString().slice(0, 10); }
function currentMondayISO() { return isoDate(mondayOf(new Date())); }
function timeDelta(isoStr) {
  if (!isoStr) return "never";
  const diff = Date.now() - new Date(isoStr).getTime();
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins===1?"":"s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs===1?"":"s"} ago`;
  return `${Math.floor(hrs/24)} day${Math.floor(hrs/24)===1?"":"s"} ago`;
}

// ─── Validators ───────────────────────────────────────────────────────────────
function isStr(v) { return typeof v === "string"; }
function isNum(v) { return typeof v === "number" && !isNaN(v); }
function isBool(v) { return typeof v === "boolean"; }
const VALID_STORE_SECTIONS = ["Produce", "Meat & Fish", "Dairy & Eggs", "Pantry"];
const VALID_MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

function validateProducts(parsed) {
  if (!Array.isArray(parsed?.products)) throw new Error("schema_error: missing 'products' array");
  parsed.products.forEach((p, i) => {
    const bad = f => { throw new Error(`schema_error: products[${i}] missing '${f}'`); };
    if (!isStr(p.product_id)) bad("product_id"); if (!isStr(p.name)) bad("name");
    if (!isStr(p.category)) bad("category"); if (!isNum(p.package_size)) bad("package_size");
    if (!isStr(p.package_unit)) bad("package_unit"); if (!isNum(p.portion_size)) bad("portion_size");
    if (!isStr(p.portion_unit)) bad("portion_unit"); if (!isNum(p.shelf_life_days)) bad("shelf_life_days");
    if (!isStr(p.shelf_life_note)) bad("shelf_life_note"); if (!isBool(p.can_freeze)) bad("can_freeze");
    if (!isNum(p.frozen_shelf_life_days)) bad("frozen_shelf_life_days");
    if (!VALID_STORE_SECTIONS.includes(p.store_section)) bad("store_section");
  }); return parsed.products;
}
function validateRecipes(parsed) {
  if (!Array.isArray(parsed?.recipes)) throw new Error("schema_error: missing 'recipes' array");
  parsed.recipes.forEach((r, i) => {
    const bad = f => { throw new Error(`schema_error: recipes[${i}] missing '${f}'`); };
    if (!isStr(r.recipe_id)) bad("recipe_id"); if (!isStr(r.name)) bad("name");
    const mt = r.meal_type;
    if (!Array.isArray(mt) || mt.length < 1 || mt.length > 2 || !mt.every(t => VALID_MEAL_TYPES.includes(t))) bad("meal_type");
    if (!isNum(r.prep_time_min)) bad("prep_time_min"); if (!isNum(r.servings)) bad("servings");
    if (!r.macros || typeof r.macros !== "object") bad("macros");
    ["calories_kcal","protein_g","carbs_g","fat_g","fiber_g"].forEach(f => { if (!isNum(r.macros[f])) bad(`macros.${f}`); });
    if (!Array.isArray(r.ingredients)) bad("ingredients");
    r.ingredients.forEach((ing, j) => {
      if (!isStr(ing.product_id)) throw new Error(`recipes[${i}].ingredients[${j}] missing product_id`);
      if (!isNum(ing.quantity)) throw new Error(`recipes[${i}].ingredients[${j}] missing quantity`);
      if (!isStr(ing.unit)) throw new Error(`recipes[${i}].ingredients[${j}] missing unit`);
    });
    if (!Array.isArray(r.tags)) bad("tags");
  }); return parsed.recipes;
}
function validateRDAs(parsed) {
  if (!Array.isArray(parsed?.nutrients)) throw new Error("schema_error: missing 'nutrients' array");
  parsed.nutrients.forEach((n, i) => {
    const bad = f => { throw new Error(`schema_error: nutrients[${i}] missing '${f}'`); };
    if (!isStr(n.nutrient)) bad("nutrient"); if (!isStr(n.unit)) bad("unit");
    if (!isNum(n.rda_male_19_50)) bad("rda_male_19_50"); if (!isNum(n.rda_female_19_50)) bad("rda_female_19_50");
    if (!isNum(n.rda_male_51_plus)) bad("rda_male_51_plus"); if (!isNum(n.rda_female_51_plus)) bad("rda_female_51_plus");
    if (!isStr(n.notes)) bad("notes");
  }); return parsed.nutrients;
}

function findOrphanIngredients(recipes, products) {
  const ids = new Set(products.map(p => p.product_id));
  const warnings = [];
  recipes.forEach(r => r.ingredients.forEach(ing => {
    if (!ids.has(ing.product_id)) warnings.push({ recipe_id: r.recipe_id, recipe_name: r.name, missing_product_id: ing.product_id });
  }));
  return warnings;
}

// ─── Calc helpers ─────────────────────────────────────────────────────────────
function dayTotals(day, weekplan, recipesById) {
  const totals = { kcal: 0, protein: 0 };
  SLOTS.forEach(slot => {
    const a = weekplan.slots?.[`${day}-${slot}`];
    if (!a?.recipe_id) return;
    const r = recipesById[a.recipe_id];
    if (!r) return;
    totals.kcal += r.macros.calories_kcal; totals.protein += r.macros.protein_g;
  }); return totals;
}

function buildShoppingList(weekplan, recipesById, productsById) {
  const totals = {};
  Object.values(weekplan.slots || {}).forEach(a => {
    if (!a?.recipe_id) return;
    const r = recipesById[a.recipe_id]; if (!r) return;
    r.ingredients.forEach(ing => {
      if (!totals[ing.product_id]) totals[ing.product_id] = { qty: 0, unit: ing.unit };
      totals[ing.product_id].qty += ing.quantity;
    });
  });
  const buckets = {}; SECTION_ORDER.forEach(s => { buckets[s] = []; });
  Object.entries(totals).forEach(([pid, { qty, unit }]) => {
    const p = productsById[pid];
    if (p) {
      const n = Math.ceil(qty / p.package_size);
      buckets[p.store_section].push({ productId: pid, name: p.name, packagesNeeded: n, totalQty: qty, totalProvided: n * p.package_size, unit, section: p.store_section });
    } else {
      buckets["Uncategorized"].push({ productId: pid, name: `? ${pid}`, packagesNeeded: null, totalQty: qty, totalProvided: null, unit, section: "Uncategorized" });
    }
  });
  const result = {};
  SECTION_ORDER.forEach(s => { if (buckets[s].length > 0) result[s] = buckets[s].sort((a,b) => a.name.localeCompare(b.name)); });
  return result;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FUEL() {
  const [view, setView]             = useState("planner");
  const [loaded, setLoaded]         = useState(false);
  const [weekStart, setWeekStart]   = useState(currentMondayISO());
  const [weekplan, setWeekplan]     = useState({ week_of: weekStart, slots: {} });
  const [checklist, setChecklist]   = useState({ week_of: weekStart, checked: {} });
  const [profile, setProfile]       = useState(DEFAULT_PROFILE);
  const [driveCache, setDriveCache] = useState(null);
  const [isSyncing, setIsSyncing]   = useState(false);
  const [pickerSlot, setPickerSlot] = useState(null);
  const syncLockRef = useRef(false);

  useEffect(() => {
    (async () => {
      const ws = currentMondayISO();
      const plan  = await storageGet("weekplan",           { week_of: ws, slots: {} });
      const chk   = await storageGet("shopping-checklist", { week_of: ws, checked: {} });
      const prof  = await storageGet("profile",            DEFAULT_PROFILE);
      let cache   = await storageGet("drive-cache",        null);

      if (plan.week_of !== ws) { plan.week_of = ws; plan.slots = {}; }
      if (chk.week_of  !== ws) { chk.week_of  = ws; chk.checked = {}; }

      // Seed from Drive data if no cache yet
      if (!cache?.recipes?.length) {
        const now = new Date().toISOString();
        cache = {
          recipes: SEED_RECIPES, products: SEED_PRODUCTS, rdas: SEED_RDAS,
          last_synced: now,
          orphan_warnings: findOrphanIngredients(SEED_RECIPES, SEED_PRODUCTS),
          last_sync_report: {
            started_at: now, completed_at: now,
            results: {
              recipes:  { status: "ok", source: "drive", items_count: SEED_RECIPES.length,  modified_time: now },
              products: { status: "ok", source: "drive", items_count: SEED_PRODUCTS.length, modified_time: now },
              rdas:     { status: "ok", source: "drive", items_count: SEED_RDAS.length,     modified_time: now },
            }
          }
        };
        await storageSet("drive-cache", cache);
      }

      setWeekStart(ws); setWeekplan(plan); setChecklist(chk);
      setProfile({ ...DEFAULT_PROFILE, ...prof }); setDriveCache(cache);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) storageSet("weekplan", weekplan); },           [weekplan, loaded]);
  useEffect(() => { if (loaded) storageSet("shopping-checklist", checklist); }, [checklist, loaded]);
  useEffect(() => { if (loaded) storageSet("profile", profile); },              [profile, loaded]);
  useEffect(() => { if (loaded && driveCache) storageSet("drive-cache", driveCache); }, [driveCache, loaded]);

  // Expose inject function for chat-driven updates
  useEffect(() => {
    window.fuelInject = (recipes, products, rdas) => {
      const now = new Date().toISOString();
      setDriveCache(prev => ({
        ...(prev || {}), recipes, products, rdas, last_synced: now,
        orphan_warnings: findOrphanIngredients(recipes, products),
        last_sync_report: {
          started_at: now, completed_at: now,
          results: {
            recipes:  { status: "ok", source: "drive", items_count: recipes.length,  modified_time: now },
            products: { status: "ok", source: "drive", items_count: products.length, modified_time: now },
            rdas:     { status: "ok", source: "drive", items_count: rdas.length,     modified_time: now },
          }
        }
      }));
    };
    return () => { delete window.fuelInject; };
  }, []);

  const recipesById = useMemo(() => {
    const m = {}; (driveCache?.recipes || []).forEach(r => { m[r.recipe_id] = r; }); return m;
  }, [driveCache?.recipes]);

  const productsById = useMemo(() => {
    const m = {}; (driveCache?.products || []).forEach(p => { m[p.product_id] = p; }); return m;
  }, [driveCache?.products]);

  const activeRecipes = driveCache?.recipes || [];
  const shoppingList = useMemo(() => buildShoppingList(weekplan, recipesById, productsById), [weekplan, recipesById, productsById]);

  const driveStatus = useMemo(() => {
    const results = driveCache?.last_sync_report?.results;
    if (!results) return "unknown";
    const vals = Object.values(results);
    if (vals.every(r => r.source === "drive")) return "drive";
    if (vals.some(r  => r.source === "cache")) return "cache";
    return "offline";
  }, [driveCache]);

  const assignRecipe = (day, slot, recipeId) => {
    setWeekplan(prev => ({ ...prev, slots: { ...prev.slots, [`${day}-${slot}`]: { recipe_id: recipeId } } }));
    setPickerSlot(null);
  };
  const clearSlot = (day, slot) => {
    setWeekplan(prev => { const slots = { ...prev.slots }; delete slots[`${day}-${slot}`]; return { ...prev, slots }; });
  };
  const toggleChecklist = pid => setChecklist(prev => ({ ...prev, checked: { ...prev.checked, [pid]: !prev.checked[pid] } }));
  const updateProfile = (field, value) => setProfile(prev => ({ ...prev, [field]: Number(value) || 0 }));

  if (!loaded) {
    return <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: MUTED, fontSize: 13 }}>LOADING FUEL…</div>;
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: FONT, color: TEXT }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: ${SURFACE}; } ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 3px; }
        button:focus-visible, input:focus-visible { outline: 1px solid ${ACCENT}; outline-offset: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } } .fuel-spin { animation: spin 1s linear infinite; }
      `}</style>
      <Header view={view} setView={setView} weekStart={weekStart} driveStatus={driveStatus} isSyncing={isSyncing} />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 20px 80px" }}>
        {view === "planner" && <PlannerView weekplan={weekplan} recipesById={recipesById} profile={profile} activeRecipes={activeRecipes} weekStart={weekStart} onOpenPicker={setPickerSlot} onClearSlot={clearSlot} setView={setView} />}
        {view === "shop"    && <ShoppingView shoppingList={shoppingList} checklist={checklist} onToggle={toggleChecklist} />}
        {view === "profile" && <ProfileView profile={profile} onUpdate={updateProfile} />}
        {view === "sync"    && <SyncView driveCache={driveCache} isSyncing={isSyncing} />}
      </main>
      {pickerSlot && <RecipePicker slot={pickerSlot} recipes={activeRecipes} onSelect={assignRecipe} onClose={() => setPickerSlot(null)} onGoToSync={() => { setPickerSlot(null); setView("sync"); }} />}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: MUTED }}>
      <Icon size={40} style={{ marginBottom: 16, opacity: 0.5 }} />
      <div style={{ fontSize: 15, fontWeight: 800, color: TEXT, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, marginBottom: action ? 20 : 0 }}>{subtitle}</div>
      {action && <button onClick={action.onClick} style={{ background: ACCENT, color: BG, border: "none", borderRadius: 2, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>{action.label}</button>}
    </div>
  );
}

function DriveStatusBadge({ driveStatus, isSyncing, onClick }) {
  let IconComp, label, color;
  if (isSyncing)                    { IconComp = RefreshCw; label = "Syncing…"; color = MUTED; }
  else if (driveStatus === "drive") { IconComp = Cloud;     label = "Drive";    color = GREEN; }
  else if (driveStatus === "cache") { IconComp = RefreshCw; label = "Cache";    color = AMBER; }
  else                              { IconComp = CloudOff;  label = "Offline";  color = MUTED; }
  return (
    <button onClick={onClick} style={{ background: "transparent", border: `1px solid ${color}`, borderRadius: 2, padding: "3px 8px", display: "flex", alignItems: "center", gap: 5, color, cursor: "pointer", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT }}>
      <IconComp size={11} className={isSyncing ? "fuel-spin" : ""} />{label}
    </button>
  );
}

function Header({ view, setView, weekStart, driveStatus, isSyncing }) {
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
            <button key={id} onClick={() => setView(id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 2, border: "none", background: view === id ? ACCENT : "transparent", color: view === id ? BG : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT, letterSpacing: "0.05em" }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function MealSlot({ day, slot, assignment, recipesById, onOpen, onClear }) {
  const recipe = assignment?.recipe_id ? recipesById[assignment.recipe_id] : null;
  const isOrphan = assignment?.recipe_id && !recipe;
  if (!assignment?.recipe_id) {
    return (
      <button onClick={() => onOpen({ day, slot })} style={{ width: "100%", padding: "10px 12px", border: `1px dashed ${BORDER}`, borderRadius: 2, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FONT }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE_2} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
        <Plus size={12} />{slot}
      </button>
    );
  }
  if (isOrphan) {
    return (
      <div style={{ padding: "10px 12px", border: `1px solid ${AMBER}`, borderRadius: 2, background: `${AMBER}18`, position: "relative" }}>
        <div style={{ fontSize: 10, color: AMBER, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{slot}</div>
        <div style={{ fontSize: 11, color: AMBER }}>Recipe removed — clear and reassign</div>
        <button onClick={e => { e.stopPropagation(); onClear(day, slot); }} style={{ position: "absolute", top: 6, right: 6, background: "transparent", border: "none", color: AMBER, cursor: "pointer", padding: 2 }}><X size={12} /></button>
      </div>
    );
  }
  return (
    <div style={{ padding: "10px 12px", border: `1px solid ${BORDER}`, borderRadius: 2, background: SURFACE_2, position: "relative" }}>
      <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{slot}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>{recipe.name}</div>
      <div style={{ fontSize: 11, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
        <span style={{ color: ACCENT }}>{recipe.macros.protein_g}P</span>{" · "}{recipe.macros.calories_kcal}kcal{" · "}{recipe.prep_time_min}m
      </div>
      <button onClick={e => { e.stopPropagation(); onClear(day, slot); }} style={{ position: "absolute", top: 6, right: 6, background: "transparent", border: "none", color: MUTED, cursor: "pointer", padding: 2 }}
        onMouseEnter={e => e.currentTarget.style.color = TEXT} onMouseLeave={e => e.currentTarget.style.color = MUTED}><X size={12} /></button>
    </div>
  );
}

function DayColumn({ day, weekStart, weekplan, recipesById, profile, onOpen, onClear }) {
  const totals = dayTotals(day, weekplan, recipesById);
  const dayIdx = DAYS.indexOf(day);
  const d = new Date(weekStart + "T00:00:00"); d.setDate(d.getDate() + dayIdx);
  const isToday = isoDate(d) === isoDate(new Date());
  return (
    <div style={{ border: `1px solid ${isToday ? ACCENT : BORDER}`, borderRadius: 2, padding: 14, background: SURFACE, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {isToday && <span style={{ fontSize: 9, fontWeight: 700, color: BG, background: ACCENT, padding: "2px 5px", borderRadius: 2, letterSpacing: "0.08em" }}>TODAY</span>}
          <span style={{ fontSize: 11, fontWeight: 800, color: isToday ? ACCENT : TEXT, textTransform: "uppercase", letterSpacing: "0.1em" }}>{day.slice(0,3)}</span>
        </div>
        <div style={{ textAlign: "right", fontSize: 10, color: MUTED, fontVariantNumeric: "tabular-nums" }}>
          <div>{totals.kcal} / {profile.daily_calories_kcal} kcal</div>
          <div>{totals.protein}P / {profile.daily_protein_g}P</div>
        </div>
      </div>
      {SLOTS.map(slot => <MealSlot key={slot} day={day} slot={slot} assignment={weekplan.slots?.[`${day}-${slot}`]} recipesById={recipesById} onOpen={onOpen} onClear={onClear} />)}
    </div>
  );
}

function PlannerView({ weekplan, weekStart, recipesById, profile, activeRecipes, onOpenPicker, onClearSlot, setView }) {
  if (activeRecipes.length === 0) {
    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24, opacity: 0.25, pointerEvents: "none" }}>
          {DAYS.map(day => <div key={day} style={{ border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14, background: SURFACE, minHeight: 180 }}><span style={{ fontSize: 11, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.1em" }}>{day.slice(0,3)}</span></div>)}
        </div>
        <EmptyState icon={CloudOff} title="No recipes loaded yet" subtitle="Ask in chat to sync your FUEL data." action={{ label: "Go to Sync panel", onClick: () => setView("sync") }} />
      </>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
      {DAYS.map(day => <DayColumn key={day} day={day} weekStart={weekStart} weekplan={weekplan} recipesById={recipesById} profile={profile} onOpen={onOpenPicker} onClear={onClearSlot} />)}
    </div>
  );
}

function RecipePicker({ slot, recipes, onSelect, onClose, onGoToSync }) {
  const { day, slot: slotName } = slot;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(slotName);
  const filtered = recipes.filter(r => {
    const matchFilter = filter === "All" || r.meal_type.includes(filter);
    const q = search.toLowerCase();
    return matchFilter && (!q || r.name.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q)));
  });
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", justifyContent: "center", paddingTop: "5vh" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 4, width: "100%", maxWidth: 720, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13 }}><span style={{ color: MUTED }}>{day}</span><span style={{ color: MUTED }}> · </span><span style={{ color: ACCENT, fontWeight: 700 }}>{slotName}</span></div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: MUTED, cursor: "pointer", padding: 4 }}><X size={16} /></button>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: SURFACE_2, borderRadius: 2, padding: "8px 10px" }}>
            <Search size={13} color={MUTED} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search recipes or tags…" style={{ background: "transparent", border: "none", color: TEXT, fontSize: 13, flex: 1, outline: "none", fontFamily: FONT }} />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["All", ...SLOTS].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "4px 10px", borderRadius: 2, cursor: "pointer", border: `1px solid ${filter===f?ACCENT:BORDER}`, background: filter===f?ACCENT:"transparent", color: filter===f?BG:MUTED, fontSize: 11, fontWeight: 700, fontFamily: FONT, letterSpacing: "0.05em" }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowY: "auto", padding: 16, flex: 1 }}>
          {recipes.length === 0 ? (
            <EmptyState icon={CloudOff} title="No recipes synced yet" subtitle="Ask in chat to sync your FUEL data." action={{ label: "Go to Sync", onClick: onGoToSync }} />
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: MUTED, padding: 40, fontSize: 13 }}>No recipes match.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {filtered.map(recipe => (
                <button key={recipe.recipe_id} onClick={() => onSelect(day, slotName, recipe.recipe_id)} style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 12, textAlign: "left", cursor: "pointer", fontFamily: FONT }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT} onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{recipe.name}</div>
                  <div style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", marginBottom: 8 }}>
                    <span style={{ color: ACCENT }}>{recipe.macros.protein_g}P</span>
                    <span style={{ color: MUTED }}> · {recipe.macros.calories_kcal}kcal · {recipe.prep_time_min}m</span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {recipe.tags.slice(0,3).map(tag => <span key={tag} style={{ fontSize: 9, fontWeight: 700, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 2, padding: "2px 5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{tag}</span>)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShoppingItem({ item, checked, onToggle }) {
  const isUncategorized = item.section === "Uncategorized";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={() => onToggle(item.productId)} style={{ flexShrink: 0, width: 18, height: 18, border: `1px solid ${checked?ACCENT:BORDER}`, borderRadius: 2, background: checked?ACCENT:"transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
        {checked && <Check size={11} color={BG} />}
      </button>
      <div style={{ flex: 1, opacity: checked ? 0.5 : 1 }}>
        <div style={{ fontSize: 13, color: TEXT, fontWeight: 600, textDecoration: checked ? "line-through" : "none" }}>
          {isUncategorized ? item.name : `${item.packagesNeeded} × ${item.name}`}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>{isUncategorized ? "Product not in catalog" : `Need ${item.totalQty}${item.unit} · Get ${item.totalProvided}${item.unit}`}</div>
      </div>
    </div>
  );
}

function ShoppingView({ shoppingList, checklist, onToggle }) {
  const sections = Object.keys(shoppingList);
  const allItems = sections.flatMap(s => shoppingList[s]);
  const checkedCount = allItems.filter(i => checklist.checked[i.productId]).length;
  if (allItems.length === 0) return <EmptyState icon={ShoppingCart} title="No shopping list yet" subtitle="Assign meals in the Plan view to generate a list." />;
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
            {shoppingList[section].map(item => <ShoppingItem key={item.productId} item={item} checked={!!checklist.checked[item.productId]} onToggle={onToggle} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileView({ profile, onUpdate }) {
  return (
    <div style={{ maxWidth: 480 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Daily macro targets</div>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 2, padding: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PROFILE_FIELDS.map(({ key, label, unit }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <label htmlFor={key} style={{ fontSize: 13, color: TEXT, fontWeight: 600, flex: 1 }}>{label} ({unit})</label>
              <input id={key} type="number" value={profile[key]} onChange={e => onUpdate(key, e.target.value)} style={{ background: SURFACE_2, border: `1px solid ${BORDER}`, borderRadius: 2, color: TEXT, fontSize: 13, padding: "6px 10px", width: 100, textAlign: "right", fontFamily: FONT, fontVariantNumeric: "tabular-nums" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 11, color: MUTED }}>Targets are saved locally. Daily totals in the Plan view compare against these numbers.</div>
      </div>
    </div>
  );
}

function SyncView({ driveCache }) {
  const report  = driveCache?.last_sync_report;
  const results = report?.results;
  const files = [
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
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Chat-driven sync</div>
          <div style={{ fontSize: 12, color: MUTED }}>Data is loaded by asking in chat: <span style={{ color: ACCENT, fontFamily: "monospace" }}>"sync my FUEL data"</span>. The chat reads your Drive files directly and pushes them into this app.</div>
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
          <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Add the missing product to products.json on Drive, then ask to sync again.</div>
        </div>
      )}
    </div>
  );
}
