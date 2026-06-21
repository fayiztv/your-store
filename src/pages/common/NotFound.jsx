import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, MessageCircle, SearchX } from "lucide-react";
import { useStoreSettings } from "../../contexts/SettingsContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { settings } = useStoreSettings();

  const isAdminRoute = pathname.startsWith("/admin");
  const storeName = settings?.storeName || "Your Store";
  const whatsappNumber = settings?.whatsappNumber || "";

  function openWhatsApp() {
    if (whatsappNumber) {
      window.location.href = `https://wa.me/${whatsappNumber}?text=Hi, I need some help finding something on the site.`;
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Icon with brand-color glow */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <SearchX className="h-10 w-10 text-white" />
        </motion.div>

        <h1 className="font-outfit text-6xl font-bold text-[var(--text-primary)]">
          404
        </h1>
        <h2 className="mt-2 font-outfit text-xl font-semibold text-[var(--text-primary)]">
          {isAdminRoute ? "Admin page not found" : "Page not found"}
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
          {isAdminRoute
            ? "This admin page doesn't exist or may have been moved. Double-check the URL or head back to your dashboard."
            : `The page you're looking for doesn't exist or may have been moved. Let's get you back to ${storeName}.`}
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          {isAdminRoute ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/dashboard")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--primary)" }}
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </motion.button>
          ) : (
            <>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <Home className="h-4 w-4" />
                Back to Home
              </motion.button>

              {whatsappNumber && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-sm font-semibold"
                  style={{
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                    backgroundColor: "var(--surface)",
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Need Help? Chat on WhatsApp
                </motion.button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}