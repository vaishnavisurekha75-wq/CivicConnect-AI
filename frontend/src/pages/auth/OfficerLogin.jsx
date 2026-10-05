import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaUserTie,
  FaLock,
  FaCheckCircle,
  FaHome,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const OfficerLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("isLoggedIn") === "true";

    if (!loggedIn) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Please enter your official officer email and password."
      );
      return;
    }

    setLoading(true);

    try {
      /*
        Officer authentication uses the existing backend /login
        endpoint first.

        The backend already determines the real platform role
        from the account ID.

        Only an account whose backend role is "officer"
        can continue from this page.
      */

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid officer email or password."
        );
      }

      const user = data.user;

      if (!user) {
        throw new Error(
          "Officer authentication response is incomplete."
        );
      }

      const actualRole =
        user.role?.trim().toLowerCase() || "";

      /*
        VERY IMPORTANT

        Even if somebody knows the officer-login page,
        a Citizen or Administrator account cannot use it.

        The backend role must specifically be "officer".
      */
      if (actualRole !== "officer") {
        throw new Error(
          "Access denied. This account is not authorized for Officer access."
        );
      }

      /*
        Store the verified officer account.
      */

      localStorage.setItem(
        "isLoggedIn",
        "true"
      );

      localStorage.setItem(
        "loginEmail",
        user.email
      );

      localStorage.setItem(
        "userEmail",
        user.email
      );

      localStorage.setItem(
        "userId",
        String(user.id)
      );

      localStorage.setItem(
        "userName",
        user.name || "Officer"
      );

      localStorage.setItem(
        "userRole",
        "officer"
      );

      localStorage.setItem(
        "accountRole",
        "officer"
      );

      localStorage.setItem(
        "selectedRole",
        "officer"
      );

      localStorage.setItem(
        "selectedDashboard",
        "officer"
      );

      localStorage.setItem(
        "accountVerified",
        String(user.isVerified)
      );

      setSuccess(
        "Officer authentication successful. Opening Officer Dashboard..."
      );

      setTimeout(() => {
        navigate("/officer/dashboard", {
          replace: true,
        });
      }, 700);

    } catch (err) {
      setError(
        err.message ||
          "Unable to authenticate officer."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/role-selection");
  };

  const handleLogout = () => {
    const keys = [
      "isLoggedIn",
      "accountVerified",
      "otpVerified",
      "loginEmail",
      "otpEmail",
      "userId",
      "userName",
      "userRole",
      "accountRole",
      "selectedRole",
      "selectedDashboard",
    ];

    keys.forEach((key) => {
      localStorage.removeItem(key);
    });

    sessionStorage.clear();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#1f2937]">

      {/* =====================================================
          TRICOLOR TOP STRIP
      ====================================================== */}
      <div className="h-1.5 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="border-b border-slate-200 bg-white shadow-sm">

        <div className="mx-auto max-w-7xl px-5">

          <div className="flex min-h-[82px] items-center justify-between">

            {/* BRAND */}
            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#0057b8] bg-white shadow-sm">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0057b8] text-white">
                  <FaShieldAlt className="text-lg" />
                </div>

              </div>

              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0b1f3a]">
                  CivicConnect AI
                </h1>

                <p className="text-xs font-medium text-slate-500">
                  Smart Public Grievance & Resolution Platform
                </p>
              </div>

            </div>

            {/* RIGHT ACTIONS */}
            <div className="hidden items-center gap-3 md:flex">

              <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-xs font-bold text-[#0057b8]">
                <FaUserTie />
                Officer Access
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <FaSignOutAlt />
                Sign Out
              </button>

            </div>

            {/* MOBILE */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 p-2.5 text-slate-600 md:hidden"
            >
              <FaSignOutAlt />
            </button>

          </div>

          {/* NAV */}
          <nav className="hidden border-t border-slate-100 md:flex">

            <div className="flex items-center gap-1 py-2">

              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-[#0057b8] hover:bg-blue-50"
              >
                <FaHome />
                Home
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <FaArrowLeft />
                Workspace Selection
              </button>

            </div>

          </nav>

        </div>

      </header>

      {/* =====================================================
          NOTICE
      ====================================================== */}
      <div className="border-b border-orange-200 bg-orange-50">

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2.5 text-sm">

          <span className="rounded bg-[#ff9933] px-2 py-1 text-xs font-bold text-white">
            SECURE
          </span>

          <span className="text-slate-700">
            Officer workspace requires secure authentication.
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="mx-auto flex max-w-7xl justify-center px-5 py-12">

        <div className="w-full max-w-xl">

          {/* BACK */}
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 flex items-center gap-2 text-sm font-semibold text-[#0057b8] transition hover:text-[#004494]"
          >
            <FaArrowLeft />
            Back to Workspace Selection
          </button>

          {/* =====================================================
              LOGIN CARD
          ====================================================== */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
          >

            {/* CARD TOP */}
            <div className="bg-gradient-to-r from-[#0b1f3a] via-[#0057b8] to-[#087e8b] px-7 py-8 text-white md:px-9">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/15 text-2xl backdrop-blur-sm">
                  <FaUserTie />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/75">
                    Secure Access
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">
                    Officer Login
                  </h2>
                </div>

              </div>

              <p className="mt-5 text-sm leading-6 text-white/80">
                Authorized department officers can use their
                official credentials to access the Officer Control
                Center.
              </p>

            </div>

            {/* CARD BODY */}
            <div className="p-7 md:p-9">

              {/* SECURITY BADGE */}
              <div className="mb-7 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#138808] text-white">
                  <FaLock />
                </div>

                <div>
                  <p className="text-sm font-bold text-[#0b1f3a]">
                    Authorized Officer Access
                  </p>

                  <p className="text-xs text-slate-500">
                    Credentials are verified securely.
                  </p>
                </div>

              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}
                <div>

                  <label className="mb-2 block text-sm font-bold text-[#0b1f3a]">
                    Officer Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter official officer email"
                    autoComplete="username"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-[#0057b8] focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* PASSWORD */}
                <div>

                  <label className="mb-2 block text-sm font-bold text-[#0b1f3a]">
                    Officer Password
                  </label>

                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter secure officer password"
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-[#0057b8] focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#0057b8]"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* ERROR */}
                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                  >
                    {error}
                  </motion.div>
                )}

                {/* SUCCESS */}
                {success && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
                  >
                    <FaCheckCircle className="mt-0.5 shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-lg bg-[#0057b8] px-6 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#004494] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Verifying Officer...
                    </>
                  ) : (
                    <>
                      Secure Officer Login
                      <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}

                </button>

              </form>

              {/* SECURITY NOTE */}
              <div className="mt-7 border-t border-slate-100 pt-6">

                <div className="flex gap-3">

                  <FaShieldAlt className="mt-0.5 shrink-0 text-[#138808]" />

                  <p className="text-xs leading-5 text-slate-500">
                    This workspace is restricted to authorized
                    officers. Do not share your login credentials
                    with other users.
                  </p>

                </div>

              </div>

            </div>

          </motion.section>

          {/* FOOTER TEXT */}
          <p className="mt-6 text-center text-xs text-slate-400">
            CivicConnect AI • Officer Secure Access
          </p>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-6 text-center">

          <p className="text-xs text-slate-400">
            © 2026 CivicConnect AI • Smart Public Grievance Platform
          </p>

        </div>

      </footer>

    </div>
  );
};

export default OfficerLogin;