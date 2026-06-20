import { useState } from "react";
import toast from "react-hot-toast";

export default function useSecurityActions(
  currentUser,
  changeEmail,
  changePassword,
) {
  // ── Security: change email ──
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailChangeSent, setEmailChangeSent] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // ── Security: change password ──
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  // ── Change email handler ──
  async function handleChangeEmail(e) {
    e.preventDefault();
    if (!newEmail.trim()) {
      toast.error("Enter a new email address");
      return;
    }
    if (!emailCurrentPassword) {
      toast.error("Enter your current password to confirm");
      return;
    }
    if (newEmail.trim().toLowerCase() === currentUser?.email?.toLowerCase()) {
      toast.error("This is already your current email");
      return;
    }

    setEmailSaving(true);
    try {
      await changeEmail(emailCurrentPassword, newEmail.trim());
      setEmailChangeSent(true);
      setEmailCurrentPassword("");
      toast.success("Verification link sent to new email");
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        toast.error("Current password is incorrect");
      } else if (err.code === "auth/email-already-in-use") {
        toast.error("That email is already in use");
      } else if (err.code === "auth/invalid-email") {
        toast.error("Please enter a valid email address");
      } else if (err.code === "auth/requires-recent-login") {
        toast.error("Please log out and log back in, then try again");
      } else {
        toast.error("Failed to update email");
      }
    } finally {
      setEmailSaving(false);
    }
  }

  // ── Change password handler ──
  async function handleChangePassword(e) {
    e.preventDefault();
    if (!oldPassword) {
      toast.error("Enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success("Password updated successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        toast.error("Current password is incorrect");
      } else if (err.code === "auth/weak-password") {
        toast.error("New password is too weak");
      } else if (err.code === "auth/requires-recent-login") {
        toast.error("Please log out and log back in, then try again");
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  return {
    // email
    newEmail,
    setNewEmail,
    emailCurrentPassword,
    setEmailCurrentPassword,
    showEmailPassword,
    setShowEmailPassword,
    emailSaving,
    emailChangeSent,
    setEmailChangeSent,

    // password
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    showOldPassword,
    setShowOldPassword,
    showNewPassword,
    setShowNewPassword,
    passwordSaving,

    // handlers
    handleChangeEmail,
    handleChangePassword,
  };
}
