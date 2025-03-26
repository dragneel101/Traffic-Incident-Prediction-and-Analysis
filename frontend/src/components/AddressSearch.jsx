import React, { useState, useEffect } from "react";
import axios from "axios";

const AddressSearch = ({ label, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length < 3) return;

      axios
        .get("https://nominatim.openstreetmap.org/search", {
          params: {
            format: "json",
            q: `${query}, Ontario`,
            countrycodes: "ca",
            addressdetails: 1,
            limit: 5,
          },
          headers: {
            "Accept-Language": "en",
          },
        })
        .then((res) => setResults(res.data))
        .catch(() => setResults([]));
    }, 400); // debounce

    return () => clearTimeout(delayDebounce);
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        placeholder="Enter address in Ontario..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
      />

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border mt-1 rounded shadow-md max-h-48 overflow-y-auto">
          {results.map((place, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
              onClick={() => handleSelect(place)}
            >
              {place.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressSearch;
