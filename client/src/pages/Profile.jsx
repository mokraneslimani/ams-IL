import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    posts: 0,
    videosWatched: 0,
    friends: 0,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setErrorMsg("Non connecté");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Erreur lors du chargement de l'utilisateur");
        }

        const current = await res.json();

        setProfile({
          username: current.username,
          fullName: current.username || current.email,
          email: current.email,
          location: "France",
          bio: current.bio || "Pas encore de bio.",
          avatar: current.avatar || DEFAULT_AVATAR,
        });

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
  }, [navigate]);

  if (loading) {
    return <div className="profile-page">Chargement du profil...</div>;
  }

  if (errorMsg) {
    return <div className="profile-page">Erreur : {errorMsg}</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="profile-page">

      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
        <button className="tab" onClick={handleLogout}>Déconnexion</button>
      </div>

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

      <div className="profile-tabs">
        <button className="tab active">Profil</button>
        <Link to="/start-room" className="tab">Start Room</Link>
        <Link to="/friends" className="tab">Amis</Link>
        <Link to="/notifications" className="tab">Notif</Link>
      </div>

      <div className="profile-content">

        <div className="card info-card">
          <h3>Informations principales</h3>
          <p><strong>Nom complet :</strong> {profile.fullName}</p>
          <p><strong>Email :</strong> {profile.email}</p>
          <p><strong>Localisation :</strong> {profile.location}</p>
          <p><strong>Bio :</strong> {profile.bio}</p>
        </div>

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

        <div className="card about-card">
          <h3>A propos</h3>
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
