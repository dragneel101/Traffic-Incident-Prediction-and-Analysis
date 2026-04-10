import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";
import Skeleton from "../components/ui/Skeleton";
import { User, Mail, Phone, Edit3, X, Check } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState({ email: "", name: "", phone_number: "", profile_image: "" });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/user/profile");
      setProfile({
        email: data.email,
        name: data.name || "",
        phone_number: data.phone_number || "",
        profile_image: data.profile_image || "",
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/user/profile", { name: profile.name, phone_number: profile.phone_number });
      toast.success("Profile updated successfully.");
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-md dark-card p-8 space-y-5">
          <Skeleton className="h-20 w-20 rounded-full mx-auto bg-gray-800" />
          <Skeleton className="h-5 w-36 mx-auto bg-gray-800" />
          <Skeleton className="h-12 rounded-lg bg-gray-800" />
          <Skeleton className="h-12 rounded-lg bg-gray-800" />
          <Skeleton className="h-12 rounded-lg bg-gray-800" />
        </div>
      </div>
    );
  }

  const userInitial = profile.name ? profile.name.charAt(0).toUpperCase() : "U";

  const Field = ({ icon: Icon, label, name, value, type = "text", editable = true }) => (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {editMode && editable ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleInputChange}
          className="dark-input"
        />
      ) : (
        <p className={`text-sm px-1 ${value ? "text-gray-200" : "text-gray-600 italic"}`}>
          {value || "Not provided"}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-slide-up">
        <div className="dark-card p-8">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            {profile.profile_image ? (
              <img
                src={profile.profile_image}
                alt="Profile avatar"
                className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500/30 mb-4"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold ring-2 ring-blue-500/20 mb-4">
                {userInitial}
              </div>
            )}
            <h2 className="text-xl font-bold text-white">{profile.name || "Your Profile"}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{profile.email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-5">
            <Field icon={Mail} label="Email" name="email" value={profile.email} editable={false} />
            <Field icon={User} label="Full Name" name="name" value={profile.name} />
            <Field icon={Phone} label="Phone Number" name="phone_number" value={profile.phone_number} />

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
              {editMode ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    {saving ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
