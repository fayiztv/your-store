import { ImagePlus, Store, Trash2 } from "lucide-react";
import Section from "./Section";
import { inputClass } from "./settingsStyles";
import { motion } from "framer-motion";

export default function BannerSection({
  banners,
  bannerPreview,
  bannerSaving,
  bannerUploadProgress,
  bannerTitle,
  setBannerTitle,
  bannerSubtitle,
  setBannerSubtitle,
  bannerCtaText,
  setBannerCtaText,
  bannerCtaLink,
  setBannerCtaLink,
  handleAddBanner,
  handleDeleteBanner,
  handleBannerFile,
  bannerFileRef,
}) {
  return (
    <Section
      title="Banner Management"
      icon={Store}
      description="Homepage promotional banners with image, title, and call-to-action button."
      defaultOpen={false}
    >
      {banners.length > 0 && (
        <div className="mb-6 space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="h-16 w-24 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {banner.title}
                </p>
                {banner.subtitle && (
                  <p className="truncate text-xs text-gray-500">
                    {banner.subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDeleteBanner(banner)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAddBanner} className="space-y-4">
        <button
          type="button"
          onClick={() => bannerFileRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-[var(--primary-dark)] dark:border-gray-600"
        >
          {bannerPreview ? (
            <img
              src={bannerPreview}
              alt="Preview"
              className="mx-auto h-32 max-w-full rounded-xl object-cover"
            />
          ) : (
            <>
              <ImagePlus className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Click to upload banner image
              </p>
            </>
          )}
        </button>
        <input
          ref={bannerFileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleBannerFile}
        />

        <input
          type="text"
          value={bannerTitle}
          onChange={(e) => setBannerTitle(e.target.value)}
          style={{ fontSize: "16px" }}
          placeholder="Banner title"
          className={inputClass}
        />
        <input
          type="text"
          value={bannerSubtitle}
          onChange={(e) => setBannerSubtitle(e.target.value)}
          style={{ fontSize: "16px" }}
          placeholder="Banner subtitle (optional)"
          className={inputClass}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            value={bannerCtaText}
            onChange={(e) => setBannerCtaText(e.target.value)}
            style={{ fontSize: "16px" }}
            placeholder="Button text (e.g. Shop Now)"
            className={inputClass}
          />
          <input
            type="text"
            value={bannerCtaLink}
            onChange={(e) => setBannerCtaLink(e.target.value)}
            style={{ fontSize: "16px" }}
            placeholder="Link (e.g. /products)"
            className={inputClass}
          />
        </div>

        {bannerSaving && bannerUploadProgress > 0 && (
          <div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full bg-[var(--primary-dark)] transition-all duration-300"
                style={{ width: `${bannerUploadProgress}%` }}
              />
            </div>
            <p className="mt-1 text-center text-xs text-gray-500">
              Uploading... {Math.round(bannerUploadProgress)}%
            </p>
          </div>
        )}

        <motion.button
          type="submit"
          disabled={bannerSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white disabled:opacity-70"
        >
          {bannerSaving ? "Uploading..." : "Add Banner"}
        </motion.button>
      </form>
    </Section>
  );
}
