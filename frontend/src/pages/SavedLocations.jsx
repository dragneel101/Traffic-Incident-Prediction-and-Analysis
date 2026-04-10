import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Bookmark, Trash2, MapPin, Plus, X } from "lucide-react";
import { getSavedLocations, createSavedLocation, deleteSavedLocation } from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";
import Skeleton from "../components/ui/Skeleton";

const SavedLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", address: "", lat: "", lon: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const data = await getSavedLocations();
      setLocations(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await deleteSavedLocation(id);
      setLocations((prev) => prev.filter((l) => l.id !== id));
      toast.success("Location removed");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const lat = parseFloat(form.lat);
    const lon = parseFloat(form.lon);
    if (!form.label.trim() || !form.address.trim() || isNaN(lat) || isNaN(lon)) {
      toast.error("Please fill in all fields with valid coordinates");
      return;
    }
    setSaving(true);
    try {
      const created = await createSavedLocation({
        label: form.label.trim(),
        address: form.address.trim(),
        lat,
        lon,
      });
      setLocations((prev) => [created, ...prev]);
      setForm({ label: "", address: "", lat: "", lon: "" });
      setShowForm(false);
      toast.success("Location saved");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-400" />
              Saved Locations
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Bookmark frequent addresses for quick route planning.
            </p>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Location"}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <form
            onSubmit={handleSave}
            className="dark-card p-5 mb-5 space-y-3 animate-slide-up"
          >
            <p className="text-sm font-semibold text-white mb-1">New Saved Location</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Label (e.g. Home, Work)</label>
                <input
                  className="input-field w-full"
                  placeholder="Home"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  maxLength={60}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Address</label>
                <input
                  className="input-field w-full"
                  placeholder="123 Main St, Toronto"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  maxLength={300}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Latitude</label>
                <input
                  className="input-field w-full"
                  placeholder="43.6532"
                  type="number"
                  step="any"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Longitude</label>
                <input
                  className="input-field w-full"
                  placeholder="-79.3832"
                  type="number"
                  step="any"
                  value={form.lon}
                  onChange={(e) => setForm((f) => ({ ...f, lon: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Tip: use the Route Planner map to find coordinates by clicking a location.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-sm px-5 py-2"
            >
              {saving ? "Saving..." : "Save Location"}
            </button>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-gray-800" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="dark-card p-10 text-center">
            <MapPin className="w-8 h-8 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No saved locations yet.</p>
            <p className="text-gray-600 text-xs mt-1">
              Add frequent destinations to speed up route planning.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="dark-card px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{loc.label}</p>
                    <p className="text-gray-500 text-xs truncate">{loc.address}</p>
                    <p className="text-gray-700 text-xs font-mono">
                      {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="flex-shrink-0 p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 cursor-pointer"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedLocations;
