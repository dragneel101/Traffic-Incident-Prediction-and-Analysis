import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      toast.info("Please log in to access this page.");
    }
  }, [ready, isAuthenticated]);

  // Don't redirect until AuthContext has finished its restore attempt
  if (!ready) return null;

  return isAuthenticated
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
}
