import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaEnvelope,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

const OTP = () => {
  const navigate = useNavigate();

  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [timer, setTimer] = useState(300);

  const inputRefs = useRef([]);

  useEffect(() => {
    const savedEmail =
      localStorage.getItem("otpEmail");

    if (!savedEmail) {
      navigate("/register", { replace: true });
      return;
    }

    setEmail(savedEmail);

    inputRefs.current[0]?.focus();
  }, [navigate]);

  // Timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;

    setOtp(updatedOtp);
    setErrorMessage("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const updatedOtp = [...otp];

    pastedValue.split("").forEach(
      (digit, index) => {
        updatedOtp[index] = digit;
      }
    );

    setOtp(updatedOtp);

    const focusIndex = Math.min(
      pastedValue.length,
      5
    );

    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    setErrorMessage("");
    setSuccessMessage("");

    if (enteredOtp.length !== 6) {
      setErrorMessage(
        "Please enter the complete 6-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp: enteredOtp,
          }),
        }
      );

      const data = await response.json();

      console.log("Verify OTP Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid OTP."
        );
      }

      // Save successful verification
      localStorage.setItem(
        "otpVerified",
        "true"
      );

      localStorage.setItem(
        "accountVerified",
        "true"
      );

      localStorage.setItem(
        "isLoggedIn",
        "false"
      );

      localStorage.setItem(
        "loginEmail",
        email
      );

      if (data.userId) {
        localStorage.setItem(
          "userId",
          String(data.userId)
        );
      }

      if (data.name) {
        localStorage.setItem(
          "userName",
          data.name
        );
      }

      // New account must select role after login.
      localStorage.removeItem("userRole");

      setSuccessMessage(
        "Email verified successfully! Your account has been created."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error
      );

      setErrorMessage(
        error.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const name =
      localStorage.getItem("registerName");

    const password =
      localStorage.getItem(
        "registerPassword"
      );

    if (!email || !name || !password) {
      setErrorMessage(
        "Registration details are missing. Please register again."
      );
      return;
    }

    try {
      setResending(true);
      setErrorMessage("");
      setSuccessMessage("");

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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to resend OTP."
        );
      }

      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setTimer(300);

      setSuccessMessage(
        "A new OTP has been sent to your email."
      );

      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to resend OTP."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center px-4 py-8">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-200/40 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.97,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
        }}
        className="relative w-full max-w-md"
      >

        {/* Back */}
        <button
          onClick={() => navigate("/register")}
          className="mb-5 flex items-center gap-2 text-slate-600 hover:text-blue-700 font-medium transition"
        >
          <FaArrowLeft />
          Back
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-7 py-8 text-white text-center">

            <div className="mx-auto w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mb-4">
              <FaShieldAlt className="text-3xl" />
            </div>

            <h1 className="text-2xl font-bold">
              Verify Your Email
            </h1>

            <p className="text-blue-100 text-sm mt-2">
              Enter the 6-digit OTP sent to your email.
            </p>
          </div>

          {/* Content */}
          <div className="p-7">

            {/* Email */}
            <div className="flex items-center justify-center gap-2 text-slate-600 mb-7">
              <FaEnvelope className="text-blue-600" />

              <span className="text-sm font-medium break-all">
                {email}
              </span>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
                {errorMessage}
              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center justify-center gap-2 text-center">
                <FaCheckCircle />
                {successMessage}
              </div>
            )}

            {/* OTP Boxes */}
            <div
              className="flex justify-center gap-2 sm:gap-3 mb-7"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] =
                      element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) =>
                    handleChange(
                      index,
                      event.target.value
                    )
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(
                      index,
                      event
                    )
                  }
                  className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center mb-6">
              {timer > 0 ? (
                <p className="text-sm text-slate-500">
                  OTP expires in{" "}
                  <span className="font-bold text-blue-600">
                    {formatTime()}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-red-500 font-medium">
                  OTP expired. Please resend OTP.
                </p>
              )}
            </div>

            {/* Verify */}
            <button
              onClick={handleVerify}
              disabled={
                loading ||
                otp.join("").length !== 6
              }
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

            {/* Resend */}
            <div className="text-center mt-5">
              <button
                onClick={handleResend}
                disabled={
                  resending || timer > 0
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {resending
                  ? "Sending..."
                  : "Resend OTP"}
              </button>
            </div>

            {/* Login */}
            <p className="text-center text-sm text-slate-500 mt-6">
              Already verified?{" "}
              <button
                onClick={() =>
                  navigate("/login")
                }
                className="font-semibold text-blue-600 hover:text-blue-800"
              >
                Login
              </button>
            </p>

          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-5">
          Your verification code is valid for 5 minutes.
        </p>

      </motion.div>
    </div>
  );
};

export default OTP;