import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLabel, setUserLabel] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;

    const loadUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("userId");
          setIsLoggedIn(false);
          return;
        }

        const data = await res.json();
        if (data?.id) {
          localStorage.setItem("userId", String(data.id));
          sessionStorage.setItem("userId", String(data.id));
        }
        const name = data.username || data.email || "";
        if (name) setUserLabel(`@${name}`);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };

    loadUser();
  }, []);

  return (
    <div className="home-wrapper">
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

      <main className="home-main">
        <div className="home-card left-card">
          <div className="eyebrow">Experience synchronisee</div>
          <h2>Watch Videos Together</h2>

          <p>
            Creez vos rooms, invitez vos amis et regardez vos videos preferees
            ensemble en temps reel.
          </p>

          <div className="cta-row">
            <a href="/start-room" className="btn-start">Start Room</a>
          </div>

          <div className="stat-row">
            <div>
              <span className="stat-value">Ultra-rapide</span>
              <span className="stat-label">Creation en 10s</span>
            </div>
            <div>
              <span className="stat-value">Temps reel</span>
              <span className="stat-label">Sync + Chat</span>
            </div>
            <div>
              <span className="stat-value">Collab</span>
              <span className="stat-label">Playlist partagee</span>
            </div>
          </div>
        </div>

        <div className="home-card right-card">
          <h3>A propos de CoWatch</h3>

          <p>
            CoWatch est une plateforme moderne qui permet de regarder des videos
            YouTube ensemble en temps reel. Invitez vos amis et profitez d'une
            experience interactive.
          </p>

          <p>
            Notre objectif est d'offrir une solution simple et performante pour
            regarder du contenu avec vos proches, ou que vous soyez.
          </p>

          <p>
            Fonctionnalites : Rooms instantanees, chat en direct, synchronisation
            video, playlist collaborative, gestion de profil et plus encore !
          </p>

          <div className="feature-grid">
            <div className="feature-item">
              <span>⚡</span>
              <div>
                <strong>Rooms instantanees</strong>
                <p>Partage de lien en 1 clic</p>
              </div>
            </div>
            <div className="feature-item">
              <span>💬</span>
              <div>
                <strong>Chat live</strong>
                <p>Conversations synchronisees</p>
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
                <strong>Prive / Public</strong>
                <p>Controle d'acces clair</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="home-trust">
        <div className="trust-card">
          <h4>Un espace propre et pro</h4>
          <p>Interface claire, performance stable, et experience fluide sur desktop & mobile.</p>
        </div>
        <div className="trust-card">
          <h4>Concu pour les equipes</h4>
          <p>Invite, modere et collabore facilement dans une seule room.</p>
        </div>
        <div className="trust-card">
          <h4>Pret pour vos cours</h4>
          <p>Partage de videos, echanges et coordination en temps reel.</p>
        </div>
      </section>

      <footer className="home-footer">
        <Link to="/conditions">Conditions generales</Link> |
        <Link to="/about">A propos</Link> |
        <Link to="/contact">Contact</Link>
      </footer>
    </div>
  );
}
