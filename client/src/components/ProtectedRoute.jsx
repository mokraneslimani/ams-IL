import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Route protégée : vérifie la présence d'un token et d'un userId
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

  if (!token || !userId) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
