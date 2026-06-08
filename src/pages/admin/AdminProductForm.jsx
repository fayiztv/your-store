import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ImagePlus, Star, X } from "lucide-react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase/firebase";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import useCategories from "../../hooks/useCategories";
import { AdminProductFormToggle } from "../../components/admin/AdminProductFormToggle";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);
  const { categories } = useCategories();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState([]);
  const [fetching, setFetching] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!isEdit) return;

    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) {
          toast.error("Product not found");
          navigate("/admin/products");
          return;
        }

        const data = snap.data();
        setName(data.name || "");
        setDescription(data.description || "");
        setPrice(data.price != null ? String(data.price) : "");
        setOfferPrice(data.offerPrice != null ? String(data.offerPrice) : "");
        setCategoryId(data.categoryId || "");
        setCategoryName(data.categoryName || "");
        setSizes(data.sizes || []);
        setInStock(data.inStock !== false);
        setIsFeatured(data.isFeatured === true);
        setImages(
          (data.images || []).map((url) => ({
            url,
            preview: url,
            file: null,
          }))
        );
      } catch {
        toast.error("Failed to load product");
        navigate("/admin/products");
      } finally {
        setFetching(false);
      }
    }

    fetchProduct();
  }, [id, isEdit, navigate]);

  function handleCategoryChange(e) {
    const selectedId = e.target.value;
    setCategoryId(selectedId);
    const cat = categories.find((c) => c.id === selectedId);
    setCategoryName(cat?.name || "");
  }

  function addSize(value) {
    const trimmed = value.trim().replace(/,/g, "");
    if (!trimmed || sizes.includes(trimmed)) return;
    setSizes((prev) => [...prev, trimmed]);
  }

  function handleSizeKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSize(sizeInput);
      setSizeInput("");
    }
  }

  function handleSizeBlur() {
    if (sizeInput.trim()) {
      addSize(sizeInput);
      setSizeInput("");
    }
  }

  function removeSize(size) {
    setSizes((prev) => prev.filter((s) => s !== size));
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - images.length;

    if (remaining <= 0) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    if (files.length > remaining) {
      toast.error("Maximum 4 images allowed");
    }

    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      url: null,
    }));

    setImages((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  }

  function removeImage(index) {
    setImages((prev) => {
      const item = prev[index];
      if (item?.preview && item?.file) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }

    setSaving(true);
    setUploading(true);
    setUploadProgress(0);

    try {
      const imageUrls = [];
      const newFiles = images.filter((img) => img.file);
      // const existingUrls = images.filter((img) => img.url && !img.file);

      // Add existing URLs first (keeping their order)
      for (const img of images) {
        if (img.url && !img.file) {
          imageUrls.push(img.url);
        } else if (img.file) {
          // Upload new files to Cloudinary
          const url = await uploadImageToCloudinary(img.file, (progress) => {
            // Calculate overall progress across all new files
            const fileIndex = newFiles.findIndex((f) => f.file === img.file);
            const baseProgress = (fileIndex / newFiles.length) * 100;
            const fileProgress = progress / newFiles.length;
            setUploadProgress(baseProgress + fileProgress);
          });
          imageUrls.push(url);
        }
      }

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        categoryId,
        categoryName,
        sizes,
        inStock,
        isFeatured,
        images: imageUrls,
      };

      if (isEdit) {
        await updateDoc(doc(db, "products", id), productData);
        toast.success("Product updated");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast.success("Product added");
      }

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
      setUploading(false);
      setUploadProgress(0);
    }
  }

  const isBusy = saving || uploading || fetching;

  if (fetching) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="h-8 w-1/3 rounded-lg skeleton-shimmer" />
        <div className="h-10 w-full rounded-xl skeleton-shimmer" />
        <div className="h-24 w-full rounded-xl skeleton-shimmer" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 rounded-xl skeleton-shimmer" />
          <div className="h-10 rounded-xl skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={handleSave}
      className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
    >
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h2 className="font-outfit text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>
      </div>

      <section className="space-y-4">
        <h3 className="font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">
          Basic Info
        </h3>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ fontSize: '16px' }}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            placeholder="e.g. Classic Oxford Shirt"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ fontSize: '16px' }}
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            placeholder="Describe the product..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={{ fontSize: '16px' }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Offer Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              style={{ fontSize: '16px' }}
              placeholder="Leave empty for no discount"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={categoryId}
            onChange={handleCategoryChange}
            style={{ fontSize: '16px' }}
            className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <AdminProductFormToggle enabled={inStock} onChange={setInStock} label="In Stock" />
          <AdminProductFormToggle
            enabled={isFeatured}
            onChange={setIsFeatured}
            label="Featured"
            icon={Star}
          />
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <div>
          <h3 className="font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">
            Available Sizes
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Leave empty if product has only one size
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <span
              key={size}
              className="flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
            >
              {size}
              <button
                type="button"
                onClick={() => removeSize(size)}
                className="rounded-full p-0.5 hover:bg-blue-100"
                aria-label={`Remove size ${size}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <input
          type="text"
          value={sizeInput}
          onChange={(e) => setSizeInput(e.target.value.toUpperCase())}
          onKeyDown={handleSizeKeyDown}
          onBlur={handleSizeBlur}
          style={{ fontSize: '16px' }}
          placeholder="e.g. S, M, L, XL or 28, 30, 32"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
      </section>

      <section className="mt-8 space-y-3">
        <h3 className="font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">
          Images
        </h3>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= 4}
          className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <ImagePlus className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Click to upload images
          </p>
          <p className="mt-1 text-xs text-gray-400">Up to 4 images • Stored on Cloudinary</p>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handleFileSelect}
        />

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {images.map((img, index) => (
              <div key={`${img.preview}-${index}`} className="relative">
                <img
                  src={img.preview || img.url}
                  alt={`Preview ${index + 1}`}
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {uploading && uploadProgress > 0 && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="mt-1 text-center text-xs text-gray-500">
            Uploading to Cloudinary... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      <motion.button
        type="submit"
        disabled={isBusy}
        whileHover={!isBusy ? { scale: 1.02 } : {}}
        whileTap={!isBusy ? { scale: 0.98 } : {}}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving || uploading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving...
          </>
        ) : (
          "Save Product"
        )}
      </motion.button>
    </motion.form>
  );
}