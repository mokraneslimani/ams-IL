import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Profile.css";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    videosWatched: 0,
    friends: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // -------------------------
  //   Charger l'utilisateur depuis l'API
  // -------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users");

        if (!res.ok) {
          throw new Error("Erreur lors du chargement des utilisateurs");
        }

        const data = await res.json(); // tableau d'utilisateurs

        // 🔹 TEST : on prend l’utilisateur "achour" comme profil courant
        const current = data.find((u) => u.username === "achour");

        if (!current) {
          throw new Error("Utilisateur 'achour' non trouvé");
        }

        setProfile({
          username: current.username,
          fullName: current.username,   // en attendant un vrai "nom complet"
          email: current.email,
          location: "France",           // valeur temporaire
          bio: current.bio || "Pas encore de bio.",
          avatar: current.avatar || DEFAULT_AVATAR,
        });

        // 🔹 Stats encore en dur pour l’instant
        setStats({
          posts: 5,
          videosWatched: 42,
          friends: 3,
        });
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // -------------------------
  //   États de chargement
  // -------------------------
  if (loading) {
    return <div className="profile-page">Chargement du profil...</div>;
  }

  if (errorMsg) {
    return <div className="profile-page">Erreur : {errorMsg}</div>;
  }

  // -------------------------
  //   Rendu principal
  // -------------------------
  return (
    <div className="profile-page">

      {/* Bouton accueil */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
      </div>

      {/* Bandeau + avatar + pseudo */}
      <div className="profile-header">
        <h2 className="username">@{profile.username}</h2>

        <div className="avatar-container">
          <img
            src={profile.avatar || DEFAULT_AVATAR}
            alt="avatar"
            className="profile-avatar"
          />
        </div>
      </div>

      {/* Onglets */}
      <div className="profile-tabs">
        <button className="tab active">Profil</button>
        <Link to="/start-room" className="tab">Start Room</Link>
        <Link to="/friends" className="tab">Amis</Link>
        <Link to="/notif" className="tab">Notif</Link>
      </div>

      {/* Contenu */}
      <div className="profile-content">

        {/* Infos principales */}
        <div className="card info-card">
          <h3>Informations principales</h3>
          <p><strong>Nom complet :</strong> {profile.fullName}</p>
          <p><strong>Email :</strong> {profile.email}</p>
          <p><strong>Localisation :</strong> {profile.location}</p>
          <p><strong>Bio :</strong> {profile.bio}</p>
        </div>

        {/* Statistiques */}
        <div className="card stats-card">
          <h3>Statistiques</h3>

          <div className="stats-grid">
            <div className="stats-box">
              <span className="stats-number">{stats.posts}</span>
              <span className="stats-label">Posts</span>
            </div>

            <div className="stats-box">
              <span className="stats-number">{stats.videosWatched}</span>
              <span className="stats-label">Vidéos vues</span>
            </div>

            <div className="stats-box">
              <span className="stats-number">{stats.friends}</span>
              <span className="stats-label">Amis</span>
            </div>
          </div>
        </div>

        {/* À propos */}
        <div className="card about-card">
          <h3>À propos</h3>
          <p>
            {profile.bio && profile.bio.trim() !== ""
              ? profile.bio
              : "Ajoute une bio pour personnaliser ton profil."}
          </p>
        </div>
      </div>
    </div>
  );
}
