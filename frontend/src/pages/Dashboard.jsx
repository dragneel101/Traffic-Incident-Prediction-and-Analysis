import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TotalCountCard from '../components/ui/TotalCountCard';
import FrequentLocations from '../components/ui/FrequentLocations';
import PredictionChart from '../components/ui/PredictionChart';
import RecentActivity from '../components/ui/RecentActivity';
import { apiClient } from '../utils/apiClient';

import {
  getTotalPredictions,
  getTimeseries,
  getFrequentLocations,
  getRecentActivity
} from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'; // Adjust to your setup

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [timeseries, setTimeseries] = useState({});
  const [frequent, setFrequent] = useState({ most_common_starts: [], most_common_ends: [] });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch analytics data
  useEffect(() => {
    getTotalPredictions().then(data => setTotalPredictions(data.count));
    getFrequentLocations().then(setFrequent);
    getTimeseries().then(setTimeseries);
    getRecentActivity().then(setRecentActivity);
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiClient(`${API_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUserName(data.name);
        } else {
          setError(data.detail || 'Failed to fetch profile.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An error occurred while fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          {loading ? 'Loading...' : `Hello, ${userName || 'User'}!`}
        </h1>
        {error && <p className="text-red-500 mt-1">{error}</p>}
        <p className="text-gray-600 mt-2">
          Welcome to your dashboard. Here's a quick overview of your prediction activity.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <TotalCountCard total={totalPredictions} />
        <FrequentLocations frequent={frequent} />
      </div>

      {/* Time Series Chart */}
      <PredictionChart timeseries={timeseries} />

      {/* Recent Activity */}
      <RecentActivity recentActivity={recentActivity} />

      {/* Quick Access Links */}
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
