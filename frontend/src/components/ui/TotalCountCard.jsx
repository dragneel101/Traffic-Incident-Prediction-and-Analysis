// src/components/ui/TotalCountCard.jsx

import React from 'react';

// This component displays the total number of predictions
const TotalCountCard = ({ total }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h2 className="text-xl font-semibold text-gray-700">Total Predictions</h2>
    <p className="text-3xl font-bold text-indigo-600 mt-2">{total}</p>
  </div>
);

export default TotalCountCard;
