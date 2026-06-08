import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Heart, MessageCircle } from "lucide-react";
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
import { useFavourites } from "../../contexts/FavouritesContext";
import { openWhatsApp } from "../../utils/whatsapp";
import { ProductDetailSkeleton } from "../../components/common/ProductDetailSkeleton";
import { containerVariantsProductDetails } from "../../utils/constents";

export default function ProductDetail() {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isMobile] = useState(window.innerWidth < 768);

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
        const [productSnap, settingsSnap] = await Promise.all([
          getDoc(doc(db, "products", productId)),
          getDoc(doc(db, "settings", "main")),
        ]);

        if (cancelled) return;

        if (!productSnap.exists()) {
          setProduct(null);
          setError("Product not found");
          setLoading(false);
          return;
        }

        const productData = { id: productSnap.id, ...productSnap.data() };
        setProduct(productData);

        if (settingsSnap.exists()) {
          setWhatsappNumber(settingsSnap.data().whatsappNumber || "");
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

  const favourited = product ? isFavourite(product.id) : false;
  const hasOffer = product?.offerPrice != null && product.offerPrice > 0;
  const hasSizes = product?.sizes?.length > 0;
  const categoryLabel = product?.categoryName || product?.category || "General";

  function handleWhatsApp() {
    if (!product) return;

    if (hasSizes && !selectedSize) {
      toast.error("Please select a size first");
      return;
    }

    if (!whatsappNumber) {
      toast.error("WhatsApp number is not configured");
      return;
    }

    openWhatsApp(product, selectedSize, whatsappNumber);
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
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/30"
            >
              <ChevronLeft className="h-4 w-4" />
              Go Back
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
                  className="mb-4 flex w-fit items-center gap-1 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <span className="mb-3 w-fit rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {categoryLabel}
                </span>

                <h1 className="font-outfit text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
                  {product.name}
                </h1>

                <div className="mt-4 flex flex-wrap items-end gap-3">
                  {hasOffer ? (
                    <>
                      <span className="text-base text-[var(--text-secondary)] line-through">
                        ₹{product.price}
                      </span>
                      <span className="font-outfit text-3xl font-bold text-primary">
                        ₹{product.offerPrice}
                      </span>
                      <span className="rounded-full bg-green-500/20 px-2.5 py-1 text-xs font-semibold text-green-400">
                        You save ₹{product.price - product.offerPrice}
                      </span>
                    </>
                  ) : (
                    <span className="font-outfit text-3xl font-bold text-[var(--text-primary)]">
                      ₹{product.price ?? "—"}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {product.inStock !== false ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      Out of Stock
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {product.description}
                  </p>
                )}

                {hasSizes && (
                  <div className="mt-6">
                    <p className="font-medium text-[var(--text-primary)]">
                      Select Size
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <motion.button
                          key={size}
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSize(size)}
                          className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                            selectedSize === size
                              ? "border-primary bg-primary text-white"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-primary"
                          }`}
                        >
                          {size}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 hidden flex-col gap-3 md:flex">
                  <motion.button
                    type="button"
                    whileHover={
                      product.inStock !== false ? { scale: 1.02 } : {}
                    }
                    whileTap={product.inStock !== false ? { scale: 0.98 } : {}}
                    disabled={product.inStock === false}
                    onClick={handleWhatsApp}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white transition-colors ${
                      product.inStock === false
                        ? "cursor-not-allowed bg-gray-300"
                        : "bg-[#25D366] hover:bg-[#20bd5a]"
                    }`}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {product.inStock === false
                      ? "Out of Stock"
                      : "Order on WhatsApp"}
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFavouriteToggle}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-[var(--surface)] py-4 text-base font-semibold text-primary transition-colors hover:bg-primary/5"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favourited ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                    {favourited
                      ? "Remove from Favourites"
                      : "Add to Favourites"}
                  </motion.button>
                </div>
              </div>
            </div>

            <div
              className="fixed left-0 right-0 z-40 flex flex-col gap-2 border-t p-4 backdrop-blur-md md:hidden"
              style={{
                bottom: "calc(4rem + env(safe-area-inset-bottom))",
                backgroundColor: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <motion.button
                type="button"
                whileHover={product.inStock !== false ? { scale: 1.02 } : {}}
                whileTap={product.inStock !== false ? { scale: 0.98 } : {}}
                disabled={product.inStock === false}
                onClick={handleWhatsApp}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white ${
                  product.inStock === false
                    ? "cursor-not-allowed bg-gray-300"
                    : "bg-[#25D366]"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                {product.inStock === false
                  ? "Out of Stock"
                  : "Order on WhatsApp"}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFavouriteToggle}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary bg-[var(--surface)] py-3.5 text-base font-semibold text-primary"
              >
                <Heart
                  className={`h-5 w-5 ${
                    favourited ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {favourited ? "Remove from Favourites" : "Add to Favourites"}
              </motion.button>
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
