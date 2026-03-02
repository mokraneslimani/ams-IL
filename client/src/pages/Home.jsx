import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLabel, setUserLabel] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (!token || !userId) return;
    setIsLoggedIn(true);

    const loadUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const name = data.username || data.email || "";
        if (name) setUserLabel(`@${name}`);
      } catch {
        // ignore and keep fallback label
      }
    };

    loadUser();
  }, []);

  return (
    <div className="home-wrapper">

      {/* Header */}
      <header className="home-header">
        <a href="/" className="logo">CoWatch</a>

        <div className="nav-buttons">
          {isLoggedIn ? (
            <a href="/profile" className="btn-nav">{userLabel || "Profil"}</a>
          ) : (
            <>
              <a href="/login" className="btn-nav">Login</a>
              <a href="/signin" className="btn-nav btn-yellow">Sign In</a>
            </>
          )}
        </div>
      </header>

      {/* Main Section */}
      <main className="home-main">

        {/* CARD LEFT */}
       <div className="home-card left-card">
  <div className="eyebrow">Expérience synchronisée</div>
  <h2>Watch Videos Together</h2>

  <p>
    Créez vos rooms, invitez vos amis et regardez vos vidéos
    préférées ensemble en temps réel.
  </p>

  <div className="cta-row">
    <a href="/start-room" className="btn-start">Start Room</a>
  </div>

  <div className="stat-row">
    <div>
      <span className="stat-value">Ultra‑rapide</span>
      <span className="stat-label">Création en 10s</span>
    </div>
    <div>
      <span className="stat-value">Temps réel</span>
      <span className="stat-label">Sync + Chat</span>
    </div>
    <div>
      <span className="stat-value">Collab</span>
      <span className="stat-label">Playlist partagée</span>
    </div>
  </div>

</div>

        {/* CARD RIGHT */}
        <div className="home-card right-card">
          <h3>À propos de CoWatch</h3>

          <p>
            CoWatch est une plateforme moderne qui permet de regarder des vidéos
            YouTube ensemble en temps réel. Invitez vos amis et profitez d'une
            expérience interactive.
          </p>

          <p>
            Notre objectif est d'offrir une solution simple et performante pour
            regarder du contenu avec vos proches, où que vous soyez.
          </p>

          <p>
            Fonctionnalités : Rooms instantanées, chat en direct, synchronisation
            vidéo, playlist collaborative, gestion de profil et plus encore !
          </p>

          <div className="feature-grid">
            <div className="feature-item">
              <span>⚡</span>
              <div>
                <strong>Rooms instantanées</strong>
                <p>Partage de lien en 1 clic</p>
              </div>
            </div>
            <div className="feature-item">
              <span>💬</span>
              <div>
                <strong>Chat live</strong>
                <p>Conversations synchronisées</p>
              </div>
            </div>
            <div className="feature-item">
              <span>🎬</span>
              <div>
                <strong>Playlist</strong>
                <p>Gestion collaborative</p>
              </div>
            </div>
            <div className="feature-item">
              <span>🛡️</span>
              <div>
                <strong>Privé / Public</strong>
                <p>Contrôle d’accès clair</p>
              </div>
            </div>
          </div>
        </div>

      </main>

      <section className="home-trust">
        <div className="trust-card">
          <h4>Un espace propre et pro</h4>
          <p>Interface claire, performance stable, et expérience fluide sur desktop & mobile.</p>
        </div>
        <div className="trust-card">
          <h4>Conçu pour les équipes</h4>
          <p>Invite, modère et collabore facilement dans une seule room.</p>
        </div>
        <div className="trust-card">
          <h4>Prêt pour vos cours</h4>
          <p>Partage de vidéos, échanges et coordination en temps réel.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <Link to="/conditions">Conditions générales</Link> |
        <Link to="/about">À propos</Link> |
        <Link to="/contact">Contact</Link>
      </footer>

    </div>
  );
}
