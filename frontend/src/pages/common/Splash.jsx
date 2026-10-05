import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400 flex flex-col items-center justify-center text-white">
      <div className="text-6xl mb-6">🌍</div>

      <h1 className="text-5xl font-bold">
        CivicConnect AI
      </h1>

      <p className="mt-4 text-xl">
        Connecting Citizens. Solving Problems.
      </p>

      <div className="mt-10">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default Splash;