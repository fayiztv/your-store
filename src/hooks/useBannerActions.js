import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import toast from "react-hot-toast";
import { db } from "../firebase/firebase";
import { uploadBannerToCloudinary } from "../utils/cloudinary";

export default function useBannerActions(bannerData) {
  function handleBannerFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    bannerData.setBannerFile(file);
    bannerData.setBannerPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function resetBannerForm() {
    bannerData.setBannerTitle("");
    bannerData.setBannerSubtitle("");
    bannerData.setBannerCtaText("");
    bannerData.setBannerCtaLink("/products");
    bannerData.setBannerFile(null);
    if (bannerData.bannerPreview) URL.revokeObjectURL(bannerData.bannerPreview);
    bannerData.setBannerPreview(null);
    bannerData.setBannerUploadProgress(0);
    bannerData.setEditingBannerId(null);
  }

  async function handleAddBanner(e) {
    e.preventDefault();
    if (!bannerData.bannerFile) {
      toast.error("Please select a banner image");
      return;
    }
    bannerData.setBannerSaving(true);
    bannerData.setBannerUploadProgress(0);
    try {
      const imageUrl = await uploadBannerToCloudinary(
        bannerData.bannerFile,
        (p) => bannerData.setBannerUploadProgress(p),
      );
      await addDoc(collection(db, "banners"), {
        imageUrl,
        title: bannerData.bannerTitle.trim(),
        subtitle: bannerData.bannerSubtitle.trim(),
        ctaText: bannerData.bannerCtaText.trim(),
        ctaLink: bannerData.bannerCtaLink.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success("Banner added");
      resetBannerForm();
    } catch {
      toast.error("Failed to add banner");
    } finally {
      bannerData.setBannerSaving(false);
    }
  }

  // Loads an existing banner's data into the form for editing.
  // Image stays as the existing imageUrl (preview shows it) unless a new file is chosen.
  function handleStartEditBanner(banner) {
    bannerData.setEditingBannerId(banner.id);
    bannerData.setBannerTitle(banner.title || "");
    bannerData.setBannerSubtitle(banner.subtitle || "");
    bannerData.setBannerCtaText(banner.ctaText || "");
    bannerData.setBannerCtaLink(banner.ctaLink || "/products");
    bannerData.setBannerFile(null);
    // Show the existing image as the preview (no new upload needed unless changed)
    bannerData.setBannerPreview(banner.imageUrl || null);
  }

  function handleCancelEditBanner() {
    resetBannerForm();
  }

  // Updates an existing banner. Only uploads a new image to Cloudinary
  // if the admin picked a new file; otherwise keeps the existing imageUrl.
  async function handleUpdateBanner(e) {
    e.preventDefault();
    const bannerId = bannerData.editingBannerId;
    if (!bannerId) return;

    const existingBanner = bannerData.banners.find((b) => b.id === bannerId);

    bannerData.setBannerSaving(true);
    bannerData.setBannerUploadProgress(0);
    try {
      let imageUrl = existingBanner?.imageUrl || "";

      if (bannerData.bannerFile) {
        imageUrl = await uploadBannerToCloudinary(
          bannerData.bannerFile,
          (p) => bannerData.setBannerUploadProgress(p),
        );
      }

      await updateDoc(doc(db, "banners", bannerId), {
        imageUrl,
        title: bannerData.bannerTitle.trim(),
        subtitle: bannerData.bannerSubtitle.trim(),
        ctaText: bannerData.bannerCtaText.trim(),
        ctaLink: bannerData.bannerCtaLink.trim(),
      });

      toast.success("Banner updated");
      resetBannerForm();
    } catch {
      toast.error("Failed to update banner");
    } finally {
      bannerData.setBannerSaving(false);
    }
  }

  async function handleDeleteBanner(banner) {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", banner.id));
      toast.success("Banner deleted");
      // If the deleted banner was being edited, reset the form
      if (bannerData.editingBannerId === banner.id) {
        resetBannerForm();
      }
    } catch {
      toast.error("Failed to delete banner");
    }
  }

  return {
    handleBannerFile,
    handleAddBanner,
    handleDeleteBanner,
    handleStartEditBanner,
    handleUpdateBanner,
    handleCancelEditBanner,
  };
}