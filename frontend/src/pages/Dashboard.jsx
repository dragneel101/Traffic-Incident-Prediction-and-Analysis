import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// UI components
import TotalCountCard from '../components/ui/TotalCountCard';
import FrequentLocations from '../components/ui/FrequentLocations';
import PredictionChart from '../components/ui/PredictionChart';
import RecentActivity from '../components/ui/RecentActivity';

// Utilities and API
import { apiClient } from '../utils/apiClient';
import {
  getTotalPredictions,
  getTimeseries,
  getFrequentLocations,
  getRecentActivity
} from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // fallback if env var is not set

const Dashboard = () => {
  // User info
  const [userName, setUserName] = useState('');

  // Dashboard metrics
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [timeseries, setTimeseries] = useState({});
  const [frequent, setFrequent] = useState({ most_common_starts: [], most_common_ends: [] });
  const [recentActivity, setRecentActivity] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetches analytics data on initial mount
   */
  useEffect(() => {
    getTotalPredictions().then(data => setTotalPredictions(data.count));
    getFrequentLocations().then(setFrequent);
    getTimeseries().then(setTimeseries);
    getRecentActivity().then(setRecentActivity);
  }, []);

  /**
   * Fetches user profile information to personalize the dashboard
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient(`${API_URL}/user/profile`, {
          method: 'GET',
        });

        // Set user name from profile response
        setUserName(data.name || 'User');
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* 🧑 Welcome Banner */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          {loading ? 'Loading...' : `Hello, ${userName}!`}
        </h1>
        {error && <p className="text-red-500 mt-1">{error}</p>}
        <p className="text-gray-600 mt-2">
          Welcome to your dashboard. Here's a quick overview of your prediction activity.
        </p>
      </div>

      {/* 📊 Key Metrics: Total Predictions + Frequent Locations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <TotalCountCard total={totalPredictions} />
        <FrequentLocations frequent={frequent} />
      </div>

      {/* 📈 Time Series of Predictions */}
      <PredictionChart timeseries={timeseries} />

      {/* 🕒 Recent Prediction Activity */}
      <RecentActivity recentActivity={recentActivity} />

      {/* 🔗 Quick Navigation Links */}
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
    </div>
  );
};

export default Dashboard;
