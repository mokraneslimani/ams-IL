const Annotation = require("../models/annotationModel");
const roomService = require("./roomService");

const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const annotationService = {
  async listByRoomAndVideo({ roomId, userId, videoUrl, limit }) {
    if (!videoUrl || !String(videoUrl).trim()) {
      throw createError("videoUrl requis", 400);
    }

    await roomService.getRoomByIdWithAccess(roomId, userId);
    const parsedLimit = Math.min(Math.max(Number(limit) || 500, 1), 1000);
    const result = await Annotation.listByRoomAndVideo(roomId, String(videoUrl).trim(), parsedLimit);
    return result.rows;
  },

  async create({ roomId, userId, videoUrl, timecodeSec, content }) {
    await roomService.getRoomByIdWithAccess(roomId, userId);

    const safeVideoUrl = String(videoUrl || "").trim();
    const safeContent = String(content || "").trim();
    const parsedTime = Number(timecodeSec);

    if (!safeVideoUrl) {
      throw createError("videoUrl requis", 400);
    }
    if (!safeContent) {
      throw createError("Le contenu de l'annotation est requis", 400);
    }
    if (safeContent.length > 500) {
      throw createError("L'annotation ne peut pas depasser 500 caracteres", 400);
    }
    if (!Number.isFinite(parsedTime) || parsedTime < 0) {
      throw createError("timecodeSec invalide", 400);
    }

    const inserted = await Annotation.create({
      roomId,
      userId,
      videoUrl: safeVideoUrl,
      timecodeSec: parsedTime,
      content: safeContent
    });

    const created = inserted.rows[0];
    const withUser = await Annotation.getById(created.id);
    return withUser.rows[0];
  },

  async delete({ roomId, annotationId, userId }) {
    const room = await roomService.getRoomByIdWithAccess(roomId, userId);
    const found = await Annotation.getById(annotationId);
    const annotation = found.rows[0];

    if (!annotation || Number(annotation.room_id) !== Number(roomId)) {
      throw createError("Annotation introuvable", 404);
    }

    const isOwner = Number(room.owner_id) === Number(userId);
    const isAuthor = Number(annotation.user_id) === Number(userId);
    if (!isOwner && !isAuthor) {
      throw createError("Suppression non autorisee", 403);
    }

    const deleted = await Annotation.deleteById(annotationId);
    return deleted.rows[0] || null;
  }
};

module.exports = annotationService;
