import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useStoreSettings } from "../../contexts/SettingsContext";
import { openWhatsApp } from "../../utils/whatsapp";
import { useCheckout } from "../../hooks/useCheckout";

const inputClass =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-dark)] border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]";

export default function Checkout() {
  const navigate = useNavigate();
  const { pendingOrder, clearOrder, savedAddressValues, saveAddressValues } = useCheckout();
  const { settings } = useStoreSettings();

  const fields = settings?.addressFormFields || [];
  const storeName = settings?.storeName || "your store";
  const whatsappNumber = settings?.whatsappNumber || "";

  // Pre-fill from any values saved earlier in this visit
  const [values, setValues] = useState(savedAddressValues || {});

  // If there's no pending order (e.g. user refreshed this page directly),
  // there's nothing to check out — send them back.
  useEffect(() => {
    if (!pendingOrder) {
      navigate("/products", { replace: true });
    }
  }, [pendingOrder, navigate]);

  if (!pendingOrder) return null;

  const { product, selectedVariant } = pendingOrder;
  const price = selectedVariant ? (selectedVariant.offerPrice ?? selectedVariant.price)
    : (product.offerPrice ?? product.price);

  function handleChange(fieldId, value) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Validate required fields
    for (const field of fields) {
      if (field.required && !values[field.id]?.trim()) {
        toast.error(`Please fill in "${field.label}"`);
        return;
      }
    }

    if (!whatsappNumber) {
      toast.error("WhatsApp number is not configured");
      return;
    }

    // Remember these values for the rest of the visit
    saveAddressValues(values);

    // Build address lines for the message
    const addressLines = fields
      .filter((f) => values[f.id]?.trim())
      .map((f) => `*${f.label}:* ${values[f.id].trim()}`);

    openWhatsApp(product, selectedVariant, whatsappNumber, storeName, addressLines);

    clearOrder();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen pb-24 pt-20"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="mx-auto max-w-lg px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="font-outfit text-2xl font-bold text-[var(--text-primary)]">
          Delivery Details
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Fill in your details so {storeName} can deliver your order.
        </p>

        {/* Order summary */}
        <div className="mt-5 flex items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: "var(--card-bg)" }}>
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className="h-14 w-14 rounded-xl object-cover" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[var(--text-primary)]">{product.name}</p>
            {selectedVariant && (
              <p className="text-xs text-[var(--text-secondary)]">
                {[selectedVariant.label, selectedVariant.size, selectedVariant.color].filter(Boolean).join(" / ")}
              </p>
            )}
          </div>
          <p className="font-outfit text-lg font-bold text-[var(--primary-dark)]">₹{price}</p>
        </div>

        {/* Dynamic address form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  rows={3}
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  style={{ fontSize: "16px" }}
                  className={`${inputClass} resize-none`}
                />
              ) : field.type === "dropdown" ? (
                <select
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  style={{ fontSize: "16px" }}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="">Select...</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === "phone" ? "tel" : "text"}
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  style={{ fontSize: "16px" }}
                  className={inputClass}
                />
              )}
            </div>
          ))}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-base font-semibold text-white"
          >
            <MessageCircle className="h-5 w-5" />
            Continue to WhatsApp
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}