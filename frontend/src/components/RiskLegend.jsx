import React from "react";

const legendItems = [
  { color: "bg-green-500", label: "Low" },
  { color: "bg-blue-500", label: "Moderate" },
  { color: "bg-yellow-400", label: "Elevated" },
  { color: "bg-orange-500", label: "High" },
  { color: "bg-red-600", label: "Severe" },
];

const RiskLegend = () => (
  <div className="flex gap-4 mb-2 items-center text-sm">
    {legendItems.map((item, index) => (
      <span key={index} className="flex items-center gap-1">
        <span className={`w-4 h-4 rounded inline-block ${item.color}`}></span>
        {item.label}
      </span>
    ))}
  </div>
);

export default RiskLegend;
