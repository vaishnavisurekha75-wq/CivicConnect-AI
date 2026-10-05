import { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaTimes,
  FaClipboardList,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaBuilding,
  FaUser,
  FaSignOutAlt,
  FaShieldAlt,
  FaImage,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [updateStatus, setUpdateStatus] = useState("Pending");
  const [assignedTo, setAssignedTo] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState("");

  // =========================================
  // IMAGE URL HELPER
  // =========================================

  const getImageUrl = (imageValue) => {
    if (!imageValue) {
      return "";
    }

    const imagePath = String(imageValue).trim();

    if (!imagePath) {
      return "";
    }

    // Already a complete URL
    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://") ||
      imagePath.startsWith("data:image/") ||
      imagePath.startsWith("blob:")
    ) {
      return imagePath;
    }

    // Convert Windows backslashes to normal slashes
    const normalizedPath = imagePath.replace(/\\/g, "/");

    // If database contains something like:
    // C:/.../uploads/image.jpeg
    // or /some/path/uploads/image.jpeg
    const uploadsIndex = normalizedPath
      .toLowerCase()
      .indexOf("/uploads/");

    if (uploadsIndex !== -1) {
      return `${API_URL}${normalizedPath.slice(uploadsIndex)}`;
    }

    // /uploads/image.jpeg
    if (normalizedPath.startsWith("/")) {
      return `${API_URL}${normalizedPath}`;
    }

    // uploads/image.jpeg
    if (
      normalizedPath
        .toLowerCase()
        .startsWith("uploads/")
    ) {
      return `${API_URL}/${normalizedPath}`;
    }

    // Just filename
    return `${API_URL}/uploads/${normalizedPath}`;
  };

  // =========================================
  // FETCH COMPLAINTS
  // =========================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/admin/complaints`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();

      console.log("ADMIN COMPLAINTS:", data);

      setComplaints(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "Admin complaints error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("adminEmail");

    navigate("/admin/login");
  };

  // =========================================
  // OPEN COMPLAINT
  // =========================================

  const openComplaint = (complaint) => {
    console.log(
      "OPENING ADMIN COMPLAINT:",
      complaint
    );

    console.log(
      "COMPLAINT IMAGE VALUE:",
      complaint.image_url
    );

    console.log(
      "FINAL IMAGE URL:",
      getImageUrl(complaint.image_url)
    );

    setSelectedComplaint(complaint);

    setUpdateStatus(
      complaint.status || "Pending"
    );

    setAssignedTo(
      complaint.assigned_to ||
        complaint.department ||
        ""
    );

    setResolutionNote(
      complaint.resolution_note || ""
    );

    setUpdateMessage("");
    setUpdateError("");
  };

  // =========================================
  // UPDATE COMPLAINT
  // =========================================

  const updateComplaint = async () => {
    if (!selectedComplaint) {
      return;
    }

    if (
      updateStatus === "Resolved" &&
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

      const response = await fetch(
        `${API_URL}/complaints/${selectedComplaint.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: updateStatus,
            assigned_to: assignedTo.trim(),
            resolution_note:
              resolutionNote.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update complaint"
        );
      }

      const updatedComplaint = {
        ...selectedComplaint,
        status: updateStatus,
        assigned_to: assignedTo.trim(),
        resolution_note:
          resolutionNote.trim(),
      };

      setSelectedComplaint(updatedComplaint);

      setComplaints((previous) =>
        previous.map((complaint) =>
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

  // =========================================
  // FILTER OPTIONS
  // =========================================

  const categories = useMemo(() => {
    const values = complaints
      .map((complaint) => complaint.category)
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [complaints]);

  // =========================================
  // FILTER COMPLAINTS
  // =========================================

  const filteredComplaints = useMemo(() => {
    const search =
      searchTerm.toLowerCase().trim();

    return complaints.filter((complaint) => {
      const matchesSearch =
        !search ||
        String(complaint.id || "")
          .toLowerCase()
          .includes(search) ||
        String(complaint.name || "")
          .toLowerCase()
          .includes(search) ||
        String(complaint.email || "")
          .toLowerCase()
          .includes(search) ||
        String(complaint.category || "")
          .toLowerCase()
          .includes(search) ||
        String(complaint.description || "")
          .toLowerCase()
          .includes(search) ||
        String(complaint.location || "")
          .toLowerCase()
          .includes(search);

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
    });
  }, [
    complaints,
    searchTerm,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ]);

  // =========================================
  // STATISTICS
  // =========================================

  const total = complaints.length;

  const pending = complaints.filter(
    (complaint) =>
      complaint.status === "Pending"
  ).length;

  const inProgress = complaints.filter(
    (complaint) =>
      complaint.status === "In Progress"
  ).length;

  const resolved = complaints.filter(
    (complaint) =>
      complaint.status === "Resolved"
  ).length;

  const highPriority = complaints.filter(
    (complaint) =>
      complaint.priority === "High"
  ).length;

  // =========================================
  // STYLES
  // =========================================

  const statusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const priorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (priority === "Low") {
      return "bg-slate-50 text-slate-600 border-slate-200";
    }

    return "bg-orange-50 text-orange-700 border-orange-200";
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="sticky top-0 z-40 border-b border-white/20 bg-slate-950 text-white shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg">
              <FaShieldAlt />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                CivicConnect AI
              </h1>

              <p className="text-xs text-slate-400">
                Administrator Control Center
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                Admin Portal
              </p>

              <p className="text-xs text-slate-400">
                System Administrator
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              <FaSignOutAlt />
              Logout
            </button>

          </div>

        </div>
      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <main className="mx-auto max-w-7xl px-5 py-8">

        {/* TITLE */}

        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>

            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-cyan-600">
              Administration
            </p>

            <h2 className="text-3xl font-extrabold text-slate-900">
              Complaint Management
            </h2>

            <p className="mt-2 text-slate-500">
              Monitor, route and resolve citizen complaints.
            </p>

          </div>

          <button
            type="button"
            onClick={fetchComplaints}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60"
          >
            <FaSyncAlt
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* =========================================
            STATS
        ========================================= */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Total
              </span>

              <FaClipboardList className="text-blue-600" />
            </div>

            <p className="text-3xl font-extrabold text-slate-900">
              {total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Pending
              </span>

              <FaClock className="text-amber-500" />
            </div>

            <p className="text-3xl font-extrabold text-slate-900">
              {pending}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                In Progress
              </span>

              <FaSpinner className="text-blue-500" />
            </div>

            <p className="text-3xl font-extrabold text-slate-900">
              {inProgress}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                Resolved
              </span>

              <FaCheckCircle className="text-emerald-500" />
            </div>

            <p className="text-3xl font-extrabold text-slate-900">
              {resolved}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500">
                High Priority
              </span>

              <FaExclamationTriangle className="text-red-500" />
            </div>

            <p className="text-3xl font-extrabold text-slate-900">
              {highPriority}
            </p>
          </div>

        </div>

        {/* =========================================
            FILTER BAR
        ========================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

            {/* SEARCH */}

            <div className="relative lg:col-span-1">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search complaints..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

            {/* PRIORITY */}

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(event.target.value)
              }
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

            {/* CATEGORY */}

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category === "All"
                    ? "All Categories"
                    : category}
                </option>
              ))}
            </select>

          </div>
        </div>

        {/* =========================================
            TABLE
        ========================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead className="bg-slate-950 text-white">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Citizen
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Priority
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Department
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider">
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

                      <div className="flex flex-col items-center gap-3">

                        <FaSpinner className="animate-spin text-3xl text-blue-600" />

                        <p className="text-sm font-medium text-slate-500">
                          Loading complaints...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : filteredComplaints.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-5 py-16 text-center"
                    >

                      <FaClipboardList className="mx-auto mb-3 text-4xl text-slate-300" />

                      <p className="font-semibold text-slate-600">
                        No complaints found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your filters.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredComplaints.map(
                    (complaint) => (

                      <tr
                        key={complaint.id}
                        className="transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <span className="font-bold text-blue-600">
                            #{complaint.id}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div>

                            <p className="font-semibold text-slate-800">
                              {complaint.name ||
                                "Unknown"}
                            </p>

                            <p className="text-xs text-slate-400">
                              {complaint.email ||
                                "No email"}
                            </p>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="font-medium text-slate-700">
                            {complaint.category ||
                              "Other"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${priorityStyle(
                              complaint.priority
                            )}`}
                          >
                            {complaint.priority ||
                              "Medium"}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div className="max-w-[220px]">

                            <p className="text-sm font-medium text-slate-700">
                              {complaint.department ||
                                "Not Assigned"}
                            </p>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusStyle(
                              complaint.status
                            )}`}
                          >
                            {complaint.status ||
                              "Pending"}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              openComplaint(
                                complaint
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-lg active:scale-95"
                          >
                            <FaEye />
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">

            <p className="text-sm text-slate-500">

              Showing{" "}

              <span className="font-bold text-slate-700">
                {filteredComplaints.length}
              </span>{" "}

              of{" "}

              <span className="font-bold text-slate-700">
                {complaints.length}
              </span>{" "}

              complaints

            </p>

          </div>

        </div>

      </main>

      {/* =========================================
          COMPLAINT DETAILS MODAL
      ========================================= */}

      {selectedComplaint && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* =========================================
                MODAL HEADER
            ========================================= */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Complaint Details
                </p>

                <h3 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Complaint #{selectedComplaint.id}
                </h3>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedComplaint(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                <FaTimes />
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* =========================================
                  CITIZEN INFORMATION
              ========================================= */}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <h4 className="mb-4 text-lg font-bold text-slate-900">
                  Citizen Information
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div className="flex gap-3">

                    <FaUser className="mt-1 text-blue-600" />

                    <div>

                      <p className="text-xs text-slate-400">
                        Name
                      </p>

                      <p className="font-semibold">
                        {selectedComplaint.name ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-3">

                    <FaClipboardList className="mt-1 text-blue-600" />

                    <div>

                      <p className="text-xs text-slate-400">
                        Email
                      </p>

                      <p className="break-all font-semibold">
                        {selectedComplaint.email ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* =========================================
                  COMPLAINT INFORMATION
              ========================================= */}

              <div className="rounded-2xl border border-slate-200 p-5">

                <h4 className="mb-4 text-lg font-bold text-slate-900">
                  Complaint Information
                </h4>

                <div className="space-y-4">

                  <div>

                    <p className="text-xs text-slate-400">
                      Category
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedComplaint.category ||
                        "Other"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-slate-400">
                      Description
                    </p>

                    <p className="mt-1 leading-6 text-slate-700">
                      {selectedComplaint.description ||
                        "No description available."}
                    </p>

                  </div>

                </div>

              </div>

              {/* =========================================
                  LOCATION & DEPARTMENT
              ========================================= */}

              <div className="rounded-2xl border border-slate-200 p-5">

                <h4 className="mb-4 text-lg font-bold text-slate-900">
                  Location & Department
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div className="flex gap-3">

                    <FaMapMarkerAlt className="mt-1 text-red-500" />

                    <div>

                      <p className="text-xs text-slate-400">
                        Location
                      </p>

                      <p className="mt-1 font-semibold">
                        {selectedComplaint.location ||
                          "Location not available"}
                      </p>

                    </div>

                  </div>

                  <div className="flex gap-3">

                    <FaBuilding className="mt-1 text-blue-600" />

                    <div>

                      <p className="text-xs text-slate-400">
                        Department
                      </p>

                      <p className="mt-1 font-semibold">
                        {selectedComplaint.department ||
                          "Not Assigned"}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* =========================================
                  COMPLAINT EVIDENCE
              ========================================= */}

              <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5 shadow-md">

                <div className="mb-4 flex items-center justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                      <FaImage />
                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Complaint Evidence
                      </p>

                      <h4 className="mt-1 text-xl font-extrabold text-slate-900">
                        Uploaded Complaint Image
                      </h4>

                    </div>

                  </div>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-extrabold text-blue-700">
                    IMAGE
                  </span>

                </div>

                {selectedComplaint.image_url ? (

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">

                    <div className="mb-3 rounded-xl bg-slate-900 px-4 py-3">

                      <p className="text-center text-xs font-bold text-white">
                        Backend Evidence Image
                      </p>

                      <p className="mt-1 break-all text-center text-[11px] text-slate-300">
                        {getImageUrl(
                          selectedComplaint.image_url
                        )}
                      </p>

                    </div>

                    <img
                      src={getImageUrl(
                        selectedComplaint.image_url
                      )}
                      alt="Complaint Evidence"
                      className="block max-h-[520px] min-h-[280px] w-full rounded-xl bg-slate-100 object-contain"
                      onLoad={() => {
                        console.log(
                          "✅ ADMIN COMPLAINT IMAGE LOADED:",
                          getImageUrl(
                            selectedComplaint.image_url
                          )
                        );
                      }}
                      onError={(event) => {
                        console.error(
                          "❌ ADMIN COMPLAINT IMAGE FAILED:",
                          event.currentTarget.src
                        );
                      }}
                    />

                  </div>

                ) : (

                  <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center">

                    <FaExclamationTriangle className="mx-auto text-4xl text-amber-500" />

                    <p className="mt-3 text-lg font-extrabold text-slate-700">
                      No complaint image uploaded
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      This complaint does not contain an evidence image.
                    </p>

                  </div>

                )}

              </div>

              {/* =========================================
                  MANAGE COMPLAINT
              ========================================= */}

              <div className="rounded-2xl border-2 border-blue-100 bg-blue-50/50 p-5">

                <div className="mb-5">

                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Admin Action
                  </p>

                  <h4 className="mt-1 text-xl font-extrabold text-slate-900">
                    Manage Complaint
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Update the complaint status and resolution details.
                  </p>

                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* STATUS */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Status
                    </label>

                    <select
                      value={updateStatus}
                      onChange={(event) =>
                        setUpdateStatus(
                          event.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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

                  {/* ASSIGNED TO */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Assigned To
                    </label>

                    <input
                      type="text"
                      value={assignedTo}
                      onChange={(event) =>
                        setAssignedTo(
                          event.target.value
                        )
                      }
                      placeholder="Department / Officer"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* RESOLUTION NOTE */}

                <div className="mt-5">

                  <label className="mb-2 block text-sm font-bold text-slate-700">

                    Resolution Note

                    {updateStatus === "Resolved" && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}

                  </label>

                  <textarea
                    rows="4"
                    value={resolutionNote}
                    onChange={(event) =>
                      setResolutionNote(
                        event.target.value
                      )
                    }
                    placeholder="Enter resolution details..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* SUCCESS */}

                {updateMessage && (

                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {updateMessage}
                  </div>

                )}

                {/* ERROR */}

                {updateError && (

                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {updateError}
                  </div>

                )}

                {/* UPDATE */}

                <button
                  type="button"
                  onClick={updateComplaint}
                  disabled={updating}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {updating ? (

                    <>
                      <FaSpinner className="animate-spin" />
                      Updating...
                    </>

                  ) : (

                    <>
                      <FaCheckCircle />
                      Update Complaint
                    </>

                  )}

                </button>

              </div>

              {/* =========================================
                  CLOSE
              ========================================= */}

              <button
                type="button"
                onClick={() =>
                  setSelectedComplaint(null)
                }
                className="w-full rounded-xl bg-slate-900 py-3 font-bold text-white transition hover:bg-slate-800"
              >
                Close Details
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}