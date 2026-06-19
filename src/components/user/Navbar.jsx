import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, MessageCircle, Search, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStoreSettings } from "../../contexts/SettingsContext";
import { Logo } from "../common/Logo";
import { ThemeToggle } from "../common/ThemeToggle";
import { CSS_VARS, userNavLinks } from "../../utils/constents";
import { useFavourites } from "../../hooks/useFavorites";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { count } = useFavourites();
  const { settings } = useStoreSettings();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const whatsappNumber = settings?.whatsappNumber || "";
  const instagramUrl = settings?.instagramUrl || "";
  const storeName = settings?.storeName || "Your Store";

  function isActive(path) {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  function handleSearch(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setMobileOpen(false);
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
    else navigate("/products");
  }

  function openInstagram() {
    if (instagramUrl) window.location.href = instagramUrl;
    else window.location.href = "https://www.instagram.com";
  }

  function openWhatsApp() {
    if (whatsappNumber) {
      window.location.href = `https://wa.me/${whatsappNumber}?text=Hello, *${storeName}!*.`;
    }
  }

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md"
        style={{
          backgroundColor: "var(--navbar-bg)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-8">
            <Logo onClick={() => navigate("/")} light={false} />

            <nav className="hidden items-center gap-6 md:flex">
              {userNavLinks.map(
                ({ to, label }) =>
                  label != "Favourites" && (
                    <Link
                      key={to}
                      to={to}
                      className={`text-sm font-medium transition-colors ${
                        isActive(to)
                          ? "font-semibold underline decoration-2 underline-offset-4"
                          : "text-[var(--text-secondary)] hover:text-[var(--primary-dark)]"
                      }`}
                      style={
                        isActive(to)
                          ? {
                              color: CSS_VARS.primary,
                              textDecorationColor: CSS_VARS.primary,
                            }
                          : {
                              undefined,
                            }
                      }
                    >
                      {label}
                    </Link>
                  ),
              )}
              {instagramUrl && (
                <button
                  type="button"
                  onClick={openInstagram}
                  className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-dark)]"
                >
                  Instagram
                </button>
              )}
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-dark)]"
              >
                Contact
              </button>
            </nav>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSearch}
                  className="overflow-hidden"
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="search"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full rounded-full bg-[var(--surface)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] outline-none focus:border-primary"
                      style={{ borderColor: "var(--border)", fontSize: "16px" }}
                    />
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/favourites")}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Favourites"
            >
              <Heart className="h-5 w-5" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                >
                  {count}
                </motion.span>
              )}
            </motion.button>

            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-primary)] md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-lg md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed left-0 top-0 z-[70] flex h-full w-[280px] flex-col md:hidden bg-black"
            >
              <div
                className="flex items-center justify-between border-b p-4"
                style={{ borderColor: "#2D2D2D" }}
              >
                <Logo
                  onClick={() => {
                    navigate("/");
                    setMobileOpen(false);
                  }}
                  light
                />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-white/10"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 p-2">
                {userNavLinks.map(({ to, label, icon: Icon }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => {
                      navigate(to);
                      setMobileOpen(false);
                    }}
                    className={`flex w-full items-center gap-4 rounded-xl px-5 py-3 text-sm font-medium transition-colors ${
                      isActive(to)
                        ? "text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                    style={
                      isActive(to)
                        ? { backgroundColor: CSS_VARS.primary }
                        : undefined
                    }
                    // style={{ borderColor: "var(--border)" }}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                    {label === "Favourites" && count > 0 && (
                      <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                        {count}
                      </span>
                    )}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    openWhatsApp();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center gap-4 rounded-xl px-5 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </button>

                {instagramUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      openInstagram();
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-4 rounded-xl px-5 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Instagram
                  </button>
                )}
              </nav>

              <div className="border-t p-4" style={{ borderColor: "#2D2D2D" }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Dark Mode</span>
                  <ThemeToggle light />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
