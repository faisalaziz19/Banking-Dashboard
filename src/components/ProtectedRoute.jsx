import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Redirect user to login if not authenticated
      navigate("/login");
    }
  }, [user, navigate]); // Only rerun when `user` changes

  if (!user) {
    return null; // You can return a loading spinner if needed while redirecting
  }

  return children;
};
