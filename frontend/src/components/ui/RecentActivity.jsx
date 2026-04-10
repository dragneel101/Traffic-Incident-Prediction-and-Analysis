import React from "react";
import { Clock, MapPin, Activity } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const formatTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp !== "string") return "Unknown time";
  try {
    const clean = timestamp.replace(/\.\d+/, "");
    const parsed = dayjs(clean);
    if (!parsed.isValid()) return "Unknown time";
    const now = dayjs();
    if (parsed.year() === now.year()) {
      return `${parsed.format("MMM D")} · ${parsed.fromNow()}`;
    }
    return parsed.format("YYYY");
  } catch {
    return "Unknown time";
  }
};

const RecentActivity = ({ recentActivity }) => (
  <div className="dark-card p-5 mb-5">
    <div className="flex items-center gap-2 mb-5">
      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <Activity className="w-4 h-4 text-blue-400" />
      </div>
      <h2 className="text-base font-semibold text-white">Recent Activity</h2>
    </div>

    {recentActivity.length === 0 ? (
      <div className="py-8 text-center">
        <MapPin className="w-8 h-8 text-gray-700 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">No recent predictions yet.</p>
        <p className="text-gray-700 text-xs mt-1">Your route history will appear here.</p>
      </div>
    ) : (
      <ul className="space-y-2">
        {recentActivity.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors duration-150"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-200 leading-snug">
                {item.message || "No message provided"}
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <Clock className="w-3 h-3 text-gray-600" />
                <span className="text-xs text-gray-600">{formatTimestamp(item.time)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default RecentActivity;
