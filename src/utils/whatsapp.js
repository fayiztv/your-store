export function openWhatsApp(product, selectedSize, whatsappNumber) {
  const price = product.offerPrice ?? product.price;
  const sizeLine = selectedSize ? `${selectedSize}` : "";

  const message = `Hello *Thread Store*, I want to buy this product.

*Product Name:* ${product.name}
*Price:* ₹${price}${sizeLine ? `\n*Size:* ${sizeLine}` : ""}
Is this product available?`;

  const encodedMessage = encodeURIComponent(message);
  window.location.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}
