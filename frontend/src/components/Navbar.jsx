import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Check for token in localStorage whenever the route changes.
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  // Close dropdown if clicked outside.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  // Public links for non-authenticated users.
  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Route Planner", path: "/route-planner" },
    { name: "Login", path: "/login" },
    { name: "Sign Up", path: "/signup" },
  ];

  // Private links for authenticated users.
  const privateLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Route Planner", path: "/route-planner" },
  ];

  return (
    <nav className="bg-indigo-600 shadow-md text-white">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-full" />
          <NavLink to="/" className="text-xl font-bold">
            Collision Predictor
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          {!isLoggedIn &&
            publicLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `hover:text-indigo-200 transition ${
                    isActive ? "underline underline-offset-4" : ""
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          {isLoggedIn && (
            <>
              {privateLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `hover:text-indigo-200 transition ${
                      isActive ? "underline underline-offset-4" : ""
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              {/* Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-300 text-gray-700 focus:outline-none"
                >
                  {/* Placeholder Avatar (could be initials or an image) */}
                  <span className="font-bold">U</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-20">
                    <NavLink
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-indigo-600 hover:text-white"
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-indigo-600 hover:text-white"
                    >
                      Profile
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 hover:bg-indigo-600 hover:text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {!isLoggedIn &&
            publicLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block hover:text-indigo-200 transition ${
                    isActive ? "underline underline-offset-4" : ""
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          {isLoggedIn && (
            <>
              {privateLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block hover:text-indigo-200 transition ${
                      isActive ? "underline underline-offset-4" : ""
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <NavLink
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block hover:text-indigo-200 transition"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block hover:text-indigo-200 transition"
              >
                Profile
              </NavLink>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="block hover:text-indigo-200 transition"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
