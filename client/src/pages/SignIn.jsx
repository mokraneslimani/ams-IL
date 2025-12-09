import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // même style partagé

export default function SignIn() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !email || !password || !confirm) {
      setErrorMsg("Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirm) {
      setErrorMsg("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Erreur lors de l'inscription");
        return;
      }

      // On force le passage par la page de login pour créer une session
      navigate("/login");

    } catch (error) {
      setErrorMsg("Impossible de contacter le serveur");
    }
  };

  return (
    <div className="auth-container">
      <Link to="/" className="auth-logo">CoWatch</Link>

      <form className="auth-box" onSubmit={handleSignIn}>
        <h2>Sign In</h2>

        {errorMsg && <p className="auth-error">{errorMsg}</p>}

        <input
          type="text"
          placeholder="Votre nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirmez le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button type="submit" className="auth-btn">Créer un compte</button>

        <p className="auth-link">
          Déjà un compte ? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
