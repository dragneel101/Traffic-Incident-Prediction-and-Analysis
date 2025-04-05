// src/components/ui/RecentActivity.jsx

import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Enable relative time plugin for "x minutes ago" formatting
dayjs.extend(relativeTime);

/**
 * Formats a given timestamp based on its age:
 * - If it's within the same year: shows "MMM D (relative time)"
 * - If it's older than a year: shows just the year.
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} - formatted display string
 */
const formatTimestamp = (timestamp) => {
  if (!timestamp || typeof timestamp !== 'string') return 'Unknown time';

  try {
    // Remove milliseconds if present (e.g., ".671435")
    const clean = timestamp.replace(/\.\d+/, '');

    const parsed = dayjs(clean);
    if (!parsed.isValid()) {
      console.warn("Invalid parsed date from:", clean);
      return "Unknown time";
    }

    const now = dayjs();
    const isSameYear = parsed.year() === now.year();

    if (isSameYear) {
      const monthDay = parsed.format('MMM D');       // e.g., "Apr 5"
      const relative = parsed.fromNow();             // e.g., "3 hours ago"
      return `${monthDay} (${relative})`;
    } else {
      return parsed.format('YYYY');                  // e.g., "2023"
    }

  } catch (error) {
    console.error("Error parsing timestamp:", timestamp, error);
    return "Unknown time";
  }
};

const RecentActivity = ({ recentActivity }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-2">Recent Activity</h2>

    <ul className="space-y-4">
      {/* Handle empty state */}
      {recentActivity.length === 0 ? (
        <p className="text-gray-500 italic">No recent predictions available.</p>
      ) : (
        recentActivity.map((item, idx) => {
          const displayTime = formatTimestamp(item.time);  // 🔥 use "time" key, not "timestamp"

          return (
            <li key={idx} className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
              {/* Start-End Message */}
              <div className="mb-2 flex items-start gap-2 text-gray-700 whitespace-pre-line">
                <MapPin className="w-5 h-5 mt-1 text-indigo-500" />
                <p className="font-medium">{item.message || 'No message provided'}</p>
              </div>

              {/* Timestamp Display */}
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{displayTime}</span>
              </div>
            </li>
          );
        })
      )}
    </ul>
  </div>
);

export default RecentActivity;
