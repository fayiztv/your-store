import { ClipboardList, ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Section from "./Section";
import { inputClass } from "./settingsStyles";

const FIELD_TYPES = [
  { value: "text", label: "Short Text" },
  { value: "textarea", label: "Long Text" },
  { value: "phone", label: "Phone Number" },
];

export default function AddressFormSection({
  addressFormEnabled,
  setAddressFormEnabled,
  fields,
  saving,
  addField,
  updateField,
  removeField,
  moveField,
  handleSaveAddressForm,
}) {
  return (
    <Section
      title="Order Form"
      icon={ClipboardList}
      description="Collect a delivery address from customers before they order on WhatsApp."
      defaultOpen={false}
    >
      <form onSubmit={(e) => handleSaveAddressForm(e, addressFormEnabled)} className="space-y-5">

        {/* Enable toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setAddressFormEnabled((p) => !p)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              addressFormEnabled ? "bg-[var(--primary-dark)]" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                addressFormEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ask delivery address before order
          </span>
        </label>

        {addressFormEnabled && (
          <div className="space-y-4 pl-1">
            <p className="text-xs text-gray-400">
              Customers will fill these fields before being sent to WhatsApp.
              Mark a field "Required" to make it mandatory — otherwise the customer can leave it blank.
            </p>

            {fields.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400 dark:border-gray-700">
                No fields added yet. Add fields like "Full Name", "House Name / Door No.", "City", "Pincode", "Phone Number".
              </div>
            )}

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-gray-200 p-3 dark:border-gray-700 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      style={{ fontSize: "16px" }}
                      className={`${inputClass} flex-1`}
                      placeholder="Field label, e.g. House Name / Door No."
                    />

                    
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value })}
                      style={{ fontSize: "16px" }}
                      className={`${inputClass} w-auto cursor-pointer`}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="h-4 w-4 rounded accent-[var(--primary-dark)]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Required</span>
                    </label>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveField(field.id, "up")}
                        disabled={index === 0}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(field.id, "down")}
                        disabled={index === fields.length - 1}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeField(field.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Remove field"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addField}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-[var(--primary-dark)] hover:text-[var(--primary-dark)] dark:border-gray-700 dark:text-gray-400"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save Order Form Settings"}
        </motion.button>
      </form>
    </Section>
  );
}