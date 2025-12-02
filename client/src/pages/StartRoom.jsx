import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StartRoom.css";

export default function StartRoom() {
  const navigate = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [privacy, setPrivacy] = useState("private");

  const friends = [
    { id: 1, name: "Ami 1", img: "https://i.pravatar.cc/50?img=1" },
    { id: 2, name: "Ami 2", img: "https://i.pravatar.cc/50?img=2" },
    { id: 3, name: "Ami 3", img: "https://i.pravatar.cc/50?img=3" },
    { id: 4, name: "Ami 4", img: "https://i.pravatar.cc/50?img=4" },
    { id: 5, name: "Ami 5", img: "https://i.pravatar.cc/50?img=5" },
    { id: 6, name: "Ami 6", img: "https://i.pravatar.cc/50?img=6" },
    { id: 7, name: "Ami 7", img: "https://i.pravatar.cc/50?img=7" },
    { id: 8, name: "Ami 8", img: "https://i.pravatar.cc/50?img=8" },
    { id: 9, name: "Ami 9", img: "https://i.pravatar.cc/50?img=9" },
    { id: 10, name: "Ami 10", img: "https://i.pravatar.cc/50?img=10" },
    { id: 11, name: "Ami 11", img: "https://i.pravatar.cc/50?img=11" },
    { id: 12, name: "Ami 12", img: "https://i.pravatar.cc/50?img=12" },
  ];

  // -------------------------
  //    REDIRECTION BOUTON
  // -------------------------
  const handleCreateRoom = () => {
    if (!roomName || !mediaUrl)
      return alert("Remplis tous les champs !");

    // Redirection vers CreateRoom.jsx
    navigate("/create-room");
  };

  return (
    <div className="start-room-page">

      {/* Retour */}
      <div className="top-bar">
        <Link to="/" className="back-btn">← Accueil</Link>
      </div>

      {/* Header */}
      <div className="profile-header">
        <h2 className="username">@john_doe</h2>

        <div className="avatar-container">
          <img
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            alt="avatar"
            className="profile-avatar"
          />
        </div>
      </div>

      {/* Onglets */}
      <div className="profile-tabs">
        <Link to="/profile" className="tab">Profil</Link>
        <button className="tab active">Start Room</button>
        <Link to="/friends" className="tab">Amis</Link>
        <Link to="/notif" className="tab">Notif</Link>
      </div>

      {/* Contenu */}
      <div className="start-room-content">

        {/* Formulaire */}
        <div className="card form-card">
          <h3>Start Room</h3>

          <label>Nom de la room</label>
          <input
            type="text"
            placeholder="Ma Room de visionnage"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <label>Lien média (YouTube, film, stream…)</label>
          <input
            type="text"
            placeholder="https://..."
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
          />

          <label>Confidentialité</label>
          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value)}
          >
            <option value="private">Privée (invitation)</option>
            <option value="public">Publique</option>
          </select>

          {/* --- BOUTON --- */}
          <button className="btn-create" onClick={handleCreateRoom}>
            Créer la room
          </button>
        </div>

        {/* Liste amis */}
        <div className="card friends-card">
          <div className="friends-header">
            <h3>Inviter des amis</h3>
            <span className="selected-count">0 sélectionné(s)</span>
          </div>

          <div className="friends-grid">
            {friends.map((f) => (
              <label key={f.id} className="friend-item">
                <input type="checkbox" />
                <img src={f.img} alt={f.name} />
                <span>{f.name}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
