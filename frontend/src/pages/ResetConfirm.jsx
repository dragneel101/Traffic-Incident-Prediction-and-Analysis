// src/pages/ResetConfirm.jsx
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../utils/apiClient';

const API_URL = import.meta.env.VITE_API_URL;

function ResetConfirm() {
  // Local state to manage form input, feedback messages, and errors
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Retrieve the `token` from the URL query string (?token=...)
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  /**
   * Handle password reset confirmation form submission
   */
  const handleConfirm = async (e) => {
    e.preventDefault(); // prevent page reload
    setMessage('');
    setError('');

    try {
      // Call the API to confirm password reset
      const data = await apiClient(`${API_URL}/password-reset/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      // If response contains a success message
      setMessage(data.message || 'Password reset successful.');
    } catch (err) {
      console.error('Reset confirm error:', err);
      // Show error from server if available, otherwise fallback
      setError(err.message || 'An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          Set New Password
        </h2>

        {/* Success message */}
        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Password Reset Form */}
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Enter your new password"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetConfirm;
