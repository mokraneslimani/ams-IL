import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`notif-item ${n.is_read ? "read" : "unread"}`}
                  onClick={() => !n.is_read && markRead(n.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="notif-icon">🔔</div>

                  <div className="notif-body">
                    <p className="notif-title">{n.message}</p>
                    <span className="notif-time">
                      {n.created_at
                        ? new Date(n.created_at).toLocaleString("fr-FR")
                        : ""}
                    </span>
                  </div>

                  {!n.is_read && <span className="notif-dot" />}
                </li>
              ))}
              {items.length === 0 && !loading && <p>Aucune notification.</p>}
            </ul>
          )}
        </section>

        <aside className="card notif-side">
          <h3>Astuce</h3>
          <p>
            Clique sur une notification pour la marquer comme lue, ou utilise le bouton
            "Tout marquer comme lu" pour tout passer en lu.
          </p>
        </aside>
      </main>
    </div>
  );
}
