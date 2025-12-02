import React from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  return (
    <div className="profile-page">

      {/* --- Bouton accueil --- */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
      </div>

      {/* --- Bandeau + avatar + pseudo --- */}
      <div className="profile-header">
        <h2 className="username">@john_doe</h2>

        <div className="avatar-container">
          <img
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            alt="avatar"
            className="profile-avatar"
          />
        </div>
      </div>

      {/* --- Menu Onglets --- */}
      <div className="profile-tabs">
        <button className="tab active">Profil</button>
       <Link to="/start-room" className="tab">Start Room</Link>


        <button className="tab">Amis</button>
        <button className="tab">Notif</button>
      </div>

      {/* --- CONTENU --- */}
      <div className="profile-content">

        {/* Informations principales */}
        <div className="card info-card">
          <h3>Informations principales</h3>
          <p><strong>Nom complet :</strong> John Doe</p>
          <p><strong>Email :</strong> john.doe@example.com</p>
          <p><strong>Localisation :</strong> Paris, FR</p>
          <p>
            <strong>Bio :</strong> Passionné par les vidéos et le partage !
          </p>
        </div>

        {/* Statistiques */}
        <div className="card stats-card">
          <h3>Statistiques</h3>

          <div className="stats-grid">
            <div className="stats-box">
              <span className="stats-number">128</span>
              <span className="stats-label">Posts</span>
            </div>

            <div className="stats-box">
              <span className="stats-number">248</span>
              <span className="stats-label">Vidéos vues</span>
            </div>

            <div className="stats-box">
              <span className="stats-number">9</span>
              <span className="stats-label">Amis</span>
            </div>
          </div>
        </div>

        {/* À propos */}
        <div className="card about-card">
          <h3>À propos</h3>
          <p>
            Passionné par l'UI/UX et les interfaces performantes.  
            J’aime transformer des idées en produits élégants et accessibles.
          </p>
        </div>
      </div>
    </div>
  );
}
