const db = require("../db");

// =====================================
//   ROOM MEMBER MODEL
// =====================================
const RoomMember = {

  // Ajouter un membre dans une room
  addMember(room_id, user_id, role = "guest") {
    const query = `
      INSERT INTO room_members (room_id, user_id, role)
      VALUES ($1, $2, $3)
      RETURNING *`;
    
    return db.query(query, [room_id, user_id, role]);
  },

  // Retirer un membre d'une room
  removeMember(room_id, user_id) {
    const query = `
      DELETE FROM room_members 
      WHERE room_id = $1 AND user_id = $2
      RETURNING *`;
    
    return db.query(query, [room_id, user_id]);
  },

  // Obtenir la liste des membres d'une room
  getMembers(room_id) {
    const query = `
      SELECT u.id, u.username, u.email, rm.role
      FROM room_members rm
      JOIN users u ON u.id = rm.user_id
      WHERE rm.room_id = $1`;
    
    return db.query(query, [room_id]);
  },

  // Vérifier si un user est membre d'une room
  isMember(room_id, user_id) {
    const query = `
      SELECT * FROM room_members
      WHERE room_id = $1 AND user_id = $2`;
    
    return db.query(query, [room_id, user_id]);
  }
};

module.exports = RoomMember;
