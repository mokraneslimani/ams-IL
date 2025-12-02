import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

import "./CreateRoom.css";

export default function CreateRoom() {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [roomLink, setRoomLink] = useState("");

  // Générer Room ID
  useEffect(() => {
    const id = Math.random().toString(36).substring(2, 10);
    setRoomId(id);
    setRoomLink(`${window.location.origin}/room/${id}`);
  }, []);

  // Copier le lien
  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    alert("Lien copié !");
  };

  // Aller vers la room
  const goToRoom = () => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="create-room-container">

      <div className="create-room-box">
        <h2>Share the room</h2>

        {/* Input URL + bouton Copy */}
        <div className="link-box">
          <input type="text" value={roomLink} readOnly />
          <button onClick={copyLink}>Copy</button>
        </div>

        <h4>Share via</h4>

        {/* Icônes */}
        <div className="social-icons">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-instagram"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-whatsapp"></i>
        </div>

        {/* QR Code */}
        <div className="qr-box">
        <QRCodeCanvas value={roomLink} size={120} />

        </div>

        {/* Bouton Start */}
        <button className="start-btn" onClick={goToRoom}>
          Start
        </button>
      </div>
    </div>
  );
}
