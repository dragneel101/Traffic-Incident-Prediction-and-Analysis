import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import api from "../api/client";
import { getErrorMessage } from "../utils/errorMessages";

const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordChecks, setPasswordChecks] = useState({
    length: false, upper: false, lower: false, number: false, special: false,
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
    const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-400", "bg-emerald-500"];
    const labels = ["Weak", "Fair", "Okay", "Strong", "Excellent"];
    return {
      width: `${(score / 5) * 100}%`,
      color: colors[score - 1] || "bg-gray-700",
      label: labels[score - 1] || "Too Weak",
    };
  };

  const isFormValid =
    Object.values(passwordChecks).every(Boolean) &&
    !emailError && !confirmPasswordError && !phoneError &&
    email && password && confirmPassword && password === confirmPassword;

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

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create an account</h1>
          <p className="text-gray-500 text-sm mt-1.5">Start predicting safer routes today</p>
        </div>

        <div className="dark-card p-7">
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="name"
                  type="text"
                  className="dark-input pl-10"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  className={`dark-input pl-10 ${emailError ? "border-red-500/60" : ""}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    setEmailError(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? "" : "Invalid email format");
                  }}
                  required
                  autoComplete="email"
                />
              </div>
              {emailError && <p className="text-xs text-red-400 mt-1.5">{emailError}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Phone <span className="text-gray-600 normal-case font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="phone"
                  type="text"
                  className={`dark-input pl-10 ${phoneError ? "border-red-500/60" : ""}`}
                  placeholder="+1 416 555 0100"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhoneNumber(val);
                    if (val) {
                      setPhoneError(/^\+?[0-9]{7,15}$/.test(val) ? "" : "Enter valid phone (7–15 digits)");
                    } else {
                      setPhoneError("");
                    }
                  }}
                />
              </div>
              {phoneError && <p className="text-xs text-red-400 mt-1.5">{phoneError}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="dark-input pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassword(val);
                    validatePassword(val);
                    setConfirmPasswordError(
                      val === confirmPassword || confirmPassword === "" ? "" : "Passwords do not match"
                    );
                  }}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-150 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 overflow-hidden"
                  >
                    {/* Strength bar */}
                    <div className="mb-3">
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { key: "length", label: "At least 8 characters" },
                        { key: "upper", label: "One uppercase letter" },
                        { key: "lower", label: "One lowercase letter" },
                        { key: "number", label: "One number" },
                        { key: "special", label: "One special character" },
                      ].map(({ key, label }) => {
                        const passed = passwordChecks[key];
                        return (
                          <div
                            key={key}
                            className={`flex items-center gap-2 text-xs transition-colors duration-150 ${
                              passed ? "text-emerald-400" : "text-gray-600"
                            }`}
                          >
                            {passed
                              ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              : <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            }
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm" className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                <input
                  id="confirm"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`dark-input pl-10 pr-10 ${confirmPasswordError ? "border-red-500/60" : ""}`}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfirmPassword(val);
                    setConfirmPasswordError(val === password ? "" : "Passwords do not match");
                  }}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-150 cursor-pointer"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-xs text-red-400 mt-1.5">{confirmPasswordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <NavLink to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-150 cursor-pointer">
            Sign in
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
