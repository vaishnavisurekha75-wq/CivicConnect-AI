import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaHome,
  FaSignOutAlt,
  FaShieldAlt,
  FaClipboardList,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaEye,
  FaTimes,
  FaMapMarkerAlt,
  FaUser,
  FaBuilding,
  FaImage,
  FaSyncAlt,
  FaChevronRight,
  FaUserCog,
  FaFileAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";

const API_URL = "http://localhost:5000";

const OfficerDashboard = () => {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [priorityFilter, setPriorityFilter] =
    useState("All");
  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [updateStatus, setUpdateStatus] =
    useState("Pending");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [resolutionNote, setResolutionNote] =
    useState("");

  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] =
    useState("");
  const [updateError, setUpdateError] =
    useState("");

  const officerName =
    localStorage.getItem("userName") ||
    "Officer";

  const officerEmail =
    localStorage.getItem("loginEmail") ||
    "";

  // =====================================================
  // IMAGE URL HELPER
  // =====================================================

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "";
    }

    const cleanPath = imagePath
      .toString()
      .trim();

    if (!cleanPath) {
      return "";
    }

    if (
      cleanPath.startsWith("http://") ||
      cleanPath.startsWith("https://")
    ) {
      return cleanPath;
    }

    return `${API_URL}${
      cleanPath.startsWith("/")
        ? ""
        : "/"
    }${cleanPath}`;
  };

  // =====================================================
  // GET COMPLAINT IMAGE
  // =====================================================

  const getComplaintImage = (complaint) => {
    if (!complaint) {
      return "";
    }

    return (
      complaint.image_url ||
      complaint.imageUrl ||
      complaint.image ||
      complaint.evidence_url ||
      complaint.evidenceUrl ||
      ""
    );
  };

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleBack = () => {
    navigate("/role-selection", {
      replace: true,
    });
  };

  const goHome = () => {
    navigate("/", {
      replace: true,
    });
  };

  const goRoleSelection = () => {
    navigate("/role-selection", {
      replace: true,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("otpVerified");
    localStorage.removeItem("accountVerified");
    localStorage.removeItem("loginEmail");
    localStorage.removeItem("otpEmail");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("accountRole");
    localStorage.removeItem("selectedRole");
    localStorage.removeItem("selectedDashboard");

    sessionStorage.clear();

    navigate("/login", {
      replace: true,
    });
  };

  // =====================================================
  // FETCH COMPLAINTS
  // =====================================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/complaints`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch complaints"
        );
      }

      const data = await response.json();

      setComplaints(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Officer complaints error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    const values = complaints
      .map(
        (complaint) =>
          complaint.category
      )
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [complaints]);

  // =====================================================
  // FILTERED COMPLAINTS
  // =====================================================

  const filteredComplaints = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return complaints.filter(
      (complaint) => {
        const searchableText = [
          complaint.id,
          complaint.name,
          complaint.email,
          complaint.category,
          complaint.description,
          complaint.location,
          complaint.department,
          complaint.assigned_to,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !search ||
          searchableText.includes(search);

        const matchesStatus =
          statusFilter === "All" ||
          complaint.status === statusFilter;

        const matchesPriority =
          priorityFilter === "All" ||
          complaint.priority === priorityFilter;

        const matchesCategory =
          categoryFilter === "All" ||
          complaint.category === categoryFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesCategory
        );
      }
    );
  }, [
    complaints,
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const total =
    complaints.length;

  const pending =
    complaints.filter(
      (complaint) =>
        complaint.status === "Pending"
    ).length;

  const inProgress =
    complaints.filter(
      (complaint) =>
        complaint.status === "In Progress"
    ).length;

  const resolved =
    complaints.filter(
      (complaint) =>
        complaint.status === "Resolved"
    ).length;

  const highPriority =
    complaints.filter(
      (complaint) =>
        complaint.priority === "High"
    ).length;

  // =====================================================
  // OPEN COMPLAINT
  // =====================================================

  const openComplaint = (
    complaint
  ) => {
    setSelectedComplaint(
      complaint
    );

    setUpdateStatus(
      complaint.status ||
        "Pending"
    );

    setAssignedTo(
      complaint.assigned_to ||
        complaint.department ||
        ""
    );

    setResolutionNote(
      complaint.resolution_note ||
        ""
    );

    setUpdateMessage("");
    setUpdateError("");
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
    setUpdateMessage("");
    setUpdateError("");
  };

  // =====================================================
  // UPDATE COMPLAINT
  // =====================================================

  const updateComplaint =
    async () => {
      if (!selectedComplaint)
        return;

      if (
        updateStatus ===
          "Resolved" &&
        !resolutionNote.trim()
      ) {
        setUpdateError(
          "Please enter a resolution note before resolving."
        );
        return;
      }

      try {
        setUpdating(true);
        setUpdateMessage("");
        setUpdateError("");

        const response =
          await fetch(
            `${API_URL}/complaints/${selectedComplaint.id}/status`,
            {
              method: "PATCH",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                status:
                  updateStatus,
                assigned_to:
                  assignedTo.trim(),
                resolution_note:
                  resolutionNote.trim(),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update complaint"
          );
        }

        const updatedComplaint =
          {
            ...selectedComplaint,
            status:
              updateStatus,
            assigned_to:
              assignedTo.trim(),
            resolution_note:
              resolutionNote.trim(),
          };

        setSelectedComplaint(
          updatedComplaint
        );

        setComplaints(
          (previous) =>
            previous.map(
              (complaint) =>
                complaint.id ===
                selectedComplaint.id
                  ? updatedComplaint
                  : complaint
            )
        );

        setUpdateMessage(
          "Complaint updated successfully."
        );
      } catch (error) {
        console.error(
          "Update complaint error:",
          error
        );

        setUpdateError(
          error.message ||
            "Failed to update complaint."
        );
      } finally {
        setUpdating(false);
      }
    };

  // =====================================================
  // BADGES
  // =====================================================

  const statusStyle = (
    status
  ) => {
    if (
      status === "Resolved"
    ) {
      return "bg-green-50 text-[#138808] border-green-200";
    }

    if (
      status === "In Progress"
    ) {
      return "bg-blue-50 text-[#0057B8] border-blue-200";
    }

    return "bg-orange-50 text-[#D97706] border-orange-200";
  };

  const priorityStyle = (
    priority
  ) => {
    if (
      priority === "High"
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (
      priority === "Low"
    ) {
      return "bg-slate-50 text-slate-600 border-slate-200";
    }

    return "bg-orange-50 text-[#D97706] border-orange-200";
  };

  const activeFilterCount =
    [
      statusFilter !== "All",
      priorityFilter !== "All",
      categoryFilter !== "All",
    ].filter(Boolean)
      .length;

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setCategoryFilter("All");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="bg-[#0B1F3A] text-white sticky top-0 z-30 shadow-lg">

        <div className="h-1.5 flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="h-20 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-xl bg-[#0057B8] flex items-center justify-center shadow-lg">
                <FaShieldAlt />
              </div>

              <div>
                <h1 className="font-bold text-lg sm:text-xl">
                  CivicConnect AI
                </h1>

                <p className="text-[11px] text-blue-200">
                  Officer Control Portal
                </p>
              </div>

            </div>

            <div className="hidden md:flex items-center gap-2">

              <button
                onClick={handleBack}
                className="px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition flex items-center gap-2"
              >
                <FaArrowLeft />
                Back
              </button>

              <button
                onClick={goHome}
                className="px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition flex items-center gap-2"
              >
                <FaHome />
                Home
              </button>

              <button
                onClick={goRoleSelection}
                className="px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-white/10 transition flex items-center gap-2"
              >
                <FaUserCog />
                Change Role
              </button>

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm text-red-200 hover:bg-red-500/10 transition flex items-center gap-2"
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>

            <button
              onClick={handleLogout}
              className="md:hidden w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
            >
              <FaSignOutAlt />
            </button>

          </div>

        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* HERO */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-3xl overflow-hidden bg-gradient-to-r from-[#0B1F3A] via-[#0057B8] to-[#087E8B] text-white shadow-xl"
        >

          <div className="p-7 sm:p-9 relative overflow-hidden">

            <div className="absolute -right-16 -top-24 w-72 h-72 rounded-full border border-white/10" />

            <div className="absolute right-20 bottom-[-120px] w-64 h-64 rounded-full border border-white/10" />

            <div className="absolute right-0 top-0 w-2 h-full bg-gradient-to-b from-[#FF9933] via-white to-[#138808]" />

            <div className="relative z-10">

              <div className="flex flex-wrap items-center gap-3 mb-4">

                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/15 border border-green-300/20 text-green-100 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                  Officer Portal Active
                </span>

                <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs">
                  Complaint Management
                </span>

              </div>

              <h2 className="text-3xl sm:text-4xl font-bold">
                Officer Control Center
              </h2>

              <p className="mt-3 text-blue-100 max-w-2xl">
                Review citizen complaints, manage
                assignments and update resolution
                progress from one centralized workspace.
              </p>

              <div className="mt-6 flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <FaUser />
                </div>

                <div>
                  <p className="text-sm font-semibold">
                    {officerName}
                  </p>

                  <p className="text-xs text-blue-200">
                    {officerEmail}
                  </p>
                </div>

              </div>

            </div>

          </div>
        </motion.section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">

          <StatCard
            icon={<FaClipboardList />}
            label="Total Complaints"
            value={total}
            iconClass="bg-blue-50 text-[#0057B8]"
          />

          <StatCard
            icon={<FaClock />}
            label="Pending"
            value={pending}
            iconClass="bg-orange-50 text-[#FF9933]"
          />

          <StatCard
            icon={<FaSpinner />}
            label="In Progress"
            value={inProgress}
            iconClass="bg-cyan-50 text-cyan-700"
          />

          <StatCard
            icon={<FaCheckCircle />}
            label="Resolved"
            value={resolved}
            iconClass="bg-green-50 text-[#138808]"
          />

          <StatCard
            icon={<FaExclamationTriangle />}
            label="High Priority"
            value={highPriority}
            iconClass="bg-red-50 text-red-600"
          />

        </section>

        {/* =================================================
            SEARCH / FILTERS
        ================================================= */}

        <section className="mt-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0057B8] flex items-center justify-center">
                  <FaClipboardList />
                </div>

                <div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Complaint Management
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    Search and manage assigned civic complaints.
                  </p>

                </div>

              </div>

            </div>

            <button
              onClick={fetchComplaints}
              className="self-start lg:self-auto px-4 py-2.5 rounded-xl border border-blue-100 text-[#0057B8] hover:bg-blue-50 transition flex items-center gap-2 text-sm font-semibold"
            >
              <FaSyncAlt />
              Refresh
            </button>

          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">

            <div className="lg:col-span-2 relative">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                placeholder="Search complaint, citizen, location..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-[#F5F7FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] text-sm"
              />

            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="px-4 py-3 rounded-xl border border-slate-200 bg-[#F5F7FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] text-sm"
            >
              <option value="All">
                All Status
              </option>
              <option value="Pending">
                Pending
              </option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Resolved">
                Resolved
              </option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(
                  e.target.value
                )
              }
              className="px-4 py-3 rounded-xl border border-slate-200 bg-[#F5F7FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] text-sm"
            >
              <option value="All">
                All Priority
              </option>
              <option value="High">
                High
              </option>
              <option value="Medium">
                Medium
              </option>
              <option value="Low">
                Low
              </option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
              className="px-4 py-3 rounded-xl border border-slate-200 bg-[#F5F7FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] text-sm"
            >
              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category ===
                    "All"
                      ? "All Categories"
                      : category}
                  </option>
                )
              )}
            </select>

          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <FaFilter className="text-[#0057B8]" />

              <span>
                {filteredComplaints.length} complaint
                {filteredComplaints.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </span>

              {activeFilterCount >
                0 && (
                <span className="px-2 py-1 rounded-full bg-blue-50 text-[#0057B8] text-xs font-semibold">
                  {activeFilterCount} filter
                  {activeFilterCount !==
                  1
                    ? "s"
                    : ""}{" "}
                  active
                </span>
              )}

            </div>

            {activeFilterCount >
              0 && (
              <button
                onClick={clearFilters}
                className="text-sm font-semibold text-[#0057B8] hover:text-[#0B1F3A]"
              >
                Clear filters
              </button>
            )}

          </div>

        </section>

        {/* =================================================
            TABLE
        ================================================= */}

        <section className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

              <thead className="bg-[#0B1F3A] border-b border-slate-200">

                <tr>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-white">
                    Complaint
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-white">
                    Citizen
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-white">
                    Category
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-white">
                    Priority
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-white">
                    Location
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-white">
                    Status
                  </th>

                  <th className="text-right px-5 py-4 text-xs font-bold uppercase tracking-wide text-white">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>

                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center"
                    >

                      <div className="flex flex-col items-center gap-3 text-slate-500">

                        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-[#0057B8] animate-spin" />

                        <p className="text-sm">
                          Loading complaints...
                        </p>

                      </div>

                    </td>

                  </tr>
                ) : filteredComplaints.length ===
                  0 ? (
                  <tr>

                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0057B8] mb-4">
                          <FaClipboardList className="text-xl" />
                        </div>

                        <h4 className="font-bold text-slate-800">
                          No complaints found
                        </h4>

                        <p className="text-sm text-slate-500 mt-1">
                          Try changing your search or filters.
                        </p>

                      </div>

                    </td>

                  </tr>
                ) : (
                  filteredComplaints.map(
                    (complaint) => (
                      <tr
                        key={
                          complaint.id
                        }
                        className="hover:bg-blue-50/30 transition"
                      >

                        <td className="px-5 py-4">

                          <div className="max-w-[230px]">

                            <p className="font-bold text-slate-800 truncate">
                              Complaint #
                              {complaint.id}
                            </p>

                            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                              {complaint.description ||
                                "No description"}
                            </p>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0057B8] flex items-center justify-center">
                              <FaUser className="text-sm" />
                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-slate-800 truncate max-w-[150px]">
                                {complaint.name ||
                                  "Citizen"}
                              </p>

                              <p className="text-xs text-slate-400 truncate max-w-[150px]">
                                {complaint.email ||
                                  "No email"}
                              </p>

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-[#0057B8] text-xs font-semibold border border-blue-100">
                            {complaint.category ||
                              "General"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold ${priorityStyle(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority ||
                              "Medium"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-2 text-sm text-slate-600 max-w-[180px]">

                            <FaMapMarkerAlt className="text-[#FF9933] shrink-0" />

                            <span className="truncate">
                              {complaint.location ||
                                "Location not available"}
                            </span>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold ${statusStyle(
                              complaint.status
                            )}`}
                          >
                            {complaint.status ||
                              "Pending"}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-right">

                          <button
                            onClick={() =>
                              openComplaint(
                                complaint
                              )
                            }
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0057B8] text-white text-sm font-semibold hover:bg-[#004494] transition"
                          >
                            <FaEye />
                            View
                            <FaChevronRight className="text-[10px]" />
                          </button>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

      {/* ===================================================
          COMPLAINT DETAIL DRAWER
      =================================================== */}

      {selectedComplaint && (
        <div className="fixed inset-0 z-50">

          {/* Overlay */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="absolute inset-0 bg-[#0B1F3A]/60 backdrop-blur-sm"
            onClick={closeComplaint}
          />

          {/* Drawer */}

          <motion.aside
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 260,
            }}
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col"
          >

            {/* Drawer Header */}

            <div className="bg-[#0B1F3A] text-white px-6 py-5">

              <div className="h-1 -mx-6 -mt-5 mb-5 flex">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white" />
                <div className="flex-1 bg-[#138808]" />
              </div>

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="text-xs text-orange-300 font-semibold uppercase tracking-wider">
                      Complaint
                    </span>

                    <span className="text-xs text-slate-400">
                      #
                      {
                        selectedComplaint.id
                      }
                    </span>

                  </div>

                  <h2 className="text-xl font-bold mt-1">
                    Complaint Details
                  </h2>

                  <p className="text-xs text-blue-200 mt-1">
                    Review and update this complaint.
                  </p>

                </div>

                <button
                  onClick={
                    closeComplaint
                  }
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <FaTimes />
                </button>

              </div>

              <div className="flex flex-wrap gap-2 mt-4">

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusStyle(
                    selectedComplaint.status
                  )}`}
                >
                  {selectedComplaint.status ||
                    "Pending"}
                </span>

                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${priorityStyle(
                    selectedComplaint.priority
                  )}`}
                >
                  {selectedComplaint.priority ||
                    "Medium"}{" "}
                  Priority
                </span>

              </div>

            </div>

            {/* Drawer Body */}

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Citizen */}

              <DetailSection
                title="Citizen Information"
                icon={<FaUser />}
              >

                <div className="grid sm:grid-cols-2 gap-4">

                  <InfoItem
                    label="Name"
                    value={
                      selectedComplaint.name ||
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="Email"
                    value={
                      selectedComplaint.email ||
                      "Not available"
                    }
                  />

                </div>

              </DetailSection>

              {/* Complaint */}

              <DetailSection
                title="Complaint Information"
                icon={<FaFileAlt />}
              >

                <div className="space-y-4">

                  <InfoItem
                    label="Category"
                    value={
                      selectedComplaint.category ||
                      "General"
                    }
                  />

                  <div>

                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Description
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-slate-700 bg-[#F5F7FA] rounded-xl p-4 border border-slate-100">
                      {selectedComplaint.description ||
                        "No description available."}
                    </p>

                  </div>

                </div>

              </DetailSection>

              {/* Location */}

              <DetailSection
                title="Location & Department"
                icon={
                  <FaMapMarkerAlt />
                }
              >

                <div className="grid sm:grid-cols-2 gap-4">

                  <InfoItem
                    label="Location"
                    value={
                      selectedComplaint.location ||
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="Department"
                    value={
                      selectedComplaint.department ||
                      "Not assigned"
                    }
                  />

                </div>

              </DetailSection>

              {/* =================================================
                  COMPLAINT EVIDENCE
              ================================================= */}

              {(() => {
                const imagePath =
                  getComplaintImage(
                    selectedComplaint
                  );

                const imageUrl =
                  getImageUrl(
                    imagePath
                  );

                return (
                  <DetailSection
                    title="Complaint Evidence"
                    icon={<FaImage />}
                  >

                    {imageUrl ? (
                      <div>

                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-[#F5F7FA] shadow-sm">

                          <img
                            src={imageUrl}
                            alt="Complaint evidence"
                            className="w-full max-h-96 object-contain"
                            onError={(e) => {
                              console.error(
                                "Complaint evidence image failed to load:",
                                imageUrl
                              );

                              e.currentTarget.style.display =
                                "none";

                              const errorBox =
                                e.currentTarget
                                  .parentElement
                                  ?.querySelector(
                                    ".image-error-message"
                                  );

                              if (errorBox) {
                                errorBox.classList.remove(
                                  "hidden"
                                );
                              }
                            }}
                          />

                          <div className="image-error-message hidden p-6 text-center">

                            <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
                              <FaImage />
                            </div>

                            <p className="font-semibold text-slate-700">
                              Image could not be loaded
                            </p>

                            <p className="text-xs text-slate-500 mt-1 break-all">
                              {imageUrl}
                            </p>

                          </div>

                        </div>

                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              Uploaded Complaint Evidence
                            </p>

                            <p className="text-xs text-slate-400 mt-1 break-all">
                              {imageUrl}
                            </p>

                          </div>

                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0057B8] text-white text-xs font-bold hover:bg-[#004494] transition"
                          >
                            <FaExternalLinkAlt />
                            View Full Image
                          </a>

                        </div>

                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-[#F5F7FA] p-8 text-center">

                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">

                          <FaImage className="text-xl" />

                        </div>

                        <p className="font-bold text-slate-700">
                          No image evidence uploaded
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                          This complaint was submitted without an image.
                        </p>

                      </div>
                    )}

                  </DetailSection>
                );
              })()}

              {/* Timeline */}

              <DetailSection
                title="Resolution Progress"
                icon={
                  <FaCheckCircle />
                }
              >

                <div className="space-y-0">

                  <TimelineItem
                    title="Complaint Submitted"
                    active={true}
                    complete={
                      selectedComplaint.status ===
                        "Pending" ||
                      selectedComplaint.status ===
                        "In Progress" ||
                      selectedComplaint.status ===
                        "Resolved"
                    }
                  />

                  <TimelineItem
                    title="Under Review"
                    active={
                      selectedComplaint.status ===
                        "In Progress" ||
                      selectedComplaint.status ===
                        "Resolved"
                    }
                    complete={
                      selectedComplaint.status ===
                        "In Progress" ||
                      selectedComplaint.status ===
                        "Resolved"
                    }
                  />

                  <TimelineItem
                    title="Resolved"
                    active={
                      selectedComplaint.status ===
                      "Resolved"
                    }
                    complete={
                      selectedComplaint.status ===
                      "Resolved"
                    }
                    last
                  />

                </div>

              </DetailSection>

              {/* Administrative Action */}

              <DetailSection
                title="Officer Action"
                icon={<FaBuilding />}
              >

                <div className="space-y-4">

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Complaint Status
                    </label>

                    <select
                      value={
                        updateStatus
                      }
                      onChange={(e) =>
                        setUpdateStatus(
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F5F7FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] text-sm"
                    >

                      <option value="Pending">
                        Pending
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Resolved">
                        Resolved
                      </option>

                    </select>

                  </div>

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Assigned Officer / Department
                    </label>

                    <input
                      type="text"
                      value={
                        assignedTo
                      }
                      onChange={(e) =>
                        setAssignedTo(
                          e.target.value
                        )
                      }
                      placeholder="Enter assigned officer or department"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F5F7FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] text-sm"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Resolution Note
                    </label>

                    <textarea
                      rows="4"
                      value={
                        resolutionNote
                      }
                      onChange={(e) =>
                        setResolutionNote(
                          e.target.value
                        )
                      }
                      placeholder="Enter resolution details..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-[#F5F7FA] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] text-sm resize-none"
                    />

                  </div>

                </div>

              </DetailSection>

              {/* Messages */}

              {updateMessage && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-[#138808] flex items-center gap-2">
                  <FaCheckCircle />
                  {updateMessage}
                </div>
              )}

              {updateError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                  <FaExclamationTriangle />
                  {updateError}
                </div>
              )}

            </div>

            {/* Footer */}

            <div className="border-t border-slate-200 bg-white px-6 py-4">

              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  onClick={
                    updateComplaint
                  }
                  disabled={updating}
                  className="flex-1 py-3 rounded-xl bg-[#0057B8] text-white font-bold hover:bg-[#004494] transition disabled:opacity-50"
                >
                  {updating
                    ? "Updating..."
                    : "Update Complaint"}
                </button>

                <button
                  onClick={
                    closeComplaint
                  }
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition"
                >
                  Close
                </button>

              </div>

            </div>

          </motion.aside>

        </div>
      )}

    </div>
  );
};

// =====================================================
// STAT CARD
// =====================================================

const StatCard = ({
  icon,
  label,
  value,
  iconClass,
}) => {
  return (
    <motion.div
      whileHover={{
        y: -2,
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition"
    >

      <div className="flex items-center justify-between">

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>

      </div>

      <p className="text-sm font-semibold text-slate-600 mt-4">
        {label}
      </p>

    </motion.div>
  );
};

// =====================================================
// DETAIL SECTION
// =====================================================

const DetailSection = ({
  title,
  icon,
  children,
}) => {
  return (
    <section>

      <div className="flex items-center gap-2 mb-4">

        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0057B8] flex items-center justify-center">
          {icon}
        </div>

        <h3 className="font-bold text-slate-800">
          {title}
        </h3>

      </div>

      {children}

    </section>
  );
};

// =====================================================
// INFO ITEM
// =====================================================

const InfoItem = ({
  label,
  value,
}) => {
  return (
    <div>

      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-700 mt-1 break-words">
        {value}
      </p>

    </div>
  );
};

// =====================================================
// TIMELINE ITEM
// =====================================================

const TimelineItem = ({
  title,
  active,
  complete,
  last = false,
}) => {
  return (
    <div className="flex gap-4">

      <div className="flex flex-col items-center">

        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${
            complete
              ? "bg-[#138808] border-[#138808] text-white"
              : "bg-white border-slate-200 text-slate-300"
          }`}
        >
          <FaCheckCircle className="text-sm" />
        </div>

        {!last && (
          <div
            className={`w-0.5 h-10 ${
              active
                ? "bg-[#138808]"
                : "bg-slate-200"
            }`}
          />
        )}

      </div>

      <div className="pt-1">

        <p
          className={`text-sm font-bold ${
            complete
              ? "text-slate-800"
              : "text-slate-400"
          }`}
        >
          {title}
        </p>

        <p className="text-xs text-slate-400 mt-1">
          {complete
            ? "Completed"
            : "Waiting for update"}
        </p>

      </div>

    </div>
  );
};

export default OfficerDashboard;