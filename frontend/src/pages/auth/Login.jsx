import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaUserPlus,
  FaQuestionCircle,
  FaGlobe,
  FaUniversalAccess,
  FaCheckCircle,
  FaHome,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError(
        "Please enter your email address and password."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Invalid email or password."
        );
      }

      const user = data.user;

      if (!user) {
        throw new Error(
          "Login response is incomplete."
        );
      }

      const actualRole =
        user.role?.trim().toLowerCase() || "";

      // Store authenticated user information
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
        user.name || "User"
      );

      localStorage.setItem(
        "accountRole",
        actualRole
      );

      localStorage.setItem(
        "userRole",
        actualRole
      );

      localStorage.setItem(
        "accountVerified",
        String(user.isVerified)
      );

      // Clear previous workspace selection
      localStorage.removeItem(
        "selectedRole"
      );

      localStorage.removeItem(
        "selectedDashboard"
      );

      // Every successful login goes through Role Selection
      navigate("/role-selection", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
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

            {/* Logo / Brand */}
            <Link
              to="/"
              className="flex items-center gap-4"
            >

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

            </Link>

            {/* Utility controls */}
            <div className="hidden items-center gap-2 md:flex">

              <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                <FaGlobe className="text-[#0057b8]" />
                English
              </button>

              <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
                <FaUniversalAccess className="text-[#138808]" />
                Accessibility
              </button>

            </div>

          </div>

          {/* Portal navigation */}
          <nav className="hidden border-t border-slate-100 py-2 md:flex">

            <Link
              to="/"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-[#0057b8] hover:bg-blue-50"
            >
              <FaHome />
              Home
            </Link>

            <Link
              to="/register"
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Create Account
            </Link>

            <button className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
              Help
            </button>

          </nav>

        </div>

      </header>

      {/* =====================================================
          NOTICE
      ====================================================== */}
      <div className="border-b border-blue-100 bg-blue-50">

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2.5 text-sm">

          <span className="rounded bg-[#0057b8] px-2.5 py-1 text-xs font-bold text-white">
            SECURE LOGIN
          </span>

          <span className="text-slate-700">
            Sign in to access your CivicConnect AI services.
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-5 py-10">

        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-sm text-slate-500">

          <FaHome className="text-[#0057b8]" />

          <span>Home</span>

          <span>›</span>

          <span className="font-semibold text-[#0057b8]">
            Login
          </span>

        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-[1.1fr_0.9fr]">

          {/* =================================================
              LEFT INFORMATION PANEL
          ================================================== */}
          <motion.section
            initial={{
              opacity: 0,
              x: -20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >

            {/* Blue heading */}
            <div className="bg-[#0057b8] px-8 py-7 text-white md:px-10">

              <p className="text-sm font-bold uppercase tracking-wider text-blue-100">
                Digital Public Service Platform
              </p>

              <h2 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
                Welcome to
                <br />
                CivicConnect AI
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-blue-50 md:text-base">
                Access a secure digital platform to
                report public grievances, monitor
                complaints and track resolution progress.
              </p>

            </div>

            {/* Service information */}
            <div className="p-8 md:p-10">

              <h3 className="text-lg font-bold text-[#0b1f3a]">
                One platform for public services
              </h3>

              <div className="mt-6 space-y-5">

                {/* Item */}
                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0057b8]">
                    <FaCheckCircle />
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0b1f3a]">
                      AI-Assisted Classification
                    </h4>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Civic complaints can be analyzed
                      and categorized for appropriate routing.
                    </p>
                  </div>

                </div>

                {/* Item */}
                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#ff9933]">
                    <FaCheckCircle />
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0b1f3a]">
                      Transparent Tracking
                    </h4>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Follow your complaint from submission
                      through resolution.
                    </p>
                  </div>

                </div>

                {/* Item */}
                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-green-50 text-[#138808]">
                    <FaCheckCircle />
                  </div>

                  <div>
                    <h4 className="font-bold text-[#0b1f3a]">
                      Secure Account Access
                    </h4>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Your workspace is selected according
                      to your registered account role.
                    </p>
                  </div>

                </div>

              </div>

              {/* Tricolor accent */}
              <div className="mt-9 flex h-1.5 overflow-hidden rounded-full">
                <div className="w-1/3 bg-[#ff9933]" />
                <div className="w-1/3 bg-white border-y border-slate-200" />
                <div className="w-1/3 bg-[#138808]" />
              </div>

            </div>

          </motion.section>

          {/* =================================================
              LOGIN CARD
          ================================================== */}
          <motion.section
            initial={{
              opacity: 0,
              x: 20,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >

            <div className="p-7 md:p-9">

              {/* Login title */}
              <div className="mb-7">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-xl text-[#0057b8]">
                  <FaLock />
                </div>

                <p className="text-sm font-bold uppercase tracking-wide text-[#0057b8]">
                  Account Login
                </p>

                <h2 className="mt-1 text-3xl font-extrabold text-[#0b1f3a]">
                  Sign In
                </h2>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Enter your registered account details
                  to continue.
                </p>

              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-[#1f2937]"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0057b8]" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      className="w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0057b8] focus:ring-2 focus:ring-[#0057b8]/15"
                    />

                  </div>

                </div>

                {/* Password */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-bold text-[#1f2937]"
                    >
                      Password
                    </label>

                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-[#0057b8] hover:underline"
                    >
                      Forgot Password?
                    </Link>

                  </div>

                  <div className="relative">

                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0057b8]" />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0057b8] focus:ring-2 focus:ring-[#0057b8]/15"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-[#0057b8]"
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

                {/* Remember / security */}
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-600">

                  <FaShieldAlt className="shrink-0 text-[#138808]" />

                  <span>
                    Secure sign-in with your registered
                    CivicConnect AI account.
                  </span>

                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-3 rounded-lg bg-[#0057b8] px-5 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#004494] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}

                </button>

              </form>

              {/* Register divider */}
              <div className="my-7 flex items-center gap-3">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-medium text-slate-400">
                  New to CivicConnect?
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* Register button */}
              <Link
                to="/register"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#0057b8] bg-white px-5 py-3.5 text-sm font-bold text-[#0057b8] transition hover:bg-blue-50"
              >
                <FaUserPlus />
                Create New Account
              </Link>

              {/* Help */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">

                <FaQuestionCircle className="text-[#0057b8]" />

                Need help accessing your account?

              </div>

            </div>

          </motion.section>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-7">

          <div className="flex flex-col justify-between gap-4 text-xs text-slate-500 md:flex-row">

            <p>
              © 2026 CivicConnect AI • Smart Public
              Grievance Platform
            </p>

            <div className="flex gap-5">
              <span className="cursor-pointer hover:text-[#0057b8]">
                Privacy
              </span>

              <span className="cursor-pointer hover:text-[#0057b8]">
                Accessibility
              </span>

              <span className="cursor-pointer hover:text-[#0057b8]">
                Help
              </span>
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default Login;