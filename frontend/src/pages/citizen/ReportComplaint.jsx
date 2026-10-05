import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaImage,
  FaVideo,
  FaRobot,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
  FaMagic,
  FaLocationArrow,
  FaExclamationTriangle,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

const API_URL = "http://localhost:5000";
const AI_URL = "http://localhost:5052";

const ReportComplaint = () => {
  const navigate = useNavigate();

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    location: "",
    image: null,
    video: null,
  });

  const [imagePreview, setImagePreview] = useState("");

  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [aiResult, setAiResult] = useState(null);

  const [gpsInfo, setGpsInfo] = useState(null);
  const [gpsWarning, setGpsWarning] = useState("");

  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // DUPLICATE DETECTION STATE
  // =========================================================

  const [duplicateData, setDuplicateData] = useState(null);

  // =========================================================
  // CATEGORY -> DEPARTMENT
  // =========================================================

  const getDepartment = (category) => {
    const value = (category || "").toLowerCase();

    if (
      value.includes("road") ||
      value.includes("pothole")
    ) {
      return "Roads & Buildings Department";
    }

    if (
      value.includes("garbage") ||
      value.includes("waste") ||
      value.includes("sanitation")
    ) {
      return "Municipal Sanitation Department";
    }

    if (value.includes("water")) {
      return "Water Supply Department";
    }

    if (
      value.includes("drain") ||
      value.includes("sewage")
    ) {
      return "Municipal Engineering Department";
    }

    if (
      value.includes("street light") ||
      value.includes("streetlight") ||
      value.includes("electric")
    ) {
      return "Electrical Department";
    }

    return "General Civic Department";
  };

  // =========================================================
  // CATEGORY FROM DESCRIPTION
  // =========================================================

  const detectCategoryFromText = (text) => {
    const value = (text || "").toLowerCase();

    if (
      value.includes("road") ||
      value.includes("pothole") ||
      value.includes("potholes") ||
      value.includes("street damage")
    ) {
      return "Road Damage";
    }

    if (
      value.includes("garbage") ||
      value.includes("waste") ||
      value.includes("trash") ||
      value.includes("dump")
    ) {
      return "Garbage";
    }

    if (
      value.includes("water") ||
      value.includes("pipeline") ||
      value.includes("drinking water")
    ) {
      return "Water Supply";
    }

    if (
      value.includes("drain") ||
      value.includes("drainage") ||
      value.includes("sewage")
    ) {
      return "Drainage";
    }

    if (
      value.includes("street light") ||
      value.includes("streetlight") ||
      value.includes("lamp")
    ) {
      return "Street Light";
    }

    if (
      value.includes("electricity") ||
      value.includes("power") ||
      value.includes("transformer")
    ) {
      return "Electricity";
    }

    return "";
  };

  // =========================================================
  // AUTOMATIC PRIORITY
  // =========================================================

  const detectPriority = (text, category = "") => {
    const value =
      `${text || ""} ${category || ""}`.toLowerCase();

    if (
      value.includes("danger") ||
      value.includes("accident") ||
      value.includes("collapsed") ||
      value.includes("overflow") ||
      value.includes("fire") ||
      value.includes("emergency") ||
      value.includes("open manhole") ||
      value.includes("major")
    ) {
      return "High";
    }

    if (
      value.includes("blocked") ||
      value.includes("severe") ||
      value.includes("broken") ||
      value.includes("leak") ||
      value.includes("damaged")
    ) {
      return "Medium";
    }

    return "Low";
  };

  // =========================================================
  // TEXT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "description") {
        const detectedCategory =
          detectCategoryFromText(value);

        if (detectedCategory) {
          updated.category = detectedCategory;

          if (!aiResult) {
            updated.priority = detectPriority(
              value,
              detectedCategory
            );
          }

          if (!prev.title) {
            updated.title =
              `${detectedCategory} Complaint`;
          }
        }
      }

      if (name === "category") {
        if (!aiResult) {
          updated.priority = detectPriority(
            updated.description,
            value
          );
        }
      }

      return updated;
    });

    setError("");
  };

  // =========================================================
  // IMAGE AI ANALYSIS
  // =========================================================

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10 MB.");
      return;
    }

    setError("");
    setDuplicateData(null);
    setAiResult(null);
    setLoadingAI(true);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    try {
      const data = new FormData();
      data.append("image", file);

      const response = await fetch(
        `${AI_URL}/analyze-image`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        let message = "AI image analysis failed.";

        try {
          const result = await response.json();

          if (result?.message) {
            message = result.message;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(message);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            "AI could not analyze the image."
        );
      }

      const aiDescription =
        result.description ||
        result.generated_description ||
        result.caption ||
        result.generatedDescription ||
        "";

      const aiCategory =
        result.category ||
        result.predicted_category ||
        result.predictedCategory ||
        "";

      let confidence =
        result.confidence ??
        result.aiConfidence ??
        result.prediction_confidence ??
        0;

      if (
        confidence > 0 &&
        confidence <= 1
      ) {
        confidence *= 100;
      }

      confidence = Math.round(confidence);

      const aiPriority =
        result.priority ||
        detectPriority(
          aiDescription,
          aiCategory
        );

      const aiDepartment =
        result.department ||
        getDepartment(aiCategory);

      const finalCategory =
        aiCategory ||
        detectCategoryFromText(
          aiDescription
        ) ||
        "Other";

      const finalPriority =
        aiPriority ||
        detectPriority(
          aiDescription,
          finalCategory
        ) ||
        "Medium";

      const finalDepartment =
        aiDepartment ||
        getDepartment(finalCategory);

      setAiResult({
        caption: result.caption || "",
        description: aiDescription,
        category: finalCategory,
        confidence,
        priority: finalPriority,
        department: finalDepartment,
      });

      setFormData((prev) => ({
        ...prev,
        image: file,

        description:
          aiDescription ||
          prev.description,

        category:
          finalCategory ||
          prev.category,

        priority:
          finalPriority ||
          prev.priority,

        title:
          prev.title ||
          `${finalCategory} Complaint`,
      }));
    } catch (err) {
      console.error(
        "Image AI Error:",
        err
      );

      setAiResult(null);

      setError(
        err.message ||
          "AI analysis failed. Make sure Image AI is running on port 5052."
      );
    } finally {
      setLoadingAI(false);
    }
  };

  // =========================================================
  // LOCATION
  // =========================================================

  const detectLocation = () => {
    setGpsWarning("");
    setError("");
    setGpsInfo(null);

    if (!navigator.geolocation) {
      setGpsWarning(
        "GPS is not supported by this browser."
      );
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        setGpsInfo({
          latitude,
          longitude,
        });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              "Location service failed"
            );
          }

          const data =
            await response.json();

          let address = "";

          if (data?.display_name) {
            address =
              data.display_name;
          } else if (data?.address) {
            const a = data.address;

            address = [
              a.house_number,
              a.road,
              a.neighbourhood,
              a.suburb,
              a.village,
              a.town,
              a.city,
              a.district,
              a.state,
              a.postcode,
              a.country,
            ]
              .filter(Boolean)
              .join(", ");
          }

          if (address) {
            setFormData((prev) => ({
              ...prev,
              location: address,
            }));

            setGpsWarning("");
          } else {
            setGpsWarning(
              "Coordinates detected, but an address could not be found automatically."
            );
          }
        } catch (err) {
          console.error(
            "Reverse Geocoding Error:",
            err
          );

          setGpsWarning(
            "Location coordinates were detected, but the address service could not return an address."
          );
        } finally {
          setLoadingLocation(false);
        }
      },

      (gpsError) => {
        console.error(
          "GPS Error:",
          gpsError
        );

        setLoadingLocation(false);

        if (gpsError.code === 1) {
          setGpsWarning(
            "Location permission was denied. Please allow location access."
          );
        } else if (gpsError.code === 2) {
          setGpsWarning(
            "Your location could not be detected automatically."
          );
        } else if (gpsError.code === 3) {
          setGpsWarning(
            "GPS took too long. Please try again."
          );
        } else {
          setGpsWarning(
            "Unable to detect your location automatically."
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
  };

  // =========================================================
  // VIDEO
  // =========================================================

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError(
        "Please select a valid video file."
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      video: file,
    }));

    setError("");
  };

  // =========================================================
  // CREATE FORM DATA
  // =========================================================

  const buildComplaintFormData = (
    forceSubmit = false
  ) => {
    const email =
      localStorage.getItem("otpEmail") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("loginEmail") ||
      "";

    const userName =
      localStorage.getItem("userName") ||
      localStorage.getItem("registerName") ||
      "Citizen";

    let finalCategory =
      formData.category;

    if (!finalCategory) {
      finalCategory =
        detectCategoryFromText(
          formData.description
        );
    }

    if (!finalCategory) {
      finalCategory = "Other";
    }

    let finalPriority =
      formData.priority;

    if (aiResult?.priority) {
      finalPriority =
        aiResult.priority;
    }

    if (!finalPriority) {
      finalPriority =
        detectPriority(
          formData.description,
          finalCategory
        );
    }

    const finalTitle =
      formData.title.trim() ||
      `${finalCategory} Complaint`;

    const finalDepartment =
      aiResult?.department ||
      getDepartment(finalCategory);

    const data = new FormData();

    data.append(
      "name",
      userName
    );

    data.append(
      "email",
      email.trim().toLowerCase()
    );

    data.append(
      "title",
      finalTitle
    );

    data.append(
      "category",
      finalCategory
    );

    data.append(
      "description",
      formData.description
    );

    data.append(
      "location",
      formData.location ||
        "Automatic location unavailable"
    );

    data.append(
      "priority",
      finalPriority
    );

    data.append(
      "forceSubmit",
      forceSubmit
        ? "true"
        : "false"
    );

    if (formData.image) {
      data.append(
        "image",
        formData.image
      );
    }

    if (formData.video) {
      data.append(
        "video",
        formData.video
      );
    }

    return {
      data,
      email,
      finalCategory,
      finalPriority,
      finalTitle,
      finalDepartment,
    };
  };

  // =========================================================
  // PROCESS SUCCESS
  // =========================================================

  const processSuccessfulSubmission = (
    result,
    finalTitle,
    finalCategory,
    finalPriority,
    finalDepartment
  ) => {
    setDuplicateData(null);

    setSuccessData({
      complaintId:
        result.complaintId ||
        result.id ||
        "Generated",

      title: finalTitle,

      category: finalCategory,

      priority: finalPriority,

      department:
        result.department ||
        finalDepartment,

      assignedTo:
        result.assignedTo ||
        result.assigned_to ||
        "Authority Pending Assignment",

      confidence:
        aiResult?.confidence || 0,

      location:
        formData.location ||
        "Automatic location unavailable",
    });
  };

  // =========================================================
  // SUBMIT COMPLAINT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setDuplicateData(null);

    const email =
      localStorage.getItem("otpEmail") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("loginEmail") ||
      "";

    if (!email) {
      setError(
        "Your login session was not found. Please login again."
      );
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Please upload an image or provide a complaint description."
      );
      return;
    }

    const {
      data,
      finalCategory,
      finalPriority,
      finalTitle,
      finalDepartment,
    } = buildComplaintFormData(false);

    setSubmitting(true);

    try {
      const response =
        await fetch(
          `${API_URL}/complaints`,
          {
            method: "POST",
            body: data,
          }
        );

      let result = {};

      try {
        result =
          await response.json();
      } catch {
        result = {};
      }

      // =====================================================
      // DUPLICATE FOUND
      // =====================================================

      if (
        response.status === 409 &&
        result.duplicate
      ) {
        console.log(
          "⚠️ Similar complaint detected:",
          result
        );

        setDuplicateData(result);

        setSubmitting(false);

        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Complaint submission failed"
        );
      }

      processSuccessfulSubmission(
        result,
        finalTitle,
        finalCategory,
        finalPriority,
        finalDepartment
      );
    } catch (err) {
      console.error(
        "Submit Error:",
        err
      );

      setError(
        err.message ||
          "Complaint submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // SUBMIT ANYWAY
  // =========================================================

  const handleSubmitAnyway = async () => {
    setError("");
    setSubmitting(true);

    const {
      data,
      finalCategory,
      finalPriority,
      finalTitle,
      finalDepartment,
    } = buildComplaintFormData(true);

    try {
      const response =
        await fetch(
          `${API_URL}/complaints`,
          {
            method: "POST",
            body: data,
          }
        );

      let result = {};

      try {
        result =
          await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Complaint submission failed."
        );
      }

      processSuccessfulSubmission(
        result,
        finalTitle,
        finalCategory,
        finalPriority,
        finalDepartment
      );
    } catch (err) {
      console.error(
        "Submit Anyway Error:",
        err
      );

      setError(
        err.message ||
          "Complaint submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // CLOSE DUPLICATE WARNING
  // =========================================================

  const closeDuplicateWarning = () => {
    if (submitting) return;

    setDuplicateData(null);
  };

  // =========================================================
  // SUCCESS SCREEN
  // =========================================================

  if (successData) {
    return (
      <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-[#eef5fc] via-white to-[#eef8f1] px-4 py-8 md:px-8">

        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

          <div className="flex h-2">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-white" />
            <div className="w-1/3 bg-[#138808]" />
          </div>

          <div className="p-6 md:p-10">

            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/70">
                <FaCheckCircle className="text-5xl text-[#138808]" />
              </div>
            </div>

            <div className="mt-5 text-center">

              <h1 className="text-3xl font-extrabold text-[#0B1F3A] md:text-4xl">
                Complaint Submitted Successfully 🎉
              </h1>

              <p className="mt-2 text-base text-slate-600">
                CivicConnect AI has received and routed your complaint.
              </p>

            </div>

            <div className="mt-7 flex justify-center">

              <div className="flex items-center gap-3 rounded-full border border-green-200 bg-green-50 px-5 py-2">

                <span className="h-2.5 w-2.5 rounded-full bg-[#138808]" />

                <span className="text-sm font-bold text-[#138808]">
                  Complaint Successfully Registered
                </span>

              </div>

            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0057B8]">
                  Complaint ID
                </p>

                <p className="mt-2 text-lg font-extrabold text-[#0B1F3A]">
                  #{successData.complaintId}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97706]">
                  Complaint Title
                </p>

                <p className="mt-2 text-base font-bold text-[#0B1F3A]">
                  {successData.title}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0057B8]">
                  Category
                </p>

                <p className="mt-2 text-base font-bold text-[#0B1F3A]">
                  {successData.category}
                </p>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97706]">
                  Priority
                </p>

                <p className="mt-2 text-base font-bold text-[#0B1F3A]">
                  {successData.priority}
                </p>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#138808]">
                  Department
                </p>

                <p className="mt-2 text-base font-bold text-[#0B1F3A]">
                  {successData.department}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#0057B8]">
                  AI Confidence
                </p>

                <p className="mt-2 text-base font-extrabold text-[#138808]">
                  {successData.confidence
                    ? `${successData.confidence}%`
                    : "AI Processed"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Assigned To
                </p>

                <p className="mt-2 text-base font-bold text-[#0B1F3A]">
                  {successData.assignedTo}
                </p>
              </div>

              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#138808]">
                  Detected Location
                </p>

                <p className="mt-2 break-words text-base font-bold text-[#0B1F3A]">
                  {successData.location}
                </p>
              </div>

            </div>

            <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-4">

              <div className="flex gap-3">

                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0057B8] text-sm font-bold text-white">
                  i
                </div>

                <p className="text-sm leading-6 text-slate-700">
                  Your complaint has been registered in CivicConnect AI.
                  You can monitor its status and resolution progress from
                  <span className="font-bold text-[#0057B8]">
                    {" "}My Complaints
                  </span>.
                </p>

              </div>

            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  navigate("/my-complaints")
                }
                className="rounded-xl bg-[#0057B8] px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-[#004494] hover:shadow-lg"
              >
                View My Complaints
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/citizen/dashboard")
                }
                className="rounded-xl border-2 border-[#138808] bg-green-50 px-6 py-3.5 font-bold text-[#138808] transition hover:bg-[#138808] hover:text-white"
              >
                Dashboard
              </button>

            </div>

          </div>

          <div className="flex h-1.5">
            <div className="w-1/3 bg-[#FF9933]" />
            <div className="w-1/3 bg-[#0057B8]" />
            <div className="w-1/3 bg-[#138808]" />
          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN REPORT PAGE
  // =========================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#f3f8fd] via-white to-[#f2f8f3] px-4 py-6 md:px-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-7 flex items-center gap-4">

          <button
            type="button"
            onClick={() =>
              navigate("/citizen/dashboard")
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-[#0057B8] shadow-sm transition hover:bg-blue-50"
          >
            <FaArrowLeft />
          </button>

          <div>

            <h1 className="text-3xl font-extrabold text-[#0B1F3A] md:text-4xl">
              Report a Civic Problem
            </h1>

            <p className="mt-1 text-slate-600">
              Let CivicConnect AI understand your complaint automatically 🤖
            </p>

          </div>

        </div>

        {/* TRICOLOR LINE */}
        <div className="mb-6 flex h-1 overflow-hidden rounded-full">
          <div className="w-1/3 bg-[#FF9933]" />
          <div className="w-1/3 bg-[#0057B8]" />
          <div className="w-1/3 bg-[#138808]" />
        </div>

        {/* AI INFORMATION */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-[#0057B8] to-[#138808] p-6 text-white shadow-lg">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <FaRobot className="text-2xl" />
            </div>

            <div>

              <h2 className="text-lg font-bold">
                AI-Powered Complaint Detection
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-50">
                Upload a photo and CivicConnect AI will automatically
                analyze the issue, generate the description, classify
                the category, determine priority and route it to the
                responsible department.
              </p>

            </div>

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">

            <FaExclamationTriangle className="mt-0.5 shrink-0" />

            <span>{error}</span>

          </div>
        )}

        {/* =====================================================
            DUPLICATE WARNING MODAL
        ===================================================== */}

        {duplicateData && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              overflow-y-auto
              bg-[#0B1F3A]/60
              p-3
              backdrop-blur-sm
              sm:p-5
            "
          >

            <div className="flex min-h-full items-start justify-center py-4 sm:items-center sm:py-6">

              <div
                className="
                  flex
                  w-full
                  max-w-2xl
                  flex-col
                  overflow-hidden
                  rounded-3xl
                  border
                  border-orange-200
                  bg-white
                  shadow-2xl
                  max-h-[94vh]
                  sm:max-h-[90vh]
                "
              >

                {/* =================================================
                    MODAL HEADER
                ================================================= */}

                <div
                  className="
                    flex
                    shrink-0
                    items-start
                    gap-3
                    border-b
                    border-orange-100
                    bg-gradient-to-r
                    from-orange-50
                    to-white
                    px-4
                    py-4
                    sm:px-6
                    sm:py-5
                  "
                >

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 sm:h-12 sm:w-12">

                    <FaExclamationTriangle className="text-lg text-[#D97706] sm:text-xl" />

                  </div>

                  <div className="min-w-0 flex-1">

                    <h2 className="text-lg font-extrabold leading-tight text-[#0B1F3A] sm:text-xl">
                      Similar Complaint Found
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                      We found an active complaint that may describe the same issue.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={closeDuplicateWarning}
                    disabled={submitting}
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition
                      hover:bg-white
                      hover:text-slate-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    <FaTimes />
                  </button>

                </div>

                {/* =================================================
                    SCROLLABLE MODAL CONTENT
                ================================================= */}

                <div
                  className="
                    min-h-0
                    flex-1
                    overflow-y-auto
                    overscroll-contain
                    px-4
                    py-4
                    sm:px-6
                    sm:py-6
                  "
                >

                  {/* Existing Complaint Summary */}

                  <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 sm:p-5">

                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">

                      <div>

                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#D97706]">
                          Existing Complaint
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-[#0B1F3A] sm:text-2xl">
                          #{duplicateData.existingComplaint?.id}
                        </p>

                      </div>

                      {duplicateData.similarityScore !==
                        undefined &&
                        duplicateData.similarityScore !==
                          null && (
                          <div className="rounded-full bg-orange-100 px-3 py-2 text-xs font-extrabold text-[#D97706] sm:px-4 sm:text-sm">
                            {duplicateData.similarityScore}% Similar
                          </div>
                        )}

                    </div>

                    {/* DETAILS GRID */}

                    <div className="grid gap-3 md:grid-cols-2">

                      {/* CATEGORY */}

                      <div className="rounded-xl bg-white p-4 shadow-sm">

                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Category
                        </p>

                        <p className="mt-1 break-words font-bold text-[#0B1F3A]">
                          {duplicateData.existingComplaint?.category ||
                            "Not available"}
                        </p>

                      </div>

                      {/* STATUS */}

                      <div className="rounded-xl bg-white p-4 shadow-sm">

                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Status
                        </p>

                        <p className="mt-1 font-bold text-[#0057B8]">
                          {duplicateData.existingComplaint?.status ||
                            "Not available"}
                        </p>

                      </div>

                      {/* LOCATION */}

                      <div className="rounded-xl bg-white p-4 shadow-sm md:col-span-2">

                        <div className="flex items-start gap-2">

                          <FaMapMarkerAlt className="mt-1 shrink-0 text-red-500" />

                          <div className="min-w-0">

                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                              Location
                            </p>

                            <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#0B1F3A]">
                              {duplicateData.existingComplaint?.location ||
                                "Location unavailable"}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* DESCRIPTION */}

                      <div className="rounded-xl bg-white p-4 shadow-sm md:col-span-2">

                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Existing Complaint Description
                        </p>

                        <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                          {duplicateData.existingComplaint?.description ||
                            "Description unavailable"}
                        </p>

                      </div>

                      {/* PRIORITY */}

                      <div className="rounded-xl bg-white p-4 shadow-sm">

                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Priority
                        </p>

                        <p className="mt-1 font-bold text-[#D97706]">
                          {duplicateData.existingComplaint?.priority ||
                            "Medium"}
                        </p>

                      </div>

                      {/* DEPARTMENT */}

                      <div className="rounded-xl bg-white p-4 shadow-sm">

                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Department
                        </p>

                        <p className="mt-1 break-words text-sm font-bold leading-5 text-[#138808]">
                          {duplicateData.existingComplaint?.department ||
                            "Department not assigned"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* INFO BOX */}

                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:mt-5">

                    <FaSearch className="mt-1 shrink-0 text-[#0057B8]" />

                    <p className="text-sm leading-6 text-slate-700">

                      Duplicate detection helps prevent multiple citizens from
                      submitting the same issue repeatedly. You can still submit
                      your complaint if you believe it is a separate problem.

                    </p>

                  </div>

                  {/* Extra bottom spacing for mobile scrolling */}

                  <div className="h-2 sm:h-0" />

                </div>

                {/* =================================================
                    FIXED ACTION AREA
                ================================================= */}

                <div
                  className="
                    shrink-0
                    border-t
                    border-slate-200
                    bg-white
                    p-4
                    sm:p-5
                  "
                >

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={closeDuplicateWarning}
                      disabled={submitting}
                      className="
                        w-full
                        rounded-xl
                        border
                        border-slate-300
                        bg-white
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-slate-700
                        transition
                        hover:bg-slate-100
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      Edit Complaint
                    </button>

                    {/* VIEW */}

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/my-complaints")
                      }
                      disabled={submitting}
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border-2
                        border-[#0057B8]
                        bg-blue-50
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-[#0057B8]
                        transition
                        hover:bg-[#0057B8]
                        hover:text-white
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <FaSearch />
                      View My Complaints
                    </button>

                    {/* SUBMIT ANYWAY */}

                    <button
                      type="button"
                      onClick={handleSubmitAnyway}
                      disabled={submitting}
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#D97706]
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-white
                        shadow-md
                        transition
                        hover:bg-[#B45309]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          Submit Anyway
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            MAIN FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* IMAGE + VIDEO */}

          <div className="grid gap-6 md:grid-cols-2">

            {/* IMAGE */}

            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md">

              <div className="mb-4 flex items-center gap-2">

                <FaImage className="text-[#0057B8]" />

                <h2 className="text-lg font-bold text-[#0B1F3A]">
                  Upload Problem Image
                </h2>

              </div>

              <label className="flex min-h-[230px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 transition hover:bg-blue-50">

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Complaint preview"
                    className="h-[230px] w-full object-cover"
                  />
                ) : (
                  <>
                    <FaImage className="mb-4 text-5xl text-[#0057B8]" />

                    <p className="font-semibold text-slate-700">
                      Click to upload image
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      AI will analyze it automatically
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </label>

              {loadingAI && (
                <div className="mt-4 flex items-center gap-3 text-[#0057B8]">

                  <FaSpinner className="animate-spin" />

                  <span className="font-medium">
                    AI is analyzing your image...
                  </span>

                </div>
              )}

              {aiResult && !loadingAI && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">

                  <div className="mb-3 flex items-center gap-2 font-bold text-[#0057B8]">

                    <FaMagic />

                    AI Analysis Complete

                  </div>

                  <div className="space-y-2 text-sm text-slate-700">

                    {aiResult.caption && (
                      <p>
                        <b>AI Caption:</b>{" "}
                        {aiResult.caption}
                      </p>
                    )}

                    <p>
                      <b>Category:</b>{" "}
                      {aiResult.category}
                    </p>

                    <p>
                      <b>Priority:</b>{" "}
                      {aiResult.priority}
                    </p>

                    <p>
                      <b>Confidence:</b>{" "}
                      {aiResult.confidence}%
                    </p>

                    <p>
                      <b>Department:</b>{" "}
                      {aiResult.department}
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* VIDEO */}

            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-md">

              <div className="mb-4 flex items-center gap-2">

                <FaVideo className="text-[#D97706]" />

                <h2 className="text-lg font-bold text-[#0B1F3A]">
                  Upload Video
                </h2>

              </div>

              <label className="flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 transition hover:bg-orange-50">

                <FaVideo className="mb-4 text-5xl text-[#D97706]" />

                <p className="font-semibold text-slate-700">
                  Click to upload video
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Optional evidence
                </p>

                {formData.video && (
                  <p className="mt-3 px-4 text-center text-sm font-medium text-[#D97706]">
                    {formData.video.name}
                  </p>
                )}

                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />

              </label>

            </div>

          </div>

          {/* COMPLAINT DETAILS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md md:p-8">

            <h2 className="mb-6 text-xl font-bold text-[#0B1F3A]">
              Complaint Details
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

              {/* TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Complaint Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="AI will generate automatically"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0057B8] focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0057B8] focus:ring-2 focus:ring-blue-100"
                >

                  <option value="">
                    AI will detect category
                  </option>

                  <option value="Road Damage">
                    Road Damage
                  </option>

                  <option value="Garbage">
                    Garbage
                  </option>

                  <option value="Water Supply">
                    Water Supply
                  </option>

                  <option value="Drainage">
                    Drainage
                  </option>

                  <option value="Street Light">
                    Street Light
                  </option>

                  <option value="Electricity">
                    Electricity
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Complaint Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Describe the civic problem or upload an image for AI analysis..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#0057B8] focus:ring-2 focus:ring-blue-100"
                />

                {aiResult?.description && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[#0057B8]">

                    <FaRobot />

                    Description generated by AI

                  </p>
                )}

              </div>

              {/* PRIORITY */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Priority
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[#0057B8] focus:ring-2 focus:ring-blue-100"
                >

                  <option value="Low">
                    Low
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="High">
                    High
                  </option>

                </select>

                <p className="mt-2 text-xs text-slate-400">
                  AI automatically suggests priority.
                </p>

              </div>

              {/* DEPARTMENT */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Responsible Department
                </label>

                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 font-medium text-[#138808]">
                  {aiResult?.department ||
                    getDepartment(
                      formData.category
                    )}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Automatically routed from AI category.
                </p>

              </div>

            </div>

          </div>

          {/* LOCATION */}

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-md md:p-8">

            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">

              <div>

                <h2 className="flex items-center gap-2 text-xl font-bold text-[#0B1F3A]">

                  <FaMapMarkerAlt className="text-[#138808]" />

                  Complaint Location

                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Automatically detect the location or enter it manually.
                </p>

              </div>

              <button
                type="button"
                onClick={detectLocation}
                disabled={loadingLocation}
                className="flex items-center gap-2 rounded-xl bg-[#138808] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#0f7207] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loadingLocation ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaLocationArrow />
                )}

                {loadingLocation
                  ? "Detecting..."
                  : "Use My Location"}

              </button>

            </div>

            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter complaint location"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#138808] focus:ring-2 focus:ring-green-100"
            />

            {gpsInfo && (
              <p className="mt-3 text-xs text-[#138808]">

                GPS detected:{" "}

                {gpsInfo.latitude.toFixed(6)},{" "}

                {gpsInfo.longitude.toFixed(6)}

              </p>
            )}

            {gpsWarning && (
              <p className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-sm text-[#D97706]">
                {gpsWarning}
              </p>
            )}

          </div>

          {/* SUBMIT */}

          <div className="flex justify-end">

            <button
              type="submit"
              disabled={submitting || loadingAI}
              className="flex items-center justify-center gap-3 rounded-xl bg-[#0057B8] px-8 py-4 font-bold text-white shadow-lg transition hover:bg-[#004494] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >

              {submitting ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Checking Complaint...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Submit Complaint
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default ReportComplaint;