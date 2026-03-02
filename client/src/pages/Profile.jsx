import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

const DEFAULT_AVATAR = "/avatar.svg";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    bio: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
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

        localStorage.setItem("profileName", current.username || current.email || "Utilisateur");
        localStorage.setItem("profileAvatar", current.avatar || DEFAULT_AVATAR);

        setForm({
          username: current.username || "",
          email: current.email || "",
          bio: current.bio || "",
          avatar: current.avatar || "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      setErrorMsg("Non connecte");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          bio: form.bio,
          avatar: form.avatar,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de la mise a jour");
      }

      const updated = await res.json();

      setProfile({
        username: updated.username,
        fullName: updated.username || updated.email,
        email: updated.email,
        location: profile?.location || "France",
        bio: updated.bio || "",
        avatar: updated.avatar || DEFAULT_AVATAR,
      });

      localStorage.setItem("profileName", updated.username || updated.email || "Utilisateur");
      localStorage.setItem("profileAvatar", updated.avatar || DEFAULT_AVATAR);

      setForm({
        username: updated.username || "",
        email: updated.email || "",
        bio: updated.bio || "",
        avatar: updated.avatar || "",
      });

      setSuccessMsg("Profil mis a jour.");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const normalizeAvatar = (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return "";
    if (
      trimmed === "avatar.png" ||
      trimmed === "avatar.jpg" ||
      trimmed === "avatar.jpeg" ||
      trimmed === "avatar"
    ) {
      return DEFAULT_AVATAR;
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    if (trimmed.startsWith("data:") || trimmed.startsWith("/")) {
      return trimmed;
    }
    return `/${trimmed}`;
  };

  const avatarPreview =
    normalizeAvatar(form.avatar) ||
    normalizeAvatar(profile.avatar) ||
    DEFAULT_AVATAR;

  return (
    <div className="profile-page">
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
        <button className="tab" onClick={handleLogout}>Déconnexion</button>
      </div>

      <div className="profile-shell">
        <div className="profile-header">
          <div className="profile-banner" aria-hidden="true" />

          <div className="profile-identity">
            <div className="avatar-container">
              <img
                src={avatarPreview}
                alt="avatar"
                className="profile-avatar"
              />
            </div>

            <div className="identity-text">
              <h2 className="username">@{profile.username}</h2>
              <p className="identity-subtitle">{profile.fullName}</p>
            </div>
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

          <form className="profile-edit" onSubmit={handleSave}>
            <label>
              Username
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </label>

            <label>
              Avatar URL
              <input
                type="text"
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
              />
            </label>

            <label>
              Bio
              <textarea
                name="bio"
                rows="3"
                value={form.bio}
                onChange={handleChange}
              />
            </label>

            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            {successMsg && <p className="success-msg">{successMsg}</p>}
          </form>
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
    </div>
  );
}
