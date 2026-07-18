import { MapPin, MessageCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useStoreSettings } from "../../contexts/SettingsContext";
import { Logo } from "../common/Logo";

export default function Footer() {
  const { settings } = useStoreSettings();
  const storeName = settings?.storeName || "Your Store";
  const whatsappNumber = settings?.whatsappNumber || "";
  const instagramUrl = settings?.instagramUrl || "";
  const storeTagline = settings?.storeTagline || "";
  const hasPhysicalStore = settings?.hasPhysicalStore || false;
  const address = settings?.address || "";
  const openingHours = settings?.openingHours || "";
  const mapUrl = settings?.mapUrl || "";

  function openWhatsApp() {
    if (whatsappNumber) {
      window.location.href = `https://wa.me/${whatsappNumber}`;
    }
  }

  function openInstagram() {
    if (instagramUrl) {
      window.location.href = instagramUrl;
    } else {
      window.location.href = "https://www.instagram.com";
    }
  }

  function openDeveloper() {
    const message = encodeURIComponent(
      "Hi DivNode,\n\nI visited one of your client websites and I'd like a similar website for my business.",
    );

    window.location.href = `https://wa.me/917025576941?text=${message}`;
  }

  const policyMap = [
    { to: "/privacy-policy", label: "Privacy Policy" },
    { to: "/terms-and-conditions", label: "Terms & Conditions" },
    { to: "/refund-policy", label: "Returns & Refund Policy" },
    // { to: "/payment-policy", label: "Payment Policy" },
  ];

  return (
    <footer
      className="border-t pt-10 px-4"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        paddingBottom: "calc(5rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <Logo light={false} />
            {storeTagline && (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                {storeTagline}
              </p>
            )}
            {hasPhysicalStore && address && (
              <div className="mt-3 flex items-start gap-2">
                {mapUrl ? (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--primary-dark)] transition-colors"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {address}
                  </a>
                ) : (
                  <p className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {address}
                  </p>
                )}
              </div>
            )}
            {hasPhysicalStore && openingHours && (
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {openingHours}
              </div>
            )}
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="font-outfit font-semibold text-[var(--text-primary)]">
              Quick Links
            </h3>
            <nav className="mt-3 flex flex-col gap-2">
              {[
                { to: "/", label: "Home" },
                { to: "/products", label: "Products" },
                { to: "/favourites", label: "Favourites" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-dark)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3 — Privacy Policy */}

          <div>
            <h3 className="font-outfit font-semibold text-[var(--text-primary)]">
              Legal & Policies
            </h3>
            <nav className="mt-3 flex flex-col gap-2">
              {policyMap.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-dark)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h3 className="font-outfit font-semibold text-[var(--text-primary)]">
              Contact Us
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={openWhatsApp}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-dark)] text-left"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                Chat on WhatsApp
              </button>
              <button
                type="button"
                onClick={openInstagram}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-dark)] text-left"
              >
                <span className="text-sm">@</span>
                Instagram
              </button>
            </div>
          </div>
        </div>

        <div
          className="mt-8 border-t pt-6 text-center text-xs text-[var(--text-secondary)]"
          style={{ borderColor: "var(--border)" }}
        >
          © {new Date().getFullYear()} {storeName}. All rights reserved.
          <button
            type="button"
            onClick={openDeveloper}
            className="mt-2 block w-full text-center text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--primary-dark)]"
          >
            Powered by DivNode • Launch your own store →
          </button>
        </div>
      </div>
    </footer>
  );
}
