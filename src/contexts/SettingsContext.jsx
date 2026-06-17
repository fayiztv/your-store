import { createContext, useContext, useEffect } from "react";
import useSettings from "../hooks/useSettings";
import { useTheme } from "./ThemeContext";

const SettingsContext = createContext(null);

export function useStoreSettings() {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useStoreSettings must be used within SettingsProvider");
  return context;
}

// This provider:
// 1. Fetches settings in real-time
// 2. Applies dynamic primary color from settings
// 3. Updates <title> tag dynamically
// 4. Makes settings available everywhere via context
export function SettingsProvider({ children }) {
  const { settings, loading } = useSettings();
  const { applyPrimaryColor } = useTheme();

  // Apply brand color whenever settings change
  useEffect(() => {
    if (settings?.primaryColor) {
      applyPrimaryColor(settings.primaryColor);
      // Also update browser theme-color meta tag
      let themeMeta = document.querySelector("meta[name='theme-color']");
      if (!themeMeta) {
        themeMeta = document.createElement("meta");
        themeMeta.name = "theme-color";
        document.head.appendChild(themeMeta);
      }
      themeMeta.content = settings.primaryColor;
    }
  }, [settings?.primaryColor]);

  // Update page title dynamically
  useEffect(() => {
    if (settings?.metaTitle) {
      document.title = settings.metaTitle;
    } else if (settings?.storeName && settings?.city) {
      document.title = `${settings.storeName} ${settings.city} — ${settings.storeTagline || "Online Store"}`;
    } else if (settings?.storeName) {
      document.title = `${settings.storeName} — ${settings.storeTagline || "Online Store"}`;
    }
  }, [
    settings?.storeName,
    settings?.city,
    settings?.storeTagline,
    settings?.metaTitle,
  ]);

  // Update meta description dynamically
  useEffect(() => {
    if (settings?.metaDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = settings.metaDescription;
    }
  }, [settings?.metaDescription]);

  useEffect(() => {
    if (!settings?.logoUrl) return;

    let favicon = document.querySelector("link[rel='icon']");

    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }

    favicon.href = settings.logoUrl;
  }, [settings?.logoUrl]);

  useEffect(() => {
    if (!settings?.logoUrl) return;

    let ogImage = document.querySelector("meta[property='og:image']");

    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }

    ogImage.setAttribute("content", settings.logoUrl);
  }, [settings?.logoUrl]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}
