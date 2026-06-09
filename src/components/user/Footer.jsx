import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import useSettings from "../../hooks/useSettings";
import { Logo } from "../common/Logo";

export default function Footer() {
  const { settings } = useSettings();
  const whatsappNumber = settings?.whatsappNumber || "";
  const instagramUrl =
    settings?.instagramUrl || "https://www.instagram.com/threadstore___";

  return (
    <footer
      className="border-t pt-10 px-4 md:pb-10"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
        paddingBottom: "calc(5rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Premium gents clothing store
            </p>
          </div>

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
                  className="text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="font-outfit font-semibold text-[var(--text-primary)]">
              Contact Us
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              )}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-primary"
              >
                {/* <Instagram className="h-4 w-4" /> */}@ Chat on Instagram
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-8 border-t pt-6 text-center text-xs text-[var(--text-secondary)]"
          style={{ borderColor: "var(--border)" }}
        >
          © {new Date().getFullYear()} Thread Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
