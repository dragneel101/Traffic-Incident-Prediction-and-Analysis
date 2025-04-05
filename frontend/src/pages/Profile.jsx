// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;
import { apiClient } from '../utils/apiClient';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    email: '',
    name: '',
    phone_number: '',
    profile_image: '', // <- New field
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      const data = await apiClient(`${API_URL}/user/profile`, {
        method: 'GET',
      });

      setProfile({
        email: data.email,
        name: data.name || '',
        phone_number: data.phone_number || '',
        profile_image: data.profile_image || '', // default/fallback image support
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'An error occurred while fetching profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const data = await apiClient(`${API_URL}/user/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          name: profile.name,
          phone_number: profile.phone_number,
        }),
      });

      setMessage(data.message || 'Profile updated successfully.');
      setEditMode(false);
      fetchProfile(); // Refresh after save too
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'An error occurred while updating the profile.');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setMessage('');
    setError('');
    fetchProfile(); // ← Live re-fetch on cancel
  };

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <div className="flex flex-col items-center">
          {/* 🖼 Profile Picture */}
          <img
            src={profile.profile_image || 'https://via.placeholder.com/100?text=User'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-4 border"
          />
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Your Profile</h2>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-800">{profile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            {editMode ? (
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800">{profile.name || '-'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            {editMode ? (
              <input
                type="text"
                name="phone_number"
                value={profile.phone_number}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <p className="text-gray-800">{profile.phone_number || '-'}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            {editMode ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                  Save
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
