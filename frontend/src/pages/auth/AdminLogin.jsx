import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaEnvelope,
  FaCheckCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("otpVerified");
    localStorage.removeItem("accountVerified");
    localStorage.removeItem("loginEmail");
    localStorage.removeItem("otpEmail");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("accountRole");
    localStorage.removeItem("selectedRole");
    localStorage.removeItem("selectedDashboard");
    localStorage.removeItem("loginTime");

    sessionStorage.clear();

    navigate("/login", { replace: true });
  };

  const handleBack = () => {
    navigate("/role-selection");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

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
          data.message || "Invalid administrator credentials."
        );
      }

      if (!data.user) {
        throw new Error("Administrator account details were not returned.");
      }

      const actualRole = String(data.user.role || "").toLowerCase();

      if (actualRole !== "admin") {
        throw new Error(
          "Access denied. This account is not authorized for Administrator access."
        );
      }

      // Store verified administrator session
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginEmail", data.user.email);
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userId", String(data.user.id));
      localStorage.setItem("userName", data.user.name || "Administrator");

      localStorage.setItem("userRole", "admin");
      localStorage.setItem("accountRole", "admin");
      localStorage.setItem("selectedRole", "admin");
      localStorage.setItem("selectedDashboard", "admin");

      localStorage.setItem("accountVerified", "true");
      localStorage.setItem("otpVerified", "true");
      localStorage.setItem("loginTime", new Date().toISOString());

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Unable to login. Please check your administrator credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1F2937]">

      {/* Top Government Style Strip */}
      <div className="h-1.5 flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* Header */}
      <header className="bg-[#0B1F3A] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#0057B8] flex items-center justify-center shadow-md">
              <FaShieldAlt className="text-xl" />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                CivicConnect AI
              </h1>

              <p className="text-xs md:text-sm text-blue-200">
                Smart Public Grievance Platform
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 transition"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4 py-10">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >

          {/* Back */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[#0057B8] font-semibold mb-5 hover:text-[#003f86] transition"
          >
            <FaArrowLeft />
            Back to Workspace Selection
          </button>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

            {/* Card Header */}
            <div className="bg-gradient-to-r from-[#0B1F3A] via-[#0057B8] to-[#087E8B] px-7 py-7 text-white">

              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mb-4">
                <FaShieldAlt className="text-2xl" />
              </div>

              <p className="text-xs uppercase tracking-widest text-blue-100 font-semibold mb-2">
                Secure Workspace
              </p>

              <h2 className="text-2xl md:text-3xl font-bold">
                Administrator Login
              </h2>

              <p className="mt-2 text-sm text-blue-100">
                Authorized administrative access only.
              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-7 space-y-5"
            >

              {/* Security Badge */}
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <FaCheckCircle className="text-[#138808]" />

                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Protected Access
                  </p>

                  <p className="text-xs text-green-700">
                    Administrator credentials are verified securely.
                  </p>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                  Administrator Email
                </label>

                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter administrator email"
                    autoComplete="username"
                    className="w-full pl-11 pr-4 py-3.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0057B8] focus:border-[#0057B8] transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-[#1F2937] mb-2">
                  Administrator Password
                </label>

                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter administrator password"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#0057B8] focus:border-[#0057B8] transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0057B8] transition"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#0057B8] hover:bg-[#004494] disabled:bg-slate-400 text-white font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FaShieldAlt />
                    Secure Administrator Login
                  </>
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="px-7 py-4 bg-[#F5F7FA] border-t border-slate-200">
              <p className="text-center text-xs text-slate-500">
                Authorized administrative personnel only
              </p>
            </div>

          </div>

        </motion.div>

      </main>
    </div>
  );
};

export default AdminLogin;