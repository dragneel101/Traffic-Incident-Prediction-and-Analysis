import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify"; // ✅ This line is important

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      toast.info("Please log in to access this page.");
    }
  }, [token]);

  return token ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
