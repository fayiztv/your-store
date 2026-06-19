import { motion } from "framer-motion";
import { Heart, Shirt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cardVariants } from "../../utils/constents";
import { useFavourites } from "../../hooks/useFavorites";

// Helper: get price range string from variants
function getVariantPriceRange(variants) {
  if (!variants || variants.length === 0) return null;
  const prices = variants.map((v) => v.offerPrice ?? v.price).filter(Boolean);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
}

// Helper: check if any variant has an offer
function hasAnyOffer(variants) {
  return variants?.some((v) => v.offerPrice != null && v.offerPrice > 0);
}

export default function ProductCard({ product, layout = "vertical" }) {
  const navigate = useNavigate();
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();
  const favourited = isFavourite(product.id);

  const hasVariants = product.variants && product.variants.length > 0;
  const categoryLabel = product.categoryName || product.category || "General";

  // Simple product pricing
  const hasOffer =
    !hasVariants && product.offerPrice != null && product.offerPrice > 0;

  // Variant price range
  const priceRange = hasVariants
    ? getVariantPriceRange(product.variants)
    : null;

  // Color swatches (for color/size_color variants)
  const colorVariants = hasVariants
    ? product.variants
        .filter((v) => v.colorHex)
        .reduce((acc, v) => {
          if (!acc.find((c) => c.colorHex === v.colorHex)) acc.push(v);
          return acc;
        }, [])
    : [];

  function handleCardClick() {
    navigate(`/product/${product.id}`);
  }

  function handleHeartClick(e) {
    e.stopPropagation();
    if (favourited) removeFavourite(product.id);
    else addFavourite(product);
  }

  // ─── PRICE DISPLAY ───
  function PriceDisplay({ size = "normal" }) {
    const bigClass = size === "big" ? "text-lg" : "text-base";
    const smallClass = size === "big" ? "text-sm" : "text-xs";

    if (hasVariants) {
      return (
        <span className={`font-outfit font-bold text-[var(--primary)] ${bigClass}`}>
          {priceRange}
        </span>
      );
    }
    if (hasOffer) {
      return (
        <div className="flex items-end gap-1.5">
          <span
            className={`text-[var(--text-secondary)] line-through ${smallClass}`}
          >
            ₹{product.price}
          </span>
          <span className={`font-outfit font-bold text-[var(--primary)] ${bigClass}`}>
            ₹{product.offerPrice}
          </span>
        </div>
      );
    }
    return (
      <span
        className={`font-outfit font-bold text-[var(--text-primary)] ${bigClass}`}
      >
        ₹{product.price ?? "—"}
      </span>
    );
  }

  // ─── HORIZONTAL LAYOUT ───
  if (layout === "horizontal") {
    return (
      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.01, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
        className="flex min-h-[110px] w-full cursor-pointer flex-row overflow-hidden rounded-2xl bg-[var(--card-bg)] shadow-sm"
      >
        <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-l-2xl">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/5 dark:bg-white/5">
              <Shirt
                className="h-8 w-8 text-[var(--text-secondary)]"
                strokeWidth={1.2}
              />
            </div>
          )}
          {product.isFeatured && (
            <span className="absolute left-1.5 top-1.5 rounded-2xl bg-[var(--primary-dark)] px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-[var(--primary)]">
              Featured
            </span>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-center font-outfit text-[10px] font-semibold text-white">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <h3 className="line-clamp-2 font-outfit text-sm font-semibold text-[var(--text-primary)]">
              {product.name}
            </h3>
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-[var(--primary-dark)] dark:bg-blue-900/30 dark:text-[var(--primary)]">
              {categoryLabel}
            </span>

            {/* Color swatches */}
            {colorVariants.length > 0 && (
              <div className="mt-1 flex gap-1">
                {colorVariants.slice(0, 5).map((v) => (
                  <div
                    key={v.colorHex}
                    className="h-3 w-3 rounded-full border border-gray-200"
                    style={{ backgroundColor: v.colorHex }}
                    title={v.color}
                  />
                ))}
              </div>
            )}

            {/* Size labels (non-color variants) */}
            {hasVariants && colorVariants.length === 0 && (
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {product.variants
                  .map((v) => v.label || v.size)
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            <PriceDisplay />
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleHeartClick}
              className="rounded-xl p-2 transition-colors hover:bg-primary/10"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${favourited ? "fill-red-500 text-red-500" : "text-[var(--text-secondary)]"}`}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── VERTICAL LAYOUT ───
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-[var(--card-bg)] shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/5 dark:bg-white/5">
            <Shirt
              className="h-12 w-12 text-[var(--text-secondary)]"
              strokeWidth={1.2}
            />
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute left-3 top-2 rounded-2xl bg-[var(--primary-dark)] px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-[var(--primary)]">
            Featured
          </span>
        )}
        {product.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="font-outfit text-sm font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-1 font-outfit text-base font-semibold text-[var(--text-primary)]">
            {product.name}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-[var(--primary-dark)] dark:bg-blue-900/30 dark:text-[var(--primary)]">
            {categoryLabel}
          </span>

          {/* Color swatches */}
          <div className="mt-1 min-h-[22px]">
            {colorVariants.length > 0 ? (
              <div className="flex gap-1.5">
                {colorVariants.slice(0, 6).map((v) => (
                  <div
                    key={v.colorHex}
                    className="h-4 w-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: v.colorHex }}
                    title={v.color}
                  />
                ))}
              </div>
            ) : (
              hasVariants && (
                <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                  {product.variants
                    .map((v) => v.label || v.size)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <PriceDisplay size="big" />
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={handleHeartClick}
            className="rounded-xl p-2 transition-colors hover:bg-primary/10"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${favourited ? "fill-red-500 text-red-500" : "text-[var(--text-secondary)]"}`}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
