// src/pages/ResetRequest.jsx
import React, { useState } from 'react';
import { apiClient } from '../utils/apiClient';

const API_URL = import.meta.env.VITE_API_URL;

function ResetRequest() {
  // State to manage form input, success message, and error message
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  /**
   * Handles the form submission for password reset request
   */
  const handleRequest = async (e) => {
    e.preventDefault(); // Prevent full page reload
    setMessage('');
    setError('');

    try {
      // Send POST request to backend with user's email
      const data = await apiClient(`${API_URL}/password-reset/request`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      // Display success message from backend
      setMessage(data.message || 'A password reset email has been sent.');
    } catch (err) {
      console.error('Reset request error:', err);
      // Display meaningful error or fallback message
      setError(err.message || 'An unexpected error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
          Reset Password
        </h2>

        {/* Success message */}
        {message && (
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4">
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Reset Request Form */}
        <form onSubmit={handleRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition"
          >
            Send Reset Email
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetRequest;
