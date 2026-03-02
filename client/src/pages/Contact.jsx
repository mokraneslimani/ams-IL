import React from "react";
import { Link } from "react-router-dom";
import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact-page">
      <div className="contact-top">
        <Link to="/" className="contact-back">← Accueil</Link>
        <span className="contact-title">Contact</span>
      </div>

      <div className="contact-hero">
        <h1>On reste en contact</h1>
        <p>Une question, un bug, une idée ? Écris‑nous, on répond vite.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <h3>Email</h3>
          <p>contact@cowatch.app</p>
          <p>support@cowatch.app</p>
        </div>
        <div className="contact-card">
          <h3>Téléphone</h3>
          <p>+33 6 12 34 56 78</p>
          <p>+33 4 90 00 00 00</p>
        </div>
        <div className="contact-card">
          <h3>Réseaux</h3>
          <p>Instagram : @cowatch.app</p>
          <p>LinkedIn : CoWatch</p>
        </div>
      </div>

      <div className="contact-card contact-note">
        <h3>Horaires</h3>
        <p>Lun‑Ven : 09h00 – 18h00</p>
        <p>Weekend : support réduit</p>
      </div>
    </div>
  );
}
