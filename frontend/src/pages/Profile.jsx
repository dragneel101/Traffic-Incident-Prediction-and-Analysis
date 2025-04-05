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
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch the current user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await apiClient(`${API_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setProfile({
            email: data.email,
            name: data.name || '',
            phone_number: data.phone_number || '',
          });
        } else {
          setError(data.detail || 'Failed to fetch profile.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An error occurred while fetching profile.');
      }
      setLoading(false);
    };

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
      const token = localStorage.getItem('token');
      const response = await apiClient(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone_number: profile.phone_number,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Profile updated successfully.');
        setEditMode(false);
      } else {
        setError(data.detail || 'Update failed.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('An error occurred while updating the profile.');
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setMessage('');
    setError('');
    // Optionally, re-fetch the profile to reset unsaved changes.
  };

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          Your Profile
        </h2>
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
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <p className="text-gray-800">{profile.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
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
