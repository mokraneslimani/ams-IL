import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./VideoRoom.css";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

export default function VideoRoom() {
  const { roomId } = useParams(); // /room/:roomId
  const [effectiveRoomId, setEffectiveRoomId] = useState(roomId);

  // Profil / utilisateur courant
  const [profile, setProfile] = useState({ username: "mon_pseudo", avatar: DEFAULT_AVATAR });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // Menu
  const [menuItems] = useState([
    { id: "profile", label: "Profil", path: "/profile" },
    { id: "settings", label: "Parametres", path: "/settings" },
    { id: "playlist", label: "Playlist", path: "/playlist" },
  ]);

  // Controles
  const [controls, setControls] = useState([
    { id: "camera", label: "Camera", enabled: true },
    { id: "micro", label: "Micro", enabled: true },
    { id: "screen", label: "Partage d'ecran", enabled: false },
  ]);

  // Infos room
  const [roomInfo, setRoomInfo] = useState({ id: roomId || "room", name: "Room", link: "" });
  const [roomError, setRoomError] = useState("");

  useEffect(() => {
    setEffectiveRoomId(roomId);
  }, [roomId]);

  // Video
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [currentVideo, setCurrentVideo] = useState({ url: "", title: "" });

  // Historique
  const [history, setHistory] = useState([]);

  // Participants
  const [participants, setParticipants] = useState([]);

  // Chat
  const [chatMessages, setChatMessages] = useState([{ id: 1, author: "System", text: "Bienvenue dans la room !" }]);
  const [chatInput, setChatInput] = useState("");

  // Invites / friends
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState("");

  // Settings
  const [videoSettings, setVideoSettings] = useState({
    autoplay: false,
    defaultVolume: 50,
    subtitles: "off",
    quality: "auto",
    syncMode: "strict",
  });
  const [roomSettings, setRoomSettings] = useState({
    privacy: "private",
    hostDelay: 0,
    chatLocked: false,
    screenShare: true,
    maxParticipants: 10,
    pin: "",
    expireMinutes: 0,
    notifInvites: true,
    notifChanges: true,
    notifParticipants: true,
    showInitials: false,
  });

  // --------- Effects ----------

  // Profil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (!storedId) {
          setProfileError("Utilisateur non connecte (userId manquant).");
          return;
        }

        const res = await fetch(`http://localhost:5000/api/users/${storedId}`);
        if (!res.ok) {
          throw new Error("Impossible de recuperer l'utilisateur connecte");
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

  // Room + video principale
  useEffect(() => {
    if (!roomId) return;
    const loadRoom = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      try {
        let res = await fetch(`http://localhost:5000/api/rooms/${roomId}`, { headers });
        if (!res.ok) {
          const linkRes = await fetch(`http://localhost:5000/api/rooms/link/${roomId}`);
          if (!linkRes.ok) {
            throw new Error(res.status === 401 ? "Connexion requise" : "Room introuvable");
          }

          const roomByLink = await linkRes.json();
          setEffectiveRoomId(roomByLink.id);
          setRoomInfo({
            id: roomByLink.id,
            name: roomByLink.name || "Room sans nom",
            description: roomByLink.description || "",
            link: roomByLink.link || "",
          });

          setCurrentVideo({
            url: roomByLink.video_url || "",
            title: roomByLink.name || "",
          });

          if (!token) {
            setRoomError("Connexion requise pour rejoindre cette room");
            return;
          }

          const joinRes = await fetch(
            `http://localhost:5000/api/rooms/link/${roomId}/join`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!joinRes.ok) {
            const data = await joinRes.json().catch(() => ({}));
            throw new Error(data.message || "Impossible de rejoindre la room");
          }

          return;
        }

        const room = await res.json();

        setEffectiveRoomId(room.id);
        setRoomInfo({
          id: room.id,
          name: room.name || "Room sans nom",
          description: room.description || "",
          link: room.link || "",
        });

        setCurrentVideo({
          url: room.video_url || "",
          title: room.name || "",
        });
      } catch (err) {
        setRoomError(err.message);
      }
    };
    loadRoom();
  }, [roomId]);

  // Historique
  useEffect(() => {
    if (!effectiveRoomId) return;
    const loadHistory = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/history/${effectiveRoomId}`);
        if (!res.ok) {
          throw new Error("Erreur lors du chargement de l'historique");
        }
        const data = await res.json();
        const mapped = data.map((item) => ({
          id: item.id,
          title: item.title || "Video",
          category: "Historique",
          views: item.created_at ? new Date(item.created_at).toLocaleString("fr-FR") : "",
          thumbnail: item.thumbnail,
          videoUrl: item.video_url,
        }));
        setHistory(mapped);
      } catch (err) {
        console.error("Erreur chargement history :", err);
      }
    };
    loadHistory();
  }, [effectiveRoomId]);

  // Members
  useEffect(() => {
    if (!effectiveRoomId) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const loadMembers = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${effectiveRoomId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de charger les membres");
        const data = await res.json();
        const mapped = data.map((m) => ({
          id: m.id || m.user_id || Math.random(),
          username: m.username || m.email || "user",
          avatar: m.avatar || DEFAULT_AVATAR,
          initials: (m.username || m.email || "U").slice(0, 1).toUpperCase(),
        }));
        setParticipants(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    loadMembers();
  }, [effectiveRoomId]);

  // Friends list (for invites)
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return;
    const loadFriends = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de charger vos amis");
        const data = await res.json();
        setFriends(data.friends || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadFriends();
  }, []);

  // --------- Helpers ----------

  const toggleControl = (id) => {
    setControls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const u = new URL(url);
      if (!u.hostname.includes("youtube.com") && !u.hostname.includes("youtu.be")) {
        return "";
      }
      let videoId = "";
      if (u.searchParams.get("v")) videoId = u.searchParams.get("v");
      if (!videoId && u.hostname.includes("youtu.be")) {
        videoId = u.pathname.replace("/", "");
      }
      if (!videoId) return "";
      return `https://www.youtube.com/embed/${videoId}`;
    } catch (e) {
      return "";
    }
  };

  // --------- Actions ----------

  const loadVideo = () => {
    if (!videoUrlInput) return;
    setCurrentVideo({ url: videoUrlInput, title: "Nouvelle video" });
    setHistory((prev) => [
      { id: Date.now(), title: "Nouvelle video", category: "Custom", views: "N/A", videoUrl: videoUrlInput },
      ...prev,
    ]);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { id: Date.now(), author: profile.username, text: chatInput.trim() };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  const toggleFriend = (id) => {
    setSelectedFriends((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const sendInvites = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!effectiveRoomId || selectedFriends.length === 0) {
      setInviteStatus("Selectionne au moins un ami.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${effectiveRoomId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendIds: selectedFriends }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Envoi invitations echoue");
      setInviteStatus("Invitations envoyees !");
      setSelectedFriends([]);
    } catch (err) {
      setInviteStatus(err.message);
    }
  };

  const roomLink = `${window.location.origin}/room/${roomInfo.link || roomInfo.id || roomId}`;
  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setInviteStatus("Lien copie !");
  };

  // --------- Rendu ---------

  return (
    <div className="room-container">
      {/* HEADER */}
      <header className="room-header">
        <Link to="/" className="logo">CoWatch</Link>
        <div className="room-header-right">
          <span className="room-name">
            Room : <strong>{roomError ? "Room inconnue" : roomInfo.name}</strong>
          </span>
          <input className="search-input" type="text" placeholder="Rechercher..." />
        </div>
      </header>

      <div className="room-layout">
        {/* Sidebar gauche */}
        <aside className="room-sidebar">
          <div className="profile-mini">
            <img src={profile.avatar} alt={profile.username} className="profile-mini-avatar" />
            <span>
              {profileLoading ? "Chargement..." : profileError ? "Erreur profil" : `@${profile.username}`}
            </span>
          </div>

          <h3>Mon espace</h3>
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.path ? <Link to={item.path}>{item.label}</Link> : <span>{item.label}</span>}
              </li>
            ))}
            <li>
              <button className="sidebar-action" onClick={() => setShowInvite(true)}>
                Inviter des amis
              </button>
            </li>
          </ul>

          <div className="sidebar-section">
            <h4>Controles</h4>
            {controls.map((ctrl) => (
              <div key={ctrl.id} className="toggle-row">
                <span>{ctrl.label}</span>
                <input type="checkbox" checked={ctrl.enabled} onChange={() => toggleControl(ctrl.id)} />
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <h4>Parametres video</h4>
            <label className="setting-row">
              <span>Autoplay</span>
              <input
                type="checkbox"
                checked={videoSettings.autoplay}
                onChange={(e) => setVideoSettings((p) => ({ ...p, autoplay: e.target.checked }))}
              />
            </label>
            <label className="setting-row">
              <span>Volume</span>
              <input
                type="range"
                min="0"
                max="100"
                value={videoSettings.defaultVolume}
                onChange={(e) => setVideoSettings((p) => ({ ...p, defaultVolume: Number(e.target.value) }))}
              />
            </label>
            <label className="setting-row">
              <span>Qualite</span>
              <select
                value={videoSettings.quality}
                onChange={(e) => setVideoSettings((p) => ({ ...p, quality: e.target.value }))}
              >
                <option value="auto">Auto</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
              </select>
            </label>
            <label className="setting-row">
              <span>Synchro</span>
              <select
                value={videoSettings.syncMode}
                onChange={(e) => setVideoSettings((p) => ({ ...p, syncMode: e.target.value }))}
              >
                <option value="strict">Host controle</option>
                <option value="free">Libre</option>
              </select>
            </label>
          </div>

          <div className="sidebar-section">
            <h4>Parametres room</h4>
            <label className="setting-row">
              <span>Confidentialite</span>
              <select
                value={roomSettings.privacy}
                onChange={(e) => setRoomSettings((p) => ({ ...p, privacy: e.target.value }))}
              >
                <option value="private">Privee</option>
                <option value="public">Publique</option>
              </select>
            </label>
            <label className="setting-row">
              <span>Chat verrouille</span>
              <input
                type="checkbox"
                checked={roomSettings.chatLocked}
                onChange={(e) => setRoomSettings((p) => ({ ...p, chatLocked: e.target.checked }))}
              />
            </label>
            <label className="setting-row">
              <span>Max participants</span>
              <input
                type="number"
                min="1"
                value={roomSettings.maxParticipants}
                onChange={(e) => setRoomSettings((p) => ({ ...p, maxParticipants: Number(e.target.value) }))}
              />
            </label>
            <label className="setting-row">
              <span>PIN</span>
              <input
                type="text"
                value={roomSettings.pin}
                onChange={(e) => setRoomSettings((p) => ({ ...p, pin: e.target.value }))}
              />
            </label>
          </div>
        </aside>

        {/* Centre : video + historique */}
        <main className="room-center">
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
                <p className="placeholder">Aucune video chargee.</p>
              )}
            </div>
          </div>

          <section className="history-section">
            <h3>Historique</h3>
            <div className="history-list">
              {history.length === 0 && <p className="placeholder">Aucun historique pour cette room.</p>}
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

        {/* Droite : Live room + chat */}
        <aside className="room-right">
          <section className="live-room">
            <h3>Live Room</h3>
            <div className="avatars">
              {participants.map((p) => (
                <div key={p.id} className="avatar" title={p.username}>
                  {roomSettings.showInitials ? (
                    p.initials
                  ) : (
                    <>
                      <img src={p.avatar} alt={p.username} />
                      <span className="avatar-name">{p.username}</span>
                    </>
                  )}
                </div>
              ))}
              {participants.length === 0 && <p className="placeholder">Aucun membre pour l'instant.</p>}
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
                placeholder="Ecrire un message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button onClick={sendMessage}>Envoyer</button>
            </div>
          </section>
        </aside>
      </div>

      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Inviter des amis</h3>
            <div className="modal-section">
              <p>Lien de la room</p>
              <div className="link-box">
                <input type="text" value={roomLink} readOnly />
                <button onClick={copyLink}>Copier</button>
                <a href={`mailto:?subject=Rejoins ma room&body=${encodeURIComponent(roomLink)}`} className="share-btn">Gmail</a>
                <a href={`https://wa.me/?text=${encodeURIComponent(roomLink)}`} target="_blank" rel="noreferrer" className="share-btn">WhatsApp</a>
              </div>
            </div>
            <div className="modal-section">
              <p>Selectionne des amis</p>
              <div className="friends-grid">
                {friends.length === 0 && <p>Aucun ami disponible.</p>}
                {friends.map((f) => (
                  <label key={f.id} className="friend-item">
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(f.id)}
                      onChange={() => toggleFriend(f.id)}
                    />
                    <img src={f.avatar || DEFAULT_AVATAR} alt={f.username || f.email} />
                    <span>{f.username || f.email}</span>
                  </label>
                ))}
              </div>
              {inviteStatus && <p className="auth-error" style={{ marginTop: 8 }}>{inviteStatus}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button onClick={() => setShowInvite(false)} className="share-btn">Fermer</button>
                <button onClick={sendInvites} className="share-btn">Envoyer invitations</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
