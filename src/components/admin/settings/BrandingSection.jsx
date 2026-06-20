import { FolderPen, Globe, ImagePlus, MapPin, Palette, X } from "lucide-react";
import Section from "./Section";
import Subsection from "./Subsection";
import { inputClass, labelClass } from "./settingsStyles";
import { uploadImageToCloudinary } from "../../../utils/cloudinary";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebase";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function BrandingSection({
  storeName,
  setStoreName,
  storeTagline,
  setStoreTagline,
  logoText,
  setLogoText,
  logoUrl,
  logoPreview,
  handleLogoFile,
  handleRemoveLogo,
  logoFileRef,
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
  logoFile,
  setLogoUrl,
  setLogoFile,
  setLogoPreview,
}) {
    
  async function handleSaveSettings(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let finalLogoUrl = logoUrl;

      if (logoFile) {
        finalLogoUrl = await uploadImageToCloudinary(logoFile, () => {});
        setLogoUrl(finalLogoUrl);
        setLogoFile(null);
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }

      await setDoc(
        doc(db, "settings", "main"),
        {
          storeName: storeName.trim(),
          storeTagline: storeTagline.trim(),
          logoText: logoText.trim() || storeName.trim().charAt(0).toUpperCase(),
          logoUrl: finalLogoUrl,
          primaryColor: primaryColor,
          whatsappNumber: whatsappNumber.trim(),
          instagramUrl: instagramUrl.trim(),
          email: email.trim(),
          hasPhysicalStore,
          address: address.trim(),
          mapUrl: mapUrl.trim(),
          openingHours: openingHours.trim(),
          city: city.trim(),
          metaTitle: metaTitle.trim(),
          metaDescription: metaDescription.trim(),
        },
        { merge: true },
      );

      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Section
      title="Branding"
      icon={Palette}
      description="Store name, logo, brand color, contact details, physical store info, and SEO."
      defaultOpen={false}
    >
      <form onSubmit={handleSaveSettings} className="space-y-5">
        {/* ── STORE (subsection) ── */}
        <Subsection
          title="Store configuration"
          icon={FolderPen}
          description="Store logo, Store name, Logo letter if no image, and Store tagline shown to customers, and the Brand color to apply across the app."
        >
          {/* Logo upload */}
          <div>
            <label className={labelClass}>Store Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {logoPreview || logoUrl ? (
                  <img
                    src={logoPreview || logoUrl}
                    alt="Logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-[var(--primary-dark)]">
                    {logoText || storeName.charAt(0) || "Y"}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => logoFileRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-[var(--primary-dark)] hover:text-[var(--primary-dark)] dark:border-gray-600 dark:text-gray-300 transition-colors"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {logoPreview || logoUrl
                      ? "Change Logo"
                      : "Upload Logo Image"}
                  </button>

                  {(logoPreview || logoUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  {logoPreview || logoUrl
                    ? "Remove to fall back to the letter logo below"
                    : "Or use a letter below if no image"}
                </p>
              </div>
            </div>
            <input
              ref={logoFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleLogoFile}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Store Name *</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                style={{ fontSize: "16px" }}
                className={inputClass}
                placeholder="Eg: Your Store"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Logo Letter (if no image)</label>
              <input
                type="text"
                value={logoText}
                onChange={(e) =>
                  setLogoText(e.target.value.toUpperCase().slice(0, 2))
                }
                style={{ fontSize: "16px" }}
                className={inputClass}
                placeholder="Eg: Y or YS"
                maxLength={2}
              />
              <p className="mt-1 text-xs text-gray-400">
                1–2 letters shown in logo box
              </p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Store Tagline</label>
            <input
              type="text"
              value={storeTagline}
              onChange={(e) => setStoreTagline(e.target.value)}
              style={{ fontSize: "16px" }}
              className={inputClass}
              placeholder="Eg: Premium products store"
            />
          </div>

          <div>
            <label className={labelClass}>Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-16 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-600"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ fontSize: "16px" }}
                className={`${inputClass} flex-1`}
                placeholder="#1A8FE3"
              />
            </div>
            <p className="mt-1 text-xs text-gray-400">
              This color will apply instantly across the whole store
            </p>
          </div>
        </Subsection>

        {/* ── CONTACT (subsection) ── */}
        <Subsection
          title="Contact & Social"
          icon={Globe}
          description="WhatsApp number, Instagram link, and store email shown to customers."
        >
          <div>
            <label className={labelClass}>WhatsApp Number</label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              style={{ fontSize: "16px" }}
              className={inputClass}
              placeholder="Eg: 919876543210"
            />
            <p className="mt-1 text-xs text-gray-400">
              Include country code without + (e.g. 91 for India)
            </p>
          </div>
          <div>
            <label className={labelClass}>Instagram URL</label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              style={{ fontSize: "16px" }}
              className={inputClass}
              placeholder="Eg: https://www.instagram.com/yourstore"
            />
          </div>
          <div>
            <label className={labelClass}>Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ fontSize: "16px" }}
              className={inputClass}
              placeholder="Eg: store@email.com"
            />
          </div>
        </Subsection>

        {/* ── PHYSICAL STORE (subsection) ── */}
        <Subsection
          title="Physical Store"
          icon={MapPin}
          description="Address, city, opening hours, and map link for an offline location."
        >
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setHasPhysicalStore((p) => !p)}
              className={`relative h-6 w-11 rounded-full transition-colors ${hasPhysicalStore ? "bg-[var(--primary-dark)]" : "bg-gray-300 dark:bg-gray-600"}`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${hasPhysicalStore ? "translate-x-5" : "translate-x-0.5"}`}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Has physical store / offline location
            </span>
          </label>

          {hasPhysicalStore && (
            <div className="space-y-4 pl-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ fontSize: "16px" }}
                    className={inputClass}
                    placeholder="Eg: Kannur"
                  />
                </div>
                <div>
                  <label className={labelClass}>Opening Hours</label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    style={{ fontSize: "16px" }}
                    className={inputClass}
                    placeholder="Eg: Mon–Sat: 9AM – 9PM"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Full Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ fontSize: "16px" }}
                  className={`${inputClass} resize-none`}
                  placeholder="Eg: MG Road, Kannur, Kerala 670001"
                />
              </div>
              <div>
                <label className={labelClass}>Google Maps URL</label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  style={{ fontSize: "16px" }}
                  className={inputClass}
                  placeholder="Eg: https://maps.google.com/..."
                />
                <p className="mt-1 text-xs text-gray-400">
                  Address in footer will link to this map
                </p>
              </div>
            </div>
          )}
        </Subsection>

        {/* ── SEO (subsection) ── */}
        <Subsection
          title="SEO"
          description="Browser tab title and the description shown in Google search results."
        >
          <div>
            <label className={labelClass}>Page Title (browser tab)</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              style={{ fontSize: "16px" }}
              className={inputClass}
              placeholder="My Store Kannur — Premium products"
            />
          </div>
          <div>
            <label className={labelClass}>
              Meta Description (Google preview)
            </label>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              style={{ fontSize: "16px" }}
              className={`${inputClass} resize-none`}
              placeholder="Shop premium products at My Store. Order via WhatsApp."
            />
            <p
              className={`mt-1 text-xs ${metaDescription.length > 160 ? "text-red-400" : "text-gray-400"}`}
            >
              {metaDescription.length}/160 characters
            </p>
          </div>
        </Subsection>

        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save All Settings"}
        </motion.button>
      </form>
    </Section>
  );
}
