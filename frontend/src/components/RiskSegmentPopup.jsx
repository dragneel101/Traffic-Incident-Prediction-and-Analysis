import React from "react";

const getRiskDescription = (risk) => {
    if (risk < 0.2) return "Very low collision risk";
    if (risk < 0.4) return "Low collision risk";
    if (risk < 0.6) return "Moderate collision risk";
    if (risk < 0.8) return "High collision risk - Exercise caution!";
    return "Very high collision risk - Avoid if possible!";
  };

const RiskSegmentPopup = ({ riskScore, description }) => (
  <div className="text-sm">
    <strong>Collision Risk:</strong> {(riskScore * 100).toFixed(1)}%<br />
    <strong>Description:</strong> {getRiskDescription(riskScore)}
  </div>
);

export default RiskSegmentPopup;
