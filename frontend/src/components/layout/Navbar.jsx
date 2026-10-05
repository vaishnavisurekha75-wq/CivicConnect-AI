import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-4">

        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold text-white flex items-center gap-2"
        >
          🌍 CivicConnect AI
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-white font-medium">
          <a href="#home" className="hover:text-cyan-300 transition">
            Home
          </a>

          <a href="#features" className="hover:text-cyan-300 transition">
            Features
          </a>

          <a href="#about" className="hover:text-cyan-300 transition">
            About
          </a>

          <a href="#contact" className="hover:text-cyan-300 transition">
            Contact
          </a>

          <Link
            to="/login"
            className="bg-white text-blue-700 px-5 py-2 rounded-full font-semibold hover:bg-cyan-100 transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile Icon */}
        <button className="md:hidden text-white text-2xl">
          <FaBars />
        </button>
      </div>
    </nav>
  );
}