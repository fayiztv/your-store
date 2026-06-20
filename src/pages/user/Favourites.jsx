import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import ProductCard from "../../components/user/ProductCard";
import { useEffect, useState } from "react";
import { containerVariantsFavorites } from "../../utils/constents";
import { useFavourites } from "../../hooks/useFavorites";
import { SectionHeading } from "../../components/common/sectionHeading";

export default function Favourites() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const navigate = useNavigate();
  const { favourites, clearAllFavourites } = useFavourites();

  function handleClearAll() {
    if (favourites.length === 0) return;
    if (window.confirm("Remove all items from your favourites?")) {
      clearAllFavourites();
      toast.success("Favourites cleared");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pb-16 pt-20"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <SectionHeading>My Favourites</SectionHeading>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {favourites.length} {favourites.length === 1 ? "item" : "items"}
            </p>
          </div>

          {favourites.length > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearAll}
              className="shrink-0 text-sm font-medium text-red-500 transition-colors hover:text-red-600"
            >
              Clear All
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {favourites.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center rounded-2xl py-24 text-center shadow-md"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <Heart
                className="mb-4 h-16 w-16 text-[var(--text-secondary)]"
                strokeWidth={1.2}
              />
              <h2 className="font-outfit text-xl font-bold text-[var(--text-primary)]">
                No favourites yet
              </h2>
              <p className="mt-2 max-w-xs text-sm text-[var(--text-secondary)]">
                Save products you love and find them here
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/products")}
                className="mt-8 rounded-xl bg-[var(--primary-dark)] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-primary/30 transition-colors"
              >
                Browse Products
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={containerVariantsFavorites}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-3"
            >
              {favourites.map((product) => (
                // <ProductCard key={product.id} product={product} layout="vertical" />
                <ProductCard
                  key={product.id}
                  product={product}
                  layout={isMobile ? "horizontal" : "vertical"}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
