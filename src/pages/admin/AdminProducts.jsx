import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Package, Pencil, Plus, Search, Shirt, Star, Trash2,
} from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase/firebase";
import useProducts from "../../hooks/useProducts";
import { ProductListSkeleton } from "../../components/admin/ProductListSkeleton";
import GlassCard from "../../components/common/GlassCard";

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// Helper: get price display from product (handles both simple + variants)
function getPriceDisplay(product) {
  const hasVariants = product.variants && product.variants.length > 0;

  if (hasVariants) {
    const prices = product.variants.map((v) => v.offerPrice ?? v.price).filter(Boolean);
    if (prices.length === 0) return { type: 'simple', price: '—' };
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const hasOffer = product.variants.some((v) => v.offerPrice != null && v.offerPrice > 0);
    return {
      type: 'range',
      range: min === max ? `₹${min}` : `₹${min} – ₹${max}`,
      hasOffer,
    };
  }

  const hasOffer = product.offerPrice != null && product.offerPrice > 0;
  return { type: 'simple', price: product.price, offerPrice: product.offerPrice, hasOffer };
}

// Helper: get variant summary string for display
function getVariantSummary(product) {
  const hasVariants = product.variants && product.variants.length > 0;
  if (!hasVariants) return null;

  const first = product.variants[0];

  // Color variants — show color swatches
  if (first.colorHex) return { type: 'colors', variants: product.variants };

  // Label or size variants — show as text
  const labels = product.variants.map((v) => v.label || v.size).filter(Boolean);
  return { type: 'text', text: labels.join(', ') };
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => p.name?.toLowerCase().includes(query));
  }, [products, search]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "products", deleteTarget.id));
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-outfit text-2xl font-bold text-gray-900 dark:text-white">
          Products
        </h2>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/admin/products/new")}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </motion.button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 md:max-w-md"
          style={{ fontSize: "16px" }}
        />
      </div>

      {loading ? (
        <ProductListSkeleton />
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center shadow-sm dark:bg-gray-900"
        >
          <Package className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
          <h3 className="font-outfit text-lg font-semibold text-gray-900 dark:text-white">
            {search ? "No products match your search" : "No products yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search ? "Try a different search term" : "Add your first product to get started"}
          </p>
          {!search && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/products/new")}
              className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Add New Product
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {filteredProducts.map((product) => {
            const categoryLabel = product.categoryName || product.category || "General";
            const priceDisplay = getPriceDisplay(product);
            const variantSummary = getVariantSummary(product);

            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                className="rounded-2xl border border-transparent bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
              >
                {/* TOP ROW — image + info */}
                <div className="flex items-start gap-3">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600">
                      <Shirt className="h-6 w-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </p>

                    {/* Category + variant summary */}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {categoryLabel}
                      </span>

                      {/* Color swatches */}
                      {variantSummary?.type === 'colors' && (
                        <div className="flex items-center gap-1">
                          {variantSummary.variants
                            .filter((v, i, arr) => arr.findIndex((x) => x.colorHex === v.colorHex) === i)
                            .slice(0, 6)
                            .map((v) => (
                              <div
                                key={v.colorHex}
                                className="h-3.5 w-3.5 rounded-full border border-gray-200"
                                style={{ backgroundColor: v.colorHex }}
                                title={v.color}
                              />
                            ))}
                        </div>
                      )}

                      {/* Text variant summary */}
                      {variantSummary?.type === 'text' && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {variantSummary.text}
                        </span>
                      )}
                    </div>

                    {/* Price display */}
                    <div className="mt-1 flex items-center gap-2">
                      {priceDisplay.type === 'range' ? (
                        <span className={`text-sm font-semibold ${priceDisplay.hasOffer ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>
                          {priceDisplay.range}
                        </span>
                      ) : priceDisplay.hasOffer ? (
                        <>
                          <span className="text-sm text-gray-400 line-through dark:text-gray-500">
                            ₹{priceDisplay.price}
                          </span>
                          <span className="text-sm font-semibold text-primary">
                            ₹{priceDisplay.offerPrice}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {priceDisplay.price != null ? `₹${priceDisplay.price}` : '—'}
                        </span>
                      )}

                      {/* Variant count badge */}
                      {product.variants?.length > 0 && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ROW — badges + actions */}
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                  <div className="flex flex-wrap items-center gap-2">
                    {product.isFeatured && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        Featured
                      </span>
                    )}
                    {product.inStock !== false ? (
                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        In Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                      className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      aria-label="Edit product"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(product)}
                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Delete product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm "
            >
              <GlassCard className="p-6">

              <h3 className="font-outfit text-lg font-bold text-gray-900 dark:text-white">
                Delete Product?
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {deleteTarget.name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-70"
                  >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
                  </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}