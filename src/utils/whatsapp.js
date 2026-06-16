export function openWhatsApp(
  product,
  selectedVariant,
  whatsappNumber,
  storeName = "your store",
) {
  // Price
  const price = selectedVariant
    ? (selectedVariant.offerPrice ?? selectedVariant.price)
    : (product.offerPrice ?? product.price);

  // Variant details
  let variantLine = "";

  if (selectedVariant) {
    const parts = [
      selectedVariant.label,
      selectedVariant.size ? `Size: ${selectedVariant.size}` : null,
      selectedVariant.color ? `Color: ${selectedVariant.color}` : null,
    ].filter(Boolean);

    if (parts.length > 0) {
      variantLine = `\n*Variant:* ${parts.join(" / ")}`;
    }
  }

  // Product page link
  const productLink = `${window.location.origin}/product/${product.id}`;

  const message = `🛍️ *New Product Enquiry*

Hello *${storeName}*,

I'd like to order the following item:

📦 *Product:* ${product.name}
💰 *Price:* ₹${price}${variantLine}

🔗 *Product Link:*
${productLink}

Please let me know if this product is available.
Thank you 😊`;

  const encodedMessage = encodeURIComponent(message);
  window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}
