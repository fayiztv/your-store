import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase/firebase";
import { uploadImageToCloudinary } from "../utils/cloudinary";

export default function useSettingsActions(storeSettings) {
  function handleLogoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    storeSettings.setLogoFile(file);
    storeSettings.setLogoPreview(URL.createObjectURL(file));

    e.target.value = "";
  }

  function handleRemoveLogo() {
    if (storeSettings.logoPreview) {
      URL.revokeObjectURL(storeSettings.logoPreview);
    }

    storeSettings.setLogoFile(null);
    storeSettings.setLogoPreview(null);
    storeSettings.setLogoUrl("");
  }

  async function handleSaveSettings(e) {
    e.preventDefault();

    storeSettings.setSaving(true);

    try {
      let finalLogoUrl = storeSettings.logoUrl;

      if (storeSettings.logoFile) {
        finalLogoUrl = await uploadImageToCloudinary(
          storeSettings.logoFile,
          () => {},
        );

        storeSettings.setLogoUrl(finalLogoUrl);
        storeSettings.setLogoFile(null);

        if (storeSettings.logoPreview) {
          URL.revokeObjectURL(storeSettings.logoPreview);
        }

        storeSettings.setLogoPreview(null);
      }

      await setDoc(
        doc(db, "settings", "main"),
        {
          storeName: storeSettings.storeName.trim(),
          storeTagline: storeSettings.storeTagline.trim(),
          logoText:
            storeSettings.logoText.trim() ||
            storeSettings.storeName.trim().charAt(0).toUpperCase(),
          logoUrl: finalLogoUrl,
          primaryColor: storeSettings.primaryColor,
          whatsappNumber: storeSettings.whatsappNumber.trim(),
          instagramUrl: storeSettings.instagramUrl.trim(),
          email: storeSettings.email.trim(),
          hasPhysicalStore: storeSettings.hasPhysicalStore,
          address: storeSettings.address.trim(),
          mapUrl: storeSettings.mapUrl.trim(),
          openingHours: storeSettings.openingHours.trim(),
          city: storeSettings.city.trim(),
          metaTitle: storeSettings.metaTitle.trim(),
          metaDescription: storeSettings.metaDescription.trim(),
          developerCreditEnabled: storeSettings.developerCreditEnabled,
        },
        { merge: true },
      );

      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      storeSettings.setSaving(false);
    }
  }

  return {
    handleLogoFile,
    handleRemoveLogo,
    handleSaveSettings,
  };
}
