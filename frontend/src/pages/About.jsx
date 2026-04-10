import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../components/ui/card";
import { motion } from "framer-motion";
import AboutBanner from "../components/AboutBanner";
import { Target, Layers, Users, Telescope, Mail, ExternalLink } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

const techRows = [
  ["Backend", "FastAPI + Python 3.11"],
  ["Frontend", "React 19 + Tailwind CSS"],
  ["ML Model", "Scikit-learn RandomForest"],
  ["Data", "Pandas, Numpy, Meteostat"],
  ["APIs", "OpenWeather, OpenRouteService, HERE Traffic"],
  ["Deployment", "Coolify + Nixpacks"],
];

export default function AboutProjectPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <AboutBanner />

      <div className="max-w-5xl mx-auto space-y-5">
        {/* Objectives */}
        <motion.div {...fadeUp(0.1)}>
          <div className="dark-card p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Objectives</h2>
            </div>
            <ul className="space-y-2.5">
              {[
                "Predict collision risk between two points using live and historical data.",
                "Visualize high-risk and low-risk zones on a dynamic map.",
                "Incorporate contextual factors: weather, time of day, and traffic patterns.",
                "Support user accounts with trip history and safety logs.",
                "Enable model monitoring and automated retraining pipelines.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Visual Preview */}
        <motion.div {...fadeUp(0.15)}>
          <div className="dark-card p-7">
            <h2 className="text-lg font-bold text-white mb-5">Visual Preview</h2>
            <div className="rounded-xl overflow-hidden border border-gray-700/50">
              <img
                src="/assets/route-map.png"
                alt="Risk heatmap showing route risk levels"
                className="w-full h-auto max-w-3xl mx-auto block"
                loading="lazy"
              />
            </div>
            <p className="text-center text-xs text-gray-600 mt-3 italic">
              Red zones indicate areas of elevated collision risk based on model analysis.
            </p>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div {...fadeUp(0.2)}>
          <div className="dark-card p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Tech Stack</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/60">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Component</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Technology</th>
                  </tr>
                </thead>
                <tbody>
                  {techRows.map(([component, tech], i) => (
                    <tr key={i} className={`border-t border-gray-800 ${i % 2 === 0 ? "" : "bg-gray-800/20"}`}>
                      <td className="px-4 py-3 text-gray-400 font-medium">{component}</td>
                      <td className="px-4 py-3 text-gray-200">{tech}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Future */}
        <motion.div {...fadeUp(0.25)}>
          <div className="dark-card p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Telescope className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Future Enhancements</h2>
            </div>
            <ul className="space-y-2.5">
              {[
                "Live risk heatmap updates along route timeline",
                "Model monitoring dashboard for accuracy and drift",
                "Scheduled retraining with new data",
                "Comparative risk analysis for alternate routes",
                "Mobile-optimized PWA support",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Target Users */}
        <motion.div {...fadeUp(0.3)}>
          <div className="dark-card p-7">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Target Users</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Everyday commuters and city drivers",
                "Urban transportation and traffic safety officials",
                "Ride-share and logistics companies",
                "Emergency responders seeking optimal safe routing",
              ].map((user, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50">
                  <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{user}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fadeUp(0.35)} className="text-center pt-4">
          <Link
            to="/route-planner"
            className="btn-amber inline-flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Try the Route Planner
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
