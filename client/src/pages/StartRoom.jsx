import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StartRoom.css";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png";

export default function StartRoom() {
  const navigate = useNavigate();

  // ==========================
  // 1. ÉTATS INITIAUX (UI)
  // ==========================

  // Profil de l’utilisateur connecté
  const [profile, setProfile] = useState({
    username: "mon_pseudo",   // ex: "achour"
    fullName: "Nom Prénom",
    avatar: DEFAULT_AVATAR,
  });

  // Contenu du formulaire Start Room
  const [roomConfig, setRoomConfig] = useState({
    roomName: "",
    mediaUrl: "",
    privacy: "private", // "private" | "public"
  });

  // Menu de gauche / liens de contexte
  const [sideMenu, setSideMenu] = useState([
    { id: "profile", label: "Profil", path: "/profile" },
    { id: "settings", label: "Paramètres", path: "/settings" }, // plus tard
    { id: "playlist", label: "Playlist", path: "/playlist" },   // plus tard
    { id: "addFriend", label: "Ajouter un ami", path: "/friends" },
  ]);

  // Contrôles de la room (caméra, micro, partage…)
  const [controls, setControls] = useState([
    { id: "camera", label: "Caméra", enabled: true },
    { id: "micro", label: "Micro", enabled: true },
    { id: "screen", label: "Partage d'écran", enabled: false },
  ]);

  // Liste des amis à inviter
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  // États techniques (chargement / erreurs)
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // =====================================
  // 2. CHARGEMENT INITIAL (future API)
  // =====================================
  useEffect(() => {
    // 👉 Plus tard, tu pourras récupérer tout ça depuis le serveur.
    // Exemple :
    //
    // setLoading(true);
    // fetch("http://localhost:5000/api/start-room-ui")
    //   .then(res => res.json())
    //   .then(data => {
    //     setProfile(data.profile);
    //     setRoomConfig(data.defaultRoomConfig);
    //     setSideMenu(data.sideMenu);
    //     setControls(data.controls);
    //     setFriends(data.friends);
    //   })
    //   .catch(err => setErrorMsg(err.message))
    //   .finally(() => setLoading(false));
    //
    // Pour l’instant, on met juste une petite liste d’amis de TEST :
    const fakeFriends = [
      { id: 1, name: "Alice", avatar: DEFAULT_AVATAR },
      { id: 2, name: "Samir", avatar: DEFAULT_AVATAR },
      { id: 3, name: "Lina", avatar: DEFAULT_AVATAR },
    ];
    setFriends(fakeFriends);
  }, []);

  // =====================================
  // 3. HANDLERS DE L’UI
  // =====================================

  // Changer un champ du formulaire
  const handleRoomChange = (field, value) => {
    setRoomConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Activer / désactiver un contrôle (caméra, micro, etc.)
  const toggleControl = (id) => {
    setControls((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  // Sélection d’un ami
  const toggleFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id]
    );
  };

  // Créer la room
  const handleCreateRoom = () => {
    if (!roomConfig.roomName || !roomConfig.mediaUrl) {
      return alert("Remplis tous les champs !");
    }

    // 👉 Plus tard : envoi de roomConfig + selectedFriends au serveur
    // fetch("http://localhost:5000/api/rooms", {...})

    navigate("/create-room");
  };

  // =====================================
  // 4. RENDU
  // =====================================

  if (loading) {
    return <div className="start-room-page">Chargement...</div>;
  }

  if (errorMsg) {
    return <div className="start-room-page">Erreur : {errorMsg}</div>;
  }

  return (
    <div className="start-room-page">
      {/* Barre de retour */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
      </div>

      {/* Header profil */}
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

      {/* Onglets principaux */}
      <div className="profile-tabs">
        <Link to="/profile" className="tab">Profil</Link>
        <button className="tab active">Start Room</button>
        <Link to="/friends" className="tab">Amis</Link>
        <Link to="/notifications" className="tab">Notif</Link>
      </div>

      {/* Layout principal */}
      <div className="start-room-layout">
        {/* Colonne gauche : menu + contrôles */}
        <aside className="left-column card">
          <h3>Navigation</h3>
          <ul className="side-menu">
            {sideMenu.map((item) => (
              <li key={item.id}>
                {item.path ? (
                  <Link to={item.path}>{item.label}</Link>
                ) : (
                  <span>{item.label}</span>
                )}
              </li>
            ))}
          </ul>

          <h3>Contrôles</h3>
          <div className="controls-list">
            {controls.map((ctrl) => (
              <button
                key={ctrl.id}
                type="button"
                className={
                  ctrl.enabled ? "control-btn active" : "control-btn"
                }
                onClick={() => toggleControl(ctrl.id)}
              >
                {ctrl.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Colonne centre : formulaire de création de room */}
        <section className="center-column card form-card">
          <h3>Créer une nouvelle room</h3>

          <label>Nom de la room</label>
          <input
            type="text"
            placeholder="Ma Room de visionnage"
            value={roomConfig.roomName}
            onChange={(e) => handleRoomChange("roomName", e.target.value)}
          />

          <label>Lien média (YouTube, film, stream…)</label>
          <input
            type="text"
            placeholder="https://..."
            value={roomConfig.mediaUrl}
            onChange={(e) => handleRoomChange("mediaUrl", e.target.value)}
          />

          <label>Confidentialité</label>
          <select
            value={roomConfig.privacy}
            onChange={(e) => handleRoomChange("privacy", e.target.value)}
          >
            <option value="private">Privée (invitation)</option>
            <option value="public">Publique</option>
          </select>

          <button className="btn-create" onClick={handleCreateRoom}>
            Créer la room
          </button>
        </section>

        {/* Colonne droite : amis */}
        <section className="right-column card friends-card">
          <div className="friends-header">
            <h3>Inviter des amis</h3>
            <span className="selected-count">
              {selectedFriends.length} sélectionné(s)
            </span>
          </div>

          <div className="friends-grid">
            {friends.map((f) => (
              <label key={f.id} className="friend-item">
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(f.id)}
                  onChange={() => toggleFriend(f.id)}
                />
                <img src={f.avatar || DEFAULT_AVATAR} alt={f.name} />
                <span>{f.name}</span>
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
