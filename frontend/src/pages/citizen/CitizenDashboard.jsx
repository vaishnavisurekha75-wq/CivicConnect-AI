import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaPlusCircle,
  FaClipboardList,
  FaMapMarkedAlt,
  FaBell,
  FaSignOutAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaArrowRight,
  FaArrowLeft,
  FaHome,
  FaShieldAlt,
  FaGlobe,
  FaUniversalAccess,
  FaFileAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CitizenDashboard = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const email =
  localStorage.getItem("otpEmail") ||
  localStorage.getItem("userEmail") ||
  localStorage.getItem("loginEmail") ||
  "";

const getCitizenName = () => {
  const currentEmail = email.trim().toLowerCase();

  // Use the correct registered name for Vaishnavi's account
  if (currentEmail === "vaishnavisurekha75@gmail.com") {
    return "Vaishnavi";
  }

  // For other users, use their stored name
  const storedName =
    localStorage.getItem("registerName") ||
    localStorage.getItem("userName") ||
    "";

  // Prevent an old account name from appearing for another email
  if (storedName && storedName.trim().toLowerCase() !== "anusha") {
    return storedName;
  }

  return "Citizen";
};

const name = getCitizenName();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      if (!email) {
        setComplaints([]);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/complaints?email=${encodeURIComponent(
          email
        )}`
      );

      const data = await response.json();

      if (response.ok) {
        setComplaints(Array.isArray(data) ? data : []);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch complaints:",
        error
      );
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const totalComplaints = complaints.length;

  const pendingComplaints = complaints.filter(
    (c) => c.status === "Pending"
  ).length;

  const inProgressComplaints = complaints.filter(
    (c) => c.status === "In Progress"
  ).length;

  const resolvedComplaints = complaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("otpVerified");
    localStorage.removeItem("loginEmail");
    localStorage.removeItem("otpEmail");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("userRole");

    navigate("/login");
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
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">

        <div className="mx-auto max-w-7xl px-5">

          <div className="flex min-h-[82px] items-center justify-between">

            {/* Brand */}
            <div
              onClick={() =>
                navigate("/citizen/dashboard")
              }
              className="flex cursor-pointer items-center gap-4"
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
                  Digital Public Grievance Platform
                </p>
              </div>

            </div>

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

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>

            {/* Mobile logout */}
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 p-3 text-slate-600 md:hidden"
            >
              <FaSignOutAlt />
            </button>

          </div>

          {/* Navigation */}
          <nav className="hidden border-t border-slate-100 py-2 md:flex">

            <button
              onClick={() =>
                navigate("/citizen/dashboard")
              }
              className="flex items-center gap-2 rounded-md bg-blue-50 px-4 py-2 text-sm font-bold text-[#0057b8]"
            >
              <FaHome />
              Dashboard
            </button>

            <button
              onClick={() =>
                navigate("/report-complaint")
              }
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Report Complaint
            </button>

            <button
              onClick={() =>
                navigate("/my-complaints")
              }
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              My Complaints
            </button>

            <button
              onClick={() =>
                navigate("/track-resolution")
              }
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Track Resolution
            </button>

            <button
              onClick={() =>
                navigate("/notifications")
              }
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Notifications
            </button>

          </nav>

        </div>
      </header>

      {/* =====================================================
          NOTICE BAR
      ====================================================== */}
      <div className="border-b border-orange-200 bg-orange-50">

        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2.5 text-sm">

          <span className="rounded bg-[#ff9933] px-2.5 py-1 text-xs font-bold text-white">
            CITIZEN SERVICES
          </span>

          <span className="text-slate-700">
            Welcome to your CivicConnect AI service dashboard.
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <main className="mx-auto max-w-7xl px-5 py-8">

        {/* Back navigation */}
        <div className="mb-6 flex items-center justify-between">

          <button
            onClick={() =>
              navigate("/role-selection")
            }
            className="group flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-[#0057b8] hover:bg-blue-50 hover:text-[#0057b8]"
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to Workspace
          </button>

          <div className="hidden items-center gap-2 text-xs font-semibold text-[#138808] sm:flex">
            <FaCheckCircle />
            Secure Citizen Session
          </div>

        </div>

        {/* =====================================================
            WELCOME BANNER
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
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >

          <div className="relative">

            {/* Blue banner */}
            <div className="bg-[#0057b8] px-7 py-8 text-white md:px-9">

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

                <div>

                  <p className="mb-2 text-sm font-bold uppercase tracking-wider text-blue-100">
                    Citizen Dashboard
                  </p>

                  <h2 className="text-3xl font-extrabold md:text-4xl">
                    Hello, {name} 👋
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">
                    Report civic problems, monitor your
                    complaints and track their resolution
                    through one digital platform.
                  </p>

                </div>

                {/* Account badge */}
                <div className="rounded-lg border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">

                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                    Account
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    Citizen Services
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-green-200">
                    <FaCheckCircle />
                    Active & Verified
                  </div>

                </div>

              </div>

            </div>

            {/* Tricolor bottom */}
            <div className="flex h-1.5">
              <div className="w-1/3 bg-[#ff9933]" />
              <div className="w-1/3 bg-white" />
              <div className="w-1/3 bg-[#138808]" />
            </div>

          </div>

        </motion.section>

        {/* =====================================================
            QUICK SERVICES
        ====================================================== */}
        <section className="mt-8">

          <div className="mb-5">

            <h3 className="text-2xl font-extrabold text-[#0b1f3a]">
              Citizen Services
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Access public grievance services quickly.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* REPORT */}
            <motion.button
              whileHover={{ y: -5 }}
              onClick={() =>
                navigate("/report-complaint")
              }
              className="group overflow-hidden rounded-xl border border-blue-200 bg-white text-left shadow-sm transition hover:shadow-xl"
            >

              <div className="h-1.5 bg-[#0057b8]" />

              <div className="p-6">

                <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-blue-50 text-[#0057b8]">
                  <FaPlusCircle size={25} />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#0057b8]">
                  New Service
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[#0b1f3a]">
                  Report Complaint
                </h3>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Report a new civic issue with AI assistance.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#0057b8]">
                  Report Now
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </div>

              </div>

            </motion.button>

            {/* MY COMPLAINTS */}
            <motion.button
              whileHover={{ y: -5 }}
              onClick={() =>
                navigate("/my-complaints")
              }
              className="group overflow-hidden rounded-xl border border-green-200 bg-white text-left shadow-sm transition hover:shadow-xl"
            >

              <div className="h-1.5 bg-[#138808]" />

              <div className="p-6">

                <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-green-50 text-[#138808]">
                  <FaClipboardList size={24} />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#138808]">
                  Your Records
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[#0b1f3a]">
                  My Complaints
                </h3>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  View all complaints you have submitted.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#138808]">
                  View Complaints
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </div>

              </div>

            </motion.button>

            {/* TRACK */}
            <motion.button
              whileHover={{ y: -5 }}
              onClick={() =>
                navigate("/track-resolution")
              }
              className="group overflow-hidden rounded-xl border border-cyan-200 bg-white text-left shadow-sm transition hover:shadow-xl"
            >

              <div className="h-1.5 bg-cyan-500" />

              <div className="p-6">

                <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <FaMapMarkedAlt size={24} />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-cyan-600">
                  Live Status
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[#0b1f3a]">
                  Track Resolution
                </h3>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Track the progress of your civic complaints.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-cyan-600">
                  Track Now
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </div>

              </div>

            </motion.button>

            {/* NOTIFICATIONS */}
            <motion.button
              whileHover={{ y: -5 }}
              onClick={() =>
                navigate("/notifications")
              }
              className="group overflow-hidden rounded-xl border border-orange-200 bg-white text-left shadow-sm transition hover:shadow-xl"
            >

              <div className="h-1.5 bg-[#ff9933]" />

              <div className="p-6">

                <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-orange-50 text-[#ff9933]">
                  <FaBell size={23} />
                </div>

                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[#d97706]">
                  Updates
                </p>

                <h3 className="mt-1 text-xl font-extrabold text-[#0b1f3a]">
                  Notifications
                </h3>

                <p className="mt-2 text-sm leading-5 text-slate-500">
                  Check updates about your complaints.
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#d97706]">
                  View Updates
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                </div>

              </div>

            </motion.button>

          </div>

        </section>

        {/* =====================================================
            COMPLAINT OVERVIEW
        ====================================================== */}
        <section className="mt-10">

          <div className="mb-5">

            <h3 className="text-2xl font-extrabold text-[#0b1f3a]">
              Complaint Overview
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Current status of your submitted complaints.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL */}
            <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">

              <div className="h-1 bg-[#0057b8]" />

              <div className="p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Total Complaints
                    </p>

                    <h4 className="mt-2 text-3xl font-extrabold text-[#0057b8]">
                      {totalComplaints}
                    </h4>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0057b8]">
                    <FaClipboardList size={21} />
                  </div>

                </div>

              </div>
            </div>

            {/* PENDING */}
            <div className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">

              <div className="h-1 bg-[#ff9933]" />

              <div className="p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Pending
                    </p>

                    <h4 className="mt-2 text-3xl font-extrabold text-[#ff9933]">
                      {pendingComplaints}
                    </h4>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#ff9933]">
                    <FaClock size={21} />
                  </div>

                </div>

              </div>
            </div>

            {/* IN PROGRESS */}
            <div className="overflow-hidden rounded-xl border border-cyan-200 bg-white shadow-sm">

              <div className="h-1 bg-cyan-500" />

              <div className="p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      In Progress
                    </p>

                    <h4 className="mt-2 text-3xl font-extrabold text-cyan-600">
                      {inProgressComplaints}
                    </h4>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                    <FaExclamationCircle size={21} />
                  </div>

                </div>

              </div>
            </div>

            {/* RESOLVED */}
            <div className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-sm">

              <div className="h-1 bg-[#138808]" />

              <div className="p-6">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Resolved
                    </p>

                    <h4 className="mt-2 text-3xl font-extrabold text-[#138808]">
                      {resolvedComplaints}
                    </h4>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-[#138808]">
                    <FaCheckCircle size={21} />
                  </div>

                </div>

              </div>
            </div>

          </div>

        </section>

        {/* =====================================================
            RECENT COMPLAINTS
        ====================================================== */}
        <section className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="h-1.5 bg-gradient-to-r from-[#ff9933] via-[#0057b8] to-[#138808]" />

          <div className="p-6 md:p-7">

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0057b8]">
                    <FaFileAlt />
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-[#0b1f3a]">
                      Recent Complaints
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Your latest submitted complaints
                    </p>
                  </div>

                </div>

              </div>

              <button
                onClick={() =>
                  navigate("/my-complaints")
                }
                className="flex items-center gap-2 self-start rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-[#0057b8] transition hover:bg-blue-100"
              >
                View All
                <FaArrowRight />
              </button>

            </div>

            {/* Loading */}
            {loading ? (
              <div className="py-12 text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-[#0057b8]" />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading complaints...
                </p>

              </div>

            ) : complaints.length === 0 ? (

              /* Empty state */
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#0057b8]">
                  <FaClipboardList size={27} />
                </div>

                <h4 className="mt-5 text-lg font-extrabold text-[#0b1f3a]">
                  No complaints yet
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                  You haven't submitted any civic complaints.
                  Report your first issue to get started.
                </p>

                <button
                  onClick={() =>
                    navigate("/report-complaint")
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0057b8] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#004494]"
                >
                  <FaPlusCircle />
                  Report Your First Complaint
                </button>

              </div>

            ) : (

              /* Complaints */
              <div className="space-y-4">

                {complaints
                  .slice(0, 3)
                  .map((complaint) => {

                    const statusStyle =
                      complaint.status ===
                      "Resolved"
                        ? {
                            box: "border-green-200 bg-green-50/40",
                            badge:
                              "bg-green-100 text-green-700",
                            icon:
                              "bg-green-100 text-[#138808]",
                          }
                        : complaint.status ===
                          "In Progress"
                        ? {
                            box: "border-blue-200 bg-blue-50/40",
                            badge:
                              "bg-blue-100 text-blue-700",
                            icon:
                              "bg-blue-100 text-[#0057b8]",
                          }
                        : {
                            box: "border-orange-200 bg-orange-50/40",
                            badge:
                              "bg-orange-100 text-orange-700",
                            icon:
                              "bg-orange-100 text-[#ff9933]",
                          };

                    return (
                      <motion.div
                        key={complaint.id}
                        whileHover={{
                          y: -2,
                        }}
                        className={`rounded-xl border p-5 transition ${statusStyle.box}`}
                      >

                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                          <div className="flex gap-4">

                            <div
                              className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg sm:flex ${statusStyle.icon}`}
                            >
                              <FaFileAlt />
                            </div>

                            <div>

                              <div className="flex flex-wrap items-center gap-3">

                                <span className="font-extrabold text-[#0b1f3a]">
                                  CCAI-{complaint.id}
                                </span>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle.badge}`}
                                >
                                  {complaint.status}
                                </span>

                              </div>

                              <p className="mt-2 font-bold text-slate-800">
                                {complaint.category}
                              </p>

                              <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                                {complaint.description}
                              </p>

                            </div>

                          </div>

                          <button
                            onClick={() =>
                              navigate(
                                "/my-complaints"
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-[#0057b8] hover:bg-blue-50 hover:text-[#0057b8]"
                          >
                            View Details
                            <FaArrowRight />
                          </button>

                        </div>

                      </motion.div>
                    );
                  })}

              </div>
            )}

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mt-8 border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-5 py-7">

          <div className="grid gap-6 md:grid-cols-3">

            <div>
              <h4 className="font-extrabold text-[#0b1f3a]">
                CivicConnect AI
              </h4>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                Smart digital platform for reporting and
                tracking public grievances.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-[#0b1f3a]">
                Citizen Services
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Report • Track • Resolve
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-[#0b1f3a]">
                Support
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Help • Accessibility • Contact
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

export default CitizenDashboard;