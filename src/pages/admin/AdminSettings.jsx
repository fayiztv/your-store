import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Trash2, Palette, Store, MapPin, Globe } from 'lucide-react';
import {
  addDoc, collection, deleteDoc, doc,
  onSnapshot, serverTimestamp, setDoc,
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { db } from '../../firebase/firebase';
import { uploadBannerToCloudinary, uploadImageToCloudinary } from '../../utils/cloudinary';

const inputClass = "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-dark)] dark:border-gray-600 dark:bg-gray-700 dark:text-white";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

function Section({ title, icon: Icon, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900"
    >
      <h2 className="mb-6 flex items-center gap-2 font-outfit text-lg font-semibold text-gray-900 dark:text-white">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

export default function AdminSettings() {
  const bannerFileRef = useRef(null);
  const logoFileRef = useRef(null);

  // Store info
  const [storeName, setStoreName] = useState('');
  const [storeTagline, setStoreTagline] = useState('');
  const [logoText, setLogoText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#1A8FE3');

  // Contact
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [email, setEmail] = useState('');

  // Physical store
  const [hasPhysicalStore, setHasPhysicalStore] = useState(false);
  const [address, setAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [openingHours, setOpeningHours] = useState('Mon–Sat: 9AM – 9PM');
  const [city, setCity] = useState('');

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Banners
  const [banners, setBanners] = useState([]);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('');
  const [bannerCtaLink, setBannerCtaLink] = useState('/products');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

  // Load settings real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'main'), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setStoreName(d.storeName || '');
        setStoreTagline(d.storeTagline || '');
        setLogoText(d.logoText || '');
        setLogoUrl(d.logoUrl || '');
        setPrimaryColor(d.primaryColor || '#1A8FE3');
        setWhatsappNumber(d.whatsappNumber || '');
        setInstagramUrl(d.instagramUrl || '');
        setEmail(d.email || '');
        setHasPhysicalStore(d.hasPhysicalStore || false);
        setAddress(d.address || '');
        setMapUrl(d.mapUrl || '');
        setOpeningHours(d.openingHours || '');
        setCity(d.city || '');
        setMetaTitle(d.metaTitle || '');
        setMetaDescription(d.metaDescription || '');
      }
      setLoading(false);
    }, () => setLoading(false));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'banners'), (snap) => {
      setBanners(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  function handleLogoFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    e.target.value = '';
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSaving(true);
    try {
      let finalLogoUrl = logoUrl;

      // Upload new logo if selected
      if (logoFile) {
        finalLogoUrl = await uploadImageToCloudinary(logoFile, () => {});
        setLogoUrl(finalLogoUrl);
        setLogoFile(null);
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
      }

      await setDoc(doc(db, 'settings', 'main'), {
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
      }, { merge: true });

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
    if (!bannerFile) { toast.error('Please select a banner image'); return; }
    setBannerSaving(true);
    setBannerUploadProgress(0);
    try {
      const imageUrl = await uploadBannerToCloudinary(bannerFile, (p) => setBannerUploadProgress(p));
      await addDoc(collection(db, 'banners'), {
        imageUrl,
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        ctaText: bannerCtaText.trim(),
        ctaLink: bannerCtaLink.trim(),
        createdAt: serverTimestamp(),
      });
      toast.success('Banner added');
      setBannerTitle(''); setBannerSubtitle(''); setBannerCtaText('');
      setBannerCtaLink('/products'); setBannerFile(null);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setBannerPreview(null); setBannerUploadProgress(0);
    } catch { toast.error('Failed to add banner'); }
    finally { setBannerSaving(false); }
  }

  async function handleDeleteBanner(banner) {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await deleteDoc(doc(db, 'banners', banner.id));
      toast.success('Banner deleted');
    } catch { toast.error('Failed to delete banner'); }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">

      {/* ── BRANDING ── */}
      <Section title="Branding" icon={Palette} delay={0}>
        <form onSubmit={handleSaveSettings} className="space-y-5">

          {/* Logo upload */}
          <div>
            <label className={labelClass}>Store Logo</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {logoPreview || logoUrl ? (
                  <img src={logoPreview || logoUrl} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[var(--primary-dark)]">
                    {logoText || storeName.charAt(0) || 'Y'}
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-[var(--primary-dark)] hover:text-[var(--primary-dark)] dark:border-gray-600 dark:text-gray-300 transition-colors"
                >
                  <ImagePlus className="h-4 w-4" />
                  Upload Logo Image
                </button>
                <p className="text-xs text-gray-400">Or use a letter below if no image</p>
              </div>
            </div>
            <input ref={logoFileRef} type="file" accept="image/*" hidden onChange={handleLogoFile} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Store Name *</label>
              <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
                style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: Your Store" required />
            </div>
            <div>
              <label className={labelClass}>Logo Letter (if no image)</label>
              <input type="text" value={logoText} onChange={(e) => setLogoText(e.target.value.toUpperCase().slice(0,2))}
                style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: Y or YS" maxLength={2} />
              <p className="mt-1 text-xs text-gray-400">1–2 letters shown in logo box</p>
            </div>
          </div>

          <div>
            <label className={labelClass}>Store Tagline</label>
            <input type="text" value={storeTagline} onChange={(e) => setStoreTagline(e.target.value)}
              style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: Premium products store" />
          </div>

          <div>
            <label className={labelClass}>Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-16 cursor-pointer rounded-lg border border-gray-200 dark:border-gray-600" />
              <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ fontSize: '16px' }} className={`${inputClass} flex-1`} placeholder="#1A8FE3" />
            </div>
            <p className="mt-1 text-xs text-gray-400">This color will apply instantly across the whole store</p>
          </div>

          {/* ── CONTACT ── */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <h3 className="mb-4 flex items-center gap-2 font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">
              <Globe className="h-4 w-4" /> Contact & Social
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)}
                  style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: 919876543210" />
                <p className="mt-1 text-xs text-gray-400">Include country code without + (e.g. 91 for India)</p>
              </div>
              <div>
                <label className={labelClass}>Instagram URL</label>
                <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)}
                  style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: https://www.instagram.com/yourstore" />
              </div>
              <div>
                <label className={labelClass}>Email (optional)</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: store@email.com" />
              </div>
            </div>
          </div>

          {/* ── PHYSICAL STORE ── */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <h3 className="mb-4 flex items-center gap-2 font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">
              <MapPin className="h-4 w-4" /> Physical Store
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setHasPhysicalStore((p) => !p)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${hasPhysicalStore ? 'bg-[var(--primary-dark)]' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${hasPhysicalStore ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Has physical store / offline location</span>
              </label>

              {hasPhysicalStore && (
                <div className="space-y-4 pl-1">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)}
                        style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: Kannur" />
                    </div>
                    <div>
                      <label className={labelClass}>Opening Hours</label>
                      <input type="text" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)}
                        style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: Mon–Sat: 9AM – 9PM" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Full Address</label>
                    <textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)}
                      style={{ fontSize: '16px' }} className={`${inputClass} resize-none`} placeholder="Eg: MG Road, Kannur, Kerala 670001" />
                  </div>
                  <div>
                    <label className={labelClass}>Google Maps URL</label>
                    <input type="url" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)}
                      style={{ fontSize: '16px' }} className={inputClass} placeholder="Eg: https://maps.google.com/..." />
                    <p className="mt-1 text-xs text-gray-400">Address in footer will link to this map</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── SEO ── */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5">
            <h3 className="mb-4 font-outfit text-sm font-semibold uppercase tracking-wide text-gray-400">SEO</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Page Title (browser tab)</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                  style={{ fontSize: '16px' }} className={inputClass} placeholder="My Store Kannur — Premium products" />
              </div>
              <div>
                <label className={labelClass}>Meta Description (Google preview)</label>
                <textarea rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                  style={{ fontSize: '16px' }} className={`${inputClass} resize-none`}
                  placeholder="Shop premium products at My Store. Order via WhatsApp." />
                <p className={`mt-1 text-xs ${metaDescription.length > 160 ? 'text-red-400' : 'text-gray-400'}`}>
                  {metaDescription.length}/160 characters
                </p>
              </div>
            </div>
          </div>

          <motion.button
            type="submit" disabled={saving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </motion.button>
        </form>
      </Section>

      {/* ── BANNER MANAGEMENT ── */}
      <Section title="Banner Management" icon={Store} delay={0.1}>
        {banners.length > 0 && (
          <div className="mb-6 space-y-3">
            {banners.map((banner) => (
              <div key={banner.id} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <img src={banner.imageUrl} alt={banner.title} className="h-16 w-24 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{banner.title}</p>
                  {banner.subtitle && <p className="truncate text-xs text-gray-500">{banner.subtitle}</p>}
                </div>
                <button type="button" onClick={() => handleDeleteBanner(banner)}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddBanner} className="space-y-4">
          <button type="button" onClick={() => bannerFileRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-[var(--primary-dark)] dark:border-gray-600">
            {bannerPreview ? (
              <img src={bannerPreview} alt="Preview" className="mx-auto h-32 max-w-full rounded-xl object-cover" />
            ) : (
              <>
                <ImagePlus className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">Click to upload banner image</p>
              </>
            )}
          </button>
          <input ref={bannerFileRef} type="file" accept="image/*" hidden onChange={handleBannerFile} />

          <input type="text" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)}
            style={{ fontSize: '16px' }} placeholder="Banner title" className={inputClass} />
          <input type="text" value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)}
            style={{ fontSize: '16px' }} placeholder="Banner subtitle (optional)" className={inputClass} />
          <div className="grid gap-4 sm:grid-cols-2">
            <input type="text" value={bannerCtaText} onChange={(e) => setBannerCtaText(e.target.value)}
              style={{ fontSize: '16px' }} placeholder="Button text (e.g. Shop Now)" className={inputClass} />
            <input type="text" value={bannerCtaLink} onChange={(e) => setBannerCtaLink(e.target.value)}
              style={{ fontSize: '16px' }} placeholder="Link (e.g. /products)" className={inputClass} />
          </div>

          {bannerSaving && bannerUploadProgress > 0 && (
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div className="h-full rounded-full bg-[var(--primary-dark)] transition-all duration-300" style={{ width: `${bannerUploadProgress}%` }} />
              </div>
              <p className="mt-1 text-center text-xs text-gray-500">Uploading... {Math.round(bannerUploadProgress)}%</p>
            </div>
          )}

          <motion.button type="submit" disabled={bannerSaving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="w-full rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white disabled:opacity-70">
            {bannerSaving ? 'Uploading...' : 'Add Banner'}
          </motion.button>
        </form>
      </Section>
    </div>
  );
}