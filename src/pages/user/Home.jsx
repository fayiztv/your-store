import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Shirt, Tag } from "lucide-react";
import { collection, onSnapshot } from "firebase/firestore";
import ProductCard from "../../components/user/ProductCard";
import useProducts from "../../hooks/useProducts";
import useCategories from "../../hooks/useCategories";
import { db } from "../../firebase/firebase";
import {
  cardVariantsHome,
  categoryColors,
  containerVariantsHome,
} from "../../utils/constents";
import { SectionHeading } from "../../components/common/sectionHeading";

const categoryIcons = [Shirt, Tag];

export default function Home() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "banners"), (snap) => {
      setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.isFeatured === true),
    [products],
  );

  const hasBanners = banners.length > 0;

  useEffect(() => {
    if (!hasBanners) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [hasBanners, banners.length]);

  function goToSlide(index) {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  }

  function nextSlide() {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % (hasBanners ? banners.length : 1));
  }

  function prevSlide() {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-8 pt-20"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <section className="relative mb-14 overflow-hidden rounded-2xl">
          {hasBanners ? (
            <div className="relative h-64 md:h-96">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <img
                    src={banners[currentSlide].imageUrl}
                    alt={banners[currentSlide].title || "Banner"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 md:p-10">
                    <h2 className="font-outfit text-3xl font-bold text-white md:text-5xl">
                      {banners[currentSlide].title}
                    </h2>
                    {banners[currentSlide].subtitle && (
                      <p className="mt-2 text-sm text-white/80 md:text-base">
                        {banners[currentSlide].subtitle}
                      </p>
                    )}
                    {banners[currentSlide].ctaText && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          navigate(banners[currentSlide].ctaLink || "/products")
                        }
                        className="mt-4 rounded-xl bg-white px-6 py-2 font-semibold text-gray-900 shadow-lg"
                      >
                        {banners[currentSlide].ctaText}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <button
                type="button"
                onClick={prevSlide}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => goToSlide(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentSlide ? "w-6 bg-white" : "w-2 bg-white/50"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center bg-gradient-to-r from-primary to-primary-dark px-6 text-center md:h-96">
              <h2 className="font-outfit text-3xl font-bold text-white md:text-5xl">
                Welcome to Thread Store
              </h2>
              <p className="mt-2 text-sm text-white/80 md:text-base">
                Premium gents clothing curated for you
              </p>
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/products")}
                className="mt-6 rounded-xl bg-white px-8 py-2.5 font-semibold text-gray-900 shadow-lg"
              >
                Shop Now
              </motion.button>
            </div>
          )}
        </section>

        {categories.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-14"
          >
            <SectionHeading>Shop by Category</SectionHeading>
            <motion.div
              variants={containerVariantsHome}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0"
            >
              {categories.map((cat, index) => {
                const Icon = categoryIcons[index % categoryIcons.length];
                const colorClass =
                  categoryColors[index % categoryColors.length];
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    variants={cardVariantsHome}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/products?category=${cat.id}`)}
                    className="w-28 shrink-0 rounded-2xl border p-4 text-center shadow-sm transition-colors md:w-auto dark:bg-gray-800"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${colorClass}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p
                      className="mt-3 line-clamp-2 text-sm font-medium text-[var(--text-primary)]"
                      title={cat.name}
                    >
                      {cat.name}
                    </p>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.section>
        )}

        {featuredProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <SectionHeading
              action={
                <button
                  type="button"
                  onClick={() => navigate("/products")}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View All →
                </button>
              }
            >
              Featured Picks ✦
            </SectionHeading>
            <div className="hide-scrollbar -mx-2 flex gap-4 overflow-x-auto snap-x snap-mandatory px-4 pb-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-44 shrink-0 snap-start md:w-56"
                >
                  <ProductCard product={product} layout="vertical" />
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </motion.main>
  );
}
