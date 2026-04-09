import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";

function ResetRequest() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password-reset/request", { email });
      setSent(true);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Reset Password</h2>

        {sent ? (
          <p className="text-green-700 text-center">
            If an account with that email exists, a reset link has been sent.
          </p>
        ) : (
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
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetRequest;
