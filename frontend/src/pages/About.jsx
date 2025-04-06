import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import AboutBanner from "../components/AboutBanner";

export default function AboutProjectPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <AboutBanner />
      {/* Section Wrapper */}
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Overview */}


        {/* Objectives */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white shadow-md">
            <CardContent className="space-y-4 py-6 px-5">
              <h2 className="text-2xl font-semibold flex items-center gap-2">🎯 Objectives</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Predict collision risk between two points using live and historical data.</li>
                <li>Visualize high-risk and low-risk zones on a dynamic map.</li>
                <li>Incorporate contextual factors like weather, time of day, and traffic patterns.</li>
                <li>Support user accounts with trip history and safety logs.</li>
                <li>Enable model monitoring and automated retraining pipelines.</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Visual Previews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="bg-white shadow-md">
            <CardContent className="space-y-4 py-6 px-5">
              <h2 className="text-2xl font-semibold flex items-center gap-2">📸 Visual Previews</h2>
              <img
                src="/assets/route-map.png"
                alt="Risk Heatmap"
                className="rounded-xl shadow max-w-3xl h-auto mx-auto"
              />
              <p className="text-center text-sm text-gray-500">
                <em>Red zones indicate areas of elevated collision risk based on model analysis.</em>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white shadow-md">
            <CardContent className="space-y-4 py-6 px-5">
              <h2 className="text-2xl font-semibold flex items-center gap-2">🧰 Tech Stack</h2>
              <table className="w-full text-left border-collapse text-gray-700">
                <thead>
                  <tr className="border-b font-semibold text-gray-800">
                    <th className="p-2">Component</th>
                    <th className="p-2">Technology</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="p-2">Backend</td><td className="p-2">FastAPI</td></tr>
                  <tr><td className="p-2">Frontend</td><td className="p-2">React + Tailwind CSS</td></tr>
                  <tr><td className="p-2">Modeling</td><td className="p-2">Scikit-learn (Toronto data)</td></tr>
                  <tr><td className="p-2">Data</td><td className="p-2">Pandas, Numpy, Meteostat</td></tr>
                  <tr><td className="p-2">APIs</td><td className="p-2">OpenWeather, OpenRouteService</td></tr>
                  <tr><td className="p-2">Deployment</td><td className="p-2">Uvicorn + REST</td></tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Future Enhancements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="bg-white shadow-md">
            <CardContent className="space-y-4 py-6 px-5">
              <h2 className="text-2xl font-semibold flex items-center gap-2">🔍 Future Enhancements</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>User login and personalized trip dashboard</li>
                <li>Live risk heatmap updates along route timeline</li>
                <li>Model monitoring dashboard for accuracy and drift</li>
                <li>Scheduled retraining with new data</li>
                <li>Comparative risk analysis for alternate routes</li>
                <li>Mobile-optimized PWA support</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Target Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white shadow-md">
            <CardContent className="space-y-4 py-6 px-5">
              <h2 className="text-2xl font-semibold flex items-center gap-2">👩‍💻 Target Users</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Everyday commuters and city drivers</li>
                <li>Urban transportation and traffic safety officials</li>
                <li>Ride-share and logistics companies</li>
                <li>Emergency responders seeking optimal safe routing</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Button */}
        <div className="text-center pt-6">
          <Button className="text-lg px-6 py-2 shadow-md">📬 Contact Us</Button>
        </div>
      </div>
    </div>
  );
}
