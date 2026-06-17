import { AlertCircle, Heart, Home, LayoutDashboard, Package, Settings, Star, Tag } from "lucide-react";

export const statConfig = [
  {
    key: 'products',
    label: 'Total Products',
    icon: Package,
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: Tag,
    bg: 'bg-violet-500/10',
    text: 'text-violet-500',
  },
  {
    key: 'featured',
    label: 'Featured',
    icon: Star,
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
  },
  {
    key: 'outOfStock',
    label: 'Out of Stock',
    icon: AlertCircle,
    bg: 'bg-red-500/10',
    text: 'text-red-500',
  },
];

export const navLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export const userNavLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/products", label: "Products", icon: Package },
  { to: "/favourites", label: "Favourites", icon: Heart },
];

export const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const containerVariantsProducts = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const containerVariantsProductDetails = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const containerVariantsFavorites= {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const containerVariantsAdminCategory = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const cardVariantsAdminCategory = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const categoryColors = [
  'bg-blue-500/10 text-blue-500',
  'bg-violet-500/10 text-violet-500',
  'bg-amber-500/10 text-amber-500',
  'bg-emerald-500/10 text-emerald-500',
  'bg-rose-500/10 text-rose-500',
  'bg-cyan-500/10 text-cyan-500',
];

export const containerVariantsHome = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const cardVariantsHome = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const THEME_KEY = 'store_theme';

export const PER_PAGE = 6;

// CSS variable references
export const CSS_VARS = {
  primary: 'var(--primary)',
  primaryDark: 'var(--primary-dark)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  surface: 'var(--surface)',
  border: 'var(--border)',
  bg: 'var(--bg)',
  cardBg: 'var(--card-bg)',
  navbarBg: 'var(--navbar-bg)',
};