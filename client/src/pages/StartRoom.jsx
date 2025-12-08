import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StartRoom.css";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png";

export default function StartRoom() {
  const navigate = useNavigate();

  // Profil (plus tard : appeler l'API /auth/me)
  const [profile, setProfile] = useState({
    id: 1, // ⚠️ TEMPORAIRE : l'utilisateur connecté aura un vrai ID plus tard
    username: "mon_pseudo",
    avatar: DEFAULT_AVATAR,
  });

  // Formulaire de création de room
  const [roomConfig, setRoomConfig] = useState({
    roomName: "",
    mediaUrl: "",
    privacy: "private",
  });

  // Friends mocks → plus tard API
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  // UI
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Fake friends pour test
    const fakeFriends = [
      { id: 1, name: "Alice", avatar: DEFAULT_AVATAR },
      { id: 2, name: "Samir", avatar: DEFAULT_AVATAR },
      { id: 3, name: "Lina", avatar: DEFAULT_AVATAR },
    ];
    setFriends(fakeFriends);
  }, []);

  // Gestion des inputs
  const handleRoomChange = (field, value) => {
    setRoomConfig((prev) => ({ ...prev, [field]: value }));
  };

  // Sélection amis
  const toggleFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ================================
  // 🚀 Créer une room (appel backend)
  // ================================
  const handleCreateRoom = async () => {
    if (!roomConfig.roomName || !roomConfig.mediaUrl) {
      return alert("Remplis tous les champs !");
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomConfig.roomName,
          description: "Room créée depuis StartRoom",
          video_url: roomConfig.mediaUrl,
          privacy: roomConfig.privacy,
          owner_id: profile.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création");
      }

      console.log("ROOM CREATED:", data);

      // Redirection automatique vers la room nouvellement créée
      navigate(`/room/${data.id}`);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // Rendu
  // ================================
  if (loading) return <div className="start-room-page">Création en cours...</div>;
  if (errorMsg) return <div className="start-room-page">Erreur : {errorMsg}</div>;

  return (
    <div className="start-room-page">

      {/* HEADER */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
      </div>

      <div className="profile-header">
        <h2 className="username">@{profile.username}</h2>
        <img src={profile.avatar} className="profile-avatar" alt="avatar" />
      </div>

      <div className="profile-tabs">
        <Link to="/profile" className="tab">Profil</Link>
        <button className="tab active">Start Room</button>
        <Link to="/friends" className="tab">Amis</Link>
        <Link to="/notifications" className="tab">Notif</Link>
      </div>

      <div className="start-room-layout">

        {/* FORMULAIRE */}
        <section className="center-column card form-card">
          <h3>Créer une nouvelle room</h3>

          <label>Nom de la room</label>
          <input
            type="text"
            placeholder="Ma Room de visionnage"
            value={roomConfig.roomName}
            onChange={(e) => handleRoomChange("roomName", e.target.value)}
          />

          <label>Lien média (YouTube, film…)</label>
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
            <option value="private">Privée</option>
            <option value="public">Publique</option>
          </select>

          <button className="btn-create" onClick={handleCreateRoom}>
            🚀 Créer la room
          </button>
        </section>

        {/* LISTE AMIS */}
        <section className="right-column card friends-card">
          <h3>Inviter des amis</h3>
          <div className="friends-grid">
            {friends.map((f) => (
              <label key={f.id} className="friend-item">
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(f.id)}
                  onChange={() => toggleFriend(f.id)}
                />
                <img src={f.avatar} alt={f.name} />
                <span>{f.name}</span>
              </label>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
