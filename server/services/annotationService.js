const Annotation = require("../models/annotationModel");
const roomService = require("./roomService");

const MAX_ANNOTATION_LENGTH = 500;
const MAX_VIDEO_URL_LENGTH = 2048;
const DEFAULT_LIMIT = 500;
const MIN_LIMIT = 1;
const MAX_LIMIT = 1000;

const createError = (message, status) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const toPositiveInteger = (value, fieldName) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createError(`${fieldName} invalide`, 400);
  }
  return parsed;
};

const normalizeVideoUrl = (videoUrl) => {
  const safeVideoUrl = String(videoUrl || "").trim();
  if (!safeVideoUrl) {
    throw createError("videoUrl requis", 400);
  }
  if (safeVideoUrl.length > MAX_VIDEO_URL_LENGTH) {
    throw createError("videoUrl trop long", 400);
  }
  return safeVideoUrl;
};

const normalizeContent = (content) => {
  const safeContent = String(content || "").trim();
  if (!safeContent) {
    throw createError("Le contenu de l'annotation est requis", 400);
  }
  if (safeContent.length > MAX_ANNOTATION_LENGTH) {
    throw createError("L'annotation ne peut pas depasser 500 caracteres", 400);
  }
  return safeContent;
};

const normalizeTimecode = (timecodeSec) => {
  const parsed = Number(timecodeSec);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw createError("timecodeSec invalide", 400);
  }
  // Keep a deterministic precision aligned with NUMERIC(10,3).
  return Math.round(parsed * 1000) / 1000;
};

const normalizeLimit = (limit) => {
  if (limit === undefined || limit === null || limit === "") {
    return DEFAULT_LIMIT;
  }
  const parsed = Number(limit);
  if (!Number.isFinite(parsed)) {
    throw createError("limit invalide", 400);
  }
  return Math.min(Math.max(Math.floor(parsed), MIN_LIMIT), MAX_LIMIT);
};

const ensureRoomAccess = async (roomId, userId) => {
  const room = await roomService.getRoomByIdWithAccess(roomId, userId);
  if (!room) {
    throw createError("Room introuvable", 404);
  }
  return room;
};

const annotationService = {
  async listByRoomAndVideo({ roomId, userId, videoUrl, limit }) {
    const safeRoomId = toPositiveInteger(roomId, "roomId");
    const safeUserId = toPositiveInteger(userId, "userId");
    const safeVideoUrl = normalizeVideoUrl(videoUrl);
    const safeLimit = normalizeLimit(limit);

    await ensureRoomAccess(safeRoomId, safeUserId);
    const result = await Annotation.listByRoomAndVideo(safeRoomId, safeVideoUrl, safeLimit);
    return result.rows;
  },

  async create({ roomId, userId, videoUrl, timecodeSec, content }) {
    const safeRoomId = toPositiveInteger(roomId, "roomId");
    const safeUserId = toPositiveInteger(userId, "userId");
    const safeVideoUrl = normalizeVideoUrl(videoUrl);
    const safeContent = normalizeContent(content);
    const safeTimecode = normalizeTimecode(timecodeSec);

    await ensureRoomAccess(safeRoomId, safeUserId);

    const duplicate = await Annotation.findRecentDuplicate({
      roomId: safeRoomId,
      userId: safeUserId,
      videoUrl: safeVideoUrl,
      timecodeSec: safeTimecode,
      content: safeContent
    });

    if (duplicate.rows[0]) {
      return duplicate.rows[0];
    }

    const inserted = await Annotation.create({
      roomId: safeRoomId,
      userId: safeUserId,
      videoUrl: safeVideoUrl,
      timecodeSec: safeTimecode,
      content: safeContent
    });

    const created = inserted.rows[0];
    const withUser = await Annotation.getById(created.id);
    return withUser.rows[0] || created;
  },

  async delete({ roomId, annotationId, userId }) {
    const safeRoomId = toPositiveInteger(roomId, "roomId");
    const safeAnnotationId = toPositiveInteger(annotationId, "annotationId");
    const safeUserId = toPositiveInteger(userId, "userId");

    const room = await ensureRoomAccess(safeRoomId, safeUserId);
    const found = await Annotation.getById(safeAnnotationId);
    const annotation = found.rows[0];

    if (!annotation || Number(annotation.room_id) !== safeRoomId) {
      throw createError("Annotation introuvable", 404);
    }

    const isOwner = Number(room.owner_id) === safeUserId;
    const isAuthor = Number(annotation.user_id) === safeUserId;
    if (!isOwner && !isAuthor) {
      throw createError("Suppression non autorisee", 403);
    }

    const deleted = await Annotation.deleteByIdInRoom(safeAnnotationId, safeRoomId);
    return deleted.rows[0] || null;
  }
};

module.exports = annotationService;
