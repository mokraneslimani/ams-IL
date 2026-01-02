const CGU_TEXT = `Conditions Generales d'Utilisation (CGU)

1. Objet
L'application permet de creer des rooms de visionnage et d'interagir avec d'autres utilisateurs.

2. Compte utilisateur
Vous etes responsable des informations de votre compte et de la securite de votre mot de passe.

3. Contenus
Vous ne devez pas publier de contenus illegaux, offensants ou portant atteinte aux droits d'autrui.

4. Disponibilite
Le service est fourni en l'etat, sans garantie de disponibilite continue.

5. Responsabilite
L'utilisation du service se fait a vos propres risques.

6. Contact
Pour toute question, contactez l'administrateur du service.`;

exports.getCgu = (_req, res) => {
  res.json({ text: CGU_TEXT });
};
