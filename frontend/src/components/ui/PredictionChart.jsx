import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Maximize2, Minimize2, TrendingUp } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PredictionChart = ({ timeseries }) => {
  const [expanded, setExpanded] = useState(false);

  const labels = Object.keys(timeseries);
  const values = Object.values(timeseries);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Predictions",
        data: values,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.08)",
        borderWidth: 2,
        pointBackgroundColor: "#3B82F6",
        pointBorderColor: "#0A0F1E",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#9CA3AF",
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} predictions`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(55, 65, 81, 0.5)", drawBorder: false },
        ticks: { color: "#6B7280", font: { size: 11, family: "Inter" } },
        border: { display: false },
      },
      y: {
        grid: { color: "rgba(55, 65, 81, 0.5)", drawBorder: false },
        ticks: { color: "#6B7280", font: { size: 11, family: "Inter" } },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dark-card p-5 mb-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-base font-semibold text-white">Predictions Over Time</h2>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors duration-150 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-800"
        >
          {expanded
            ? <><Minimize2 className="w-3.5 h-3.5" /> Collapse</>
            : <><Maximize2 className="w-3.5 h-3.5" /> Expand</>
          }
        </button>
      </div>
      <div
        className={`transition-all duration-300 ${expanded ? "h-[360px]" : "h-[200px]"}`}
      >
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PredictionChart;
