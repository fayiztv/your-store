import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

export default function useBannerData() {
  const [banners, setBanners] = useState([]);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerCtaText, setBannerCtaText] = useState("");
  const [bannerCtaLink, setBannerCtaLink] = useState("/products");
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "banners"), (snap) => {
      setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  return {
    banners,
    setBanners,
    bannerTitle,
    setBannerTitle,
    bannerSubtitle,
    setBannerSubtitle,
    bannerCtaText,
    setBannerCtaText,
    bannerCtaLink,
    setBannerCtaLink,
    bannerFile,
    setBannerFile,
    bannerPreview,
    setBannerPreview,
    bannerSaving,
    setBannerSaving,
    bannerUploadProgress,
    setBannerUploadProgress,
  };
}
