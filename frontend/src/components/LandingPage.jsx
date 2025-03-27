import React from "react";
import { Link } from "react-router-dom";
import landingImage from "../assets/landing_page_img.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 to-indigo-700 text-white flex flex-col">

      <div className="flex-grow container mx-auto px-6 flex flex-col justify-center items-center text-center">
        <h1 className="text-5xl font-bold mb-4">
          Predict and Avoid Traffic Collisions
        </h1>
        <p className="text-xl mb-8 max-w-2xl">
          Real-time traffic incident prediction powered by machine learning. Plan safer journeys with collision-risk insights along your route.
        </p>

        <img
          src={landingImage}
          alt="Landing"
          className="w-full max-w-2xl mb-8 rounded-lg shadow-lg"
        />

        <Link
          to="/route-planner"
          className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition"
        >
          Plan Your Route Now
        </Link>
      </div>

      <footer className="py-4 px-6 text-center">
        © {new Date().getFullYear()} Collision Predictor. All Rights Reserved.
      </footer>
    </div>
  );
};

export default LandingPage;