import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Section from "./Section";
import Subsection from "./Subsection";
import { inputClass, labelClass } from "./settingsStyles";
import { motion } from "framer-motion";

export default function SecuritySection({
  currentUser,
  handleChangeEmail,
  handleChangePassword,
  newEmail,
  emailChangeSent,
  setEmailChangeSent,
  setNewEmail,
  showEmailPassword,
  emailCurrentPassword,
  setEmailCurrentPassword,
  setShowEmailPassword,
  emailSaving,
  showOldPassword,
  oldPassword,
  setOldPassword,
  setShowOldPassword,
  showNewPassword,
  newPassword,
  setNewPassword,
  setShowNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  passwordSaving,
}) {
  return (
    <Section
      title="Security"
      icon={ShieldCheck}
      description="Change your admin login email or password."
      defaultOpen={false}
    >
      <div className="space-y-5">
        {/* Change Email (subsection) */}
        <Subsection
          title="Change Email"
          icon={Mail}
          description={`Update the email used to log in. Currently: ${currentUser?.email || "—"}`}
          defaultOpen={false}
        >
          <p className="text-xs text-gray-400">
            Currently signed in as{" "}
            <span className="font-medium text-gray-600 dark:text-gray-300">
              {currentUser?.email}
            </span>
          </p>

          {emailChangeSent ? (
            <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Verification link sent
              </p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                Check <span className="font-medium">{newEmail}</span> and click
                the link to confirm. Your login email won't change until you do.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEmailChangeSent(false);
                  setNewEmail("");
                }}
                className="mt-3 text-xs font-medium text-[var(--primary-dark)] hover:underline"
              >
                Change a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label className={labelClass}>New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ fontSize: "16px" }}
                  className={inputClass}
                  placeholder="newemail@example.com"
                />
              </div>
              <div>
                <label className={labelClass}>
                  Current Password (to confirm it's you)
                </label>
                <div className="relative">
                  <input
                    type={showEmailPassword ? "text" : "password"}
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    style={{ fontSize: "16px" }}
                    className={`${inputClass} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showEmailPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={emailSaving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-[var(--primary-dark)] py-3 text-sm font-semibold text-white disabled:opacity-70"
              >
                {emailSaving ? "Sending link..." : "Send Verification Link"}
              </motion.button>
            </form>
          )}
        </Subsection>

        {/* Change Password (subsection) */}
        <Subsection
          title="Change Password"
          icon={Lock}
          description="Update your admin login password. You'll need your current password first."
          defaultOpen={false}
        >
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{ fontSize: "16px" }}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ fontSize: "16px" }}
                    className={`${inputClass} pr-12`}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={{ fontSize: "16px" }}
                  className={inputClass}
                  placeholder="Re-enter new password"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={passwordSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-[var(--primary-dark)] py-3 text-sm font-semibold text-white disabled:opacity-70"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </motion.button>
          </form>
        </Subsection>
      </div>
    </Section>
  );
}
