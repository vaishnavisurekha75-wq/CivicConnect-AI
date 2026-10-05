import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaShieldAlt,
  FaCheckCircle,
  FaCity,
  FaUserPlus,
} from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/send-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            purpose: "register",
          }),
        }
      );

      const data = await response.json();

      console.log("Send OTP Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to send OTP."
        );
      }

      localStorage.setItem("otpEmail", email);
      localStorage.setItem("registerName", name);
      localStorage.setItem("registerPassword", password);

      setSuccessMessage(
        "OTP sent successfully! Please check your email."
      );

      setTimeout(() => {
        navigate("/otp");
      }, 800);
    } catch (error) {
      console.error("Register error:", error);

      setErrorMessage(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 px-4 py-8">

      {/* ================= BACKGROUND ================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-orange-200/35 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-green-100/30 blur-3xl" />

      </div>

      {/* ================= MAIN ================= */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center"
      >

        {/* ================= BACK ================= */}
        <button
          onClick={() => navigate("/")}
          className="mb-5 flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <FaArrowLeft />
          Back to Home
        </button>

        {/* ================= CARD ================= */}
        <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-blue-100/60">

          {/* ================= HEADER ================= */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-7 py-8 text-white">

            {/* Soft decorations */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/20" />

            <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-green-300/15" />

            <div className="relative">

              {/* Logo */}
              <div className="mb-6 flex items-center gap-3">

                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur">

                  <FaCity className="text-2xl text-white" />

                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-blue-600 bg-green-400" />

                </div>

                <div>

                  <h1 className="text-xl font-extrabold tracking-tight">
                    CivicConnect{" "}
                    <span className="text-orange-200">
                      AI
                    </span>
                  </h1>

                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-100">
                    Smart Public Grievance Platform
                  </p>

                </div>

              </div>

              {/* Heading */}
              <div className="flex items-start gap-3">

                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-200/20 text-orange-100">
                  <FaUserPlus className="text-sm" />
                </div>

                <div>

                  <h2 className="text-2xl font-black">
                    Create Account
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-blue-100">
                    Create your account to report and track civic issues.
                  </p>

                </div>

              </div>

            </div>
          </div>

          {/* ================= FORM ================= */}
          <form
            onSubmit={handleRegister}
            className="space-y-5 p-7"
          >

            {/* Error */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Success */}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"
              >
                <FaCheckCircle />
                {successMessage}
              </motion.div>
            )}

            {/* Name */}
            <InputField
              label="Full Name"
              icon={<FaUser />}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

            {/* Email */}
            <InputField
              label="Email Address"
              icon={<FaEnvelope />}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />

            {/* Password */}
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            {/* Confirm Password */}
            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              showPassword={showConfirmPassword}
              setShowPassword={setShowConfirmPassword}
            />

            {/* Security */}
            <div className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">

              <FaShieldAlt className="mt-0.5 shrink-0 text-green-600" />

              <p className="text-xs leading-5 text-slate-600">
                Your account information is securely handled by
                CivicConnect AI.
              </p>

            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition hover:from-blue-700 hover:to-blue-600 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Create Account
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-1">

              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs font-medium text-slate-400">
                  Already registered?
                </span>
              </div>

            </div>

            {/* Login */}
            <p className="text-center text-sm text-slate-600">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-extrabold text-blue-600 transition hover:text-green-600"
              >
                Login
              </Link>

            </p>

          </form>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">

          <FaShieldAlt className="text-green-600" />

          <span>
            Secure citizen services powered by CivicConnect AI
          </span>

        </div>

      </motion.div>
    </div>
  );
};


/* =========================================================
   INPUT FIELD
========================================================= */

const InputField = ({
  label,
  icon,
  type,
  name,
  value,
  onChange,
  placeholder,
}) => {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="group relative">

        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600">
          {icon}
        </div>

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-orange-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />

      </div>

    </div>
  );
};


/* =========================================================
   PASSWORD FIELD
========================================================= */

const PasswordField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  showPassword,
  setShowPassword,
}) => {
  return (
    <div>

      <label className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </label>

      <div className="group relative">

        <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600" />

        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-orange-200 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword((previous) => !previous)
          }
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-orange-500"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>

      </div>

    </div>
  );
};

export default Register;