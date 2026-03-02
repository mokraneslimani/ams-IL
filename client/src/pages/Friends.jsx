// src/pages/Friends.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Friends.css";

export default function Friends() {
  const navigate = useNavigate();
  const DEFAULT_AVATAR = "/avatar.svg";
  const [friends, setFriends] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const storedAvatar = localStorage.getItem("profileAvatar") || DEFAULT_AVATAR;
  const storedName = localStorage.getItem("profileName") || "Utilisateur";

  const normalizeAvatar = (value) => {
    const trimmed = (value || "").trim();
    if (!trimmed) return DEFAULT_AVATAR;
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

  const avatarPreview = normalizeAvatar(storedAvatar);

  const authFetch = async (url, options = {}) => {
    const headers = options.headers || {};
    return fetch(url, {
      ...options,
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const loadFriends = async () => {
    if (!token) {
      setError("Non connecté. Merci de vous identifier.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await authFetch("http://localhost:5000/api/friends");
      if (!res.ok) {
        throw new Error("Impossible de charger vos amis");
      }
      const data = await res.json();
      setFriends(data.friends || []);
      setPendingReceived(data.pendingReceived || []);
      setPendingSent(data.pendingSent || []);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const sendRequest = async (emailOverride) => {
    const emailToSend = (emailOverride || emailInput).trim();
    if (!emailToSend) return;
    try {
      const res = await authFetch("http://localhost:5000/api/friends/request", {
        method: "POST",
        body: JSON.stringify({ email: emailToSend }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'envoi");
      setEmailInput("");
      loadFriends();
    } catch (err) {
      setError(err.message);
    }
  };

  const acceptRequest = async (requesterId) => {
    try {
      const res = await authFetch(
        `http://localhost:5000/api/friends/accept/${requesterId}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'acceptation");
      loadFriends();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteFriend = async (friendId) => {
    try {
      const res = await authFetch(
        `http://localhost:5000/api/friends/${friendId}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
      loadFriends();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!token) {
    return (
      <div className="friends-page">
        <p>Vous devez être connecté.</p>
        <button onClick={() => navigate("/login")}>Aller au login</button>
      </div>
    );
  }

  return (
    <div className="friends-page">
      {/* Top bar */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
        <span className="logo-title">CoWatch</span>
        <img className="top-avatar" src={avatarPreview} alt="avatar" />
      </div>

      <div className="page-hero">
        <img className="page-hero-avatar" src={avatarPreview} alt="avatar" />
        <div>
          <h2>Amis</h2>
          <p>Gère ton réseau et invite {storedName} à collaborer.</p>
        </div>
      </div>

      {/* Onglets profil */}
      <div className="tabs-row">
        <Link to="/profile" className="tab-link">Profil</Link>
        <Link to="/start-room" className="tab-link">Start Room</Link>
        <button className="tab-link active">Amis</button>
        <Link to="/notifications" className="tab-link">Notif</Link>
      </div>

      {error && <div className="auth-error" style={{ margin: "1rem" }}>{error}</div>}

      {loading ? (
        <div style={{ padding: "2rem" }}>Chargement...</div>
      ) : (
        <div className="friends-layout">
          {/* Colonne gauche : amis */}
          <section className="card friends-list">
            <h2>Mes amis</h2>
            {friends.length === 0 && <p>Aucun ami pour le moment.</p>}
            <ul>
              {friends.map((f) => (
                <li key={f.id} className="friend-item">
                  <div>
                    <p className="friend-name">{f.username || f.email}</p>
                    <p className="friend-last-room">{f.email}</p>
                  </div>
                  <button onClick={() => deleteFriend(f.id)}>Supprimer</button>
                </li>
              ))}
            </ul>
          </section>

          {/* Colonne droite : demandes + suggestions */}
          <section className="side-column">
            <div className="card pending-requests">
              <h3>Ajouter un ami par email</h3>
              <div className="pending-actions" style={{ gap: "0.5rem" }}>
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <button onClick={sendRequest}>Inviter</button>
              </div>
            </div>

            <div className="card pending-requests">
              <h3>Demandes reçues</h3>
              {pendingReceived.length === 0 ? (
                <p>Aucune demande en attente.</p>
              ) : (
                <ul>
                  {pendingReceived.map((p) => (
                    <li key={p.id} className="pending-item">
                      <span>{p.username || p.email}</span>
                      <div className="pending-actions">
                        <button onClick={() => acceptRequest(p.id)}>Accepter</button>
                        <button onClick={() => deleteFriend(p.id)}>Refuser</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card pending-requests">
              <h3>Demandes envoyées</h3>
              {pendingSent.length === 0 ? (
                <p>Rien en cours.</p>
              ) : (
                <ul>
                  {pendingSent.map((p) => (
                    <li key={p.id} className="pending-item">
                      <span>{p.username || p.email}</span>
                      <div className="pending-actions">
                        <button onClick={() => deleteFriend(p.id)}>Annuler</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card suggestions">
              <h3>Suggestions d'amis</h3>
              {suggestions.length === 0 && <p>Aucune suggestion.</p>}
              <ul>
                {suggestions.map((s) => (
                  <li key={s.id} className="suggest-item">
                    <span>{s.username || s.email}</span>
                    <button onClick={() => sendRequest(s.email)}>
                      Ajouter
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
