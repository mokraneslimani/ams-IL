import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StartRoom.css";

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/847/847969.png";

export default function StartRoom() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

  const [profile, setProfile] = useState({
    id: userId,
    username: "mon_pseudo",
    avatar: DEFAULT_AVATAR,
  });

  const [roomConfig, setRoomConfig] = useState({
    roomName: "",
    mediaUrl: "",
    privacy: "private",
  });

  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeRoom, setActiveRoom] = useState(() => {
    try {
      const stored = localStorage.getItem("activeRoom");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

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

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await authFetch(`http://localhost:5000/api/users/${userId}`);
        if (!res.ok) throw new Error("Impossible de charger le profil");
        const data = await res.json();
        setProfile({
          id: data.id,
          username: data.username || data.email,
          avatar: data.avatar || DEFAULT_AVATAR,
        });
      } catch (err) {
        setErrorMsg(err.message);
      }
    };

    const loadFriends = async () => {
      try {
        const res = await authFetch("http://localhost:5000/api/friends");
        if (!res.ok) throw new Error("Impossible de charger vos amis");
        const data = await res.json();
        setFriends(data.friends || []);
      } catch (err) {
        setErrorMsg(err.message);
      }
    };

    if (token && userId) {
      loadProfile();
      loadFriends();
    } else {
      setErrorMsg("Non connecté");
    }
  }, [token, userId]);

  const handleRoomChange = (field, value) => {
    setRoomConfig((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleCreateRoom = async () => {
    if (!roomConfig.roomName || !roomConfig.mediaUrl) {
      return alert("Remplis tous les champs !");
    }

    setLoading(true);

    try {
      const response = await authFetch("http://localhost:5000/api/rooms", {
        method: "POST",
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

      if (selectedFriends.length > 0) {
        await authFetch(`http://localhost:5000/api/rooms/${data.id}/invite`, {
          method: "POST",
          body: JSON.stringify({ friendIds: selectedFriends }),
        });
      }

      // conserver la room active pour y revenir facilement
      const roomInfo = { id: data.id, name: data.name || roomConfig.roomName };
      setActiveRoom(roomInfo);
      localStorage.setItem("activeRoom", JSON.stringify(roomInfo));

      navigate(`/room/${data.id}`);

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearActiveRoom = () => {
    setActiveRoom(null);
    localStorage.removeItem("activeRoom");
  };

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
        {activeRoom && (
          <div className="card" style={{ marginBottom: 12, gridColumn: "1 / -1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0 }}>Room en cours</h4>
                <p style={{ margin: "4px 0 0" }}>{activeRoom.name} (ID: {activeRoom.id})</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="tab" onClick={() => navigate(`/room/${activeRoom.id}`)}>
                  Rejoindre
                </button>
                <button className="tab" onClick={clearActiveRoom}>
                  Fermer la room
                </button>
              </div>
            </div>
          </div>
        )}

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

          <label>Lien média (YouTube, film...)</label>
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
        </section>

      </div>
    </div>
  );
}
