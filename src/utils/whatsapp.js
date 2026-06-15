export function openWhatsApp(product, selectedVariant, whatsappNumber, storeName = 'the store') {
  // Build price string
  const price = selectedVariant
    ? (selectedVariant.offerPrice ?? selectedVariant.price)
    : (product.offerPrice ?? product.price);

  // Build variant detail line
  let variantLine = '';
  if (selectedVariant) {
    const parts = [
      selectedVariant.label,
      selectedVariant.size ? `Size: ${selectedVariant.size}` : null,
      selectedVariant.color ? `Color: ${selectedVariant.color}` : null,
    ].filter(Boolean);
    if (parts.length > 0) variantLine = `\n*Variant:* ${parts.join(' / ')}`;
  }

  const message = `Hello *${storeName}*, I want to buy this product.

*Product Name:* ${product.name}
*Price:* ₹${price}${variantLine}
Is this product available?`;

  const encodedMessage = encodeURIComponent(message);
  window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}