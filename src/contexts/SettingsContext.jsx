import { createContext, useContext, useEffect } from 'react';
import useSettings from '../hooks/useSettings';
import { useTheme } from './ThemeContext';

const SettingsContext = createContext(null);

export function useStoreSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useStoreSettings must be used within SettingsProvider');
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
    }
  }, [settings?.primaryColor, applyPrimaryColor]);

  // Update page title dynamically
  useEffect(() => {
    if (settings?.metaTitle) {
      document.title = settings.metaTitle;
    } else if (settings?.storeName && settings?.city) {
      document.title = `${settings.storeName} ${settings.city} — ${settings.storeTagline || 'Online Store'}`;
    } else if (settings?.storeName) {
      document.title = `${settings.storeName} — ${settings.storeTagline || 'Online Store'}`;
    }
  }, [settings?.storeName, settings?.city, settings?.storeTagline, settings?.metaTitle]);

  // Update meta description dynamically
  useEffect(() => {
    if (settings?.metaDescription) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = settings.metaDescription;
    }
  }, [settings?.metaDescription]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}