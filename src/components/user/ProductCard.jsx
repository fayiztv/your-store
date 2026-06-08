import { motion } from "framer-motion";
import { Heart, Shirt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavourites } from "../../contexts/FavouritesContext";
import { cardVariants } from "../../utils/constents";

export default function ProductCard({ product, layout = "vertical" }) {
  const navigate = useNavigate();
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();
  const favourited = isFavourite(product.id);
  const hasOffer = product.offerPrice != null && product.offerPrice > 0;
  const categoryLabel = product.categoryName || product.category || "General";

  function handleCardClick() {
    navigate(`/product/${product.id}`);
  }

  function handleHeartClick(e) {
    e.stopPropagation();
    if (favourited) removeFavourite(product.id);
    else addFavourite(product);
  }

  // ─── HORIZONTAL LAYOUT (mobile products page only) ───────────────────────
  if (layout === "horizontal") {
    return (
      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.01, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
        transition={{ duration: 0.2 }}
        onClick={handleCardClick}
        className="flex min-h-[110px] w-full cursor-pointer flex-row overflow-hidden rounded-2xl bg-[var(--card-bg)] shadow-sm"
      >
        {/* LEFT — image */}
        <div className="relative w-28 shrink-0">
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
            <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
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

        {/* RIGHT — details */}
        <div className="flex flex-1 flex-col justify-between p-3">
          <div>
            <h3 className="line-clamp-2 font-outfit text-sm font-semibold text-[var(--text-primary)]">
              {product.name}
            </h3>
            <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {categoryLabel}
            </span>
            {product.sizes?.length > 0 && (
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {product.sizes.join(" · ")}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-end gap-1.5">
              {hasOffer ? (
                <>
                  <span className="text-xs text-[var(--text-secondary)] line-through">
                    ₹{product.price}
                  </span>
                  <span className="font-outfit text-base font-bold text-primary">
                    ₹{product.offerPrice}
                  </span>
                </>
              ) : (
                <span className="font-outfit text-base font-bold text-[var(--text-primary)]">
                  ₹{product.price ?? product.offerPrice ?? "—"}
                </span>
              )}
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={handleHeartClick}
              className="rounded-xl p-2 transition-colors hover:bg-primary/10"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  favourited
                    ? "fill-red-500 text-red-500"
                    : "text-[var(--text-secondary)]"
                }`}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── VERTICAL LAYOUT (default — home, favourites, desktop) ───────────────
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.2 }}
      onClick={handleCardClick}
      className="flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-[var(--card-bg)] shadow-md"
    >
      {/* Image */}
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
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
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

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-1 font-outfit text-base font-semibold text-[var(--text-primary)]">
            {product.name}
          </h3>
          <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {categoryLabel}
          </span>
          {product.sizes?.length > 0 && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Sizes: {product.sizes.join(" ")}
            </p>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-end gap-2">
            {hasOffer ? (
              <>
                <span className="text-sm text-[var(--text-secondary)] line-through">
                  ₹{product.price}
                </span>
                <span className="font-outfit text-lg font-bold text-primary">
                  ₹{product.offerPrice}
                </span>
              </>
            ) : (
              <span className="font-outfit text-lg font-bold text-[var(--text-primary)]">
                ₹{product.price ?? product.offerPrice ?? "—"}
              </span>
            )}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={handleHeartClick}
            className="rounded-xl p-2 transition-colors hover:bg-primary/10"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                favourited
                  ? "fill-red-500 text-red-500"
                  : "text-[var(--text-secondary)]"
              }`}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
