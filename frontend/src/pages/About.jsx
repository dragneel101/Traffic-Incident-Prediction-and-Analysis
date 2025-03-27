import React from "react";

const About = () => {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-indigo-700 mb-4">ℹ️ About This Project</h2>
      <p className="text-gray-700 mb-4">
        Collision Predictor is an AI-powered tool designed to improve road safety by forecasting
        accident risks across various routes.
      </p>
      <ul className="list-disc ml-6 text-gray-700">
        <li>Uses live weather and traffic data</li>
        <li>Predicts risk scores for routes in real time</li>
        <li>Built with FastAPI + React + OpenRouteService</li>
      </ul>
    </div>
  );
};

export default About;
