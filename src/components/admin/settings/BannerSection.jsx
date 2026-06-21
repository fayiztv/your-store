import { ImagePlus, Pencil, Store, Trash2, X } from "lucide-react";
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
  editingBannerId,
  handleStartEditBanner,
  handleUpdateBanner,
  handleCancelEditBanner,
}) {
  const isEditing = Boolean(editingBannerId);

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
              className={`flex items-center gap-4 rounded-xl border p-3 transition-colors ${
                editingBannerId === banner.id
                  ? "border-[var(--primary-dark)] bg-[var(--primary-dark)]/5"
                  : "border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              }`}
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
                onClick={() => handleStartEditBanner(banner)}
                className="rounded-lg p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                aria-label="Edit banner"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBanner(banner)}
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Delete banner"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={isEditing ? handleUpdateBanner : handleAddBanner}
        className="space-y-4"
      >
        {isEditing && (
          <div className="flex items-center justify-between rounded-xl bg-[var(--primary-dark)]/10 px-4 py-2.5">
            <p className="text-sm font-medium text-[var(--primary-dark)]">
              Editing banner
            </p>
            <button
              type="button"
              onClick={handleCancelEditBanner}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        )}

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
        {isEditing && (
          <p className="text-xs text-gray-400">
            Leave the image as-is, or click above to replace it
          </p>
        )}
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

        <div className="flex gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEditBanner}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          )}
          <motion.button
            type="submit"
            disabled={bannerSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white disabled:opacity-70"
          >
            {bannerSaving
              ? isEditing ? "Updating..." : "Uploading..."
              : isEditing ? "Update Banner" : "Add Banner"}
          </motion.button>
        </div>
      </form>
    </Section>
  );
}