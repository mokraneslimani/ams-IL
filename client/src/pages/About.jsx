import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-top">
        <Link to="/" className="about-back">← Accueil</Link>
        <span className="about-title">À propos</span>
      </div>

      <div className="about-hero">
        <div>
          <h1>CoWatch, l’expérience vidéo collaborative</h1>
          <p>
            Nous avons créé CoWatch pour faciliter les moments partagés : un
            lien, une room, une playlist et un chat en temps réel pour regarder
            ensemble, même à distance.
          </p>
        </div>
        <div className="about-pill">Projet IL • Semestre 5</div>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <h3>Notre mission</h3>
          <p>
            Offrir un espace simple, stable et élégant pour regarder du contenu
            en groupe, avec une synchronisation fluide et une expérience pro.
          </p>
        </div>
        <div className="about-card">
          <h3>Nos valeurs</h3>
          <ul>
            <li>Clarté : interface lisible et intuitive.</li>
            <li>Fiabilité : temps réel et performance constante.</li>
            <li>Collaboration : inviter, discuter, partager.</li>
          </ul>
        </div>
        <div className="about-card">
          <h3>Ce que vous obtenez</h3>
          <ul>
            <li>Rooms instantanées</li>
            <li>Chat live & réactions</li>
            <li>Playlist collaborative</li>
            <li>Gestion de profil</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
