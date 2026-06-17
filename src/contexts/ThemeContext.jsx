import { createContext, useContext, useEffect, useState } from "react";
import { THEME_KEY } from "../utils/constents";
import { readSavedTheme } from "../utils/helpers";

const ThemeContext = createContext(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const dark = readSavedTheme();
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    return dark;
  });

  // Apply dark/light class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(isDark));
    } catch {
      //
    }
  }, [isDark]);

  function toggleTheme() {
    setIsDark((prev) => !prev);
  }

  // Apply dynamic primary color from settings
  function applyPrimaryColor(color) {
    if (!color) return;
    document.documentElement.style.setProperty("--primary", color);
    // Auto-generate darker shade
    document.documentElement.style.setProperty(
      "--primary-dark",
      darkenColor(color, 15),
    );

    //   if (isDarkMode) {
    //   document.documentElement.style.setProperty('--primary', lightenColor(color, 10));
    // }
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, applyPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Simple color darkener — takes hex, returns darker hex
function darkenColor(hex, percent) {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - Math.round(2.55 * percent));
    const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(2.55 * percent));
    const b = Math.max(0, (num & 0xff) - Math.round(2.55 * percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  } catch {
    return hex;
  }
}

// function lightenColor(hex, percent) {
//   try {
//     const num = parseInt(hex.replace("#", ""), 16);
//     const r = Math.min(255, (num >> 16) + Math.round(2.55 * percent));
//     const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(2.55 * percent));
//     const b = Math.min(255, (num & 0xff) + Math.round(2.55 * percent));
//     return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
//   } catch {
//     return hex;
//   }
// }
