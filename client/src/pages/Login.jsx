import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Erreur lors de la connexion");
        return;
      }

      // Stocker le token (session + localStorage)
      if (data.token) {
        localStorage.setItem("token", data.token);
        sessionStorage.setItem("token", data.token);
      }

      // Récupérer l'id utilisateur
      let userId = null;
      if (data.user && data.user.id) {
        userId = data.user.id;
      } else if (data.id) {
        userId = data.id;
      }

      if (userId !== null) {
        localStorage.setItem("userId", String(userId));
        sessionStorage.setItem("userId", String(userId));
      } else {
        setErrorMsg("Aucun identifiant utilisateur retourné.");
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
          Pas de compte ? <Link to="/signin">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
