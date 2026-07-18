import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronDown, Heart, MessageCircle } from "lucide-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import toast from "react-hot-toast";
import ImageGallery from "../../components/user/ImageGallery";
import ProductCard from "../../components/user/ProductCard";
import { db } from "../../firebase/firebase";
import { useStoreSettings } from "../../contexts/SettingsContext";
import { openWhatsApp } from "../../utils/whatsapp";
import { ProductDetailSkeleton } from "../../components/common/ProductDetailSkeleton";
import { containerVariantsProductDetails } from "../../utils/constents";
import { useFavourites } from "../../hooks/useFavorites";
import { useCheckout } from "../../hooks/useCheckout";
import { getProductCategories } from "../../utils/helpers";

export default function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();
  const { settings } = useStoreSettings();
  const { startOrder } = useCheckout();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile] = useState(window.innerWidth < 768);
  const [actionBarVisible, setActionBarVisible] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      if (!productId) {
        setError("Product not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const productSnap = await getDoc(doc(db, "products", productId));
        if (cancelled) return;

        if (!productSnap.exists()) {
          setProduct(null);
          setError("Product not found");
          setLoading(false);
          return;
        }

        const productData = {
          id: productSnap.id,
          ...productSnap.data(),
        };

        setProduct(productData);

        if (!productData.variants || productData.variants.length === 0) {
          setSelectedVariant(null);
        }

        // ---------------- Related Products ----------------

        const categoryIds = productData.categoryIds?.length
          ? productData.categoryIds
          : productData.categoryId
            ? [productData.categoryId]
            : [];

        if (categoryIds.length > 0) {
          const snapshots = await Promise.all(
            categoryIds.map(async (categoryId) => {
              const [newFormatSnap, oldFormatSnap] = await Promise.all([
                getDocs(
                  query(
                    collection(db, "products"),
                    where("categoryIds", "array-contains", categoryId),
                    limit(5),
                  ),
                ),
                getDocs(
                  query(
                    collection(db, "products"),
                    where("categoryId", "==", categoryId),
                    limit(5),
                  ),
                ),
              ]);

              return [...newFormatSnap.docs, ...oldFormatSnap.docs];
            }),
          );

          if (!cancelled) {
            const uniqueProducts = new Map();

            snapshots.forEach((docs) => {
              docs.forEach((docSnap) => {
                if (docSnap.id !== productId) {
                  uniqueProducts.set(docSnap.id, {
                    id: docSnap.id,
                    ...docSnap.data(),
                  });
                }
              });
            });

            setRelatedProducts(Array.from(uniqueProducts.values()).slice(0, 4));
          }
        } else {
          setRelatedProducts([]);
        }

        // --------------------------------------------------
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load product");
          setProduct(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedLabel(null);
    setSelectedVariant(null);
    setActionBarVisible(true);
  }, [productId]);

  const hasVariants = product?.variants && product.variants.length > 0;

  const variantType = hasVariants
    ? product.variants[0].colorHex && product.variants[0].size
      ? "size_color"
      : product.variants[0].colorHex
        ? "color"
        : product.variants[0].size
          ? "size"
          : "label"
    : null;

  const uniqueColors =
    hasVariants && (variantType === "color" || variantType === "size_color")
      ? product.variants.reduce((acc, v) => {
          if (v.color && !acc.find((c) => c.color === v.color))
            acc.push({ color: v.color, colorHex: v.colorHex });
          return acc;
        }, [])
      : [];

  const availableSizes =
    hasVariants && (variantType === "size" || variantType === "size_color")
      ? product.variants
          .filter((v) => variantType === "size" || v.color === selectedColor)
          .map((v) => v.size)
          .filter(Boolean)
      : [];

  const availableLabels =
    hasVariants && variantType === "label"
      ? product.variants.map((v) => v.label).filter(Boolean)
      : [];

  useEffect(() => {
    if (!hasVariants) {
      setSelectedVariant(null);
      return;
    }
    let matched = null;
    if (variantType === "label" && selectedLabel)
      matched = product.variants.find((v) => v.label === selectedLabel) || null;
    else if (variantType === "size" && selectedSize)
      matched = product.variants.find((v) => v.size === selectedSize) || null;
    else if (variantType === "color" && selectedColor)
      matched = product.variants.find((v) => v.color === selectedColor) || null;
    else if (variantType === "size_color" && selectedColor && selectedSize)
      matched =
        product.variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize,
        ) || null;
    setSelectedVariant(matched);
  }, [
    selectedColor,
    selectedSize,
    selectedLabel,
    hasVariants,
    variantType,
    product,
  ]);

  const favourited = product ? isFavourite(product.id) : false;

  // All category labels for this product
  const productCategories = product ? getProductCategories(product, []) : [];

  function getDisplayPrice() {
    if (hasVariants) {
      if (selectedVariant) {
        return {
          price: selectedVariant.price,
          offerPrice: selectedVariant.offerPrice,
          hasOffer:
            selectedVariant.offerPrice != null &&
            selectedVariant.offerPrice > 0,
          isRange: false,
        };
      }
      const prices = product.variants
        .map((v) => v.offerPrice ?? v.price)
        .filter(Boolean);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return {
        isRange: true,
        rangeText: min === max ? `₹${min}` : `₹${min} – ₹${max}`,
      };
    }
    const hasOffer = product?.offerPrice != null && product.offerPrice > 0;
    return {
      price: product?.price,
      offerPrice: product?.offerPrice,
      hasOffer,
      isRange: false,
    };
  }

  function getSavings() {
    if (hasVariants && selectedVariant) {
      if (selectedVariant.offerPrice && selectedVariant.price)
        return selectedVariant.price - selectedVariant.offerPrice;
    } else if (!hasVariants && product?.offerPrice && product?.price) {
      return product.price - product.offerPrice;
    }
    return null;
  }

  function isOutOfStock() {
    if (hasVariants && selectedVariant)
      return selectedVariant.inStock === false;
    return product?.inStock === false;
  }

  function handleWhatsApp() {
    if (!product) return;
    const whatsappNumber = settings?.whatsappNumber || "";
    const storeName = settings?.storeName || "your store";
    if (!whatsappNumber) {
      toast.error("WhatsApp number is not configured");
      return;
    }

    if (hasVariants) {
      if (variantType === "label" && !selectedLabel) {
        toast.error("Please select an option first");
        return;
      }
      if (variantType === "size" && !selectedSize) {
        toast.error("Please select a size first");
        return;
      }
      if (variantType === "color" && !selectedColor) {
        toast.error("Please select a color first");
        return;
      }
      if (variantType === "size_color") {
        if (!selectedColor) {
          toast.error("Please select a color first");
          return;
        }
        if (!selectedSize) {
          toast.error("Please select a size first");
          return;
        }
      }
      if (!selectedVariant) {
        toast.error("Please complete your selection");
        return;
      }
      if (selectedVariant.inStock === false) {
        toast.error("This variant is out of stock");
        return;
      }
    }

    if (
      settings?.addressFormEnabled &&
      (settings?.addressFormFields?.length || 0) > 0
    ) {
      startOrder(product, selectedVariant);
      navigate("/checkout");
      return;
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

  function DesktopActionButtons() {
    return (
      <div className="mt-8 hidden flex-col gap-3 md:flex">
        <motion.button
          type="button"
          whileHover={!outOfStock ? { scale: 1.02 } : {}}
          whileTap={!outOfStock ? { scale: 0.98 } : {}}
          disabled={outOfStock}
          onClick={handleWhatsApp}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white transition-colors ${outOfStock ? "cursor-not-allowed bg-gray-300" : "bg-[#25D366] hover:bg-[#20bd5a]"}`}
        >
          <MessageCircle className="h-5 w-5" />
          {outOfStock ? "Out of Stock" : "Order on WhatsApp"}
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleFavouriteToggle}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--primary-dark)] bg-[var(--surface)] py-4 text-base font-semibold text-[var(--primary-dark)] hover:bg-primary/5"
        >
          <Heart
            className={`h-5 w-5 ${favourited ? "fill-red-500 text-red-500" : ""}`}
          />
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
          <div
            className="flex flex-col items-center justify-center rounded-2xl py-24 text-center shadow-md"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <h2 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
              Product not found
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              This product may have been removed or the link is invalid.
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-[var(--primary-dark)] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30"
            >
              <ChevronLeft className="h-4 w-4" /> Go Back
            </motion.button>
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 md:gap-10">
              <div>
                <ImageGallery images={product.images} />
              </div>

              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mb-4 flex w-fit items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>

                {/* All category chips */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {productCategories.map((cat) => (
                    <span
                      key={cat.id || cat.name}
                      className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-[var(--primary-dark)] dark:bg-blue-900/30 dark:text-[var(--primary-dark)]"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>

                <h1 className="font-outfit text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
                  {product.name}
                </h1>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  {displayPrice?.isRange ? (
                    <span className="font-outfit text-2xl font-bold text-[var(--primary-dark)]">
                      {displayPrice.rangeText}
                    </span>
                  ) : displayPrice?.hasOffer ? (
                    <>
                      <span className="text-base text-[var(--text-secondary)] line-through">
                        ₹{displayPrice.price}
                      </span>
                      <span className="font-outfit text-3xl font-bold text-[var(--primary-dark)]">
                        ₹{displayPrice.offerPrice}
                      </span>
                      {savings && (
                        <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-400">
                          You save ₹{savings}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-outfit text-3xl font-bold text-[var(--primary-dark)]">
                      ₹{displayPrice?.price ?? "—"}
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  {outOfStock ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                      <span className="h-2 w-2 rounded-full bg-red-400" /> Out
                      of Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-400" /> In
                      Stock
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {product.description}
                  </p>
                )}

                {/* ─── VARIANT SELECTORS ─── */}
                {hasVariants && (
                  <div className="mt-6 space-y-5">
                    {variantType === "label" && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                          Select Option
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableLabels.map((label) => {
                            const v = product.variants.find(
                              (x) => x.label === label,
                            );
                            const isSelected = selectedLabel === label;
                            const oos = v?.inStock === false;
                            return (
                              <motion.button
                                key={label}
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => !oos && setSelectedLabel(label)}
                                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all
                                  ${oos ? "cursor-not-allowed opacity-40 line-through" : "cursor-pointer"}
                                  ${isSelected ? "border-[var(--primary-dark)] bg-[var(--primary-dark)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--primary-dark)]"}`}
                              >
                                {label}
                                {v?.offerPrice ? (
                                  <span className="ml-1.5 text-xs opacity-80">
                                    ₹{v.offerPrice}
                                  </span>
                                ) : v?.price ? (
                                  <span className="ml-1.5 text-xs opacity-80">
                                    ₹{v.price}
                                  </span>
                                ) : null}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(variantType === "color" ||
                      variantType === "size_color") && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                          Select Color
                          {selectedColor && (
                            <span className="ml-2 font-normal text-[var(--text-secondary)]">
                              {selectedColor}
                            </span>
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
                                  setSelectedSize(null);
                                }}
                                title={color}
                                className={`relative h-9 w-9 rounded-full transition-all ${isSelected ? "ring-2 ring-[var(--primary-dark)] ring-offset-2 ring-offset-[var(--surface)] scale-110" : "ring-1 ring-gray-200 hover:scale-105"}`}
                                style={{ backgroundColor: colorHex }}
                              >
                                {isSelected && (
                                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                    ✓
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(variantType === "size" ||
                      variantType === "size_color") && (
                      <div>
                        <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                          Select Size
                        </p>
                        {variantType === "size_color" && !selectedColor ? (
                          <p className="text-xs text-[var(--text-secondary)]">
                            ← Select a color first
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {availableSizes.map((size) => {
                              const v = product.variants.find(
                                (x) =>
                                  x.size === size &&
                                  (variantType === "size" ||
                                    x.color === selectedColor),
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
                                    ${oos ? "cursor-not-allowed opacity-40 line-through" : "cursor-pointer"}
                                    ${isSelected ? "border-[var(--primary-dark)] bg-[var(--primary-dark)] text-white" : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--primary-dark)]"}`}
                                >
                                  {size}
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <AnimatePresence>
                      {selectedVariant && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
                        >
                          <p className="text-xs text-[var(--text-secondary)]">
                            Selected price
                          </p>
                          <div className="mt-0.5 flex items-end gap-2">
                            {selectedVariant.offerPrice ? (
                              <>
                                <span className="text-sm text-[var(--text-secondary)] line-through">
                                  ₹{selectedVariant.price}
                                </span>
                                <span className="font-outfit text-xl font-bold text-[var(--primary-dark)]">
                                  ₹{selectedVariant.offerPrice}
                                </span>
                              </>
                            ) : (
                              <span className="font-outfit text-xl font-bold text-[var(--primary-dark)]">
                                ₹{selectedVariant.price}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <DesktopActionButtons />
              </div>
            </div>

            {/* MOBILE STICKY ACTION BAR */}
            <div className="md:hidden">
              <AnimatePresence>
                {actionBarVisible && (
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed left-0 right-0 z-40 border-t p-4 backdrop-blur-md"
                    style={{
                      bottom: "calc(4rem + env(safe-area-inset-bottom))",
                      backgroundColor: "var(--surface)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActionBarVisible(false)}
                      className="absolute -top-8 right-4 flex h-10 w-14 items-center justify-center rounded-t-xl bg-[var(--surface)]"
                      style={{ borderColor: "var(--border)" }}
                      aria-label="Hide action bar"
                    >
                      <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                    </motion.button>
                    <div className="flex flex-col gap-2">
                      <motion.button
                        type="button"
                        whileHover={!outOfStock ? { scale: 1.02 } : {}}
                        whileTap={!outOfStock ? { scale: 0.98 } : {}}
                        disabled={outOfStock}
                        onClick={handleWhatsApp}
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white ${outOfStock ? "cursor-not-allowed bg-gray-300" : "bg-[#25D366]"}`}
                      >
                        <MessageCircle className="h-5 w-5" />
                        {outOfStock ? "Out of Stock" : "Order on WhatsApp"}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFavouriteToggle}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[var(--primary-dark)] bg-[var(--surface)] py-3.5 text-base font-semibold text-[var(--primary-dark)]"
                      >
                        <Heart
                          className={`h-5 w-5 ${favourited ? "fill-red-500 text-red-500" : ""}`}
                        />
                        {favourited
                          ? "Remove from Favourites"
                          : "Add to Favourites"}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!actionBarVisible && (
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed right-4 z-40 flex flex-col gap-2"
                    style={{
                      bottom: "calc(5.5rem + env(safe-area-inset-bottom))",
                    }}
                  >
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {
                        setActionBarVisible(true);
                        setTimeout(() => handleWhatsApp(), 100);
                      }}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] shadow-lg shadow-green-500/30"
                      aria-label="Order on WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5 text-white" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={handleFavouriteToggle}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[var(--primary-dark)] bg-[var(--surface)] shadow-lg"
                      aria-label="Toggle favourites"
                    >
                      <Heart
                        className={`h-5 w-5 ${favourited ? "fill-red-500 text-red-500" : "text-[var(--primary-dark)]"}`}
                      />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActionBarVisible(true)}
                      className="flex h-8 w-12 items-center justify-center rounded-xl border bg-[var(--surface)] shadow-md"
                      style={{ borderColor: "var(--border)" }}
                      aria-label="Show action bar"
                    >
                      <ChevronDown className="h-4 w-4 rotate-180 text-[var(--text-secondary)]" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
