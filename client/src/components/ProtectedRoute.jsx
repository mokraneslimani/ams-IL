import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setStatus("unauthorized");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("userId");
          setStatus("unauthorized");
          return;
        }

        const user = await res.json();
        if (user?.id) {
          localStorage.setItem("userId", String(user.id));
          sessionStorage.setItem("userId", String(user.id));
        }
        setStatus("authorized");
      } catch {
        setStatus("unauthorized");
      }
    };

    verify();
  }, []);

  if (status === "checking") {
    return null;
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
