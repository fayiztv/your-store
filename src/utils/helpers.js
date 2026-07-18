import { THEME_KEY } from "./constents";

export function getCreatedTime(product) {
  const c = product.createdAt;
  if (!c) return 0;
  if (typeof c.toDate === "function") return c.toDate().getTime();
  if (c.seconds != null) return c.seconds * 1000;
  if (c instanceof Date) return c.getTime();
  const parsed = new Date(c).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getEffectivePrice(product) {
  if (product.offerPrice != null && product.offerPrice > 0) {
    return product.offerPrice;
  }
  // For variant products, use the lowest effective price
  if (product.variants && product.variants.length > 0) {
    const prices = product.variants
      .map((v) => v.offerPrice ?? v.price)
      .filter((p) => p != null && p > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }
  return product.price ?? 0;
}

// Supports both new format (categories array + categoryIds array)
// and old format (categoryId / categoryName) for backward compatibility
// during the migration window.
export function productMatchesCategory(product, categoryId, categories) {
  if (!categoryId || categoryId === "All") return true;

  // ── New format: flat categoryIds array ──
  // This is the primary path after migration
  if (Array.isArray(product.categoryIds) && product.categoryIds.length > 0) {
    return product.categoryIds.includes(categoryId);
  }

  // ── Old format fallback (pre-migration products) ──
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return product.categoryId === categoryId;
  return (
    product.categoryId === cat.id ||
    product.category === cat.id ||
    product.category === cat.name ||
    product.categoryName === cat.name
  );
}

// Get all category labels for a product (supports both old and new format)
export function getProductCategories(product, categories) {
  // New format
  if (Array.isArray(product.categories) && product.categories.length > 0) {
    return product.categories; // [{ id, name }]
  }
  // Old format fallback
  const name = product.categoryName || product.category;
  if (name) return [{ id: product.categoryId || "", name }];
  return [];
}

export function getPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - 2);
  let end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function readSavedTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) {
      if (saved === "dark") return true;
      if (saved === "light") return false;
      return JSON.parse(saved);
    }
    document.documentElement.classList.add("dark");
    return true;
  } catch {
    document.documentElement.classList.add("dark");
    return true;
  }
}
