// src/components/ui/FrequentLocations.jsx

import React from 'react';

// This component shows the most frequent start and end locations for the predictions
const FrequentLocations = ({ frequent }) => (
  <>
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-700">Top Start Locations</h2>
      <ul className="text-gray-600 mt-2">
        {frequent.most_common_starts.map(([loc, count], idx) => (
          <li key={idx}>{loc} ({count})</li>
        ))}
      </ul>
    </div>

    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-700">Top End Locations</h2>
      <ul className="text-gray-600 mt-2">
        {frequent.most_common_ends.map(([loc, count], idx) => (
          <li key={idx}>{loc} ({count})</li>
        ))}
      </ul>
    </div>
  </>
);

export default FrequentLocations;
