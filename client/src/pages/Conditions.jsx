import React from "react";
import { Link } from "react-router-dom";
import "./Conditions.css";

export default function Conditions() {
  return (
    <div className="info-page">
      <div className="info-top">
        <Link to="/" className="info-back">← Accueil</Link>
        <span className="info-title">Conditions générales</span>
      </div>

      <div className="info-card">
        <h2>Conditions générales d’utilisation</h2>
        <p className="info-intro">
          En utilisant CoWatch, vous acceptez les présentes conditions. Elles
          encadrent l’accès, l’usage de la plateforme et la sécurité de votre
          compte.
        </p>

        <div className="info-section">
          <h3>1. Objet du service</h3>
          <p>
            CoWatch permet de créer des rooms pour regarder des vidéos ensemble,
            discuter en temps réel et gérer une playlist collaborative.
          </p>
        </div>

        <div className="info-section">
          <h3>2. Comptes et sécurité</h3>
          <ul>
            <li>Un compte est personnel et ne doit pas être partagé.</li>
            <li>Vous êtes responsable des informations liées à votre compte.</li>
            <li>En cas d’usage non autorisé, contactez-nous rapidement.</li>
          </ul>
        </div>

        <div className="info-section">
          <h3>3. Règles d’utilisation</h3>
          <ul>
            <li>Respect des autres utilisateurs et des contenus partagés.</li>
            <li>Pas de contenu illégal, offensant ou portant atteinte aux droits d’auteur.</li>
            <li>Le non-respect peut entraîner une suspension.</li>
          </ul>
        </div>

        <div className="info-section">
          <h3>4. Données & confidentialité</h3>
          <p>
            Les données minimales nécessaires au fonctionnement sont conservées.
            Vous pouvez demander la modification ou suppression de vos données.
          </p>
        </div>

        <div className="info-section">
          <h3>5. Responsabilité</h3>
          <p>
            CoWatch met tout en œuvre pour assurer un service fiable, mais ne
            peut garantir une disponibilité continue ni la qualité des contenus
            externes (YouTube, etc.).
          </p>
        </div>

        <div className="info-section info-contact">
          <h3>6. Contact</h3>
          <p>Pour toute question : contact@cowatch.app</p>
        </div>
      </div>
    </div>
  );
}
