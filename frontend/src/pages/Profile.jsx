import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Profile() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone_number: phoneNumber })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Profile updated!');
      } else {
        alert(data.detail || 'Update failed');
      }
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">Update Profile</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input 
            type="text"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input 
            type="text"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition"
        >
          Save Changes
        </button>
      </form>
      <div className="text-center mt-4">
        <NavLink to="/reset-request" className="text-indigo-500 hover:underline">
          Reset Password
        </NavLink>
      </div>
    </div>
  );
}

export default Profile;
