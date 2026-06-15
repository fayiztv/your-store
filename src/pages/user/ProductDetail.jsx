import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, MessageCircle } from "lucide-react";
import {
  collection, doc, getDoc, getDocs, limit, query, where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import ImageGallery from "../../components/user/ImageGallery";
import ProductCard from "../../components/user/ProductCard";
import { db } from "../../firebase/firebase";
import { useFavourites } from "../../contexts/FavouritesContext";
import { useStoreSettings } from "../../contexts/SettingsContext";
import { openWhatsApp } from "../../utils/whatsapp";
import { ProductDetailSkeleton } from "../../components/common/ProductDetailSkeleton";
import { containerVariantsProductDetails } from "../../utils/constents";

export default function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();
  const { settings } = useStoreSettings();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile] = useState(window.innerWidth < 768);

  // Variant selection state
  const [selectedColor, setSelectedColor] = useState(null);   // color name string
  const [selectedSize, setSelectedSize] = useState(null);     // size string
  const [selectedLabel, setSelectedLabel] = useState(null);   // label string (e.g. 50ml)
  const [selectedVariant, setSelectedVariant] = useState(null); // full variant object

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!productId) { setError("Product not found"); setLoading(false); return; }

      setLoading(true);
      setError(null);

      try {
        const productSnap = await getDoc(doc(db, "products", productId));
        if (cancelled) return;

        if (!productSnap.exists()) {
          setProduct(null); setError("Product not found"); setLoading(false); return;
        }

        const productData = { id: productSnap.id, ...productSnap.data() };
        setProduct(productData);

        // If simple product (no variants), auto-select
        if (!productData.variants || productData.variants.length === 0) {
          setSelectedVariant(null);
        }

        if (productData.categoryId) {
          const relatedQuery = query(
            collection(db, "products"),
            where("categoryId", "==", productData.categoryId),
            limit(5),
          );
          const relatedSnap = await getDocs(relatedQuery);
          if (!cancelled) {
            const related = relatedSnap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((p) => p.id !== productId)
              .slice(0, 4);
            setRelatedProducts(related);
          }
        } else {
          setRelatedProducts([]);
        }
      } catch (err) {
        if (!cancelled) { setError(err.message || "Failed to load product"); setProduct(null); }
      } finally {
        if (!cancelled) { setLoading(false); }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [productId]);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedLabel(null);
    setSelectedVariant(null);
  }, [productId]);

  // Derived variant info
  const hasVariants = product?.variants && product.variants.length > 0;

  // Detect variant type from first variant
  const variantType = hasVariants
    ? product.variants[0].colorHex && product.variants[0].size ? 'size_color'
      : product.variants[0].colorHex ? 'color'
      : product.variants[0].size ? 'size'
      : 'label'
    : null;

  // Unique colors (for color/size_color variants)
  const uniqueColors = hasVariants && (variantType === 'color' || variantType === 'size_color')
    ? product.variants.reduce((acc, v) => {
        if (v.color && !acc.find((c) => c.color === v.color)) {
          acc.push({ color: v.color, colorHex: v.colorHex });
        }
        return acc;
      }, [])
    : [];

  // Available sizes filtered by selected color (for size_color)
  const availableSizes = hasVariants && (variantType === 'size' || variantType === 'size_color')
    ? product.variants
        .filter((v) => variantType === 'size' || v.color === selectedColor)
        .map((v) => v.size)
        .filter(Boolean)
    : [];

  // Available labels (for label type)
  const availableLabels = hasVariants && variantType === 'label'
    ? product.variants.map((v) => v.label).filter(Boolean)
    : [];

  // Find matching variant when selections change
  useEffect(() => {
    if (!hasVariants) { setSelectedVariant(null); return; }

    let matched = null;

    if (variantType === 'label' && selectedLabel) {
      matched = product.variants.find((v) => v.label === selectedLabel) || null;
    } else if (variantType === 'size' && selectedSize) {
      matched = product.variants.find((v) => v.size === selectedSize) || null;
    } else if (variantType === 'color' && selectedColor) {
      matched = product.variants.find((v) => v.color === selectedColor) || null;
    } else if (variantType === 'size_color' && selectedColor && selectedSize) {
      matched = product.variants.find((v) => v.color === selectedColor && v.size === selectedSize) || null;
    }

    setSelectedVariant(matched);
  }, [selectedColor, selectedSize, selectedLabel, hasVariants, variantType, product]);

  // Price display logic
  const favourited = product ? isFavourite(product.id) : false;
  const categoryLabel = product?.categoryName || product?.category || "General";

  // Effective display price
  function getDisplayPrice() {
    if (hasVariants) {
      if (selectedVariant) {
        return {
          price: selectedVariant.price,
          offerPrice: selectedVariant.offerPrice,
          hasOffer: selectedVariant.offerPrice != null && selectedVariant.offerPrice > 0,
          isRange: false,
        };
      }
      // No variant selected yet — show range
      const prices = product.variants.map((v) => v.offerPrice ?? v.price).filter(Boolean);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return {
        isRange: true,
        rangeText: min === max ? `₹${min}` : `₹${min} – ₹${max}`,
      };
    }
    // Simple product
    const hasOffer = product?.offerPrice != null && product.offerPrice > 0;
    return {
      price: product?.price,
      offerPrice: product?.offerPrice,
      hasOffer,
      isRange: false,
    };
  }

  // Savings calculation
  function getSavings() {
    if (hasVariants && selectedVariant) {
      if (selectedVariant.offerPrice && selectedVariant.price) {
        return selectedVariant.price - selectedVariant.offerPrice;
      }
    } else if (!hasVariants && product?.offerPrice && product?.price) {
      return product.price - product.offerPrice;
    }
    return null;
  }

  // Is the selected variant out of stock?
  function isOutOfStock() {
    if (hasVariants && selectedVariant) return selectedVariant.inStock === false;
    return product?.inStock === false;
  }

  // Validation before WhatsApp
  function handleWhatsApp() {
    if (!product) return;

    const whatsappNumber = settings?.whatsappNumber || "";
    const storeName = settings?.storeName || "the store";

    if (!whatsappNumber) { toast.error("WhatsApp number is not configured"); return; }

    if (hasVariants) {
      if (variantType === 'label' && !selectedLabel) {
        toast.error("Please select an option first"); return;
      }
      if (variantType === 'size' && !selectedSize) {
        toast.error("Please select a size first"); return;
      }
      if (variantType === 'color' && !selectedColor) {
        toast.error("Please select a color first"); return;
      }
      if (variantType === 'size_color') {
        if (!selectedColor) { toast.error("Please select a color first"); return; }
        if (!selectedSize) { toast.error("Please select a size first"); return; }
      }
      if (!selectedVariant) { toast.error("Please complete your selection"); return; }
      if (selectedVariant.inStock === false) { toast.error("This variant is out of stock"); return; }
    }

    openWhatsApp(product, selectedVariant, whatsappNumber, storeName);
  }

  function handleFavouriteToggle() {
    if (!product) return;
    if (favourited) {
      removeFavourite(product.id);
      toast.success("Removed from favourites");
    } else {
      addFavourite(product);
      toast.success("Added to favourites");
    }
  }

  const displayPrice = product ? getDisplayPrice() : null;
  const savings = product ? getSavings() : null;
  const outOfStock = product ? isOutOfStock() : false;

  // ─── ACTION BUTTONS ───
  function ActionButtons({ className = "" }) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <motion.button
          type="button"
          whileHover={!outOfStock ? { scale: 1.02 } : {}}
          whileTap={!outOfStock ? { scale: 0.98 } : {}}
          disabled={outOfStock}
          onClick={handleWhatsApp}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white transition-colors ${
            outOfStock ? "cursor-not-allowed bg-gray-300" : "bg-[#25D366] hover:bg-[#20bd5a]"
          }`}
        >
          <MessageCircle className="h-5 w-5" />
          {outOfStock ? "Out of Stock" : "Order on WhatsApp"}
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFavouriteToggle}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-[var(--surface)] py-3.5 text-base font-semibold text-primary transition-colors hover:bg-primary/5"
        >
          <Heart className={`h-5 w-5 ${favourited ? "fill-red-500 text-red-500" : ""}`} />
          {favourited ? "Remove from Favourites" : "Add to Favourites"}
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-52 pt-20 md:pb-16"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="mx-auto max-w-5xl px-4">
        {loading ? (
          <ProductDetailSkeleton />
        ) : error || !product ? (
          <div className="flex flex-col items-center justify-center rounded-2xl py-24 text-center shadow-md"
            style={{ backgroundColor: "var(--card-bg)" }}>
            <h2 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">Product not found</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              This product may have been removed or the link is invalid.
            </p>
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30">
              <ChevronLeft className="h-4 w-4" /> Go Back
            </motion.button>
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              {/* LEFT — Image Gallery */}
              <div>
                <ImageGallery images={product.images} />
              </div>

              {/* RIGHT — Product Info */}
              <div className="flex flex-col">
                <button type="button" onClick={() => navigate(-1)}
                  className="mb-4 flex w-fit items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>

                <span className="mb-3 w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {categoryLabel}
                </span>

                <h1 className="font-outfit text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  {displayPrice?.isRange ? (
                    <span className="font-outfit text-2xl font-bold text-primary">
                      {displayPrice.rangeText}
                    </span>
                  ) : displayPrice?.hasOffer ? (
                    <>
                      <span className="text-base text-[var(--text-secondary)] line-through">
                        ₹{displayPrice.price}
                      </span>
                      <span className="font-outfit text-3xl font-bold text-primary">
                        ₹{displayPrice.offerPrice}
                      </span>
                      {savings && (
                        <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-400">
                          You save ₹{savings}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-outfit text-3xl font-bold text-[var(--text-primary)]">
                      ₹{displayPrice?.price ?? "—"}
                    </span>
                  )}
                </div>

                {/* Stock status */}
                <div className="mt-3">
                  {outOfStock ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                      <span className="h-2 w-2 rounded-full bg-red-400" /> Out of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-400" /> In Stock
                    </span>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {product.description}
                  </p>
                )}

                {/* ─── VARIANT SELECTORS ─── */}
                {hasVariants && (
                  <div className="mt-6 space-y-5">

                    {/* LABEL variants (e.g. 50ml, 100ml) */}
                    {variantType === 'label' && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                          Select Option
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableLabels.map((label) => {
                            const v = product.variants.find((x) => x.label === label);
                            const isSelected = selectedLabel === label;
                            const oos = v?.inStock === false;
                            return (
                              <motion.button
                                key={label}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => !oos && setSelectedLabel(label)}
                                className={`relative rounded-xl border px-4 py-2 text-sm font-medium transition-all
                                  ${oos ? 'cursor-not-allowed opacity-40 line-through' : 'cursor-pointer'}
                                  ${isSelected
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-primary'
                                  }`}
                              >
                                {label}
                                {v?.offerPrice ? (
                                  <span className="ml-1.5 text-xs opacity-80">₹{v.offerPrice}</span>
                                ) : v?.price ? (
                                  <span className="ml-1.5 text-xs opacity-80">₹{v.price}</span>
                                ) : null}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* COLOR selector */}
                    {(variantType === 'color' || variantType === 'size_color') && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                          Select Color
                          {selectedColor && (
                            <span className="ml-2 font-normal text-[var(--text-secondary)]">{selectedColor}</span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {uniqueColors.map(({ color, colorHex }) => {
                            const isSelected = selectedColor === color;
                            return (
                              <motion.button
                                key={color}
                                type="button"
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedColor(color);
                                  setSelectedSize(null); // reset size on color change
                                }}
                                title={color}
                                className={`relative h-9 w-9 rounded-full transition-all ${
                                  isSelected
                                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-[var(--surface)] scale-110'
                                    : 'ring-1 ring-gray-200 hover:scale-105'
                                }`}
                                style={{ backgroundColor: colorHex }}
                              >
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">✓</span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SIZE selector */}
                    {(variantType === 'size' || variantType === 'size_color') && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Select Size</p>

                        {/* For size_color: only show sizes after color is picked */}
                        {variantType === 'size_color' && !selectedColor ? (
                          <p className="text-xs text-[var(--text-secondary)]">← Select a color first</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {availableSizes.map((size) => {
                              const v = product.variants.find((x) =>
                                x.size === size && (variantType === 'size' || x.color === selectedColor)
                              );
                              const isSelected = selectedSize === size;
                              const oos = v?.inStock === false;
                              return (
                                <motion.button
                                  key={size}
                                  type="button"
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => !oos && setSelectedSize(size)}
                                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all
                                    ${oos ? 'cursor-not-allowed opacity-40 line-through' : 'cursor-pointer'}
                                    ${isSelected
                                      ? 'border-primary bg-primary text-white'
                                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-primary'
                                    }`}
                                >
                                  {size}
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Selected variant price update */}
                    <AnimatePresence>
                      {selectedVariant && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
                        >
                          <p className="text-xs text-[var(--text-secondary)]">Selected price</p>
                          <div className="mt-0.5 flex items-end gap-2">
                            {selectedVariant.offerPrice ? (
                              <>
                                <span className="text-sm text-[var(--text-secondary)] line-through">₹{selectedVariant.price}</span>
                                <span className="font-outfit text-xl font-bold text-primary">₹{selectedVariant.offerPrice}</span>
                              </>
                            ) : (
                              <span className="font-outfit text-xl font-bold text-[var(--text-primary)]">₹{selectedVariant.price}</span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Desktop action buttons */}
                <div className="mt-8 hidden md:block">
                  <ActionButtons />
                </div>
              </div>
            </div>

            {/* Mobile sticky action buttons */}
            <div
              className="fixed left-0 right-0 z-40 border-t p-4 backdrop-blur-md md:hidden"
              style={{
                bottom: "calc(4rem + env(safe-area-inset-bottom))",
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <ActionButtons />
            </div>

            {/* Related products */}
            {relatedProducts.length > 0 && (
              <section className="mt-16">
                <h2 className="mb-6 font-outfit text-xl font-bold text-[var(--text-primary)]">
                  You might also like
                </h2>
                <motion.div
                  variants={containerVariantsProductDetails}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                >
                  {relatedProducts.map((related) => (
                    <ProductCard
                      key={related.id}
                      product={related}
                      layout={isMobile ? "horizontal" : "vertical"}
                    />
                  ))}
                </motion.div>
              </section>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}