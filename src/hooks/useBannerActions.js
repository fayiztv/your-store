import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
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
      bannerData.setBannerTitle("");
      bannerData.setBannerSubtitle("");
      bannerData.setBannerCtaText("");
      bannerData.setBannerCtaLink("/products");
      bannerData.setBannerFile(null);
      if (bannerData.bannerPreview)
        URL.revokeObjectURL(bannerData.bannerPreview);
      bannerData.setBannerPreview(null);
      bannerData.setBannerUploadProgress(0);
    } catch {
      toast.error("Failed to add banner");
    } finally {
      bannerData.setBannerSaving(false);
    }
  }

  async function handleDeleteBanner(banner) {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", banner.id));
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  }

  return {
    handleBannerFile,
    handleAddBanner,
    handleDeleteBanner,
  };
}
