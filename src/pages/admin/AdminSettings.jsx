import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Trash2 } from 'lucide-react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../../firebase/firebase';
import { uploadBannerToCloudinary } from '../../utils/cloudinary';

export default function AdminSettings() {
  const fileInputRef = useRef(null);

  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [banners, setBanners] = useState([]);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('');
  const [bannerCtaLink, setBannerCtaLink] = useState('/products');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'main'));
        if (snap.exists()) {
          const data = snap.data();
          setStoreName(data.storeName || '');
          setWhatsappNumber(data.whatsappNumber || '');
          setInstagramUrl(data.instagramUrl || '');
        }
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'banners'), (snap) => {
      setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(
        doc(db, 'settings', 'main'),
        {
          storeName: storeName.trim(),
          whatsappNumber: whatsappNumber.trim(),
          instagramUrl: instagramUrl.trim(),
        },
        { merge: true }
      );
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function handleBannerFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    e.target.value = '';
  }

  async function handleAddBanner(e) {
    e.preventDefault();
    if (!bannerFile) {
      toast.error('Please select a banner image');
      return;
    }
    if (!bannerTitle.trim()) {
      toast.error('Banner title is required');
      return;
    }

    setBannerSaving(true);
    setBannerUploadProgress(0);

    try {
      // Upload to Cloudinary
      const imageUrl = await uploadBannerToCloudinary(bannerFile, (progress) => {
        setBannerUploadProgress(progress);
      });

      await addDoc(collection(db, 'banners'), {
        imageUrl,
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        ctaText: bannerCtaText.trim() || 'Shop Now',
        ctaLink: bannerCtaLink.trim() || '/products',
        createdAt: serverTimestamp(),
      });

      toast.success('Banner added');
      setBannerTitle('');
      setBannerSubtitle('');
      setBannerCtaText('');
      setBannerCtaLink('/products');
      setBannerFile(null);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null);
      setBannerUploadProgress(0);
    } catch {
      toast.error('Failed to add banner');
    } finally {
      setBannerSaving(false);
    }
  }

  async function handleDeleteBanner(banner) {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', banner.id));
      toast.success('Banner deleted');
    } catch {
      toast.error('Failed to delete banner');
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-48 rounded-2xl skeleton-shimmer" />
        <div className="h-64 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
      >
        <h2 className="mb-6 font-outfit text-lg font-semibold text-gray-900 dark:text-white">
          Store Settings
        </h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Store Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              style={{ fontSize: '16px' }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="Thread Store"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              WhatsApp Number
            </label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              style={{ fontSize: '16px' }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="919876543210"
            />
            <p className="mt-1 text-xs text-gray-400">
              Include country code without + (e.g. 91 for India)
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Instagram URL
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              style={{ fontSize: '16px' }}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="https://www.instagram.com/threadstore"
            />
          </div>
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </motion.button>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
      >
        <h2 className="mb-6 font-outfit text-lg font-semibold text-gray-900 dark:text-white">
          Banner Management
        </h2>

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
                  <p className="truncate font-medium text-gray-900 dark:text-white">
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
                  aria-label="Delete banner"
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
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-primary dark:border-gray-600"
          >
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Banner preview"
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
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleBannerFile}
          />

          <input
            type="text"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            style={{ fontSize: '16px' }}
            placeholder="Banner title"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            value={bannerSubtitle}
            onChange={(e) => setBannerSubtitle(e.target.value)}
            style={{ fontSize: '16px' }}
            placeholder="Banner subtitle"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              value={bannerCtaText}
              onChange={(e) => setBannerCtaText(e.target.value)}
              style={{ fontSize: '16px' }}
              placeholder="CTA button text (e.g. Shop Now)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="text"
              value={bannerCtaLink}
              onChange={(e) => setBannerCtaLink(e.target.value)}
              style={{ fontSize: '16px' }}
              placeholder="CTA link (e.g. /products)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {bannerSaving && bannerUploadProgress > 0 && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
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
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-70"
          >
            {bannerSaving ? 'Uploading...' : 'Add Banner'}
          </motion.button>
        </form>
      </motion.section>
    </div>
  );
}