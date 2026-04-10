import React from "react";

export default function AboutBanner() {
  return (
    <div className="relative overflow-hidden w-full mb-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="dark-card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[280px]">
            {/* Left content */}
            <div className="p-8 md:p-10 flex flex-col justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Traffic Safety AI
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3 leading-tight">
                  Collision<span className="text-blue-400">Predictor</span>
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">
                  A full-stack <span className="text-gray-200 font-medium">real-time traffic collision risk prediction system</span> built to
                  help users make safer travel decisions. Integrates historical accident datasets with live
                  traffic data, weather forecasts, and contextual metadata.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Conceived to address the growing need for proactive, data-driven traffic safety tools in
                  densely populated urban settings like Toronto.
                </p>
              </div>
            </div>

            {/* Right image */}
            <div className="relative min-h-[240px] overflow-hidden">
              <img
                src="/assets/city-banner.png"
                alt="City skyline"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900/60" />

              {/* Logo badge */}
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-20 h-20 hidden md:flex rounded-full overflow-hidden ring-2 ring-blue-500/40 shadow-glow-blue">
                <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
