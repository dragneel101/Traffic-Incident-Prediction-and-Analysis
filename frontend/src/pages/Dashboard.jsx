// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [userName, setUserName] = useState('User');

  // Optionally, fetch user details from backend to set the userName
  // useEffect(() => {
  //   // fetch user profile and setUserName(...)
  // }, []);

  // Dummy data for the chart
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Collision Predictions',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgba(79,70,229,1)', // indigo-600
        backgroundColor: 'rgba(79,70,229,0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Collision Predictions',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Hello, {userName}!</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your dashboard. Here’s a quick overview of your collision prediction stats.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">Total Predictions</h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">123</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">High Risk Routes</h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">5</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">Recent Collisions</h2>
          <p className="text-3xl font-bold text-indigo-600 mt-2">2</p>
        </div>
      </div>

      {/* Collision Predictions Chart */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Quick Access Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Link
          to="/route-planner"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow text-center hover:bg-indigo-700 transition"
        >
          Route Planner
        </Link>
        <Link
          to="/profile"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow text-center hover:bg-indigo-700 transition"
        >
          Profile
        </Link>
        <Link
          to="/reports"
          className="bg-indigo-600 text-white p-4 rounded-lg shadow text-center hover:bg-indigo-700 transition"
        >
          Reports
        </Link>
      </div>

      {/* Map & Heatmap Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Map & Heatmap</h2>
        <div className="h-64 bg-gray-200 flex items-center justify-center rounded">
          <p className="text-gray-600">Map and Heatmap Placeholder</p>
        </div>
      </div>

      {/* Recent Activity / Notifications */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
        <ul className="space-y-2">
          <li className="border-b pb-2">
            <p className="text-gray-700">Collision prediction for Route A updated.</p>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </li>
          <li className="border-b pb-2">
            <p className="text-gray-700">New high risk alert on Route B.</p>
            <span className="text-sm text-gray-500">5 hours ago</span>
          </li>
          <li>
            <p className="text-gray-700">Your profile was updated successfully.</p>
            <span className="text-sm text-gray-500">1 day ago</span>
          </li>
        </ul>
      </div>

      {/* User Tips & Help */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Tips & Help</h2>
        <p className="text-gray-600">
          - Click on a card to view more details.<br />
          - Use the route planner to check collision predictions before traveling.<br />
          - Regularly update your profile for personalized recommendations.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
