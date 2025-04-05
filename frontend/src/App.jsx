import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoutePlanner from "./components/RoutePlanner";
import LandingPage from "./pages/LandingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./components/PrivateRoute";


// Pages
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Login from "./pages/Login";
// New Auth Pages
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import ResetRequest from "./pages/ResetRequest";
import ResetConfirm from "./pages/ResetConfirm";


function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-request" element={<ResetRequest />} />
        <Route path="/reset" element={<ResetConfirm />} />
        {/* Protected Routes */}
        <Route
          path="/route-planner"
          element={
            <PrivateRoute>
              <RoutePlanner />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
