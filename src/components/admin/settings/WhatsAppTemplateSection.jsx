import { MessageCircle, Copy, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Section from "./Section";
import Subsection from "./Subsection";
import { inputClass } from "./settingsStyles";

const VARIABLES = [
  "{storeName}",
  "{productName}",
  "{price}",
  "{variant}",
  "{deliveryDetails}",
  "{productLink}",
];

export default function WhatsAppTemplateSection({
  template,
  setTemplate,
  saving,
  handleSaveTemplate,
  restoreDefaultTemplate,
}) {
  async function copyVariable(variable) {
    try {
      await navigator.clipboard.writeText(variable);
      toast.success(`${variable} copied`);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <Section
      title="WhatsApp Message"
      icon={MessageCircle}
      description="Customize the WhatsApp message customers send when ordering."
      defaultOpen={false}
    >
      <Subsection
        title="Message Template"
        description="Use variables to insert product and customer information automatically."
        defaultOpen={true}
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              WhatsApp Message Template
            </label>

            <textarea
              rows={16}
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              style={{ fontSize: "16px" }}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Available Variables
            </p>

            <div className="flex flex-wrap gap-2">
              {VARIABLES.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => copyVariable(variable)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm transition-colors hover:border-[var(--primary-dark)] hover:text-[var(--primary-dark)] dark:border-gray-700 dark:bg-gray-900"
                >
                  <Copy className="h-4 w-4" />
                  {variable}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Click any variable to copy it into your template.
            </p>
          </div>

          <div className="rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Preview Variables
            </p>

            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
              <p>
                <strong>{"{storeName}"}</strong> → Demo Store
              </p>

              <p>
                <strong>{"{productName}"}</strong> → Nike Air Max
              </p>

              <p>
                <strong>{"{price}"}</strong> → ₹999
              </p>

              <p>
                <strong>{"{variant}"}</strong> → Size: L / Color: Black
              </p>

              <p>
                <strong>{"{deliveryDetails}"}</strong> → Customer Address
              </p>

              <p>
                <strong>{"{productLink}"}</strong> → https://yourstore.com/product/123
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={restoreDefaultTemplate}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:border-[var(--primary-dark)] hover:text-[var(--primary-dark)] dark:border-gray-700 dark:text-gray-300"
            >
              <RotateCcw className="h-4 w-4" />
              Restore Default
            </button>

            <motion.button
              type="button"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveTemplate}
              className="flex-1 rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Template"}
            </motion.button>
          </div>
        </div>
      </Subsection>
    </Section>
  );
}