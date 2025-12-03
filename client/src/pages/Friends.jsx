// src/pages/Friends.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Friends.css";

export default function Friends() {
  const friends = [
    { id: 1, name: "Alice", status: "En ligne", lastRoom: "Room - Netflix & Chill" },
    { id: 2, name: "Samir", status: "Hors ligne", lastRoom: "Room - One Piece" },
    { id: 3, name: "Lina", status: "En ligne", lastRoom: "Room - BTS Live" },
  ];

  const pending = [
    { id: 4, name: "Marc", since: "Il y a 2 jours" },
    { id: 5, name: "Emma", since: "Il y a 5 heures" },
  ];

  const suggestions = [
    { id: 6, name: "Yassine", common: 3 },
    { id: 7, name: "Chloe", common: 1 },
  ];

  return (
    <div className="friends-page">
      {/* Top bar */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
        <span className="logo-title">CoWatch</span>
      </div>

      {/* Onglets profil */}
      <div className="tabs-row">
        <Link to="/profile" className="tab-link">Profil</Link>
        <Link to="/start-room" className="tab-link">Start Room</Link>
        <button className="tab-link active">Amis</button>
        <Link to="/notifications" className="tab-link">Notif</Link>
      </div>

      {/* Contenu principal */}
      <div className="friends-layout">
        {/* Colonne gauche : amis */}
        <section className="card friends-list">
          <h2>Mes amis</h2>
          <ul>
            {friends.map((f) => (
              <li key={f.id} className="friend-item">
                <div>
                  <p className="friend-name">{f.name}</p>
                  <p className="friend-last-room">{f.lastRoom}</p>
                </div>
                <span
                  className={
                    f.status === "En ligne" ? "friend-status online" : "friend-status offline"
                  }
                >
                  {f.status}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Colonne droite : demandes + suggestions */}
        <section className="side-column">
          <div className="card pending-requests">
            <h3>Demandes en attente</h3>
            {pending.length === 0 ? (
              <p>Aucune demande en attente.</p>
            ) : (
              <ul>
                {pending.map((p) => (
                  <li key={p.id} className="pending-item">
                    <span>{p.name}</span>
                    <span className="pending-since">{p.since}</span>
                    <div className="pending-actions">
                      <button>Accepter</button>
                      <button>Refuser</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card suggestions">
            <h3>Suggestions d'amis</h3>
            <ul>
              {suggestions.map((s) => (
                <li key={s.id} className="suggest-item">
                  <span>{s.name}</span>
                  <span className="suggest-common">
                    {s.common} ami(s) en commun
                  </span>
                  <button>Ajouter</button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
