// Logo reads store name and logo from settings dynamically
import { useStoreSettings } from "../../contexts/SettingsContext";

export function Logo({ onClick, light = false }) {
  const { settings } = useStoreSettings();
  const storeName = settings?.storeName || "Your Store";
  const logoText = settings?.logoText || storeName.charAt(0).toUpperCase();
  const logoUrl = settings?.logoUrl || null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={storeName}
          className="h-8 w-8 rounded-lg object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-white text-sm">
          {logoText}
        </span>
      )}
      <span
        className={`font-outfit text-lg font-bold md:text-xl ${
          light ? "text-white" : "text-[var(--text-primary)]"
        }`}
      >
        {storeName}
      </span>
    </button>
  );
}
