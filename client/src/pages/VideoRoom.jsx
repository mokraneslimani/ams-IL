import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./VideoRoom.css";

/*
  === APIS PRÉVUES ===

  // Profil connecté
  GET  /api/users/:id

  // Infos de la room (nom, url vidéo, créateur, etc.)
  GET  /api/rooms/:roomId

  // Historique des vidéos de la room
  GET  /api/rooms/:roomId/history

  // Participants / amis dans la room
  GET  /api/rooms/:roomId/participants

  // Envoyer un message dans le chat
  POST /api/rooms/:roomId/messages
*/

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png";

export default function VideoRoom() {
  const { roomId } = useParams(); // /room/:roomId

  // -------- Profil / utilisateur courant --------
  const [profile, setProfile] = useState({
    username: "mon_pseudo",
    avatar: DEFAULT_AVATAR,
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // -------- Menu "Mon espace" --------
  const [menuItems] = useState([
    { id: "profile", label: "Profil", path: "/profile" },
    { id: "settings", label: "Paramètres", path: "/settings" }, // plus tard
    { id: "playlist", label: "Playlist", path: "/playlist" },   // plus tard
    { id: "addFriend", label: "Ajouter un ami", path: "/friends" },
  ]);

  // -------- Contrôles (caméra, micro, écran) --------
  const [controls, setControls] = useState([
    { id: "camera", label: "Caméra", enabled: true },
    { id: "micro", label: "Micro", enabled: true },
    { id: "screen", label: "Partage d'écran", enabled: false },
  ]);

  // -------- Infos de la room --------
  const [roomInfo, setRoomInfo] = useState({
    id: roomId || "room-test",
    name: "Ma Room de test",
  });

  // -------- Vidéo courante + input --------
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [currentVideo, setCurrentVideo] = useState({
    url: "",
    title: "",
  });

  // -------- Historique --------
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

  // -------- Participants / amis dans la room --------
  const [participants, setParticipants] = useState([
    { id: 1, initials: "A", name: "Alice" },
    { id: 2, initials: "M", name: "Mokrane" },
    { id: 3, initials: "S", name: "Samira" },
    { id: 4, initials: "I", name: "Idir" },
  ]);

  // -------- Chat --------
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: "System", text: "Bienvenue dans la room !" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // -------- Charger l'utilisateur connecté par ID --------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedId = localStorage.getItem("userId");
        if (!storedId) {
          setProfileError("Utilisateur non connecté (userId manquant).");
          return;
        }

        const res = await fetch(
          `http://localhost:5000/api/users/${storedId}`
        );
        if (!res.ok) {
          throw new Error("Impossible de récupérer l'utilisateur connecté");
        }
        const user = await res.json();

        setProfile({
          username: user.username || "user",
          avatar: user.avatar || DEFAULT_AVATAR,
        });
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // --------- Future intégration API room (plus tard) ---------
  useEffect(() => {
    // Exemple plus tard :
    // async function loadRoom() {
    //   const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
    //   const data = await res.json();
    //   setRoomInfo(data.room);
    //   setCurrentVideo({ url: data.room.mediaUrl, title: data.room.title });
    //   setHistory(data.history);
    //   setParticipants(data.participants);
    // }
    // loadRoom();
  }, [roomId]);

  // -------- Handlers --------

  const toggleControl = (id) => {
    setControls((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    return url.replace("watch?v=", "embed/");
  };

  const loadVideo = () => {
    if (!videoUrlInput) return;

    setCurrentVideo({
      url: videoUrlInput,
      title: "Nouvelle vidéo",
    });

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

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      author: profile.username,
      text: chatInput.trim(),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  // -------- Rendu --------
  return (
    <div className="room-container">
      {/* HEADER */}
      <header className="room-header">
        <Link to="/" className="logo">
          CoWatch
        </Link>

        <div className="room-header-right">
          <span className="room-name">
            Room : <strong>{roomInfo.name}</strong>
          </span>
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
          <div className="profile-mini">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="profile-mini-avatar"
            />
            <span>
              {profileLoading
                ? "Chargement..."
                : profileError
                ? "Erreur profil"
                : `@${profile.username}`}
            </span>
          </div>

          <h3>Mon espace</h3>

          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.path ? (
                  <Link to={item.path}>{item.label}</Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            ))}
          </ul>

          <div className="sidebar-section">
            <h4>Contrôles</h4>
            {controls.map((ctrl) => (
              <div key={ctrl.id} className="toggle-row">
                <span>{ctrl.label}</span>
                <input
                  type="checkbox"
                  checked={ctrl.enabled}
                  onChange={() => toggleControl(ctrl.id)}
                />
              </div>
            ))}
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
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
              />
              <button onClick={loadVideo}>Load Video</button>
            </div>

            <div className="video-box">
              {currentVideo.url ? (
                <iframe
                  src={getEmbedUrl(currentVideo.url)}
                  title={currentVideo.title || "YouTube Video"}
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
              {participants.map((p) => (
                <div key={p.id} className="avatar" title={p.name}>
                  {p.initials}
                </div>
              ))}
            </div>
          </section>

          <section className="chat-section">
            <h3>Chat</h3>

            <div className="chat-messages">
              {chatMessages.map((msg) => (
                <p key={msg.id}>
                  <strong>{msg.author} :</strong> {msg.text}
                </p>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Écrire un message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button onClick={sendMessage}>Envoyer</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}