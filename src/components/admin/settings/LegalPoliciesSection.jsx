import { FileText } from "lucide-react";
import { motion } from "framer-motion";
import Section from "./Section";
import Subsection from "./Subsection";
import { inputClass } from "./settingsStyles";

const policies = [
  {
    key: "privacy",
    title: "Privacy Policy",
    description: "Manage your customer's privacy policy.",
  },
  {
    key: "terms",
    title: "Terms & Conditions",
    description: "Terms customers agree to while using your store.",
  },
  {
    key: "refund",
    title: "Returns & Refund Policy",
    description: "Explain return and refund eligibility.",
  },
  //   {
  //     key: "payment",
  //     title: "Payment Policy",
  //     description: "Describe accepted payment methods and conditions.",
  //   },
];

export default function LegalPoliciesSection({
  legalPolicies,
  setLegalPolicies,
  handleSavePolicies,
}) {
  function updatePolicy(key, field, value) {
    setLegalPolicies((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  }

  return (
    <Section
      title="Policies"
      icon={FileText}
      description="Manage the legal pages displayed in your website footer."
      defaultOpen={false}
    >
      <div className="space-y-5">
        {policies.map((policy) => (
          <Subsection
            key={policy.key}
            title={policy.title}
            description={policy.description}
            defaultOpen={false}
          >
            <div className="space-y-4">

              {/* Content */}
              <textarea
                rows={10}
                value={legalPolicies[policy.key].content}
                onChange={(e) =>
                  updatePolicy(policy.key, "content", e.target.value)
                }
                placeholder={`Write your ${policy.title} here...`}
                style={{ fontSize: "16px" }}
                className={`${inputClass} resize-y`}
              />
            </div>
          </Subsection>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSavePolicies}
          className="w-full rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white"
        >
          Save Policies
        </motion.button>
      </div>
    </Section>
  );
}
