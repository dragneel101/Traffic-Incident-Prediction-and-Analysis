import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";

const SignUp = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (val) => {
    setPasswordChecks({
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /\d/.test(val),
      special: /[@$!%*?&#^]/.test(val),
    });
  };

  const getPasswordStrength = () => {
    const score = Object.values(passwordChecks).filter(Boolean).length;
    const colors = ["bg-red-500", "bg-yellow-500", "bg-yellow-400", "bg-green-400", "bg-green-600"];
    return {
      width: `${(score / 5) * 100}%`,
      color: colors[score - 1] || "bg-gray-300",
      label: ["Weak", "Fair", "Okay", "Strong", "Excellent"][score - 1] || "Too Weak",
    };
  };

  const isFormValid =
    Object.values(passwordChecks).every(Boolean) &&
    !emailError &&
    !confirmPasswordError &&
    !phoneError &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    try {
      await api.post("/auth/signup", {
        email: email.toLowerCase(),
        password,
        name,
        phone_number: phoneNumber,
      });
      toast.success("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-indigo-700 mb-6">Sign Up</h2>

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => {
              const val = e.target.value;
              setEmail(val);
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              setEmailError(emailRegex.test(val) ? "" : "Invalid email format");
            }}
            required
          />
          {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                validatePassword(val);
                setConfirmPasswordError(
                  val === confirmPassword || confirmPassword === ""
                    ? ""
                    : "Passwords do not match"
                );
              }}
              required
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <AnimatePresence>
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm mt-2 space-y-2"
              >
                {[
                  { key: "length", label: "At least 8 characters" },
                  { key: "upper", label: "One uppercase letter" },
                  { key: "lower", label: "One lowercase letter" },
                  { key: "number", label: "One number" },
                  { key: "special", label: "One special character" },
                ].map(({ key, label }) => {
                  const passed = passwordChecks[key];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`flex items-center gap-2 ${passed ? "text-green-600" : "text-red-600"}`}
                      transition={{ duration: 0.25, delay: 0.05 }}
                    >
                      {passed ? <FaCheckCircle /> : <FaTimesCircle />}
                      <span>{label}</span>
                    </motion.div>
                  );
                })}

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className={`h-2 rounded transition-all ${getPasswordStrength().color}`}
                      style={{ width: getPasswordStrength().width }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{getPasswordStrength().label}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={confirmPassword}
              onChange={(e) => {
                const val = e.target.value;
                setConfirmPassword(val);
                setConfirmPasswordError(val === password ? "" : "Passwords do not match");
              }}
              required
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
            >
              {showConfirmPassword ? "🙈" : "👁️"}
            </span>
          </div>
          {confirmPasswordError && (
            <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            type="text"
            className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={phoneNumber}
            onChange={(e) => {
              const val = e.target.value;
              setPhoneNumber(val);
              const phoneRegex = /^\+?[0-9]{7,15}$/;
              setPhoneError(phoneRegex.test(val) ? "" : "Enter valid phone number (7–15 digits)");
            }}
          />
          {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full ${
            isFormValid && !loading ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-400 cursor-not-allowed"
          } text-white px-4 py-2 rounded shadow transition`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <div className="text-center mt-4">
        <p>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-500 hover:underline cursor-pointer"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
