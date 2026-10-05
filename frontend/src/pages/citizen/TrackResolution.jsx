import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaClipboardCheck,
  FaRobot,
  FaBuilding,
  FaUserTie,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaSyncAlt,
  FaFileAlt,
  FaImage,
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

export default function TrackResolution() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH USER COMPLAINTS
  // =====================================================

  const fetchComplaints = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const email =
        localStorage.getItem("loginEmail") ||
        localStorage.getItem("userEmail") ||
        localStorage.getItem("otpEmail");

      if (!email) {
        setError(
          "User email not found. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/complaints?email=${encodeURIComponent(
          email
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch complaints"
        );
      }

      const complaintList = Array.isArray(data)
        ? data
        : [];

      setComplaints(complaintList);

      // Select newest complaint automatically
      if (complaintList.length > 0) {
        setSelectedComplaint((current) => {
          if (!current) {
            return complaintList[0];
          }

          const updated = complaintList.find(
            (item) => item.id === current.id
          );

          return updated || complaintList[0];
        });
      } else {
        setSelectedComplaint(null);
      }
    } catch (err) {
      console.error(
        "❌ Fetch complaints error:",
        err
      );

      setError(
        err.message ||
          "Unable to load your complaints."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =====================================================
  // STATUS HELPERS
  // =====================================================

  const getStatus = (complaint) => {
    return complaint?.status || "Pending";
  };

  const getStatusColor = (status) => {
    if (status === "Resolved") {
      return "bg-green-50 text-[#138808] border-green-200";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-[#0057B8] border-blue-200";
    }

    if (status === "Rejected") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-orange-50 text-orange-700 border-orange-200";
  };

  // =====================================================
  // TIMELINE
  // =====================================================

  const getTimeline = (complaint) => {
    if (!complaint) {
      return [];
    }

    const status = complaint.status || "Pending";

    const progressDone =
      status === "In Progress" ||
      status === "Resolved";

    const resolvedDone =
      status === "Resolved";

    return [
      {
        title: "Complaint Submitted",
        description:
          "Your civic complaint has been successfully submitted.",
        icon: <FaFileAlt />,
        done: true,
      },

      {
        title: "AI Analysis Completed",
        description:
          "CivicConnect AI analyzed the complaint and identified the issue category.",
        icon: <FaRobot />,
        done: true,
      },

      {
        title: "Department Assigned",
        description:
          complaint.department ||
          "Department assignment is being processed.",
        icon: <FaBuilding />,
        done: true,
      },

      {
        title: "Resolution In Progress",
        description: progressDone
          ? "The responsible authority is working on your complaint."
          : "Waiting for the responsible authority to start the resolution process.",
        icon: <FaHourglassHalf />,
        done: progressDone,
      },

      {
        title: "Complaint Resolved",
        description: resolvedDone
          ? complaint.resolution_note ||
            "Your complaint has been marked as resolved."
          : "This step will be completed once the complaint is resolved.",
        icon: <FaCheckCircle />,
        done: resolvedDone,
      },
    ];
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-6">

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 text-center max-w-md w-full">

          <div className="h-1 flex -mx-10 -mt-10 mb-10 overflow-hidden rounded-t-3xl">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white border-y border-slate-100" />
            <div className="w-1/3 bg-[#138808]" />
          </div>

          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0057B8] text-white flex items-center justify-center shadow-lg">
            <FaSyncAlt className="text-2xl animate-spin" />
          </div>

          <h2 className="text-2xl font-black text-[#0B1F3A] mt-6">
            Loading Your Complaints
          </h2>

          <p className="text-slate-500 mt-2">
            Please wait while we fetch your complaint status.
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* =================================================
          TRICOLOR TOP BAR
      ================================================= */}

      <div className="h-1 flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4">

          <div className="flex items-center justify-between gap-4">

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[#0057B8] text-white flex items-center justify-center shadow-md">
                <FaClipboardCheck className="text-xl" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0B1F3A]">
                  CivicConnect{" "}
                  <span className="text-[#0057B8]">
                    AI
                  </span>
                </h1>

                <p className="text-xs text-slate-500 font-medium">
                  Digital Public Grievance Platform
                </p>
              </div>

            </div>

            {/* BUTTONS */}

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() => fetchComplaints(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-[#0057B8] font-bold border border-blue-100 hover:bg-[#0057B8] hover:text-white transition disabled:opacity-60"
              >
                <FaSyncAlt
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/citizen/dashboard")
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 shadow-sm hover:bg-slate-50 transition"
              >
                <FaArrowLeft />

                <span className="hidden sm:inline">
                  Dashboard
                </span>
              </button>

            </div>

          </div>

        </div>

        {/* TRICOLOR ACCENT */}

        <div className="h-1 flex">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-[#0057B8]" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-5 sm:px-6 py-8">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1F3A] via-[#0057B8] to-[#087FBD] text-white shadow-xl mb-8">

          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-[#138808]/10 blur-3xl" />

          <div className="relative p-7 sm:p-10">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

              <div className="max-w-3xl">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                    <FaClipboardCheck className="text-2xl" />
                  </div>

                  <span className="text-sm font-bold text-blue-100 uppercase tracking-wider">
                    Citizen Service Portal
                  </span>

                </div>

                <h2 className="text-4xl sm:text-5xl font-black">
                  Track Resolution
                </h2>

                <p className="mt-4 text-blue-50 text-base sm:text-lg leading-relaxed">
                  Follow your complaint from submission
                  to resolution with a transparent civic
                  service timeline.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/report-complaint")
                }
                className="self-start lg:self-center bg-white text-[#0057B8] px-6 py-3.5 rounded-2xl font-black shadow-lg hover:bg-blue-50 transition"
              >
                + Report Complaint
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-8 bg-white border border-red-200 rounded-3xl p-6 shadow-sm">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <FaExclamationTriangle />
              </div>

              <div>

                <h3 className="font-black text-red-700 text-lg">
                  Unable to Load Complaints
                </h3>

                <p className="text-slate-600 mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => fetchComplaints()}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#0057B8] text-white font-bold hover:bg-[#004494] transition"
                >
                  Try Again
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            NO COMPLAINTS
        ================================================= */}

        {!error && complaints.length === 0 && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-12 text-center">

            <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 text-[#0057B8] flex items-center justify-center">
              <FaClipboardCheck className="text-3xl" />
            </div>

            <h3 className="text-2xl font-black text-[#0B1F3A] mt-6">
              No Complaints Found
            </h3>

            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              You haven't submitted any civic complaints
              yet. Report an issue to start tracking its
              resolution.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/report-complaint")
              }
              className="mt-6 px-6 py-3 rounded-xl bg-[#0057B8] text-white font-bold hover:bg-[#004494] transition"
            >
              Report Your First Complaint
            </button>

          </div>
        )}

        {/* =================================================
            COMPLAINT CONTENT
        ================================================= */}

        {!error && complaints.length > 0 && (
          <div className="grid lg:grid-cols-[360px_1fr] gap-7">

            {/* =================================================
                LEFT — COMPLAINT LIST
            ================================================= */}

            <section className="bg-white rounded-3xl shadow-lg border border-slate-200 p-5 h-fit">

              <div className="flex items-center justify-between mb-5">

                <div>
                  <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                    Your Complaints
                  </p>

                  <h3 className="text-2xl font-black text-[#0B1F3A] mt-1">
                    Select to Track
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0057B8] flex items-center justify-center font-black border border-blue-100">
                  {complaints.length}
                </div>

              </div>

              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">

                {complaints.map((complaint) => {

                  const selected =
                    selectedComplaint?.id ===
                    complaint.id;

                  const status =
                    complaint.status || "Pending";

                  return (
                    <button
                      type="button"
                      key={complaint.id}
                      onClick={() =>
                        setSelectedComplaint(
                          complaint
                        )
                      }
                      className={`w-full text-left rounded-2xl p-4 border transition ${
                        selected
                          ? "bg-[#0057B8] border-[#0057B8] text-white shadow-lg"
                          : "bg-[#F5F7FA] border-slate-100 hover:bg-blue-50 hover:border-blue-200 text-[#0B1F3A]"
                      }`}
                    >

                      <div className="flex items-center justify-between gap-3">

                        <div>

                          <p className="font-black text-lg">
                            #{complaint.id}
                          </p>

                          <p
                            className={`text-sm mt-1 ${
                              selected
                                ? "text-blue-100"
                                : "text-slate-500"
                            }`}
                          >
                            {complaint.category ||
                              "General Civic Issue"}
                          </p>

                        </div>

                        <span
                          className={`text-xs font-bold ${
                            selected
                              ? "text-white"
                              : "text-slate-600"
                          }`}
                        >
                          {status}
                        </span>

                      </div>

                    </button>
                  );
                })}

              </div>

            </section>

            {/* =================================================
                RIGHT — SELECTED COMPLAINT
            ================================================= */}

            {selectedComplaint && (
              <section className="space-y-6">

                {/* =================================================
                    COMPLAINT HEADER
                ================================================= */}

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

                  <div className="h-1 flex">
                    <div className="w-1/3 bg-[#FF9933]" />
                    <div className="w-1/3 bg-[#0057B8]" />
                    <div className="w-1/3 bg-[#138808]" />
                  </div>

                  <div className="p-6 sm:p-8">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                      <div>

                        <div className="flex items-center gap-3">

                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0057B8] flex items-center justify-center">
                            <FaClipboardCheck />
                          </div>

                          <div>

                            <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                              Complaint
                            </p>

                            <h3 className="text-2xl sm:text-3xl font-black text-[#0B1F3A]">
                              #{selectedComplaint.id}
                            </h3>

                          </div>

                        </div>

                        <p className="mt-5 text-lg font-bold text-[#0057B8]">
                          {selectedComplaint.category ||
                            "General Civic Issue"}
                        </p>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        <span
                          className={`px-4 py-2 rounded-full border font-bold text-sm ${getStatusColor(
                            getStatus(
                              selectedComplaint
                            )
                          )}`}
                        >
                          {getStatus(
                            selectedComplaint
                          )}
                        </span>

                        <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-bold text-sm">
                          ⚡{" "}
                          {selectedComplaint.priority ||
                            "Medium"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="border-t border-slate-100 p-6 sm:p-8">

                    <div className="grid md:grid-cols-2 gap-5">

                      <div className="bg-[#F5F7FA] rounded-2xl border border-slate-100 p-5">

                        <p className="text-xs font-black tracking-widest text-slate-400">
                          DESCRIPTION
                        </p>

                        <p className="mt-2 text-slate-700 leading-relaxed">
                          {selectedComplaint.description ||
                            "No description available."}
                        </p>

                      </div>

                      <div className="bg-[#F5F7FA] rounded-2xl border border-slate-100 p-5">

                        <p className="text-xs font-black tracking-widest text-slate-400">
                          LOCATION
                        </p>

                        <div className="flex items-start gap-3 mt-2 text-slate-700">

                          <FaMapMarkerAlt className="text-red-500 mt-1 shrink-0" />

                          <span>
                            {selectedComplaint.location ||
                              "Location not provided"}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    AI + DEPARTMENT
                ================================================= */}

                <div className="grid md:grid-cols-2 gap-6">

                  {/* AI */}

                  <div className="rounded-3xl shadow-lg p-6 bg-gradient-to-br from-[#0B1F3A] via-[#0057B8] to-[#087FBD] text-white">

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                        <FaRobot className="text-xl" />
                      </div>

                      <div>

                        <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">
                          AI Analysis
                        </p>

                        <h3 className="text-xl font-black">
                          Category Detected
                        </h3>

                      </div>

                    </div>

                    <div className="mt-6 bg-white/10 rounded-2xl p-5 border border-white/10">

                      <p className="text-blue-100 text-sm">
                        CivicConnect AI identified:
                      </p>

                      <p className="text-2xl font-black mt-1">
                        {selectedComplaint.category ||
                          "General Civic Issue"}
                      </p>

                    </div>

                  </div>

                  {/* DEPARTMENT */}

                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                    <div className="flex items-center gap-3">

                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0057B8] flex items-center justify-center">
                        <FaBuilding />
                      </div>

                      <div>

                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                          Responsible Department
                        </p>

                        <h3 className="text-xl font-black text-[#0B1F3A]">
                          Department
                        </h3>

                      </div>

                    </div>

                    <p className="mt-6 text-lg font-bold text-[#0057B8]">
                      {selectedComplaint.department ||
                        "Department Pending Assignment"}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">

                      <FaUserTie />

                      <span>
                        {selectedComplaint.assigned_to ||
                          "Authority Pending Assignment"}
                      </span>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    TIMELINE
                ================================================= */}

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-8">

                  <div className="mb-8">

                    <p className="text-xs font-black tracking-widest text-slate-400 uppercase">
                      Resolution Journey
                    </p>

                    <h3 className="text-2xl sm:text-3xl font-black text-[#0B1F3A] mt-1">
                      Complaint Timeline
                    </h3>

                    <p className="text-slate-500 mt-2">
                      Track every stage of your civic complaint.
                    </p>

                  </div>

                  <div className="relative">

                    {getTimeline(
                      selectedComplaint
                    ).map((item, index, array) => {

                      const isLast =
                        index ===
                        array.length - 1;

                      return (
                        <div
                          key={item.title}
                          className="relative flex gap-5"
                        >

                          {/* VERTICAL LINE */}

                          {!isLast && (
                            <div
                              className={`absolute left-[23px] top-12 w-0.5 h-[calc(100%-5px)] ${
                                item.done
                                  ? "bg-[#0057B8]"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}

                          {/* ICON */}

                          <div
                            className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                              item.done
                                ? "bg-[#0057B8] text-white shadow-lg"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {item.icon}
                          </div>

                          {/* CONTENT */}

                          <div className="pb-9">

                            <div className="flex flex-wrap items-center gap-3">

                              <h4
                                className={`text-lg font-black ${
                                  item.done
                                    ? "text-[#0B1F3A]"
                                    : "text-slate-400"
                                }`}
                              >
                                {item.title}
                              </h4>

                              {item.done && (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[#138808]">
                                  Completed
                                </span>
                              )}

                            </div>

                            <p
                              className={`mt-2 leading-relaxed ${
                                item.done
                                  ? "text-slate-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {item.description}
                            </p>

                          </div>

                        </div>
                      );
                    })}

                  </div>

                </div>

                {/* =================================================
                    EXTRA INFORMATION
                ================================================= */}

                <div className="grid md:grid-cols-2 gap-6">

                  {/* SUBMITTED */}

                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#0057B8] flex items-center justify-center">
                        <FaClock />
                      </div>

                      <div>

                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          Submitted On
                        </p>

                        <p className="font-bold text-slate-700 mt-1">
                          {selectedComplaint.created_at
                            ? new Date(
                                selectedComplaint.created_at
                              ).toLocaleString()
                            : "Date unavailable"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* EVIDENCE */}

                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF9933] flex items-center justify-center">
                        <FaImage />
                      </div>

                      <div className="min-w-0">

                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
                          Evidence
                        </p>

                        {selectedComplaint.image_url ? (
                          <a
                            href={`${API_URL}${selectedComplaint.image_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-[#0057B8] hover:underline"
                          >
                            View Uploaded Image
                          </a>
                        ) : (
                          <p className="font-bold text-slate-500 mt-1">
                            No image uploaded
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    RESOLUTION NOTE
                ================================================= */}

                {selectedComplaint.resolution_note && (
                  <div className="bg-green-50 border border-green-200 rounded-3xl p-6">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-green-100 text-[#138808] flex items-center justify-center shrink-0">
                        <FaCheckCircle />
                      </div>

                      <div>

                        <h3 className="text-lg font-black text-green-800">
                          Resolution Note
                        </h3>

                        <p className="mt-2 text-green-700 leading-relaxed">
                          {selectedComplaint.resolution_note}
                        </p>

                      </div>

                    </div>

                  </div>
                )}

                {/* =================================================
                    BOTTOM BUTTONS
                ================================================= */}

                <div className="flex flex-col sm:flex-row gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/citizen/dashboard")
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition"
                  >
                    <FaArrowLeft />
                    Back to Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/report-complaint")
                    }
                    className="flex-1 px-6 py-3.5 rounded-2xl bg-[#0057B8] text-white font-bold shadow-lg hover:bg-[#004494] transition"
                  >
                    Report Another Complaint
                  </button>

                </div>

              </section>
            )}

          </div>
        )}

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mt-10 border-t border-slate-200 bg-white">

        <div className="h-1 flex">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-white" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 text-center">

          <p className="text-sm font-semibold text-slate-600">
            CivicConnect AI — Digital Public Grievance Platform
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Smarter civic services through AI-powered complaint management.
          </p>

        </div>

      </footer>

    </div>
  );
}