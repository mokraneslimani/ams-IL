import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const DEFAULT_AVATAR = "/avatar.svg";
  const storedAvatar = localStorage.getItem("profileAvatar") || DEFAULT_AVATAR;
  const storedName = localStorage.getItem("profileName") || "Utilisateur";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const loadNotifications = async () => {
    if (!token) {
      setLoading(false);
      setError("Non connecté.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("http://localhost:5000/api/notifications");
      if (!res.ok) throw new Error("Impossible de charger les notifications");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAll = async () => {
    try {
      await authFetch("http://localhost:5000/api/notifications/read-all", {
        method: "POST",
      });
      loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const markRead = async (id) => {
    try {
      await authFetch(`http://localhost:5000/api/notifications/read/${id}`, {
        method: "POST",
      });
      loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const archiveNotification = async (id) => {
    try {
      await authFetch(`http://localhost:5000/api/notifications/archive/${id}`, {
        method: "POST",
      });
      loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await authFetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
      });
      loadNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const actOnRoomInvite = async (notificationId, action, roomId) => {
    try {
      const endpoint =
        action === "accept"
          ? "room-invite/accept"
          : "room-invite/reject";

      const res = await authFetch(
        `http://localhost:5000/api/notifications/${endpoint}`,
        {
          method: "POST",
          body: JSON.stringify({ notificationId }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action invitation échouée");

      if (action === "accept" && data.room) {
        const joinSlug = data.room.link || data.room.id || data.roomId;
        navigate(`/room/${joinSlug}`);
      } else {
        loadNotifications();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  if (!token) {
    return (
      <div className="notif-page">
        <p>Vous devez être connecté.</p>
        <button onClick={() => navigate("/login")}>Aller au login</button>
      </div>
    );
  }

  const renderNotification = (n) => {
    let parsed;
    try {
      parsed = JSON.parse(n.message);
    } catch {
      parsed = null;
    }

    if (parsed && parsed.type === "room_invite") {
      return (
        <div className="notif-body">
          <p className="notif-title">Invitation à rejoindre la room {parsed.roomId}</p>
          <span className="notif-time">
            {n.created_at ? new Date(n.created_at).toLocaleString("fr-FR") : ""}
          </span>
          <div className="notif-actions">
            <button onClick={() => actOnRoomInvite(n.id, "accept", parsed.roomId)}>
              Accepter
            </button>
            <button onClick={() => actOnRoomInvite(n.id, "reject", parsed.roomId)}>
              Refuser
            </button>
            <button onClick={() => archiveNotification(n.id)}>Archiver</button>
            <button onClick={() => deleteNotification(n.id)}>Supprimer</button>
          </div>
        </div>
      );
    }

    if (parsed && parsed.type === "room_invite_response") {
      return (
        <div className="notif-body">
          <p className="notif-title">
            Réponse à ton invitation room {parsed.roomId} : {parsed.status}
          </p>
          <span className="notif-time">
            {n.created_at ? new Date(n.created_at).toLocaleString("fr-FR") : ""}
          </span>
        </div>
      );
    }

    return (
      <div className="notif-body">
        <p className="notif-title">{n.message}</p>
        <span className="notif-time">
          {n.created_at ? new Date(n.created_at).toLocaleString("fr-FR") : ""}
        </span>
        <div className="notif-actions">
          <button onClick={() => archiveNotification(n.id)}>Archiver</button>
          <button onClick={() => deleteNotification(n.id)}>Supprimer</button>
        </div>
      </div>
    );
  };

  return (
    <div className="notif-page">
      {/* Top bar */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
        <span className="logo-title">CoWatch</span>
        <img className="top-avatar" src={avatarPreview} alt="avatar" />
      </div>

      <div className="page-hero">
        <img className="page-hero-avatar" src={avatarPreview} alt="avatar" />
        <div>
          <h2>Notifications</h2>
          <p>Garde un oeil sur les invitations et mises a jour, {storedName}.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-row">
        <Link to="/profile" className="tab-link">Profil</Link>
        <Link to="/start-room" className="tab-link">Start Room</Link>
        <Link to="/friends" className="tab-link">Amis</Link>
        <button className="tab-link active">Notif</button>
      </div>

      {error && <div className="auth-error" style={{ margin: "1rem" }}>{error}</div>}

      {/* Main content */}
      <main className="notif-content">
        <section className="card notif-list">
          <div className="notif-header-row">
            <h2>Notifications</h2>
            <button className="mark-all" onClick={markAll}>Tout marquer comme lu</button>
          </div>

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <ul>
              {items.map((n) => {
                const parsed = (() => {
                  try {
                    return JSON.parse(n.message);
                  } catch {
                    return null;
                  }
                })();
                return (
                  <li
                    key={n.id}
                    className={`notif-item ${n.is_read ? "read" : "unread"}`}
                  >
                    <div className="notif-icon">🔔</div>
                    {renderNotification(n)}
                    {!n.is_read && (
                      <span
                        className="notif-dot"
                        onClick={() => markRead(n.id)}
                        style={{ cursor: "pointer" }}
                      />
                    )}
                  </li>
                );
              })}
              {items.length === 0 && !loading && <p>Aucune notification.</p>}
            </ul>
          )}
        </section>

        <aside className="card notif-side">
          <h3>Astuce</h3>
          <p>
            Clique sur une invitation pour l’accepter ou la refuser. Tu seras
            redirigé vers la room si tu acceptes.
          </p>
        </aside>
      </main>
    </div>
  );
}
