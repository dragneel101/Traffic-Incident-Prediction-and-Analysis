import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import { Menu, X, LayoutDashboard, User, LogOut, Map, ChevronDown, History, Bookmark } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const userName = user?.name || "Account";

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  const privateLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Route Planner", path: "/route-planner" },
  ];

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 cursor-pointer ${
      isActive
        ? "text-blue-400"
        : "text-gray-400 hover:text-gray-100"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-md border-b border-gray-800 shadow-lg"
          : "bg-gray-900/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all duration-200">
            <img src={logo} alt="TIPA Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            Collision<span className="text-blue-400">Predictor</span>
          </span>
        </NavLink>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {(!isAuthenticated ? publicLinks : privateLinks).map((link) => (
            <NavLink key={link.name} to={link.path} className={linkClass}>
              {link.name}
            </NavLink>
          ))}

          {!isAuthenticated && (
            <div className="flex items-center gap-3 ml-2">
              <NavLink
                to="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                className="btn-primary text-sm px-4 py-2"
              >
                Sign up
              </NavLink>
            </div>
          )}

          {isAuthenticated && (
            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 cursor-pointer group"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold ring-2 ring-blue-500/30 group-hover:ring-blue-500/60 transition-all duration-200">
                  {userInitial}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 dark-card py-1 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-gray-800">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Signed in as</p>
                    <p className="text-sm text-white font-semibold truncate mt-0.5">{userName}</p>
                  </div>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-400" />
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/history"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
                  >
                    <History className="w-4 h-4 text-blue-400" />
                    Route History
                  </NavLink>
                  <NavLink
                    to="/saved-locations"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4 text-blue-400" />
                    Saved Locations
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    Profile
                  </NavLink>
                  <div className="border-t border-gray-800 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-red-400 hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer p-1"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-3 space-y-1 animate-slide-up">
          {(!isAuthenticated ? publicLinks : privateLinks).map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? "bg-blue-500/10 text-blue-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {!isAuthenticated && (
            <>
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
              >
                Log in
              </NavLink>
              <NavLink
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-bold text-center btn-primary mt-2"
              >
                Sign up
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <>
              <NavLink
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                Dashboard
              </NavLink>
              <NavLink
                to="/history"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
              >
                <History className="w-4 h-4 text-blue-400" />
                Route History
              </NavLink>
              <NavLink
                to="/saved-locations"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-blue-400" />
                Saved Locations
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
              >
                <User className="w-4 h-4 text-blue-400" />
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
