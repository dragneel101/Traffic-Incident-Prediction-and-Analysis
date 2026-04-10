import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RoutePlanner from "./components/RoutePlanner";
import LandingPage from "./pages/LandingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

// Pages
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Profile from "./pages/Profile";
import ResetRequest from "./pages/ResetRequest";
import ResetConfirm from "./pages/ResetConfirm";
import SavedLocations from "./pages/SavedLocations";
import RouteHistory from "./pages/RouteHistory";
import SharedRoute from "./pages/SharedRoute";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Navbar />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            toastClassName="!font-sans"
          />
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
            <Route
              path="/saved-locations"
              element={
                <PrivateRoute>
                  <SavedLocations />
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <RouteHistory />
                </PrivateRoute>
              }
            />
            {/* Public shared route viewer */}
            <Route path="/shared/:token" element={<SharedRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
