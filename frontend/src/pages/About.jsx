import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";

export default function AboutProjectPage() {
  return (
    <div className="p-6 space-y-6">
      <motion.h1
        className="text-4xl font-bold text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🛣️ About This Project
      </motion.h1>

      <motion.img
        src="https://images.unsplash.com/photo-1602631985686-b04db85aa8cb?fit=crop&w=1400&q=80"
        alt="Dashboard Banner"
        className="rounded-2xl shadow-md w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">🚀 Overview</h2>
          <p>
            This project is a <strong>real-time traffic collision risk predictor</strong>
            designed to assess and visualize the risk of vehicle collisions along a
            user-defined route. It combines historical collision data, live traffic,
            weather, and contextual factors to offer proactive, risk-aware routing.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">🎯 Objectives</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Predict collision risk between two points using live and historical data.</li>
            <li>Visualize high-risk and low-risk zones on a map.</li>
            <li>Incorporate context like weather and time of day.</li>
            <li>Support user accounts and trip history.</li>
            <li>Enable model monitoring and retraining.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">📸 Visual Previews</h2>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/OpenStreetMap_Mapnik_route_example.png/1280px-OpenStreetMap_Mapnik_route_example.png"
            alt="Risk Heatmap"
            className="rounded-2xl shadow-md"
          />
          <p><em>Red zones indicate high collision risk.</em></p>
          <img
            src="https://images.unsplash.com/photo-1580126273065-d3cf94f75235?fit=crop&w=1400&q=80"
            alt="Weather Overlay"
            className="rounded-2xl shadow-md"
          />
          <p><em>Real-time weather impacts risk prediction.</em></p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">🧰 Tech Stack</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Component</th>
                <th className="p-2">Technology</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2">Backend</td><td className="p-2">FastAPI</td></tr>
              <tr><td className="p-2">Frontend</td><td className="p-2">React + Tailwind CSS (planned)</td></tr>
              <tr><td className="p-2">Modeling</td><td className="p-2">Scikit-learn (model.pkl)</td></tr>
              <tr><td className="p-2">Data</td><td className="p-2">Pandas, numpy, meteostat</td></tr>
              <tr><td className="p-2">APIs</td><td className="p-2">OpenWeather, OpenRouteService</td></tr>
              <tr><td className="p-2">Deployment</td><td className="p-2">Uvicorn</td></tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">🔍 Future Enhancements</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Secure login with trip history</li>
            <li>Performance dashboard for ML model</li>
            <li>Scheduled or active retraining pipeline</li>
            <li>Multi-route comparison</li>
            <li>Mobile-friendly design</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-2xl font-semibold">👩‍💻 Target Users</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Commuters and drivers</li>
            <li>City traffic managers</li>
            <li>Ride-share companies</li>
            <li>Emergency services</li>
          </ul>
        </CardContent>
      </Card>

      <div className="text-center pt-4">
        <Button className="text-lg">📬 Contact Us</Button>
      </div>
    </div>
  );
}
