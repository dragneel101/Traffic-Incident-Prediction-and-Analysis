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
  getModelPerformance,
} from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";
import { Map, User, Activity, Cpu } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [timeseries, setTimeseries] = useState({});
  const [frequent, setFrequent] = useState({ most_common_starts: [], most_common_ends: [] });
  const [recentActivity, setRecentActivity] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [total, ts, freq, recent, metrics] = await Promise.all([
          getTotalPredictions(),
          getTimeseries(),
          getFrequentLocations(),
          getRecentActivity(),
          getModelPerformance().catch(() => null),
        ]);
        setTotalPredictions(total.count);
        setTimeseries(ts);
        setFrequent(freq);
        setRecentActivity(recent);
        setModelMetrics(metrics);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const userName = user?.name || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Welcome banner */}
        <div className="mb-8 animate-slide-up">
          {loading ? (
            <Skeleton className="h-10 w-64 bg-gray-800" />
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {greeting}, {userName}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Here&apos;s an overview of your prediction activity.
              </p>
            </>
          )}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {loading ? (
            <>
              <Skeleton className="h-28 rounded-2xl bg-gray-800" />
              <Skeleton className="h-28 rounded-2xl bg-gray-800 md:col-span-2" />
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
          <Skeleton className="h-56 rounded-2xl bg-gray-800 mb-6" />
        ) : (
          <PredictionChart timeseries={timeseries} />
        )}

        {/* Recent activity */}
        {loading ? (
          <Skeleton className="h-40 rounded-2xl bg-gray-800 mb-6" />
        ) : (
          <RecentActivity recentActivity={recentActivity} />
        )}

        {/* Model performance */}
        {modelMetrics && (
          <div className="dark-card p-6 mb-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-base font-semibold text-white">ML Model Performance</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Accuracy", value: `${(modelMetrics.test_accuracy * 100).toFixed(1)}%` },
                { label: "AUC", value: modelMetrics.test_auc.toFixed(3) },
                { label: "F1 Score", value: modelMetrics.test_f1.toFixed(3) },
                {
                  label: "CV AUC",
                  value: modelMetrics.cv_auc.toFixed(3),
                  sub: `±${modelMetrics.cv_auc_std.toFixed(3)} (${modelMetrics.cv_folds}-fold)`,
                },
              ].map((m) => (
                <div key={m.label} className="bg-gray-800/60 rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-blue-400 font-mono">{m.value}</p>
                  <p className="text-xs text-gray-500 mt-1 font-medium">{m.label}</p>
                  {m.sub && <p className="text-xs text-gray-600 mt-0.5">{m.sub}</p>}
                </div>
              ))}
            </div>
            {modelMetrics.version && (
              <p className="text-xs text-gray-600 mt-4 font-mono">
                Model v{modelMetrics.version} · {modelMetrics.train_samples?.toLocaleString()} training samples
              </p>
            )}
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/route-planner"
            className="dark-card p-5 flex items-center gap-4 hover:border-blue-500/40 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-200">
              <Map className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Route Planner</p>
              <p className="text-gray-500 text-xs mt-0.5">Predict risk for a new route</p>
            </div>
          </Link>
          <Link
            to="/profile"
            className="dark-card p-5 flex items-center gap-4 hover:border-blue-500/40 transition-all duration-200 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-200">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Profile</p>
              <p className="text-gray-500 text-xs mt-0.5">Update your account details</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
