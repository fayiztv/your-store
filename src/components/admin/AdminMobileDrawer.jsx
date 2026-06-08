import { AnimatePresence, motion } from "framer-motion";
import { useLogout } from "../../hooks/useLogout";
import { Logo } from "../common/Logo";
import { LogOut, X } from "lucide-react";
import NavItems from "./AdminNavItems";
import { useLocation } from "react-router-dom";

export default function AdminMobileDrawer({ open, onClose }) {
  const handleLogout = useLogout();
  const { pathname } = useLocation();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 md:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-gray-900 text-white dark:bg-gray-950 md:hidden"
          >
            <div className="flex items-center justify-between p-4">
              <Logo />
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-300 hover:bg-gray-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-2 flex-1 space-y-1 px-3">
              <NavItems pathname={pathname} onNavigate={onClose} />
            </nav>

            <div className="border-t border-gray-800 p-3">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
