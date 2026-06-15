import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ImagePlus, Plus, Star, Trash2, X } from "lucide-react";
import {
  addDoc, collection, doc, getDoc, serverTimestamp, updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../../firebase/firebase";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import useCategories from "../../hooks/useCategories";
import { AdminProductFormToggle } from "../../components/admin/AdminProductFormToggle";

// Generates a simple unique id for variants
function genId() {
  return Math.random().toString(36).slice(2, 8);
}

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);
  const { categories } = useCategories();

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [images, setImages] = useState([]);

  // Pricing mode: 'simple' or 'variants'
  const [pricingMode, setPricingMode] = useState('simple');

  // Simple pricing
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");

  // Variants — each: { id, label, size, color, colorHex, price, offerPrice, inStock }
  const [variants, setVariants] = useState([]);

  // New variant form state
  const [newVariantLabel, setNewVariantLabel] = useState('');
  const [newVariantSize, setNewVariantSize] = useState('');
  const [newVariantColor, setNewVariantColor] = useState('');
  const [newVariantColorHex, setNewVariantColorHex] = useState('#000000');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantOfferPrice, setNewVariantOfferPrice] = useState('');
  const [newVariantInStock, setNewVariantInStock] = useState(true);

  // Variant type: 'label' (simple label like 50ml), 'size', 'color', 'size_color'
  const [variantType, setVariantType] = useState('label');

  const [fetching, setFetching] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!isEdit) return;
    async function fetchProduct() {
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (!snap.exists()) { toast.error("Product not found"); navigate("/admin/products"); return; }
        const data = snap.data();
        setName(data.name || "");
        setDescription(data.description || "");
        setCategoryId(data.categoryId || "");
        setCategoryName(data.categoryName || "");
        setInStock(data.inStock !== false);
        setIsFeatured(data.isFeatured === true);
        setImages((data.images || []).map((url) => ({ url, preview: url, file: null })));

        if (data.variants && data.variants.length > 0) {
          setPricingMode('variants');
          setVariants(data.variants);
          // Detect variant type from first variant
          const first = data.variants[0];
          if (first.size && first.color) setVariantType('size_color');
          else if (first.color) setVariantType('color');
          else if (first.size) setVariantType('size');
          else setVariantType('label');
        } else {
          setPricingMode('simple');
          setPrice(data.price != null ? String(data.price) : "");
          setOfferPrice(data.offerPrice != null ? String(data.offerPrice) : "");
        }
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

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - images.length;
    if (remaining <= 0) { toast.error("Maximum 4 images allowed"); return; }
    const toAdd = files.slice(0, remaining).map((file) => ({
      file, preview: URL.createObjectURL(file), url: null,
    }));
    setImages((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  }

  function removeImage(index) {
    setImages((prev) => {
      const item = prev[index];
      if (item?.preview && item?.file) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function addVariant() {
    if (!newVariantPrice || Number(newVariantPrice) <= 0) {
      toast.error("Variant price is required");
      return;
    }

    // Require at least a label, size, or color
    if (variantType === 'label' && !newVariantLabel.trim()) {
      toast.error("Variant label is required (e.g. 50ml, 100ml)");
      return;
    }
    if ((variantType === 'size' || variantType === 'size_color') && !newVariantSize.trim()) {
      toast.error("Size is required");
      return;
    }
    if ((variantType === 'color' || variantType === 'size_color') && !newVariantColor.trim()) {
      toast.error("Color name is required");
      return;
    }

    const variant = {
      id: genId(),
      label: variantType === 'label' ? newVariantLabel.trim() : null,
      size: (variantType === 'size' || variantType === 'size_color') ? newVariantSize.trim().toUpperCase() : null,
      color: (variantType === 'color' || variantType === 'size_color') ? newVariantColor.trim() : null,
      colorHex: (variantType === 'color' || variantType === 'size_color') ? newVariantColorHex : null,
      price: Number(newVariantPrice),
      offerPrice: newVariantOfferPrice ? Number(newVariantOfferPrice) : null,
      inStock: newVariantInStock,
    };

    setVariants((prev) => [...prev, variant]);

    // Reset form
    setNewVariantLabel('');
    setNewVariantSize('');
    setNewVariantColor('');
    setNewVariantColorHex('#000000');
    setNewVariantPrice('');
    setNewVariantOfferPrice('');
    setNewVariantInStock(true);
  }

  function removeVariant(variantId) {
    setVariants((prev) => prev.filter((v) => v.id !== variantId));
  }

  function toggleVariantStock(variantId) {
    setVariants((prev) =>
      prev.map((v) => v.id === variantId ? { ...v, inStock: !v.inStock } : v)
    );
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!name.trim()) { toast.error("Product name is required"); return; }
    if (!categoryId) { toast.error("Please select a category"); return; }

    if (pricingMode === 'simple') {
      if (!price || Number(price) <= 0) { toast.error("Valid price is required"); return; }
    } else {
      if (variants.length === 0) { toast.error("Add at least one variant"); return; }
    }

    setSaving(true);
    setUploading(true);
    setUploadProgress(0);

    try {
      const imageUrls = [];
      const newFiles = images.filter((img) => img.file);
      for (const img of images) {
        if (img.url && !img.file) {
          imageUrls.push(img.url);
        } else if (img.file) {
          const url = await uploadImageToCloudinary(img.file, (progress) => {
            const fileIndex = newFiles.findIndex((f) => f.file === img.file);
            setUploadProgress((fileIndex / newFiles.length) * 100 + progress / newFiles.length);
          });
          imageUrls.push(url);
        }
      }

      const productData = {
        name: name.trim(),
        description: description.trim(),
        categoryId,
        categoryName,
        inStock,
        isFeatured,
        images: imageUrls,
        // Pricing
        ...(pricingMode === 'simple'
          ? { price: Number(price), offerPrice: offerPrice ? Number(offerPrice) : null, variants: [] }
          : { price: null, offerPrice: null, variants }
        ),
      };

      if (isEdit) {
        await updateDoc(doc(db, "products", id), productData);
        toast.success("Product updated");
      } else {
        await addDoc(collection(db, "products"), { ...productData, createdAt: serverTimestamp() });
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
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      onSubmit={handleSave}
      className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button type="button" onClick={() => navigate("/admin/products")}
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="font-outfit text-xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>
      </div>

      {/* ── BASIC INFO ── */}
      <section className="space-y-4">
        <h3 className="font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">Basic Info</h3>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name <span className="text-red-500">*</span>
          </label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
            style={{ fontSize: '16px' }} className={inputClass} placeholder="e.g. Classic Oxford Shirt" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
            style={{ fontSize: '16px' }} className={`${inputClass} resize-y`} placeholder="Describe the product..." />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category <span className="text-red-500">*</span>
          </label>
          <select required value={categoryId} onChange={handleCategoryChange}
            style={{ fontSize: '16px' }} className={`${inputClass} cursor-pointer`}>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <AdminProductFormToggle enabled={inStock} onChange={setInStock} label="In Stock" />
          <AdminProductFormToggle enabled={isFeatured} onChange={setIsFeatured} label="Featured" icon={Star} />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="mt-8 space-y-4">
        <h3 className="font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">Pricing & Variants</h3>

        {/* Mode toggle */}
        <div className="flex gap-2">
          {['simple', 'variants'].map((mode) => (
            <button
              key={mode} type="button"
              onClick={() => setPricingMode(mode)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                pricingMode === mode
                  ? 'bg-primary text-white'
                  : 'border border-gray-200 text-gray-600 hover:border-primary dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              {mode === 'simple' ? '₹ Simple Price' : '⚙ Variants (sizes / colors)'}
            </button>
          ))}
        </div>

        {pricingMode === 'simple' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                style={{ fontSize: '16px' }} className={inputClass} placeholder="500" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Offer Price (₹)</label>
              <input type="number" min="0" step="0.01" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)}
                style={{ fontSize: '16px' }} className={inputClass} placeholder="Leave empty for no discount" />
            </div>
          </div>
        )}

        {pricingMode === 'variants' && (
          <div className="space-y-4">
            {/* Variant type selector */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Variant Type</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'label', label: 'Custom Label (e.g. 50ml, 100ml)' },
                  { value: 'size', label: 'Size only (S, M, L)' },
                  { value: 'color', label: 'Color only' },
                  { value: 'size_color', label: 'Size + Color' },
                ].map((opt) => (
                  <button key={opt.value} type="button"
                    onClick={() => setVariantType(opt.value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      variantType === opt.value
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-600 hover:border-primary dark:border-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing variants list */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Added Variants</p>
                <AnimatePresence>
                  {variants.map((v) => (
                    <motion.div key={v.id}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                    >
                      {/* Color swatch */}
                      {v.colorHex && (
                        <div className="h-6 w-6 rounded-full border border-gray-200 shrink-0"
                          style={{ backgroundColor: v.colorHex }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {[v.label, v.size, v.color].filter(Boolean).join(' / ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {v.offerPrice
                            ? <><span className="line-through">₹{v.price}</span> ₹{v.offerPrice}</>
                            : `₹${v.price}`
                          }
                          {' · '}
                          <span className={v.inStock ? 'text-green-500' : 'text-red-400'}>
                            {v.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </p>
                      </div>
                      <button type="button" onClick={() => toggleVariantStock(v.id)}
                        className="text-xs text-gray-400 hover:text-primary px-2">
                        Toggle Stock
                      </button>
                      <button type="button" onClick={() => removeVariant(v.id)}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Add variant form */}
            <div className="rounded-xl border border-dashed border-gray-300 p-4 space-y-3 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Add Variant</p>

              {variantType === 'label' && (
                <input type="text" value={newVariantLabel} onChange={(e) => setNewVariantLabel(e.target.value)}
                  style={{ fontSize: '16px' }} className={inputClass} placeholder="e.g. 50ml, 100ml, Large, XL" />
              )}

              {(variantType === 'size' || variantType === 'size_color') && (
                <input type="text" value={newVariantSize} onChange={(e) => setNewVariantSize(e.target.value)}
                  style={{ fontSize: '16px' }} className={inputClass} placeholder="Size (e.g. S, M, L, XL, 28, 30)" />
              )}

              {(variantType === 'color' || variantType === 'size_color') && (
                <div className="flex gap-3 items-center">
                  <input type="color" value={newVariantColorHex} onChange={(e) => setNewVariantColorHex(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-600 shrink-0" />
                  <input type="text" value={newVariantColor} onChange={(e) => setNewVariantColor(e.target.value)}
                    style={{ fontSize: '16px' }} className={`${inputClass} flex-1`} placeholder="Color name (e.g. Red, Navy Blue)" />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Price (₹) *</label>
                  <input type="number" min="0" value={newVariantPrice} onChange={(e) => setNewVariantPrice(e.target.value)}
                    style={{ fontSize: '16px' }} className={inputClass} placeholder="500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Offer Price (₹)</label>
                  <input type="number" min="0" value={newVariantOfferPrice} onChange={(e) => setNewVariantOfferPrice(e.target.value)}
                    style={{ fontSize: '16px' }} className={inputClass} placeholder="Leave empty for no discount" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newVariantInStock} onChange={(e) => setNewVariantInStock(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">In Stock</span>
              </label>

              <motion.button type="button" onClick={addVariant}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary py-2.5 text-sm font-semibold text-primary hover:bg-primary/5">
                <Plus className="h-4 w-4" /> Add Variant
              </motion.button>
            </div>
          </div>
        )}
      </section>

      {/* ── IMAGES ── */}
      <section className="mt-8 space-y-3">
        <h3 className="font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">Images</h3>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={images.length >= 4}
          className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800/50">
          <ImagePlus className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload images</p>
          <p className="mt-1 text-xs text-gray-400">Up to 4 images • Stored on Cloudinary</p>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFileSelect} />

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {images.map((img, index) => (
              <div key={`${img.preview}-${index}`} className="relative">
                <img src={img.preview || img.url} alt={`Preview ${index + 1}`}
                  className="aspect-square w-full rounded-xl object-cover" />
                <button type="button" onClick={() => removeImage(index)}
                  className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
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
            <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="mt-1 text-center text-xs text-gray-500">Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      )}

      <motion.button type="submit" disabled={isBusy}
        whileHover={!isBusy ? { scale: 1.02 } : {}} whileTap={!isBusy ? { scale: 0.98 } : {}}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
        {saving || uploading ? (
          <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving...</>
        ) : "Save Product"}
      </motion.button>
    </motion.form>
  );
}