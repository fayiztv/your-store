import { createContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import FullScreenSpinner from '../components/common/Spinner';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await signOut(auth);
  }

  // ── Forgot password
  // Sends a reset link to the given email. Firebase handles verification.
  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  // ── Change password (while logged in)
  // Re-authenticates with the old password first to confirm identity, and updates to the new password
  async function changePassword(oldPassword, newPassword) {
    if (!currentUser || !currentUser.email) {
      throw new Error('Not signed in');
    }
    const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await updatePassword(currentUser, newPassword);
  }

  // ── Change email (while logged in)
  // Requires current password to re authenticate first.
  // Firebase sends a verification LINK to the new email.
  // Only changes once the admin clicks that link. Login still uses the old email until then.
  async function changeEmail(currentPassword, newEmail) {
    if (!currentUser || !currentUser.email) {
      throw new Error('Not signed in');
    }
    const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    await reauthenticateWithCredential(currentUser, credential);
    await verifyBeforeUpdateEmail(currentUser, newEmail);
  }

  const value = {
    currentUser,
    loading,
    login,
    logout,
    resetPassword,
    changePassword,
    changeEmail,
  };

  if (loading) {
    return <FullScreenSpinner />;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}