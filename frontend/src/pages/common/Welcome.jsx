import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaRobot,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaChartLine,
  FaArrowRight,
  FaCheckCircle,
  FaRoad,
  FaWater,
  FaTrash,
  FaLightbulb,
  FaRoute,
  FaClipboardCheck,
  FaBuilding,
  FaClock,
  FaUserCheck,
} from "react-icons/fa";

import civicLogo from "../../assets/civicconnect-logo.png";

const Welcome = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src={civicLogo}
              alt="CivicConnect AI"
              className="h-32 w-auto max-w-[420px] object-contain"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden items-center gap-8 md:flex">

            <a
              href="#home"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="#features"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <Link
              to="/login"
              className="text-sm font-bold text-slate-700 transition hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-100 transition hover:bg-blue-700 hover:shadow-lg"
            >
              Create Account
            </Link>

          </div>

          {/* MOBILE MENU */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-slate-700 md:hidden"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

        </div>

        {/* MOBILE NAVIGATION */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">

            <div className="flex flex-col gap-4">

              <a
                href="#home"
                onClick={() => setMenuOpen(false)}
                className="font-semibold text-slate-700"
              >
                Home
              </a>

              <a
                href="#features"
                onClick={() => setMenuOpen(false)}
                className="font-semibold text-slate-700"
              >
                Features
              </a>

              <a
                href="#workflow"
                onClick={() => setMenuOpen(false)}
                className="font-semibold text-slate-700"
              >
                How It Works
              </a>

              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="font-semibold text-slate-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-blue-600 px-5 py-3 text-center font-bold text-white"
              >
                Create Account
              </Link>

            </div>

          </div>
        )}
      </nav>


      {/* =====================================================
          HERO
      ====================================================== */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50 pt-32"
      >

        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

        <div className="absolute left-1/2 top-20 h-48 w-48 -translate-x-1/2 rounded-full bg-green-100/25 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

          {/* HERO CONTENT */}
          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">

              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-sm font-bold text-slate-700">
                AI-Powered Civic Problem Solving
              </span>

            </div>

            <h2 className="max-w-2xl text-5xl font-black leading-tight tracking-tight text-slate-900 lg:text-6xl">

              Smarter Cities.

              <span className="block text-blue-600">
                Better Solutions.
              </span>

            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Report civic problems, let AI understand and route them,
              and follow every step until resolution — all in one platform.
            </p>

            {/* BUTTONS */}
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">

              <Link
                to="/register"
                className="group flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 hover:shadow-xl"
              >
                Report a Civic Issue

                <FaArrowRight className="transition group-hover:translate-x-1" />
              </Link>

              <Link
                to="/login"
                className="flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:border-orange-200 hover:text-blue-600"
              >
                Login to Dashboard
              </Link>

            </div>

            {/* TRUST POINTS */}
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">

              <TrustItem
                icon={<FaRobot />}
                text="AI Powered"
                color="blue"
              />

              <TrustItem
                icon={<FaMapMarkerAlt />}
                text="GPS Enabled"
                color="green"
              />

              <TrustItem
                icon={<FaShieldAlt />}
                text="Secure"
                color="orange"
              />

              <TrustItem
                icon={<FaChartLine />}
                text="Trackable"
                color="blue"
              />

            </div>

          </div>


          {/* =================================================
              AI ANALYSIS CARD
          ================================================== */}
          <div className="relative">

            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-blue-100/50 via-orange-100/40 to-green-100/40 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                <div>

                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    AI Complaint Analysis
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                    Smart Resolution Engine
                  </h3>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <FaRobot />
                </div>

              </div>

              {/* COMPLAINT */}
              <div className="p-6">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <div className="mb-3 flex items-center gap-2">

                    <FaClipboardCheck className="text-blue-600" />

                    <span className="text-sm font-bold text-slate-700">
                      Citizen Complaint
                    </span>

                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    “There is a large pothole near the school and vehicles
                    are facing difficulty.”
                  </p>

                </div>

                {/* RESULTS */}
                <div className="mt-5 grid grid-cols-2 gap-3">

                  <ResultCard
                    icon={<FaRoad />}
                    title="Category"
                    value="Road Damage"
                    color="blue"
                  />

                  <ResultCard
                    icon={<FaChartLine />}
                    title="Priority"
                    value="High"
                    color="orange"
                  />

                  <ResultCard
                    icon={<FaBuilding />}
                    title="Department"
                    value="Roads & Buildings"
                    color="green"
                  />

                  <ResultCard
                    icon={<FaMapMarkerAlt />}
                    title="Location"
                    value="GPS Detected"
                    color="blue"
                  />

                </div>

                {/* SUCCESS */}
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                    <FaCheckCircle />
                  </div>

                  <div>

                    <p className="text-sm font-extrabold text-green-800">
                      Complaint successfully routed
                    </p>

                    <p className="text-xs text-green-700">
                      Assigned to responsible authority
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          INTRO
      ====================================================== */}
      <section className="bg-white px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-blue-600">
            <FaUserCheck />
          </div>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Citizen-Centric Platform
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-900 lg:text-4xl">
            Connecting Citizens with Civic Authorities
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            CivicConnect AI simplifies public grievance management by
            connecting citizens, intelligent classification and responsible
            authorities through one transparent digital platform.
          </p>

        </div>

      </section>


      {/* =====================================================
          FEATURES
      ====================================================== */}
      <section
        id="features"
        className="bg-slate-50 px-6 py-20 lg:px-8"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-12 text-center">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              Platform Capabilities
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-900 lg:text-4xl">
              Everything needed for smarter civic services
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              From reporting a problem to tracking its resolution,
              CivicConnect AI brings the complete process together.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            <FeatureCard
              icon={<FaRobot />}
              title="AI Classification"
              text="Understand complaint descriptions and identify the appropriate civic category."
              color="blue"
            />

            <FeatureCard
              icon={<FaMapMarkerAlt />}
              title="GPS Enabled"
              text="Capture complaint location so authorities can identify where action is required."
              color="green"
            />

            <FeatureCard
              icon={<FaShieldAlt />}
              title="Secure Platform"
              text="Authenticated access keeps citizen and complaint information organized and protected."
              color="orange"
            />

            <FeatureCard
              icon={<FaChartLine />}
              title="Live Tracking"
              text="Citizens can follow complaint progress from submission to final resolution."
              color="blue"
            />

          </div>

        </div>
      </section>


      {/* =====================================================
          CIVIC CATEGORIES
      ====================================================== */}
      <section className="bg-white px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-12">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-green-600">
              Everyday Civic Problems
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-900 lg:text-4xl">
              One platform. Multiple civic needs.
            </h2>

            <p className="mt-4 max-w-2xl text-slate-600">
              Citizens can report common community issues and let CivicConnect
              AI help route them to the appropriate authority.
            </p>

          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            <CategoryCard
              icon={<FaRoad />}
              title="Road Damage"
              text="AI-assisted reporting"
              color="blue"
            />

            <CategoryCard
              icon={<FaWater />}
              title="Water Issues"
              text="AI-assisted reporting"
              color="green"
            />

            <CategoryCard
              icon={<FaTrash />}
              title="Garbage & Sanitation"
              text="AI-assisted reporting"
              color="orange"
            />

            <CategoryCard
              icon={<FaLightbulb />}
              title="Streetlights"
              text="AI-assisted reporting"
              color="blue"
            />

          </div>

        </div>
      </section>


      {/* =====================================================
          WORKFLOW
      ====================================================== */}
      <section
        id="workflow"
        className="bg-gradient-to-br from-blue-50 via-white to-green-50 px-6 py-20 lg:px-8"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-14 text-center">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Simple Digital Workflow
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-900 lg:text-4xl">
              From complaint to resolution
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              A transparent workflow connecting citizens, AI and responsible
              authorities.
            </p>

          </div>

          <div className="grid gap-5 md:grid-cols-5">

            <ProcessCard
              number="01"
              icon={<FaClipboardCheck />}
              title="Report"
              text="Submit the civic issue with description, location and supporting evidence."
              color="blue"
            />

            <ProcessCard
              number="02"
              icon={<FaRobot />}
              title="Analyze"
              text="AI processes the complaint and identifies category and priority."
              color="orange"
            />

            <ProcessCard
              number="03"
              icon={<FaRoute />}
              title="Route"
              text="The complaint is connected to the appropriate responsible department."
              color="green"
            />

            <ProcessCard
              number="04"
              icon={<FaClock />}
              title="Track"
              text="Citizens can monitor complaint progress until action is completed."
              color="blue"
            />

            <ProcessCard
              number="05"
              icon={<FaCheckCircle />}
              title="Resolve"
              text="The complaint reaches completion and the citizen receives an update."
              color="green"
            />

          </div>

        </div>
      </section>


      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 px-8 py-14 text-center shadow-2xl shadow-blue-100 lg:px-16">

          <div className="mx-auto max-w-3xl">

            <div className="mx-auto mb-5 flex justify-center">

              <div className="rounded-2xl bg-white p-3 shadow-lg">

                <img
                  src={civicLogo}
                  alt="CivicConnect AI"
                  className="h-48 w-auto max-w-[560px] object-contain"
                />

              </div>

            </div>

            <h2 className="mt-6 text-3xl font-black text-white lg:text-4xl">
              Make civic reporting smarter.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-blue-50">
              Report civic issues, connect with responsible authorities,
              and follow every step towards resolution with CivicConnect AI.
            </p>

            <Link
              to="/register"
              className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-7 py-4 font-extrabold text-blue-600 shadow-lg transition hover:scale-[1.02] hover:shadow-xl"
            >
              Get Started with CivicConnect

              <FaArrowRight className="transition group-hover:translate-x-1" />
            </Link>

          </div>

        </div>
      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="border-t border-slate-200 bg-white px-6 py-10 lg:px-8">

        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-3">

            <img
              src={civicLogo}
              alt="CivicConnect AI"
              className="h-32 w-auto max-w-[400px] object-contain"
            />

          </div>

          <p className="text-sm text-slate-500">
            Connecting Citizens. Solving Problems.
          </p>

          <p className="text-xs text-slate-400">

            <span className="text-blue-500">
              AI-Powered
            </span>

            {" • "}

            <span className="text-green-600">
              Transparent
            </span>

            {" • "}

            <span className="text-orange-500">
              Citizen-Centric
            </span>

          </p>

        </div>

      </footer>

    </div>
  );
};


/* =========================================================
   TRUST ITEM
========================================================= */

const TrustItem = ({ icon, text, color }) => {

  const colorClasses = {
    blue: "text-blue-600",
    orange: "text-orange-500",
    green: "text-green-600",
  };

  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">

      <span className={colorClasses[color]}>
        {icon}
      </span>

      {text}

    </div>
  );
};


/* =========================================================
   RESULT CARD
========================================================= */

const ResultCard = ({
  icon,
  title,
  value,
  color,
}) => {

  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">

      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">

        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${colors[color]}`}
        >
          {icon}
        </span>

        {title}

      </div>

      <p className="mt-2 text-sm font-extrabold text-slate-800">
        {value}
      </p>

    </div>
  );
};


/* =========================================================
   FEATURE CARD
========================================================= */

const FeatureCard = ({
  icon,
  title,
  text,
  color,
}) => {

  const styles = {

    blue: {
      icon: "bg-blue-50 text-blue-600",
      hover: "hover:border-blue-200",
      link: "text-blue-600",
    },

    orange: {
      icon: "bg-orange-50 text-orange-500",
      hover: "hover:border-orange-200",
      link: "text-orange-500",
    },

    green: {
      icon: "bg-green-50 text-green-600",
      hover: "hover:border-green-200",
      link: "text-green-600",
    },

  };

  return (
    <div
      className={`group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${styles[color].hover}`}
    >

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${styles[color].icon}`}
      >
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {text}
      </p>

      <div
        className={`mt-5 flex items-center gap-2 text-sm font-bold ${styles[color].link}`}
      >
        Learn more

        <FaArrowRight className="text-xs transition group-hover:translate-x-1" />
      </div>

    </div>
  );
};


/* =========================================================
   CATEGORY CARD
========================================================= */

const CategoryCard = ({
  icon,
  title,
  text,
  color,
}) => {

  const styles = {

    blue: "bg-blue-50 text-blue-600",

    orange: "bg-orange-50 text-orange-500",

    green: "bg-green-50 text-green-600",

  };

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl ${styles[color]}`}
        >
          {icon}
        </div>

        <FaArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500" />

      </div>

      <h3 className="mt-6 font-extrabold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
};


/* =========================================================
   PROCESS CARD
========================================================= */

const ProcessCard = ({
  number,
  icon,
  title,
  text,
  color,
}) => {

  const styles = {

    blue: "bg-blue-50 text-blue-600",

    orange: "bg-orange-50 text-orange-500",

    green: "bg-green-50 text-green-600",

  };

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex items-center justify-between">

        <span className="text-3xl font-black text-slate-100">
          {number}
        </span>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles[color]}`}
        >
          {icon}
        </div>

      </div>

      <h3 className="mt-6 font-extrabold text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {text}
      </p>

    </div>
  );
};


export default Welcome;