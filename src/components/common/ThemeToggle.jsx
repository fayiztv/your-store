import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { AnimatePresence, motion } from "framer-motion";

export function ThemeToggle({ light = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
        light
          ? "text-gray-300 hover:bg-white/10"
          : "text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/10"
      }`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
