// src/components/ui/RecentActivity.jsx

import React from 'react';
import { Clock, MapPin } from 'lucide-react';

const RecentActivity = ({ recentActivity }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-2">Recent Activity</h2>
    <ul className="space-y-4">
      {recentActivity.length === 0 ? (
        <p className="text-gray-500 italic">No recent predictions available.</p>
      ) : (
        recentActivity.map((item, idx) => (
          <li key={idx} className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition">
            <div className="mb-2 flex items-start gap-2 text-gray-700 whitespace-pre-line">
              <MapPin className="w-5 h-5 mt-1 text-indigo-500" />
              <p className="font-medium">{item.message}</p>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </li>
        ))
      )}
    </ul>
  </div>
);

export default RecentActivity;
