import { SLOTS, SECTION_ORDER } from "../constants.js";

export function findOrphanIngredients(recipes, products) {
  const ids = new Set(products.map(p => p.product_id));
  const warnings = [];
  recipes.forEach(r =>
    r.ingredients.forEach(ing => {
      if (!ids.has(ing.product_id))
        warnings.push({ recipe_id: r.recipe_id, recipe_name: r.name, missing_product_id: ing.product_id });
    })
  );
  return warnings;
}

export function dayTotals(day, weekplan, recipesById) {
  const totals = { kcal: 0, protein: 0 };
  SLOTS.forEach(slot => {
    const a = weekplan.slots?.[`${day}-${slot}`];
    if (!a?.recipe_id) return;
    const r = recipesById[a.recipe_id];
    if (!r) return;
    totals.kcal += r.macros.calories_kcal;
    totals.protein += r.macros.protein_g;
  });
  return totals;
}

export function buildShoppingList(weekplan, recipesById, productsById) {
  const totals = {};
  Object.values(weekplan.slots || {}).forEach(a => {
    if (!a?.recipe_id) return;
    const r = recipesById[a.recipe_id];
    if (!r) return;
    r.ingredients.forEach(ing => {
      if (!totals[ing.product_id]) totals[ing.product_id] = { qty: 0, unit: ing.unit };
      totals[ing.product_id].qty += ing.quantity;
    });
  });

  const buckets = {};
  SECTION_ORDER.forEach(s => { buckets[s] = []; });

  Object.entries(totals).forEach(([pid, { qty, unit }]) => {
    const p = productsById[pid];
    if (p) {
      const totalNeeded = Math.ceil(qty / p.package_size);
      for (let i = 0; i < totalNeeded; i++) {
        buckets[p.store_section].push({
          productId: pid, rowIndex: i, name: p.name,
          packSize: p.package_size, totalQty: qty, unit, section: p.store_section,
        });
      }
    } else {
      buckets["Uncategorized"].push({
        productId: pid, rowIndex: 0, name: `? ${pid}`,
        totalQty: qty, unit, section: "Uncategorized",
      });
    }
  });

  const result = {};
  SECTION_ORDER.forEach(s => { if (buckets[s].length > 0) result[s] = buckets[s].sort((a, b) => a.name.localeCompare(b.name)); });
  return result;
}
