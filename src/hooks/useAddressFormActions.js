import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase/firebase";

// Generates a short unique id for a new field
function genFieldId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function useAddressFormActions(addressFormData) {
  const {
    addressFormEnabled,
    fields,
    setFields,
    setSaving,
  } = addressFormData;

  function addField() {
    setFields((prev) => [
      ...prev,
      { id: genFieldId(), label: "", type: "text", required: true },
    ]);
  }

  function updateField(fieldId, updates) {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
  }

  function removeField(fieldId) {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  }

  function moveField(fieldId, direction) {
    setFields((prev) => {
      const index = prev.findIndex((f) => f.id === fieldId);
      if (index === -1) return prev;
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  }

  async function handleSaveAddressForm(e, toggleValue) {
    e.preventDefault();

    // Validate: every field needs a label
    const emptyLabel = fields.find((f) => !f.label.trim());
    if (toggleValue && emptyLabel) {
      toast.error("Every field needs a label");
      return;
    }

    setSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "main"),
        {
          addressFormEnabled: toggleValue,
          addressFormFields: fields.map((f) => ({
            id: f.id,
            label: f.label.trim(),
            type: f.type,
            required: f.required,
          })),
        },
        { merge: true }
      );
      toast.success("Order form settings saved");
    } catch {
      toast.error("Failed to save order form settings");
    } finally {
      setSaving(false);
    }
  }

  return {
    addField,
    updateField,
    removeField,
    moveField,
    handleSaveAddressForm,
  };
}