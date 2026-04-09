import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import TotalCountCard from "../components/ui/TotalCountCard";
import FrequentLocations from "../components/ui/FrequentLocations";
import PredictionChart from "../components/ui/PredictionChart";
import RecentActivity from "../components/ui/RecentActivity";
import Skeleton from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import {
  getTotalPredictions,
  getTimeseries,
  getFrequentLocations,
  getRecentActivity,
} from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";

const Dashboard = () => {
  const { user } = useAuth();
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [timeseries, setTimeseries] = useState({});
  const [frequent, setFrequent] = useState({ most_common_starts: [], most_common_ends: [] });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [total, ts, freq, recent] = await Promise.all([
          getTotalPredictions(),
          getTimeseries(),
          getFrequentLocations(),
          getRecentActivity(),
        ]);
        setTotalPredictions(total.count);
        setTimeseries(ts);
        setFrequent(freq);
        setRecentActivity(recent);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const userName = user?.name || "User";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Welcome banner */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        {loading ? (
          <Skeleton className="h-8 w-48 mb-2" />
        ) : (
          <h1 className="text-3xl font-bold text-indigo-700">Hello, {userName}!</h1>
        )}
        <p className="text-gray-600 mt-2">
          Welcome to your dashboard. Here's a quick overview of your prediction activity.
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <>
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg md:col-span-2" />
          </>
        ) : (
          <>
            <TotalCountCard total={totalPredictions} />
            <FrequentLocations frequent={frequent} />
          </>
        )}
      </div>

      {/* Time series chart */}
      {loading ? (
        <Skeleton className="h-48 rounded-lg mb-6" />
      ) : (
        <PredictionChart timeseries={timeseries} />
      )}

      {/* Recent activity */}
      {loading ? (
        <Skeleton className="h-32 rounded-lg mb-6" />
      ) : (
        <RecentActivity recentActivity={recentActivity} />
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
      </div>
    </div>
  );
};

export default Dashboard;
