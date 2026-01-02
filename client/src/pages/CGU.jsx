import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./CGU.css";

export default function CGU() {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cgu");
        if (!res.ok) throw new Error("Impossible de charger les CGU");
        const data = await res.json();
        setText(data.text || "");
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, []);

  return (
    <div className="cgu-page">
      <div className="cgu-top">
        <Link to="/" className="cgu-back">← Accueil</Link>
        <span className="cgu-title">CGU</span>
      </div>

      <div className="cgu-card">
        <h2>Conditions Generales d'Utilisation</h2>
        {error ? (
          <p className="cgu-error">{error}</p>
        ) : (
          <pre className="cgu-text">{text}</pre>
        )}
      </div>
    </div>
  );
}
