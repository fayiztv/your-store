import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase/firebase";

export default function useWhatsappTemplateActions(
  whatsappTemplateData,
) {
  async function handleSaveTemplate() {
    whatsappTemplateData.setSaving(true);

    try {
      await setDoc(
        doc(db, "settings", "main"),
        {
          whatsappTemplate:
            whatsappTemplateData.template.trim(),
        },
        { merge: true },
      );

      toast.success("WhatsApp template saved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save template");
    } finally {
      whatsappTemplateData.setSaving(false);
    }
  }

  function restoreDefaultTemplate() {
    whatsappTemplateData.setTemplate(
      whatsappTemplateData.defaultTemplate,
    );

    toast.success("Default template restored");
  }

  return {
    handleSaveTemplate,
    restoreDefaultTemplate,
  };
}