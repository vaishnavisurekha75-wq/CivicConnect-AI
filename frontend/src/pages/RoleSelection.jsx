import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaUserTie,
  FaUserShield,
  FaArrowRight,
  FaSignOutAlt,
  FaShieldAlt,
  FaGlobe,
  FaUniversalAccess,
  FaHome,
  FaLock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");
  const [message, setMessage] = useState("");

  const email =
    localStorage.getItem("loginEmail") ||
    localStorage.getItem("otpEmail") ||
    "";

  const userName =
    localStorage.getItem("userName") || "User";

  useEffect(() => {
    const loggedIn =
      localStorage.getItem("isLoggedIn") === "true";

    if (!loggedIn || !email) {
      navigate("/login", { replace: true });
    }
  }, [navigate, email]);

  const roles = [
    {
      id: "citizen",
      title: "Citizen",
      subtitle: "Citizen Services",
      description:
        "Report civic issues, view submitted complaints and track resolution progress.",
      icon: <FaUser />,
      accent: "blue",
    },
    {
      id: "officer",
      title: "Officer",
      subtitle: "Department Services",
      description:
        "Review assigned complaints, update complaint status and manage resolutions.",
      icon: <FaUserTie />,
      accent: "orange",
    },
    {
      id: "admin",
      title: "Administrator",
      subtitle: "Platform Administration",
      description:
        "Monitor complaints, users and platform-level operations.",
      icon: <FaUserShield />,
      accent: "green",
    },
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    setMessage("");
  };

  const handleContinue = () => {
    if (!selectedRole) {
      setMessage("Please select a workspace to continue.");
      return;
    }

    setMessage("");

    localStorage.setItem("selectedRole", selectedRole);
    localStorage.setItem(
      "selectedDashboard",
      selectedRole
    );

    /*
      CITIZEN
      Directly opens Citizen Dashboard.
    */
    if (selectedRole === "citizen") {
      localStorage.setItem("userRole", "citizen");

      navigate("/citizen/dashboard", {
        replace: true,
      });

      return;
    }

    /*
      OFFICER
      Opens separate Officer Secure Login.
    */
    if (selectedRole === "officer") {
      navigate("/officer-login", {
        replace: true,
      });

      return;
    }

    /*
      ADMIN
      Opens separate Administrator Secure Login.
    */
    if (selectedRole === "admin") {
      navigate("/admin-login", {
        replace: true,
      });

      return;
    }
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

            {/* DESKTOP ACTIONS */}
            <div className="hidden items-center gap-3 text-sm md:flex">

              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100"
              >
                <FaGlobe className="text-[#0057b8]" />
                English
              </button>

              <button
                type="button"
                className="flex items-center gap-2 rounded-md px-3 py-2 font-medium text-slate-600 hover:bg-slate-100"
              >
                <FaUniversalAccess className="text-[#138808]" />
                Accessibility
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <FaSignOutAlt />
                Sign Out
              </button>

            </div>

            {/* MOBILE LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-300 p-2.5 text-slate-600 md:hidden"
            >
              <FaSignOutAlt />
            </button>

          </div>

          {/* NAVIGATION */}
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
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Citizen Services
              </button>

              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Grievance Services
              </button>

              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Help
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
            NOTICE
          </span>

          <span className="text-slate-700">
            Select the service area you want to access.
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-5 py-10">

        {/* BREADCRUMB */}
        <div className="mb-7 flex items-center gap-2 text-sm text-slate-500">

          <FaHome className="text-[#0057b8]" />

          <span>Home</span>

          <span>›</span>

          <span className="font-semibold text-[#0057b8]">
            Workspace Selection
          </span>

        </div>

        {/* =====================================================
            HEADING
        ====================================================== */}
        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-xl border border-slate-200 bg-white shadow-sm"
        >

          <div className="border-l-4 border-[#ff9933] p-7 md:p-9">

            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

              <div>

                <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#0057b8]">
                  Secure Workspace Access
                </p>

                <h2 className="text-3xl font-extrabold text-[#0b1f3a] md:text-4xl">
                  Choose Your Workspace
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">

                  Welcome back,{" "}

                  <span className="font-bold text-[#0b1f3a]">
                    {userName}
                  </span>

                  . Select the service area you want to
                  access.

                </p>

              </div>

              {/* ACCOUNT */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Registered Account
                </p>

                <p className="mt-1 break-all text-sm font-bold text-[#0b1f3a]">
                  {email}
                </p>

                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#138808]">
                  <span className="h-2 w-2 rounded-full bg-[#138808]" />
                  Verified Account
                </div>

              </div>

            </div>

          </div>

        </motion.section>

        {/* =====================================================
            ROLES
        ====================================================== */}
        <section className="mt-8">

          <div className="mb-4">

            <h3 className="text-lg font-bold text-[#0b1f3a]">
              Available Services
            </h3>

            <p className="text-sm text-slate-500">
              Select one workspace to continue.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-3">

            {roles.map((role, index) => {

              const selected =
                selectedRole === role.id;

              return (
                <motion.button
                  key={role.id}
                  type="button"
                  onClick={() =>
                    handleRoleSelect(role)
                  }
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  className={`relative overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all duration-200 ${
                    selected
                      ? "border-[#0057b8] ring-2 ring-[#0057b8]/20 shadow-md"
                      : "border-slate-200 hover:-translate-y-1 hover:border-[#0057b8] hover:shadow-md"
                  }`}
                >

                  {/* COLOUR STRIP */}
                  <div
                    className={`h-1.5 ${
                      role.accent === "blue"
                        ? "bg-[#0057b8]"
                        : role.accent === "orange"
                        ? "bg-[#ff9933]"
                        : "bg-[#138808]"
                    }`}
                  />

                  <div className="p-6">

                    {/* ICON */}
                    <div className="flex items-start justify-between">

                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-lg text-xl text-white ${
                          role.accent === "blue"
                            ? "bg-[#0057b8]"
                            : role.accent === "orange"
                            ? "bg-[#ff9933]"
                            : "bg-[#138808]"
                        }`}
                      >
                        {role.icon}
                      </div>

                      {/* AVAILABLE */}
                      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-[#138808]">
                        Available
                      </span>

                    </div>

                    {/* CONTENT */}
                    <div className="mt-6">

                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${
                          role.accent === "blue"
                            ? "text-[#0057b8]"
                            : role.accent === "orange"
                            ? "text-[#d97706]"
                            : "text-[#138808]"
                        }`}
                      >
                        {role.subtitle}
                      </p>

                      <h4 className="mt-2 text-2xl font-extrabold text-[#0b1f3a]">
                        {role.title}
                      </h4>

                      <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
                        {role.description}
                      </p>

                    </div>

                    {/* FOOTER */}
                    <div className="mt-6 border-t border-slate-100 pt-4">

                      <div className="flex items-center justify-between">

                        <span className="text-sm font-semibold text-[#0057b8]">
                          Select workspace
                        </span>

                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                            selected
                              ? "bg-[#0057b8] text-white"
                              : "bg-slate-100 text-[#0057b8]"
                          }`}
                        >
                          <FaArrowRight />
                        </span>

                      </div>

                    </div>

                  </div>

                </motion.button>
              );
            })}

          </div>

        </section>

        {/* =====================================================
            MESSAGE
        ====================================================== */}
        {message && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mx-auto mt-6 max-w-2xl rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-semibold text-red-700"
          >
            {message}
          </motion.div>
        )}

        {/* =====================================================
            CONTINUE
        ====================================================== */}
        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.35,
          }}
          className="mt-9 flex flex-col items-center"
        >

          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedRole}
            className="group flex min-w-[280px] items-center justify-center gap-3 rounded-lg bg-[#0057b8] px-8 py-4 text-base font-bold text-white shadow-md transition hover:bg-[#004494] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-45"
          >

            Continue to{" "}

            {selectedRole
              ? roles.find(
                  (role) =>
                    role.id === selectedRole
                )?.title
              : "Workspace"}

            <FaArrowRight className="transition-transform group-hover:translate-x-1" />

          </button>

          <p className="mt-3 flex items-center gap-2 text-center text-xs text-slate-500">

            <FaLock className="text-slate-400" />

            Officer and Administrator workspaces require
            additional secure authentication.

          </p>

        </motion.section>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mt-6 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-7">

          <div className="grid gap-6 text-sm md:grid-cols-3">

            <div>

              <h5 className="font-bold text-[#0b1f3a]">
                CivicConnect AI
              </h5>

              <p className="mt-2 leading-6 text-slate-500">
                Digital platform for reporting and
                tracking public grievances.
              </p>

            </div>

            <div>

              <h5 className="font-bold text-[#0b1f3a]">
                Citizen Services
              </h5>

              <p className="mt-2 text-slate-500">
                Report • Track • Resolve
              </p>

            </div>

            <div>

              <h5 className="font-bold text-[#0b1f3a]">
                Secure Access
              </h5>

              <p className="mt-2 text-slate-500">
                Officer • Administrator
              </p>

            </div>

          </div>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
            © 2026 CivicConnect AI • Smart Public Grievance Platform
          </div>

        </div>

      </footer>

    </div>
  );
};

export default RoleSelection;