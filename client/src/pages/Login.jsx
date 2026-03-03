import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const decodeJwtPayload = (token) => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join("")
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Erreur lors de la connexion");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        sessionStorage.setItem("token", data.token);
      }

      let userId = null;
      if (data.user && data.user.id) {
        userId = data.user.id;
      } else if (data.id) {
        userId = data.id;
      } else if (data.token) {
        const payload = decodeJwtPayload(data.token);
        userId = payload?.id || payload?.userId || null;
      }

      if (userId !== null && userId !== undefined) {
        localStorage.setItem("userId", String(userId));
        sessionStorage.setItem("userId", String(userId));
      } else {
        setErrorMsg("Aucun identifiant utilisateur retourne.");
        return;
      }

      navigate("/profile");
    } catch (error) {
      setErrorMsg("Impossible de se connecter au serveur");
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" className="auth-logo">CoWatch</Link>

      <form className="auth-box" onSubmit={handleLogin}>
        <h2>Login</h2>

        {errorMsg && <p className="auth-error">{errorMsg}</p>}

        <input
          type="email"
          placeholder="Email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="auth-btn">Se connecter</button>

        <p className="auth-link">
          Pas de compte ? <Link to="/signin">Creer un compte</Link>
        </p>
      </form>
    </div>
  );
}
