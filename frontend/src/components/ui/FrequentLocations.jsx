import React from "react";
import { MapPin, Navigation } from "lucide-react";

const LocationList = ({ icon: Icon, title, locations, iconColor }) => (
  <div className="dark-card p-5">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
    </div>
    {locations.length === 0 ? (
      <p className="text-xs text-gray-600 italic">No data yet</p>
    ) : (
      <ul className="space-y-2">
        {locations.map(([loc, count], idx) => (
          <li key={idx} className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-300 truncate" title={loc}>{loc}</span>
            <span className="text-xs font-bold text-blue-400 font-mono flex-shrink-0">{count}x</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const FrequentLocations = ({ frequent }) => (
  <>
    <LocationList
      icon={Navigation}
      title="Top Start Locations"
      locations={frequent.most_common_starts}
      iconColor="text-emerald-400"
    />
    <LocationList
      icon={MapPin}
      title="Top End Locations"
      locations={frequent.most_common_ends}
      iconColor="text-red-400"
    />
  </>
);

export default FrequentLocations;
