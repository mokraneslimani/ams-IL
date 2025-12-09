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
  GET  /api/history/:roomId

  // Participants / amis dans la room
  GET  /api/rooms/:roomId/participants   (à faire plus tard)

  // Envoyer un message dans le chat
  POST /api/rooms/:roomId/messages       (à faire plus tard)
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
  const [roomError, setRoomError] = useState("");

  // -------- Vidéo courante + input --------
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [currentVideo, setCurrentVideo] = useState({
    url: "",
    title: "",
  });

  // -------- Historique --------
  const [history, setHistory] = useState([]); // plus de données en dur

  // -------- Participants / amis dans la room --------
  const [participants, setParticipants] = useState([
    // à connecter plus tard à /api/rooms/:roomId/participants
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

  // ============================
  // 1) Charger le profil connecté
  // ============================
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

  // =========================================
  // 2) Charger les infos de la room + la vidéo
  // =========================================
  useEffect(() => {
    if (!roomId) return;

    const loadRoom = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/rooms/${roomId}`
        );
        if (!res.ok) {
          throw new Error("Room introuvable");
        }

        // ton contrôleur renvoie directement la room (pas dans { room: ... })
        const room = await res.json();

        setRoomInfo({
          id: room.id,
          name: room.name || "Room sans nom",
          description: room.description || "",
        });

        // On charge aussi la vidéo principale depuis la colonne video_url
        setCurrentVideo({
          url: room.video_url || "",
          title: room.name || "",
        });
      } catch (err) {
        console.error("Erreur chargement room :", err);
        setRoomError(err.message);
      }
    };

    loadRoom();
  }, [roomId]);

  // =========================================
  // 3) Charger l'historique de la room
  // =========================================
  useEffect(() => {
    if (!roomId) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/history/${roomId}`
        );
        if (!res.ok) {
          throw new Error("Erreur lors du chargement de l'historique");
        }

        const data = await res.json();

        // data = lignes de la table history :
        // { id, room_id, video_url, title, thumbnail, created_at }
        const mapped = data.map((item) => ({
          id: item.id,
          title: item.title || "Vidéo",
          // on stocke la catégorie juste pour l'affichage, ici on met quelque chose de simple
          category: "Historique",
          // on utilise created_at comme "info" (à la place de vues pour l'instant)
          views: item.created_at
            ? new Date(item.created_at).toLocaleString("fr-FR")
            : "",
          thumbnail: item.thumbnail,
          videoUrl: item.video_url,
        }));

        setHistory(mapped);
      } catch (err) {
        console.error("Erreur chargement history :", err);
        // on ne casse pas l'UI, on laisse juste l'historique vide
      }
    };

    loadHistory();
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

  try {
    const u = new URL(url);

    // On n'accepte que youtube.com ou youtu.be
    if (
      !u.hostname.includes("youtube.com") &&
      !u.hostname.includes("youtu.be")
    ) {
      return "";
    }

    let videoId = "";

    // Cas 1 : https://www.youtube.com/watch?v=XXXX
    if (u.searchParams.get("v")) {
      videoId = u.searchParams.get("v");
    }

    // Cas 2 : https://youtu.be/XXXX
    if (!videoId && u.hostname.includes("youtu.be")) {
      videoId = u.pathname.replace("/", "");
    }

    if (!videoId) return "";

    // URL officielle d'embed
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (e) {
    return "";
  }
};



  const loadVideo = () => {
    if (!videoUrlInput) return;

    setCurrentVideo({
      url: videoUrlInput,
      title: "Nouvelle vidéo",
    });

    // Option : envoyer aussi au backend pour l'historique
    setHistory((prev) => [
      {
        id: Date.now(),
        title: "Nouvelle vidéo",
        category: "Custom",
        views: "N/A",
        videoUrl: videoUrlInput,
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
            Room :{" "}
            <strong>
              {roomError ? "Room inconnue" : roomInfo.name}
            </strong>
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
  {currentVideo.url && getEmbedUrl(currentVideo.url) ? (
    <iframe
      src={getEmbedUrl(currentVideo.url)}
      title={currentVideo.title || "YouTube Video"}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
              {history.length === 0 && (
                <p className="placeholder">
                  Aucun historique pour cette room.
                </p>
              )}

              {history.map((item) => (
                <div key={item.id} className="history-card">
                  <div className="thumb-placeholder">
                    {/* plus tard : <img src={item.thumbnail} ... /> */}
                  </div>
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
