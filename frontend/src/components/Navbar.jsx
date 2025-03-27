import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-indigo-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-white text-xl font-bold">
            🚗 Collision Predictor
          </span>
        </div>
        <div className="space-x-4">
          <a href="#" className="text-white hover:text-indigo-200">
            Home
          </a>

          <a href="#" className="text-white hover:text-indigo-200">
            About
          </a>
          <a href="#" className="text-white hover:text-indigo-200">
            Login
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
