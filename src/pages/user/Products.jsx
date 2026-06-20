import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag, Search } from "lucide-react";
import FilterDrawer from "../../components/user/FilterDrawer";
import ProductCard from "../../components/user/ProductCard";
import useProducts from "../../hooks/useProducts";
import useCategories from "../../hooks/useCategories";
import { containerVariantsProducts, PER_PAGE } from "../../utils/constents";
import {
  getCreatedTime,
  getEffectivePrice,
  getPageNumbers,
  productMatchesCategory,
} from "../../utils/helpers";
import { ProductGridSkeleton } from "../../components/user/ProductGridSkeleton";
import { SectionHeading } from "../../components/common/sectionHeading";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const { categories } = useCategories();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [gridKey, setGridKey] = useState(0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "All";

  const activeCategory = useMemo(() => {
    if (categoryParam === "All") return "All";
    const cat = categories.find((c) => c.id === categoryParam);
    return cat?.name || "All";
  }, [categoryParam, categories]);

  useEffect(() => {
    setCurrentPage(1);
    setGridKey((k) => k + 1);
  }, [searchQuery, categoryParam, minPrice, maxPrice, sortBy]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query),
      );
    }

    if (categoryParam && categoryParam !== "All") {
      result = result.filter((p) =>
        productMatchesCategory(p, categoryParam, categories),
      );
    }

    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;

    if (min != null && !Number.isNaN(min)) {
      result = result.filter((p) => getEffectivePrice(p) >= min);
    }
    if (max != null && !Number.isNaN(max)) {
      result = result.filter((p) => getEffectivePrice(p) <= max);
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case "price-high":
        result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        result.sort((a, b) => getCreatedTime(b) - getCreatedTime(a));
        break;
    }

    return result;
  }, [
    products,
    searchQuery,
    categoryParam,
    categories,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

  const categoryPills = [
    "All",
    ...categories.map((c) => c.name).filter(Boolean),
  ];

  function setCategoryByName(name) {
    if (name === "All") {
      const params = new URLSearchParams(searchParams);
      params.delete("category");
      setSearchParams(params);
      return;
    }
    const cat = categories.find((c) => c.name === name);
    if (cat) {
      const params = new URLSearchParams(searchParams);
      params.set("category", cat.id);
      setSearchParams(params);
    }
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    setSearchParams(params);
  }

  function goToPage(page) {
    setCurrentPage(page);
    setGridKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-12 pt-20"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
              <SectionHeading>All Products</SectionHeading>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
          <FilterDrawer
            isOpen={filterOpen}
            onOpen={() => setFilterOpen(true)}
            onClose={() => setFilterOpen(false)}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setCategoryByName}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClear={clearFilters}
          />
        </div>

        {/* Mobile search bar */}
        <div className="relative mb-4 md:hidden">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) params.set("search", e.target.value);
              else params.delete("search");
              setSearchParams(params);
            }}
            placeholder="Search products..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 md:max-w-md"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-primary)",
              fontSize: "16px",
            }}
          />
        </div>

        <div className="hide-scrollbar mb-8 hidden flex-nowrap items-center gap-3 overflow-x-auto pb-2 md:flex md:flex-wrap">
          <div className="flex shrink-0 gap-2">
            {categoryPills.map((pill) => (
              <motion.button
                key={pill}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategoryByName(pill)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === pill
                    ? "bg-[var(--primary-dark)] text-white shadow-md shadow-primary/25"
                    : "border text-[var(--text-secondary)] hover:border-primary/30 hover:text-[var(--primary-dark)]"
                }`}
                style={
                  activeCategory !== pill
                    ? {
                        borderColor: "var(--border)",
                        backgroundColor: "var(--card-bg)",
                      }
                    : undefined
                }
              >
                {pill}
              </motion.button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-primary)",
              }}
            />
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 rounded-xl border px-3 py-2 text-sm outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="shrink-0 cursor-pointer rounded-xl border px-3 py-2 text-sm font-medium outline-none"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card-bg)",
              color: "var(--text-primary)",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-asc">Name: A–Z</option>
          </select>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl py-20 text-center shadow-md"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/5">
              <ShoppingBag className="h-8 w-8 text-[var(--text-secondary)]" />
            </div>
            <h3 className="font-outfit text-xl font-bold text-[var(--text-primary)]">
              No products found
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Try adjusting your filters
            </p>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-[var(--primary-dark)] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={gridKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                variants={containerVariantsProducts}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-3"
              >
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout={isMobile ? "horizontal" : "vertical"}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  Previous
                </motion.button>

                {getPageNumbers(currentPage, totalPages).map((page) => (
                  <motion.button
                    key={page}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goToPage(page)}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "border-[var(--primary-dark)] bg-[var(--primary-dark)] text-white"
                        : ""
                    }`}
                    style={
                      page !== currentPage
                        ? {
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                            backgroundColor: "var(--card-bg)",
                          }
                        : undefined
                    }
                  >
                    {page}
                  </motion.button>
                ))}

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  Next
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.main>
  );
}
