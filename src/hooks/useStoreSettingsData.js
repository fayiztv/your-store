import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

export default function useStoreSettingsData() {
  // Store info
  const [storeName, setStoreName] = useState("");
  const [storeTagline, setStoreTagline] = useState("");
  const [logoText, setLogoText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#1A8FE3");

  // Contact
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [email, setEmail] = useState("");

  // Physical store
  const [hasPhysicalStore, setHasPhysicalStore] = useState(false);
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [openingHours, setOpeningHours] = useState("Mon–Sat: 9AM – 9PM");
  const [city, setCity] = useState("");

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "main"),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setStoreName(d.storeName || "");
          setStoreTagline(d.storeTagline || "");
          setLogoText(d.logoText || "");
          setLogoUrl(d.logoUrl || "");
          setPrimaryColor(d.primaryColor || "#1A8FE3");
          setWhatsappNumber(d.whatsappNumber || "");
          setInstagramUrl(d.instagramUrl || "");
          setEmail(d.email || "");
          setHasPhysicalStore(d.hasPhysicalStore || false);
          setAddress(d.address || "");
          setMapUrl(d.mapUrl || "");
          setOpeningHours(d.openingHours || "");
          setCity(d.city || "");
          setMetaTitle(d.metaTitle || "");
          setMetaDescription(d.metaDescription || "");
        }
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsubscribe;
  }, []);

  return {
    storeName,
    setStoreName,
    storeTagline,
    setStoreTagline,
    logoText,
    setLogoText,
    logoUrl,
    setLogoUrl,
    logoFile,
    setLogoFile,
    logoPreview,
    setLogoPreview,
    primaryColor,
    setPrimaryColor,
    whatsappNumber,
    setWhatsappNumber,
    instagramUrl,
    setInstagramUrl,
    email,
    setEmail,
    hasPhysicalStore,
    setHasPhysicalStore,
    address,
    setAddress,
    mapUrl,
    setMapUrl,
    openingHours,
    setOpeningHours,
    city,
    setCity,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    saving,
    setSaving,
    loading,
    setLoading,
  };
}
