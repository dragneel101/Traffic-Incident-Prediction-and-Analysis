import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="p-8 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">🏡 Welcome to Collision Predictor</h1>
      <p className="text-gray-700 mb-6">
        Our system helps you plan safer routes by predicting collision risks using real-time data,
        weather, and historical trends.
      </p>
      <Link to="/route-planner">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700 transition">
          Plan a Route
        </button>
      </Link>
    </div>
  );
};

export default Home;
