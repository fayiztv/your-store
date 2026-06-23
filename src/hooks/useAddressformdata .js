import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

export default function useAddressFormData() {
  const [addressFormEnabled, setAddressFormEnabled] = useState(false);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "main"),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setAddressFormEnabled(d.addressFormEnabled || false);
          setFields(d.addressFormFields || []);
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  return {
    addressFormEnabled,
    setAddressFormEnabled,
    fields,
    setFields,
    loading,
    saving,
    setSaving,
  };
}