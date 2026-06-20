import { useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import useStoreSettingsData from "../../hooks/useStoreSettingsData";
import useBannerData from "../../hooks/useBannerData";
import BrandingSection from "../../components/admin/settings/BrandingSection";
import BannerSection from "../../components/admin/settings/BannerSection";
import SecuritySection from "../../components/admin/settings/SecuritySection";
import useSettingsActions from "../../hooks/useSettingsActions";
import useBannerActions from "../../hooks/useBannerActions";
import useSecurityActions from "../../hooks/useSecurityActions";
import { SectionHeading } from "../../components/common/sectionHeading";

export default function AdminSettings() {
  const bannerFileRef = useRef(null);
  const logoFileRef = useRef(null);

  const { currentUser, changeEmail, changePassword } = useAuth();

  const storeSettings = useStoreSettingsData();
  const bannerData = useBannerData();

  const settingsActions = useSettingsActions(storeSettings);

  const bannerActions = useBannerActions(bannerData);

  const securityActions = useSecurityActions(
    currentUser,
    changeEmail,
    changePassword,
  );

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

      <SecuritySection {...securityActions} currentUser={currentUser} />
    </div>
  );
}
