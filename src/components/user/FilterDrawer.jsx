import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import GlassCard from "../common/GlassCard";

export default function FilterDrawer({
  isOpen,
  onOpen,
  onClose,
  categories,
  activeCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  sortBy,
  onSortChange,
  onClear,
}) {
  const categoryPills = [
    "All",
    ...categories.map((c) => c.name).filter(Boolean),
  ];

  return (
    <>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={onOpen}
        className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium md:hidden"
        style={{
          borderColor: "var(--border)",
          color: "var(--text-primary)",
          backgroundColor: "var(--card-bg)",
        }}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => onClose(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-[90] p-4 md:hidden"
            >
              <GlassCard className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-outfit text-lg font-bold text-[var(--text-primary)]">
                    Filters
                  </h3>
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-black/5"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">
                      Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {categoryPills.map((pill) => (
                        <button
                          key={pill}
                          type="button"
                          onClick={() => onCategoryChange(pill)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            activeCategory === pill
                              ? "bg-[var(--primary-dark)] text-white"
                              : "border text-[var(--text-secondary)]"
                          }`}
                          style={
                            activeCategory !== pill
                              ? { borderColor: "var(--border)" }
                              : undefined
                          }
                        >
                          {pill}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={minPrice}
                      onChange={(e) => onMinPriceChange(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={maxPrice}
                      onChange={(e) => onMaxPriceChange(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface)",
                        color: "var(--text-primary)",
                      }}
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-asc">Name: A–Z</option>
                  </select>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClear}
                      className="flex-1 rounded-xl border py-2.5 text-sm font-medium"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => onClose(false)}
                      className="flex-1 rounded-xl bg-[var(--primary-dark)] py-2.5 text-sm font-semibold text-white"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
