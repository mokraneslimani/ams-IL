const db = require("../db");

// =====================================
//   ROOM MODEL
// =====================================
const Room = {
  // Récupérer toutes les rooms
  getAllRooms() {
    return db.query("SELECT * FROM rooms ORDER BY created_at DESC");
  },

  // Récupérer une room par ID
  getRoomById(id) {
    return db.query("SELECT * FROM rooms WHERE id = $1", [id]);
  },

  // Récupérer une room via un lien unique (optionnel)
  getRoomByLink(link) {
    return db.query("SELECT * FROM rooms WHERE link = $1", [link]);
  },

  // Créer une room
  createRoom({ name, description, video_url, privacy, owner_id, link }) {
    const query = `
      INSERT INTO rooms (name, description, video_url, privacy, owner_id, link)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    
    return db.query(query, [name, description, video_url, privacy, owner_id, link]);
  },

  // Mettre à jour une room (optionnel)
  updateRoom(id, data) {
    const fields = [];
    const values = [];
    let index = 1;

    for (let key in data) {
      fields.push(`${key} = $${index}`);
      values.push(data[key]);
      index++;
    }

    values.push(id);

    const query = `
      UPDATE rooms SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *`;

    return db.query(query, values);
  },

  // Supprimer une room (optionnel)
  deleteRoom(id) {
    return db.query("DELETE FROM rooms WHERE id = $1 RETURNING *", [id]);
  }
};

module.exports = Room;
