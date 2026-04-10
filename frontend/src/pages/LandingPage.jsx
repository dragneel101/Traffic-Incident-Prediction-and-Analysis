import React from "react";
import { Link } from "react-router-dom";
import landingImage from "../assets/landing_page_img.png";
import { Shield, Zap, Map, TrendingUp, ArrowRight, ChevronRight } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "ML Risk Prediction",
    description: "RandomForest model trained on Toronto collision data predicts risk probability per route segment.",
  },
  {
    icon: Map,
    title: "Live Traffic Data",
    description: "HERE Traffic API feeds real-time congestion, incidents and road closures onto your route.",
  },
  {
    icon: Zap,
    title: "Instant Route Analysis",
    description: "Compare up to 3 alternate routes with color-coded risk scores in seconds.",
  },
  {
    icon: TrendingUp,
    title: "Weather-Aware",
    description: "OpenWeatherMap integration factors current conditions into every collision risk score.",
  },
];

const stats = [
  { value: "95%+", label: "Route Coverage" },
  { value: "<2s", label: "Prediction Time" },
  { value: "3", label: "Alternate Routes" },
  { value: "Real-time", label: "Traffic Data" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-app-bg pt-16 overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 md:py-28 px-4">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-800/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-slow" />
            ML-Powered Traffic Safety
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight text-white mb-6 animate-slide-up">
            Drive Smarter,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Stay Safer
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Real-time collision risk prediction powered by machine learning. Enter your route, get instant
            risk scores, and always take the safest path.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            <Link to="/route-planner" className="btn-amber inline-flex items-center gap-2 text-base shadow-glow-amber">
              Plan Your Route
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Learn how it works
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* App preview */}
          <div className="relative max-w-4xl mx-auto animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-2xl blur-xl" />
            <div className="relative rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl">
              <img
                src={landingImage}
                alt="TIPA route risk prediction interface"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8 border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Everything you need to drive safely
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Powered by live data, machine learning, and designed for real-world decision making.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="dark-card p-6 hover:border-blue-500/30 transition-all duration-300 cursor-default group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors duration-200">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent pointer-events-none" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 relative">
              Ready to predict your route risk?
            </h2>
            <p className="text-gray-400 mb-8 relative">
              Create a free account and start planning safer journeys today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative">
              <Link to="/signup" className="btn-amber inline-flex items-center justify-center gap-2 text-sm">
                Create free account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/login" className="btn-secondary inline-flex items-center justify-center gap-2 text-sm">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">
              Collision<span className="text-blue-400">Predictor</span>
            </span>
          </div>
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} CollisionPredictor · All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
