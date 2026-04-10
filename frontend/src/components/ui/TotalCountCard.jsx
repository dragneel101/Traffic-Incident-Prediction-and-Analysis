import React from "react";
import { Activity } from "lucide-react";

const TotalCountCard = ({ total }) => (
  <div className="dark-card p-5 flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
      <Activity className="w-6 h-6 text-blue-400" />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Predictions</p>
      <p className="text-3xl font-bold text-white font-mono">{total.toLocaleString()}</p>
    </div>
  </div>
);

export default TotalCountCard;
