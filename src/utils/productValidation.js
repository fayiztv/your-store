export function validateProduct({
  name,
  price,
  categoryId,
}) {
  if (!name.trim()) {
    return "Product name is required";
  }

  if (
    !price ||
    Number(price) <= 0
  ) {
    return "Valid price is required";
  }

  if (!categoryId) {
    return "Please select a category";
  }

  return null;
}