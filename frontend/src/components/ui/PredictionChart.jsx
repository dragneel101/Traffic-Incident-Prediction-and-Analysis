import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Expand, Shrink } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PredictionChart = ({ timeseries }) => {
  const [expanded, setExpanded] = useState(false);

  const chartData = {
    labels: Object.keys(timeseries),
    datasets: [
      {
        label: 'Collision Predictions',
        data: Object.values(timeseries),
        borderColor: 'rgba(79,70,229,1)',
        backgroundColor: 'rgba(79,70,229,0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Predictions Over Time',
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Prediction Chart</h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
        >
          {expanded ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
          {expanded ? 'Shrink' : 'Expand'}
        </button>
      </div>
      <div className={expanded ? "h-[400px]" : "h-[200px] transition-all duration-300"}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PredictionChart;
