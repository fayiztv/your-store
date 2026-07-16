import { DEFAULT_TEMPLATE } from "./constents";

export function openWhatsApp(
  product,
  selectedVariant,
  whatsappNumber,
  storeName = "Your Store",
  addressLines = [],
  whatsappTemplate = DEFAULT_TEMPLATE,
) {
  const price = selectedVariant
    ? (selectedVariant.offerPrice ?? selectedVariant.price)
    : (product.offerPrice ?? product.price);

  let variantLine = "";

  if (selectedVariant) {
    const parts = [
      selectedVariant.label,
      selectedVariant.size
        ? `Size: ${selectedVariant.size}`
        : null,
      selectedVariant.color
        ? `Color: ${selectedVariant.color}`
        : null,
    ].filter(Boolean);

    if (parts.length) {
      variantLine = `📦 *Variant:* ${parts.join(" / ")}`;
    }
  }

  let deliveryDetails = "";

  if (addressLines.length > 0) {
    deliveryDetails =
      `📍 *Delivery Details*\n` +
      addressLines.join("\n");
  }

  const productLink =
    `${window.location.origin}/product/${product.id}`;

  const variables = {
    storeName,
    productName: product.name,
    price: `₹${price}`,
    variant: variantLine,
    deliveryDetails,
    productLink,
  };

  const message = (whatsappTemplate || DEFAULT_TEMPLATE)
    .replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  window.location.href =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}