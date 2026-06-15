import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBag,
  Heart,
  MessageCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useFavourites } from "../../contexts/FavouritesContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useStoreSettings } from "../../contexts/SettingsContext";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Products", icon: ShoppingBag, path: "/products" },
  { label: "Favorites", icon: Heart, path: "/favourites" },
  { label: "WhatsApp", icon: MessageCircle, path: "/contact" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { favourites } = useFavourites();
  const { isDark, toggleTheme } = useTheme();
   const { settings } = useStoreSettings();
    const storeName = settings?.storeName || 'Your Store';
    const whatsappNumber = settings?.whatsappNumber || "";

  function openWhatsApp() {
    if (whatsappNumber) {
      window.location.href = `https://wa.me/${whatsappNumber}?text=Hello, *${storeName}!*.`;
    }
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t md:hidden"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "calc(4rem + env(safe-area-inset-bottom))",
      }}
    >
      {navItems.map(({ label, icon: Icon, path }) => {
        const isActive = location.pathname === path;
        const isFavourites = path === "/favourites";

        return (
          <motion.button
            key={path}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (path === "/contact") {
                openWhatsApp();
              } else {
                navigate(path);
              }
            }}
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
            style={{ color: isActive ? "#1A8FE3" : "var(--text-secondary)" }}
          >
            {/* Active indicator dot */}
            {isActive && (
              <motion.div
                layoutId="bottomNavIndicator"
                className="absolute -top-px h-0.5 w-8 rounded-full bg-primary"
              />
            )}

            {/* Icon + badge wrapper */}
            <div className="relative">
              <Icon
                style={{ width: 22, height: 22 }}
                className={isActive ? "fill-primary/10" : ""}
              />
              {isFavourites && favourites.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {favourites.length > 9 ? "9+" : favourites.length}
                </span>
              )}
            </div>

            <span className="text-[10px] font-medium">{label}</span>
          </motion.button>
        );
      })}

      {/* Theme toggle */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2"
        style={{ color: "var(--text-secondary)" }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sun style={{ width: 22, height: 22 }} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Moon style={{ width: 22, height: 22 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className="text-[10px] font-medium">Theme</span>
      </motion.button>
    </nav>
  );
}
