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
  return product.price ?? 0;
}

export function productMatchesCategory(product, categoryId, categories) {
  if (!categoryId || categoryId === "All") return true;
  const cat = categories.find((c) => c.id === categoryId);
  if (!cat) return product.categoryId === categoryId;
  return (
    product.categoryId === cat.id ||
    product.category === cat.id ||
    product.category === cat.name ||
    product.categoryName === cat.name
  );
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
