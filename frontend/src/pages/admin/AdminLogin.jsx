import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter the administrator email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter the administrator password.");
      return;
    }

    setLoading(true);

    /*
      TEMPORARY ADMIN LOGIN

      We will connect this to the backend admin
      authentication after the UI and routing are ready.

      These credentials are only for local development.
    */

    const ADMIN_EMAIL = "admin@civicconnect.ai";
    const ADMIN_PASSWORD = "Admin@123";

    setTimeout(() => {
      if (
        email.trim().toLowerCase() === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
      ) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("adminEmail", email.trim());

        navigate("/admin/dashboard");
      } else {
        setError(
          "Invalid administrator credentials. Please check your email and password."
        );
      }

      setLoading(false);
    }, 700);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* ==========================================
          BACKGROUND
      ========================================== */}

      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950" />

      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />

      <div className="absolute -bottom-48 -right-40 h-[550px] w-[550px] rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* ==========================================
          BACK TO MAIN PORTAL
      ========================================== */}

      <div className="relative z-10 px-5 pt-5 sm:px-8">

        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
        >
          <FaArrowLeft />
          Back to Citizen Login
        </Link>

      </div>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-5xl"
        >

          <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl shadow-black/40 backdrop-blur-2xl lg:grid-cols-2">

            {/* ======================================
                LEFT ADMIN BRANDING
            ====================================== */}

            <section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700/90 via-blue-800/90 to-cyan-700/80 p-10 text-white">

              <div>

                {/* Logo */}

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 shadow-lg backdrop-blur">
                    <FaShieldAlt className="text-2xl" />
                  </div>

                  <div>
                    <p className="text-xl font-bold"> 
                      CivicConnect AI
                    </p>

                    <p className="text-sm text-blue-100">
                      Smart Public Grievance Platform
                    </p>
                  </div>

                </div>

                {/* Heading */}

                <div className="mt-16">

                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider">
                    <FaUserShield />
                    Administration Portal
                  </div>

                  <h1 className="text-4xl font-extrabold leading-tight xl:text-5xl">
                    Manage civic services
                    <span className="block text-cyan-200">
                      with intelligence.
                    </span>
                  </h1>

                  <p className="mt-6 max-w-md text-base leading-7 text-blue-100">
                    Review citizen complaints, monitor resolution progress,
                    manage priorities and coordinate civic service workflows
                    from one secure administrative dashboard.
                  </p>

                </div>

                {/* Features */}

                <div className="mt-10 space-y-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <FaCheckCircle />
                    </div>

                    <span className="text-sm text-blue-50">
                      Complaint monitoring
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <FaCheckCircle />
                    </div>

                    <span className="text-sm text-blue-50">
                      Priority and status management
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <FaCheckCircle />
                    </div>

                    <span className="text-sm text-blue-50">
                      Department coordination
                    </span>

                  </div>

                </div>

              </div>

              <p className="text-xs text-blue-200">
                CivicConnect AI · Authorized Administration
              </p>

            </section>

            {/* ======================================
                RIGHT LOGIN PANEL
            ====================================== */}

            <section className="bg-white p-6 sm:p-9 lg:p-11">

              {/* Mobile Logo */}

              <div className="mb-8 flex items-center gap-3 lg:hidden">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FaShieldAlt />
                </div>

                <div>
                  <p className="font-bold text-slate-900">
                    CivicConnect AI
                  </p>

                  <p className="text-xs text-slate-500">
                    Administration Portal
                  </p>
                </div>

              </div>

              {/* Header */}

              <div className="text-center lg:text-left">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 lg:mx-0">

                  <FaUserShield className="text-3xl" />

                </div>

                <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                  Secure Access
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  Admin Sign In
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to access the CivicConnect administration dashboard.
                </p>

              </div>

              {/* Error */}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  ⚠️ {error}
                </motion.div>
              )}

              {/* FORM */}

              <form
                onSubmit={handleAdminLogin}
                className="mt-7 space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="admin-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Administrator Email
                  </label>

                  <div className="flex h-13 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">

                    <FaEnvelope className="shrink-0 text-slate-400" />

                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="admin@civicconnect.ai"
                      autoComplete="username"
                      className="h-full w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="admin-password"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                    <span className="text-xs font-medium text-slate-400">
                      Admin access
                    </span>

                  </div>

                  <div className="flex h-13 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">

                    <FaLock className="shrink-0 text-slate-400" />

                    <input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter administrator password"
                      autoComplete="current-password"
                      className="h-full w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((visible) => !visible)
                      }
                      className="shrink-0 text-slate-400 transition hover:text-blue-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>

                  </div>

                </div>

                {/* LOGIN */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-13 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                >

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Verifying Access...
                    </>
                  ) : (
                    <>
                      <FaShieldAlt />
                      Secure Admin Login
                    </>
                  )}

                </button>

              </form>

              {/* SECURITY NOTICE */}

              <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                <div className="flex gap-3">

                  <FaShieldAlt className="mt-0.5 shrink-0 text-blue-600" />

                  <div>

                    <p className="text-sm font-bold text-blue-900">
                      Authorized Access Only
                    </p>

                    <p className="mt-1 text-xs leading-5 text-blue-700">
                      This portal is intended only for authorized CivicConnect
                      administrators. Administrative actions may affect complaint
                      management and resolution workflows.
                    </p>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="mt-7 border-t border-slate-100 pt-5 text-center">

                <Link
                  to="/login"
                  className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  ← Return to Citizen Portal
                </Link>

                <p className="mt-3 text-xs text-slate-400">
                  CivicConnect AI · Secure Administration
                </p>

              </div>

            </section>

          </div>

        </motion.div>

      </div>

    </main>
  );
}