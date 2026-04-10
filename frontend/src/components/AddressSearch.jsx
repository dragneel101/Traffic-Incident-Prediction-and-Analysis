import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import axios from "axios";
import { MapPin, Loader } from "lucide-react";

const AddressSearch = forwardRef(({ label, onSelect }, ref) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);

  useImperativeHandle(ref, () => ({
    clear() {
      setQuery("");
      setResults([]);
      setShowDropdown(false);
    },
    setAddress(address) {
      setQuery(address);
      setResults([]);
      setShowDropdown(false);
    },
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length < 3) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      axios
        .get("https://nominatim.openstreetmap.org/search", {
          params: {
            format: "json",
            q: `${query}, Ontario`,
            countrycodes: "ca",
            addressdetails: 1,
            limit: 5,
          },
          headers: { "Accept-Language": "en" },
        })
        .then((res) => {
          setResults(res.data);
          setShowDropdown(true);
        })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.display_name);
    setShowDropdown(false);
    onSelect({
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    });
  };

  return (
    <div className="relative w-full">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder="Search address in Ontario..."
          className="dark-input pl-10 pr-8"
        />
        {searching && (
          <Loader className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 animate-spin" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1.5 dark-card py-1 max-h-52 overflow-y-auto">
          {results.map((place, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-gray-800 cursor-pointer transition-colors duration-100 group"
              onClick={() => handleSelect(place)}
            >
              <MapPin className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors duration-100" />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-100 leading-snug">
                {place.display_name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default AddressSearch;
