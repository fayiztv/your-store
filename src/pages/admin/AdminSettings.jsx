import { useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import useStoreSettingsData from "../../hooks/useStoreSettingsData";
import useBannerData from "../../hooks/useBannerData";
import useAddressFormData from "../../hooks/useAddressformdata ";
import BrandingSection from "../../components/admin/settings/BrandingSection";
import BannerSection from "../../components/admin/settings/BannerSection";
import SecuritySection from "../../components/admin/settings/SecuritySection";
import AddressFormSection from "../../components/admin/settings/AddressFormSection";
import useSettingsActions from "../../hooks/useSettingsActions";
import useBannerActions from "../../hooks/useBannerActions";
import useSecurityActions from "../../hooks/useSecurityActions";
import useAddressFormActions from "../../hooks/useAddressFormActions";
import { SectionHeading } from "../../components/common/sectionHeading";
import useLegalPoliciesData from "../../hooks/useLegalPoliciesData";
import useLegalPoliciesActions from "../../hooks/useLegalPoliciesActions";
import LegalPoliciesSection from "../../components/admin/settings/LegalPoliciesSection";

export default function AdminSettings() {
  const bannerFileRef = useRef(null);
  const logoFileRef = useRef(null);

  const { currentUser, changeEmail, changePassword } = useAuth();

  const storeSettings = useStoreSettingsData();
  const bannerData = useBannerData();
  const addressFormData = useAddressFormData();

  const settingsActions = useSettingsActions(storeSettings);
  const bannerActions = useBannerActions(bannerData);
  const addressFormActions = useAddressFormActions(addressFormData);

  const securityActions = useSecurityActions(
    currentUser,
    changeEmail,
    changePassword,
  );

  const legalPoliciesData = useLegalPoliciesData();

  const legalPoliciesActions = useLegalPoliciesActions(legalPoliciesData);

  if (storeSettings.loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SectionHeading>Store settings</SectionHeading>
      <BrandingSection
        {...storeSettings}
        {...settingsActions}
        logoFileRef={logoFileRef}
      />

      <BannerSection
        {...bannerData}
        {...bannerActions}
        bannerFileRef={bannerFileRef}
      />

      <AddressFormSection {...addressFormData} {...addressFormActions} />

      <SecuritySection {...securityActions} currentUser={currentUser} />

      <LegalPoliciesSection {...legalPoliciesData} {...legalPoliciesActions} />
    </div>
  );
}
