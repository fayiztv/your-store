import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStoreSettings } from "../../contexts/SettingsContext";

const policyMap = {
  "/privacy-policy": {
    key: "privacy",
    title: "Privacy Policy",
  },
  "/terms-and-conditions": {
    key: "terms",
    title: "Terms & Conditions",
  },
  "/refund-policy": {
    key: "refund",
    title: "Returns & Refund Policy",
  },
  //   "/payment-policy": {
  //     key: "payment",
  //     title: "Payment Policy",
  //   },
};

export default function PolicyPage() {
  const { settings } = useStoreSettings();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const policy = policyMap[pathname];

  const data = settings?.legalPolicies?.[policy.key];

  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mb-4 flex w-fit items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        <ChevronLeft className="h-4 w-4" /> Back to home
      </button>

      <div
        className="rounded-2xl border p-6 md:p-8"
        style={{
          backgroundColor: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <h1
          className="font-outfit text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {policy.title}
        </h1>

        <div
          className="mt-6 whitespace-pre-wrap leading-8"
          style={{ color: "var(--text-secondary)" }}
        >
          {data?.content.trim() || "No content available."}
        </div>
      </div>
    </div>
  );
}
