// src/pages/Notifications.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Notifications.css";

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      type: "room",
      title: "Invitation à rejoindre une room",
      message: "Samir t’a invité à rejoindre « Room - One Piece »",
      time: "Il y a 10 min",
      read: false,
    },
    {
      id: 2,
      type: "friend",
      title: "Nouvel ami",
      message: "Lina a accepté ta demande d’ami",
      time: "Il y a 2 h",
      read: true,
    },
    {
      id: 3,
      type: "system",
      title: "Mise à jour CoWatch",
      message: "Nouveau mode plein écran disponible.",
      time: "Hier",
      read: true,
    },
  ];

  return (
    <div className="notif-page">
      {/* Top bar */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
        <span className="logo-title">CoWatch</span>
      </div>

      {/* Tabs */}
      <div className="tabs-row">
        <Link to="/profile" className="tab-link">Profil</Link>
        <Link to="/start-room" className="tab-link">Start Room</Link>
        <Link to="/friends" className="tab-link">Amis</Link>
        <button className="tab-link active">Notif</button>
      </div>

      {/* Main content */}
      <main className="notif-content">
        <section className="card notif-list">
          <div className="notif-header-row">
            <h2>Notifications</h2>
            <button className="mark-all">Tout marquer comme lu</button>
          </div>

          <ul>
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`notif-item ${n.read ? "read" : "unread"}`}
              >
                <div className="notif-icon">
                  {n.type === "room" && "🎬"}
                  {n.type === "friend" && "👥"}
                  {n.type === "system" && "⚙️"}
                </div>

                <div className="notif-body">
                  <p className="notif-title">{n.title}</p>
                  <p className="notif-message">{n.message}</p>
                  <span className="notif-time">{n.time}</span>
                </div>

                {!n.read && <span className="notif-dot" />}
              </li>
            ))}
          </ul>
        </section>

        <aside className="card notif-side">
          <h3>Filtres rapides</h3>
          <button>Tout</button>
          <button>Rooms</button>
          <button>Amis</button>
          <button>Système</button>

          <div className="notif-tip">
            <h4>Astuce</h4>
            <p>
              Les notifications non lues apparaissent avec un point bleu.  
              Pense à les consulter avant de rejoindre une nouvelle room !
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}
