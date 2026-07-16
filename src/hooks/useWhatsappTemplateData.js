import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { DEFAULT_TEMPLATE } from "../utils/constents";

export default function useWhatsappTemplateData() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "main"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          setTemplate(
            data.whatsappTemplate || DEFAULT_TEMPLATE,
          );
        }

        setLoading(false);
      },
      () => setLoading(false),
    );

    return unsubscribe;
  }, []);

  return {
    template,
    setTemplate,
    saving,
    setSaving,
    loading,
    defaultTemplate: DEFAULT_TEMPLATE,
  };
}