import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaBuilding,
  FaRobot,
  FaSyncAlt,
  FaClipboardCheck,
  FaMapMarkerAlt,
  FaTools,
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

export default function Notifications() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // GET CURRENT USER EMAIL
  // =====================================================

  const getUserEmail = () => {
    return (
      localStorage.getItem("loginEmail") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("otpEmail") ||
      ""
    )
      .trim()
      .toLowerCase();
  };

  // =====================================================
  // FETCH COMPLAINTS
  // =====================================================

  const fetchComplaints = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const email = getUserEmail();

      if (!email) {
        setError("User email not found. Please login again.");
        setComplaints([]);
        return;
      }

      const response = await fetch(
        `${API_URL}/complaints?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load notifications."
        );
      }

      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Notifications Error:", err);

      setError(
        err.message || "Unable to load your notifications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =====================================================
  // CREATE NOTIFICATIONS FROM COMPLAINT DATA
  // =====================================================

  const notifications = useMemo(() => {
    const result = [];

    complaints.forEach((complaint) => {
      const status = complaint.status || "Pending";

      // ---------------------------------------------
      // 1. COMPLAINT SUBMITTED
      // ---------------------------------------------

      result.push({
        id: `${complaint.id}-submitted`,
        complaintId: complaint.id,
        type: "submitted",
        title: "Complaint Submitted",
        message:
          "Your civic complaint has been successfully received by CivicConnect AI.",
        icon: <FaClipboardCheck />,
        iconStyle: "bg-blue-100 text-blue-600",
        badgeStyle: "bg-blue-50 text-blue-700",
        time: complaint.created_at,
      });

      // ---------------------------------------------
      // 2. AI CLASSIFICATION
      // ---------------------------------------------

      result.push({
        id: `${complaint.id}-ai`,
        complaintId: complaint.id,
        type: "ai",
        title: "AI Classification Completed",
        message: `CivicConnect AI classified your complaint as ${
          complaint.category || "Civic Issue"
        }.`,
        icon: <FaRobot />,
        iconStyle: "bg-purple-100 text-purple-600",
        badgeStyle: "bg-purple-50 text-purple-700",
        time: complaint.created_at,
      });

      // ---------------------------------------------
      // 3. DEPARTMENT ASSIGNED
      // ---------------------------------------------

      if (complaint.department) {
        result.push({
          id: `${complaint.id}-department`,
          complaintId: complaint.id,
          type: "department",
          title: "Department Assigned",
          message: `${complaint.department} is responsible for handling your complaint.`,
          icon: <FaBuilding />,
          iconStyle: "bg-orange-100 text-orange-600",
          badgeStyle: "bg-orange-50 text-orange-700",
          time: complaint.created_at,
        });
      }

      // ---------------------------------------------
      // 4. WORK IN PROGRESS
      // ---------------------------------------------

      if (
        status === "In Progress" ||
        status === "Resolved"
      ) {
        result.push({
          id: `${complaint.id}-progress`,
          complaintId: complaint.id,
          type: "progress",
          title: "Resolution In Progress",
          message:
            "The responsible authority has started working on your complaint.",
          icon: <FaTools />,
          iconStyle: "bg-cyan-100 text-cyan-600",
          badgeStyle: "bg-cyan-50 text-cyan-700",
          time: complaint.created_at,
        });
      }

      // ---------------------------------------------
      // 5. RESOLVED
      // ---------------------------------------------

      if (status === "Resolved") {
        result.push({
          id: `${complaint.id}-resolved`,
          complaintId: complaint.id,
          type: "resolved",
          title: "Complaint Resolved",
          message:
            complaint.resolution_note ||
            "Your complaint has been successfully resolved by the responsible authority.",
          icon: <FaCheckCircle />,
          iconStyle: "bg-green-100 text-green-600",
          badgeStyle: "bg-green-50 text-green-700",
          time: complaint.created_at,
        });
      }

      // ---------------------------------------------
      // PENDING UPDATE
      // ---------------------------------------------

      if (status === "Pending") {
        result.push({
          id: `${complaint.id}-pending`,
          complaintId: complaint.id,
          type: "pending",
          title: "Complaint Under Processing",
          message:
            "Your complaint is currently waiting for action from the responsible authority.",
          icon: <FaClock />,
          iconStyle: "bg-yellow-100 text-yellow-600",
          badgeStyle: "bg-yellow-50 text-yellow-700",
          time: complaint.created_at,
        });
      }
    });

    // Latest notifications first
    return result.reverse();
  }, [complaints]);

  // =====================================================
  // STATUS SUMMARY
  // =====================================================

  const stats = useMemo(() => {
    const total = complaints.length;

    const pending = complaints.filter(
      (item) => (item.status || "Pending") === "Pending"
    ).length;

    const progress = complaints.filter(
      (item) => item.status === "In Progress"
    ).length;

    const resolved = complaints.filter(
      (item) => item.status === "Resolved"
    ).length;

    return {
      total,
      pending,
      progress,
      resolved,
    };
  }, [complaints]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-10 text-center max-w-md w-full">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
            <FaBell className="text-2xl animate-pulse" />
          </div>

          <h2 className="text-2xl font-black text-[#0B1F3A] mt-6">
            Loading Notifications
          </h2>

          <p className="text-slate-500 mt-2">
            Please wait while we fetch your latest complaint updates.
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* =================================================
          GOVERNMENT STYLE TOP STRIP
      ================================================= */}

      <div className="h-1 flex">
        <div className="w-1/3 bg-[#FF9933]" />
        <div className="w-1/3 bg-white" />
        <div className="w-1/3 bg-[#138808]" />
      </div>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-4">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[#0057B8] text-white flex items-center justify-center shadow-md">
                <FaBell className="text-lg" />
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

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() => fetchComplaints(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-[#0057B8] border border-blue-100 font-bold hover:bg-[#0057B8] hover:text-white transition disabled:opacity-60"
              >
                <FaSyncAlt
                  className={
                    refreshing ? "animate-spin" : ""
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
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition"
              >
                <FaArrowLeft />

                <span className="hidden sm:inline">
                  Dashboard
                </span>
              </button>

            </div>

          </div>

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

          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative p-7 sm:p-10">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

              <div>

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                    <FaBell className="text-2xl" />
                  </div>

                  <span className="text-sm font-bold text-blue-100 uppercase tracking-wider">
                    Citizen Service Portal
                  </span>

                </div>

                <h2 className="text-4xl sm:text-5xl font-black">
                  Notifications
                </h2>

                <p className="mt-3 text-blue-100 max-w-2xl">
                  Stay informed about every important update
                  related to your civic complaints.
                </p>

              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-5 min-w-[180px]">

                <p className="text-sm text-blue-100">
                  Total Updates
                </p>

                <p className="text-4xl font-black mt-1">
                  {notifications.length}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-5">

            <div className="flex items-start gap-3">

              <FaExclamationCircle className="text-red-500 text-xl mt-1" />

              <div>

                <p className="font-bold text-red-700">
                  Unable to load notifications
                </p>

                <p className="text-red-600 text-sm mt-1">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => fetchComplaints()}
                  className="mt-3 px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                >
                  Try Again
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        {!error && complaints.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Complaints
              </p>

              <p className="text-3xl font-black text-[#0B1F3A] mt-2">
                {stats.total}
              </p>
            </div>

            <div className="bg-white border border-yellow-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-600">
                Pending
              </p>

              <p className="text-3xl font-black text-yellow-700 mt-2">
                {stats.pending}
              </p>
            </div>

            <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                In Progress
              </p>

              <p className="text-3xl font-black text-blue-700 mt-2">
                {stats.progress}
              </p>
            </div>

            <div className="bg-white border border-green-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-green-600">
                Resolved
              </p>

              <p className="text-3xl font-black text-green-700 mt-2">
                {stats.resolved}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!error && complaints.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-12 text-center">

            <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-50 text-[#0057B8] flex items-center justify-center">
              <FaBell className="text-3xl" />
            </div>

            <h3 className="text-2xl font-black text-[#0B1F3A] mt-6">
              No Notifications Yet
            </h3>

            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              Once you submit a civic complaint, important
              updates about its progress will appear here.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/report-complaint")
              }
              className="mt-6 px-6 py-3 rounded-xl bg-[#0057B8] text-white font-bold shadow-md hover:bg-[#004494] transition"
            >
              Report a Complaint
            </button>

          </div>
        )}

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        {!error && notifications.length > 0 && (
          <section>

            <div className="flex items-center justify-between mb-5">

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Recent Activity
                </p>

                <h3 className="text-2xl font-black text-[#0B1F3A] mt-1">
                  Complaint Updates
                </h3>
              </div>

              <span className="px-4 py-2 rounded-full bg-blue-50 text-[#0057B8] text-sm font-bold">
                {notifications.length} Updates
              </span>

            </div>

            <div className="space-y-4">

              {notifications.map((notification) => {

                const complaint = complaints.find(
                  (item) =>
                    item.id === notification.complaintId
                );

                return (
                  <article
                    key={notification.id}
                    className="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition overflow-hidden"
                  >

                    {/* Accent line */}

                    <div className="h-1 flex">

                      <div className="w-1/3 bg-[#FF9933]" />
                      <div className="w-1/3 bg-[#0057B8]" />
                      <div className="w-1/3 bg-[#138808]" />

                    </div>

                    <div className="p-6">

                      <div className="flex items-start gap-4">

                        {/* Icon */}

                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${notification.iconStyle}`}
                        >
                          {notification.icon}
                        </div>

                        {/* Content */}

                        <div className="flex-1 min-w-0">

                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <h4 className="text-xl font-black text-[#0B1F3A]">
                                  {notification.title}
                                </h4>

                                <span
                                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${notification.badgeStyle}`}
                                >
                                  Complaint #{notification.complaintId}
                                </span>

                              </div>

                              <p className="mt-2 text-slate-600 leading-relaxed">
                                {notification.message}
                              </p>

                            </div>

                            <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                              {complaint?.created_at
                                ? new Date(
                                    complaint.created_at
                                  ).toLocaleString()
                                : "Recently"}
                            </div>

                          </div>

                          {/* Complaint info */}

                          {complaint && (
                            <div className="mt-5 grid sm:grid-cols-3 gap-3">

                              <div className="bg-slate-50 rounded-xl p-3">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Category
                                </p>

                                <p className="text-sm font-bold text-slate-700 mt-1">
                                  {complaint.category ||
                                    "Civic Issue"}
                                </p>

                              </div>

                              <div className="bg-slate-50 rounded-xl p-3">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Location
                                </p>

                                <p className="text-sm font-bold text-slate-700 mt-1 flex items-start gap-1">
                                  <FaMapMarkerAlt className="text-red-500 mt-0.5 shrink-0" />

                                  <span className="truncate">
                                    {complaint.location ||
                                      "Not provided"}
                                  </span>
                                </p>

                              </div>

                              <div className="bg-slate-50 rounded-xl p-3">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                  Current Status
                                </p>

                                <p className="text-sm font-bold text-slate-700 mt-1">
                                  {complaint.status ||
                                    "Pending"}
                                </p>

                              </div>

                            </div>
                          )}

                          {/* Track button */}

                          <div className="mt-5">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  "/track-resolution"
                                )
                              }
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-[#0057B8] border border-blue-100 font-bold hover:bg-[#0057B8] hover:text-white transition"
                            >
                              <FaClock />
                              Track Complaint
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>

          </section>
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