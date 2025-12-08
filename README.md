README – Backend du projet CoWatch (Projet IL – Semestre 5)
1. Présentation du projet

Ce projet consiste à développer une plateforme permettant à plusieurs utilisateurs de regarder des vidéos ensemble en temps réel, de discuter via un chat et de gérer une playlist collaborative.
Ce document décrit uniquement la partie backend mise en place : serveur Node.js, connexion à PostgreSQL, configuration, installation et tests.

2. Prérequis

Avant d’installer le projet, les outils suivants doivent être installés :

Node.js (version 18 ou supérieure)
Téléchargement : https://nodejs.org

PostgreSQL + pgAdmin
Téléchargement : https://www.postgresql.org/download/

3. Installation de la base de données PostgreSQL

Ouvrir pgAdmin.

Se connecter au serveur PostgreSQL.

Dans le panneau de gauche : clic droit sur « Databases » → « Create » → « Database ».

Nommer la base : cowatch

Valider.

3.1 Création des tables

Dans pgAdmin :

Sélectionner la base cowatch.

Clic droit → Query Tool.

Copier-coller le script SQL suivant :
------------------------------------------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  bio TEXT,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  video_url TEXT,
  privacy VARCHAR(20) DEFAULT 'public',
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

------------------------------------------------------
Exécuter la requête avec le bouton Run.

4. Installation du backend
4.1 Se placer dans le dossier server
cd projet_IL/server

4.2 Initialiser le projet Node.js
npm init -y

4.3 Installation des dépendances
npm install express cors pg bcryptjs jsonwebtoken dotenv nodemon

5. Configuration du fichier .env

Créer un fichier nommé .env dans :
projet_IL/server/.env

Contenu :
-------------------------------------------------------
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=mot_de_passe_postgres
DB_NAME=cowatch
DB_PORT=5432
PORT=5000
JWT_SECRET=secret_pour_jwt
-----------------------------------------------------
6. Fichier de connexion à PostgreSQL (db.js)

Créer un fichier db.js dans le dossier server :
-----------------------------------------------------------------
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log("Connecté à PostgreSQL !"))
  .catch(err => console.error("Erreur de connexion PostgreSQL :", err));

module.exports = pool;
----------------------------------------------------------------------------
7. Serveur Node.js (server.js)

Créer le fichier server.js dans le dossier server :
-----------------------------------------------------------------
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Route de test
app.get("/api/test", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({ message: "Backend OK", time: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Serveur démarré sur http://localhost:" + process.env.PORT);
});
----------------------------------------------------------------------------------
8. Lancer le serveur
Méthode classique
node server.js

Avec nodemon (redémarrage automatique)

Ajouter dans package.json :
--------------------------------------
"scripts": {
  "dev": "nodemon server.js"
}
------------------------------

Lancer :

npm run dev

9. Tester le backend

Ouvrir un navigateur et entrer :

http://localhost:5000/api/test


Si la configuration est correcte, la réponse suivante doit apparaître :

{
  "message": "Backend OK",
  "time": {"now": "..."}
}


Cela signifie que :

Node.js fonctionne

La route Express fonctionne

La connexion PostgreSQL fonctionne

10. Structure actuelle du backend
server/
 ├── controllers/      (vide pour l’instant)
 ├── models/           (vide pour l’instant)
 ├── routes/           (vide pour l’instant)
 ├── db.js             Connexion PostgreSQL
 ├── server.js         Serveur Node.js
 ├── .env              Variables d’environnement
 ├── package.json
 └── package-lock.json

11. Commandes récapitulatives
Installation des dépendances
npm install

Lancer le serveur
npm run dev

Lancer sans nodemon
node server.js

Réinitialiser les modules Node
rm -rf node_modules
npm install

12. État d’avancement

Serveur Node.js opérationnel

Connexion PostgreSQL fonctionnelle

Première route API opérationnelle

Communication navigateur ↔ backend validée

Le backend est maintenant prêt à recevoir les futures fonctionnalités : gestion des utilisateurs, gestion des salons, chat, synchronisation vidéo, etc.

Synchronisation Temps Réel (Socket.io)
1. Mise en place du serveur WebSocket

Configuration d’un serveur WebSocket avec Socket.io dans server.js.
Ajout du serveur HTTP, activation de CORS, et chargement du module socket.js.

2. Création du fichier socket.js

Le module gère :

Connexion des utilisateurs

Détection des connexions et déconnexions.

Rejoindre une room

Gestion de l’événement join_room, mise à jour de la liste des participants et attribution d’un host.

Synchronisation vidéo

Événements supportés :

video_play

video_pause

video_seek

Diffusion automatique à tous les utilisateurs de la room.

Synchronisation avancée

Événements :

video_sync_request

video_sync_response

Permet la synchronisation d’un nouvel utilisateur avec l’état courant de la vidéo.

Chat en temps réel

Événement :

chat_message

Diffusion des messages instantanément dans la room.

Gestion du host

Le premier utilisateur devient host.
Si le host quitte la room, un nouveau host est sélectionné automatiquement.

3. Test du WebSocket avec un client Node

Création d’un fichier testSocket.js permettant de tester le WebSocket sans interface graphique.

Le client :

se connecte au serveur,

rejoint une room,

envoie un message,

reçoit les événements du serveur.

Résultat obtenu :

Client connecté : xxxxx
Reçu : { roomId: '12345', username: 'ServerTest', message: 'Hello depuis node !' }

4. Résumé du travail réalisé aujourd’hui

Mise en place du serveur Socket.io

Création de socket.js

Gestion complète des rooms

Synchronisation vidéo (play, pause, seek)

Système de host

Gestion des participants

Chat en temps réel

Tests via un client Node (testSocket.js)