const Friend = require("../models/friendModel");
const User = require("../models/userModel");
const notificationService = require("./notificationService");

const friendService = {
  async listAllForUser(userId, search) {
    const [friends, pendingReceived, pendingSent, suggestions] = await Promise.all([
      Friend.getFriends(userId),
      Friend.getPendingReceived(userId),
      Friend.getPendingSent(userId),
      Friend.getSuggestions(userId, 5),
    ]);

    let result = {
      friends: friends.rows,
      pendingReceived: pendingReceived.rows,
      pendingSent: pendingSent.rows,
      suggestions: suggestions.rows,
    };

    const q = String(search || "").trim().toLowerCase();
    if (q) {
      const filterByQuery = (row) => {
        const username = String(row.username || "").toLowerCase();
        const email = String(row.email || "").toLowerCase();
        return username.includes(q) || email.includes(q);
      };
      result = {
        friends: result.friends.filter(filterByQuery),
        pendingReceived: result.pendingReceived.filter(filterByQuery),
        pendingSent: result.pendingSent.filter(filterByQuery),
        suggestions: result.suggestions.filter(filterByQuery),
      };
    }

    return result;
  },

  async sendRequest(userId, targetEmail) {
    const target = await User.getUserByEmail(targetEmail);
    if (target.rows.length === 0) {
      throw new Error("Utilisateur introuvable");
    }
    const targetUser = target.rows[0];

    const requesterData = await User.getUserById(userId);
    const requester = requesterData.rows[0];

    if (targetUser.id === userId) {
      throw new Error("Impossible de s'ajouter soi-même");
    }

    const exists = await Friend.relationExists(userId, targetUser.id);
    if (exists.rows.length > 0) {
      throw new Error("Relation déjà existante ou en attente");
    }

    const created = await Friend.createRequest(userId, targetUser.id);

    // Notifier le destinataire
    await notificationService.create(
      targetUser.id,
      `Nouvelle demande d'ami de ${requester?.username ? "@" + requester.username : "un utilisateur"}`
    );

    return created.rows[0];
  },

  async acceptRequest(currentUserId, requesterId) {
    const updated = await Friend.acceptRequest(requesterId, currentUserId);
    if (updated.rows.length === 0) {
      throw new Error("Demande introuvable");
    }

    // Notifier le demandeur
    await notificationService.create(
      requesterId,
      `Votre demande d'ami a été acceptée`
    );

    return updated.rows[0];
  },

  async removeFriend(userId, friendId) {
    const deleted = await Friend.deleteRelation(userId, friendId);
    if (deleted.rows.length === 0) {
      throw new Error("Relation introuvable");
    }
    return deleted.rows[0];
  },
};

module.exports = friendService;
