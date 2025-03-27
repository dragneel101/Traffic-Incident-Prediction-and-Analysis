import React from "react";
import { Link } from "react-router-dom";
import landingImage from "../assets/landing_page_img.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-indigo-700 text-white flex flex-col">
      {/* Main Hero Section */}
      <main className="flex-grow container mx-auto px-6 flex flex-col items-center justify-center text-center py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Predict and Avoid Traffic Collisions
        </h1>

        <p className="text-xl md:text-2xl text-indigo-100 mb-10 max-w-2xl">
          Real-time traffic incident prediction powered by machine learning. Plan safer journeys with collision-risk insights along your route.
        </p>

        <img
          src={landingImage}
          alt="Traffic prediction illustration"
          className="w-full max-w-3xl rounded-lg shadow-xl mb-12 animate-fadeIn"
        />

        <Link
          to="/route-planner"
          className="bg-white text-indigo-700 text-lg font-semibold px-8 py-4 rounded-md hover:bg-gray-100 transition-all duration-200 shadow-md"
        >
          🚀 Plan Your Route Now
        </Link>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-800 text-sm py-4 px-6 text-center text-indigo-200">
        © {new Date().getFullYear()} Collision Predictor · All Rights Reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
