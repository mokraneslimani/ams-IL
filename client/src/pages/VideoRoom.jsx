import React, { useState } from "react";
import "./VideoRoom.css";

export default function VideoRoom() {
  const [videoUrl, setVideoUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");

  // Historique (fake pour l'instant)
  const [history, setHistory] = useState([
    {
      id: 1,
      title: "Epic Adventure Trailer",
      category: "Adventure",
      views: "1.2M vues",
    },
    {
      id: 2,
      title: "Relaxing Lofi Mix",
      category: "Music",
      views: "530K vues",
    },
    {
      id: 3,
      title: "Funny Moments Compilation",
      category: "Comedy",
      views: "890K vues",
    },
  ]);

  const loadVideo = () => {
    if (!videoUrl) return;

    setCurrentUrl(videoUrl);

    // Ajouter dans l'historique (simple, sans API pour le moment)
    setHistory((prev) => [
      {
        id: Date.now(),
        title: "Nouvelle vidéo",
        category: "Custom",
        views: "N/A",
      },
      ...prev,
    ]);
  };

  return (
    <div className="room-container">
      {/* HEADER */}
      <header className="room-header">
        <a href="/" className="logo">
          CoWatch
        </a>

        <div className="room-header-right">
          <input
            className="search-input"
            type="text"
            placeholder="Rechercher..."
          />
        </div>
      </header>

      {/* LAYOUT 3 COLONNES */}
      <div className="room-layout">
        {/* COLONNE GAUCHE – MON ESPACE */}
        <aside className="room-sidebar">
          <h3>Mon espace</h3>

          <ul className="sidebar-menu">
            <li>Profil</li>
            <li>Paramètres</li>
            <li>Playlist</li>
            <li>Ajouter un ami</li>
          </ul>

          <div className="sidebar-section">
            <h4>Contrôles</h4>
            <div className="toggle-row">
              <span>Caméra</span>
              <input type="checkbox" />
            </div>
            <div className="toggle-row">
              <span>Micro</span>
              <input type="checkbox" />
            </div>
            <div className="toggle-row">
              <span>Partage d'écran</span>
              <input type="checkbox" />
            </div>
          </div>
        </aside>

        {/* COLONNE CENTRALE – VIDEO + HISTORIQUE */}
        <main className="room-center">
          {/* Zone vidéo */}
          <div className="video-section">
            <div className="url-input-box">
              <input
                type="text"
                placeholder="Collez une URL YouTube ici..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <button onClick={loadVideo}>Load Video</button>
            </div>

            <div className="video-box">
              {currentUrl ? (
                <iframe
                  src={currentUrl.replace("watch?v=", "embed/")}
                  title="YouTube Video"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              ) : (
                <p className="placeholder">Aucune vidéo chargée.</p>
              )}
            </div>
          </div>

          {/* Historique */}
          <section className="history-section">
            <h3>Historique</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-card">
                  <div className="thumb-placeholder"></div>
                  <div className="history-info">
                    <h4>{item.title}</h4>
                    <p>{item.category}</p>
                    <span>{item.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* COLONNE DROITE – LIVE ROOM + CHAT */}
        <aside className="room-right">
          <section className="live-room">
            <h3>Live Room</h3>
            <div className="avatars">
              <div className="avatar">A</div>
              <div className="avatar">M</div>
              <div className="avatar">S</div>
              <div className="avatar">I</div>
            </div>
          </section>

          <section className="chat-section">
            <h3>Chat</h3>

            <div className="chat-messages">
              <p><strong>System :</strong> Bienvenue dans la room !</p>
            </div>

            <div className="chat-input">
              <input type="text" placeholder="Écrire un message..." />
              <button>Envoyer</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
