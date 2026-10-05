import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaSpinner,
  FaMapMarkerAlt,
  FaBuilding,
  FaFlag,
  FaArrowLeft,
  FaSyncAlt,
  FaCheck,
  FaTools,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function MyComplaints() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const email =
    localStorage.getItem("loginEmail") ||
    localStorage.getItem("userEmail") ||
    localStorage.getItem("otpEmail");

  // =========================================================
  // FETCH COMPLAINTS
  // =========================================================

  const fetchComplaints = async () => {
    if (!email) {
      setError("Citizen login information not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/complaints?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to fetch complaints."
        );
      }

      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("My Complaints Error:", err);
      setError(err.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =========================================================
  // STATUS STYLE
  // =========================================================

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-green-50 text-[#138808] border border-green-200";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-[#0057B8] border border-blue-200";
    }

    return "bg-orange-50 text-orange-700 border border-orange-200";
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon = (status) => {
    if (status === "Resolved") {
      return <FaCheckCircle />;
    }

    if (status === "In Progress") {
      return <FaSpinner className="animate-spin" />;
    }

    return <FaClock />;
  };

  // =========================================================
  // COMPLAINT TIMELINE LOGIC
  // =========================================================

  const getTimelineStep = (complaint, step) => {
    const status = complaint.status || "Pending";

    if (step === "submitted") {
      return true;
    }

    if (step === "classified") {
      return true;
    }

    if (step === "assigned") {
      return Boolean(complaint.department);
    }

    if (step === "progress") {
      return (
        status === "In Progress" ||
        status === "Resolved"
      );
    }

    if (step === "resolved") {
      return status === "Resolved";
    }

    return false;
  };

  // =========================================================
  // TIMELINE ITEM
  // =========================================================

  const TimelineItem = ({
    active,
    completed,
    icon,
    title,
    description,
    last,
  }) => {
    return (
      <div className="relative flex gap-4">

        {!last && (
          <div
            className={`absolute left-[19px] top-10 h-[calc(100%-8px)] w-0.5 ${
              completed
                ? "bg-[#0057B8]"
                : "bg-slate-200"
            }`}
          />
        )}

        <div
          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-md ${
            completed
              ? "bg-[#0057B8] text-white"
              : active
              ? "bg-blue-50 text-[#0057B8]"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {completed ? <FaCheck /> : icon}
        </div>

        <div className="pb-7">

          <p
            className={`font-bold ${
              completed || active
                ? "text-[#0B1F3A]"
                : "text-slate-400"
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-sm ${
              completed || active
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            {description}
          </p>

        </div>
      </div>
    );
  };

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <main className="min-h-screen bg-[#F5F7FA]">

      {/* =====================================================
          TRICOLOR TOP BAR
      ===================================================== */}

      <div className="h-1 flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="bg-white border-b border-slate-200 shadow-sm">

        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-4">

          {/* TOP NAV */}

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0057B8] text-white shadow-md">
                <FaClipboardList className="text-xl" />
              </div>

              <div>
                <h1 className="text-xl font-black text-[#0B1F3A]">
                  CivicConnect{" "}
                  <span className="text-[#0057B8]">
                    AI
                  </span>
                </h1>

                <p className="text-xs font-medium text-slate-500">
                  Digital Public Grievance Platform
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                navigate("/citizen/dashboard")
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0057B8]"
            >
              <FaArrowLeft />
              <span className="hidden sm:inline">
                Back to Dashboard
              </span>
              <span className="sm:hidden">
                Back
              </span>
            </button>

          </div>

        </div>

        {/* TRICOLOR LINE */}

        <div className="h-1 flex">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-[#0057B8]" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="bg-gradient-to-r from-[#0B1F3A] via-[#0057B8] to-[#087FBD] text-white">

        <div className="mx-auto max-w-7xl px-5 sm:px-6 py-9">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <FaClipboardList className="text-2xl" />
                </div>

                <span className="text-sm font-bold uppercase tracking-wider text-blue-100">
                  Citizen Portal
                </span>

              </div>

              <h1 className="text-3xl font-black sm:text-4xl">
                My Complaints
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                Track your submitted civic complaints and
                monitor their resolution status.
              </p>

            </div>

            <button
              onClick={fetchComplaints}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#0057B8] shadow-lg transition hover:bg-blue-50"
            >
              <FaSyncAlt />
              Refresh
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-8">

        {/* ===================================================
            LOADING
        =================================================== */}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="rounded-3xl border border-slate-200 bg-white px-10 py-12 text-center shadow-sm">

              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-[#0057B8]" />

              <p className="mt-5 font-semibold text-slate-600">
                Loading your complaints...
              </p>

            </div>

          </div>
        )}

        {/* ===================================================
            ERROR
        =================================================== */}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              !
            </div>

            <p className="mt-4 font-semibold text-red-700">
              {error}
            </p>

            <button
              onClick={fetchComplaints}
              className="mt-5 rounded-xl bg-[#0057B8] px-5 py-2.5 font-semibold text-white transition hover:bg-[#004494]"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ===================================================
            EMPTY
        =================================================== */}

        {!loading &&
          !error &&
          complaints.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-[#0057B8]">
                <FaClipboardList className="text-3xl" />
              </div>

              <h2 className="mt-6 text-2xl font-black text-[#0B1F3A]">
                No Complaints Yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-slate-500">
                You haven't submitted any civic complaints yet.
              </p>

              <button
                onClick={() =>
                  navigate("/report-complaint")
                }
                className="mt-6 rounded-xl bg-[#0057B8] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#004494]"
              >
                Report a Complaint
              </button>

            </div>
          )}

        {/* ===================================================
            COMPLAINT LIST
        =================================================== */}

        {!loading &&
          !error &&
          complaints.length > 0 && (
            <div className="space-y-6">

              {/* SECTION TITLE */}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Citizen Service Portal
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-[#0B1F3A]">
                    Your Submitted Complaints
                  </h2>
                </div>

                <span className="w-fit rounded-full bg-blue-50 border border-blue-100 px-4 py-2 text-sm font-bold text-[#0057B8]">
                  {complaints.length} Complaint
                  {complaints.length !== 1 ? "s" : ""}
                </span>

              </div>

              {/* COMPLAINT CARDS */}

              {complaints.map((complaint, index) => (

                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl"
                >

                  {/* CARD TRICOLOR ACCENT */}

                  <div className="h-1 flex">
                    <div className="w-1/3 bg-[#FF9933]" />
                    <div className="w-1/3 bg-[#0057B8]" />
                    <div className="w-1/3 bg-[#138808]" />
                  </div>

                  {/* =========================================
                      CARD TOP
                  ========================================= */}

                  <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Complaint #{complaint.id}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-[#0B1F3A]">
                        {complaint.category ||
                          "Civic Complaint"}
                      </h3>

                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${getStatusStyle(
                        complaint.status
                      )}`}
                    >
                      {getStatusIcon(
                        complaint.status
                      )}

                      {complaint.status || "Pending"}
                    </span>

                  </div>

                  {/* =========================================
                      DETAILS
                  ========================================= */}

                  <div className="grid gap-5 p-6 md:grid-cols-2">

                    {/* DESCRIPTION */}

                    <div className="rounded-2xl border border-slate-100 bg-[#F5F7FA] p-5">

                      <div className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A]">

                        <FaClipboardList className="text-[#0057B8]" />

                        Description

                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {complaint.description ||
                          "No description provided."}
                      </p>

                    </div>

                    {/* LOCATION */}

                    <div className="rounded-2xl border border-slate-100 bg-[#F5F7FA] p-5">

                      <div className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A]">

                        <FaMapMarkerAlt className="text-red-500" />

                        Location

                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {complaint.location ||
                          "Location not provided."}
                      </p>

                    </div>

                    {/* DEPARTMENT */}

                    <div className="rounded-2xl border border-slate-100 bg-[#F5F7FA] p-5">

                      <div className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A]">

                        <FaBuilding className="text-[#0057B8]" />

                        Department

                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        {complaint.department ||
                          "Pending Assignment"}
                      </p>

                    </div>

                    {/* PRIORITY */}

                    <div className="rounded-2xl border border-slate-100 bg-[#F5F7FA] p-5">

                      <div className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A]">

                        <FaFlag className="text-[#FF9933]" />

                        Priority

                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        {complaint.priority || "Medium"}
                      </p>

                    </div>

                  </div>

                  {/* =========================================
                      COMPLAINT PROGRESS
                  ========================================= */}

                  <div className="mx-6 mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-green-50">

                    {/* Timeline Header */}

                    <div className="border-b border-blue-100 p-6">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0057B8] text-white shadow-md">
                          <FaClock />
                        </div>

                        <div>

                          <h4 className="text-lg font-black text-[#0B1F3A]">
                            Complaint Progress
                          </h4>

                          <p className="text-sm text-slate-500">
                            Track your complaint journey
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* Timeline */}

                    <div className="p-6">

                      {/* STEP 1 */}

                      <TimelineItem
                        completed={getTimelineStep(
                          complaint,
                          "submitted"
                        )}
                        active={true}
                        icon={<FaClipboardList />}
                        title="Complaint Submitted"
                        description="Your civic complaint has been successfully submitted."
                      />

                      {/* STEP 2 */}

                      <TimelineItem
                        completed={getTimelineStep(
                          complaint,
                          "classified"
                        )}
                        active={true}
                        icon={<FaSpinner />}
                        title="AI Classification"
                        description={`Complaint classified as ${
                          complaint.category ||
                          "Civic Issue"
                        }.`}
                      />

                      {/* STEP 3 */}

                      <TimelineItem
                        completed={getTimelineStep(
                          complaint,
                          "assigned"
                        )}
                        active={
                          Boolean(
                            complaint.department
                          ) &&
                          complaint.status ===
                            "Pending"
                        }
                        icon={<FaBuilding />}
                        title="Department Assigned"
                        description={
                          complaint.department
                            ? `${complaint.department} is responsible for this complaint.`
                            : "Waiting for department assignment."
                        }
                      />

                      {/* STEP 4 */}

                      <TimelineItem
                        completed={getTimelineStep(
                          complaint,
                          "progress"
                        )}
                        active={
                          complaint.status ===
                          "In Progress"
                        }
                        icon={<FaTools />}
                        title="Work In Progress"
                        description={
                          complaint.status ===
                          "In Progress"
                            ? "An officer is currently working on your complaint."
                            : "Work will begin after the complaint is taken up by the responsible authority."
                        }
                      />

                      {/* STEP 5 */}

                      <TimelineItem
                        completed={getTimelineStep(
                          complaint,
                          "resolved"
                        )}
                        active={
                          complaint.status ===
                          "Resolved"
                        }
                        icon={<FaCheckCircle />}
                        title="Complaint Resolved"
                        description={
                          complaint.status ===
                          "Resolved"
                            ? "Your complaint has been marked as resolved."
                            : "This step will be completed after the issue is resolved."
                        }
                        last
                      />

                    </div>

                  </div>

                  {/* =========================================
                      RESOLUTION NOTE
                  ========================================= */}

                  {complaint.status ===
                    "Resolved" &&
                    complaint.resolution_note && (

                      <div className="mx-6 mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">

                        <div className="flex items-center gap-2">

                          <FaCheckCircle className="text-[#138808]" />

                          <p className="text-sm font-bold text-green-800">
                            Resolution Note
                          </p>

                        </div>

                        <p className="mt-2 text-sm leading-6 text-green-700">
                          {complaint.resolution_note}
                        </p>

                      </div>

                    )}

                  {/* =========================================
                      DATE
                  ========================================= */}

                  <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs text-slate-400">
                      Submitted:{" "}
                      {complaint.created_at
                        ? new Date(
                            complaint.created_at
                          ).toLocaleString()
                        : "Date unavailable"}
                    </p>

                    <button
                      onClick={() =>
                        navigate(
                          "/track-resolution"
                        )
                      }
                      className="w-fit rounded-xl bg-blue-50 border border-blue-100 px-4 py-2 text-sm font-bold text-[#0057B8] transition hover:bg-[#0057B8] hover:text-white"
                    >
                      Track Resolution
                    </button>

                  </div>

                </motion.div>

              ))}

            </div>
          )}

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-8 border-t border-slate-200 bg-white">

        <div className="h-1 flex">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-6 text-center">

          <p className="text-sm font-semibold text-slate-600">
            CivicConnect AI — Digital Public Grievance Platform
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Smarter civic services through AI-powered
            complaint management.
          </p>

        </div>

      </footer>

    </main>
  );
}