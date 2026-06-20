import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Logo } from "../../components/common/Logo";
import { useAuth } from "../../hooks/useAuth";

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-all focus:ring-2 focus:ring-[var(--primary-dark)] dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

export default function AdminLogin() {
  const { currentUser, login, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("demo@#pass");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot password view state
  const [view, setView] = useState('login'); // 'login' | 'forgot'
  const [resetEmail, setResetEmail] = useState("");
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  if (currentUser) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid credentials");
      setLoading(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    setResetSending(true);
    setResetError("");

    try {
      await resetPassword(resetEmail.trim());
      setResetSent(true);
    } catch (err) {
      // Keep the message generic — don't reveal whether the email exists
      if (err.code === 'auth/invalid-email') {
        setResetError("Please enter a valid email address");
      } else {
        setResetError("Something went wrong. Please try again.");
      }
    } finally {
      setResetSending(false);
    }
  }

  function backToLogin() {
    setView('login');
    setResetSent(false);
    setResetError("");
    setResetEmail("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-transparent bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex flex-col items-center">
          <Logo />
          <p className="mt-1 text-center text-sm text-gray-400 dark:text-gray-500">
            Admin Panel
          </p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ fontSize: '16px' }}
                  className={inputClass}
                  placeholder="admin@yourstore.com"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-medium text-[var(--primary-dark)] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ fontSize: '16px' }}
                    className={`${inputClass} pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              key="forgot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              <button
                type="button"
                onClick={backToLogin}
                className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" /> Back to login
              </button>

              {resetSent ? (
                <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20">
                  <p className="font-medium text-green-700 dark:text-green-400">Check your email</p>
                  <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                    We've sent a password reset link to <span className="font-medium">{resetEmail}</span>.
                    Click the link in that email to set a new password.
                  </p>
                  <button
                    type="button"
                    onClick={backToLogin}
                    className="mt-4 text-sm font-medium text-[var(--primary-dark)] hover:underline"
                  >
                    Back to login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-outfit text-lg font-semibold text-gray-900 dark:text-white">
                      Reset your password
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Enter your admin email and we'll send you a link to reset your password.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="resetEmail" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      id="resetEmail"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{ fontSize: '16px' }}
                      className={inputClass}
                      placeholder="admin@yourstore.com"
                    />
                    {resetError && <p className="mt-2 text-sm text-red-500">{resetError}</p>}
                  </div>
                  <motion.button
                    type="submit"
                    disabled={resetSending}
                    whileHover={!resetSending ? { scale: 1.02 } : {}}
                    whileTap={!resetSending ? { scale: 0.98 } : {}}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-dark)] py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {resetSending ? "Sending..." : "Send Reset Link"}
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}