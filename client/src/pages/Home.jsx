import React, { useEffect, useState } from "react";
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
  <h2>Watch Videos Together</h2>

  <p>
    Créez vos rooms, invitez vos amis et regardez vos vidéos
    préférées ensemble en temps réel.
  </p>

  <a href="/start-room" className="btn-start">Start Room</a>

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
        </div>

      </main>

      {/* Footer */}
      <footer className="home-footer">
        <a href="#">Conditions générales</a> |
        <a href="#">À propos</a> |
        <a href="#">Contact</a>
      </footer>

    </div>
  );
}
