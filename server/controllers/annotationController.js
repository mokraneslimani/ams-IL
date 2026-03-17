const annotationService = require("../services/annotationService");

const handleError = (res, err, fallbackStatus = 500) => {
  const status = err.status || fallbackStatus;
  return res.status(status).json({ message: err.message });
};

exports.getAnnotationsByRoom = async (req, res) => {
  const { roomId } = req.params;
  const { videoUrl, limit, offset, authorId, fromSec, toSec, cursor, cursorId } = req.query;
  try {
    const annotations = await annotationService.listByRoomAndVideo({
      roomId,
      userId: req.userId,
      videoUrl,
      limit,
      offset,
      authorId,
      fromSec,
      toSec,
      cursor: cursor || cursorId
    });
    res.json(annotations);
  } catch (err) {
    handleError(res, err);
  }
};

exports.createAnnotation = async (req, res) => {
  const { roomId } = req.params;
  const { videoUrl, timecodeSec, content } = req.body;
  try {
    const created = await annotationService.create({
      roomId,
      userId: req.userId,
      videoUrl,
      timecodeSec,
      content
    });
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err, 400);
  }
};

exports.deleteAnnotation = async (req, res) => {
  const { roomId, annotationId } = req.params;
  try {
    const deleted = await annotationService.delete({
      roomId,
      annotationId,
      userId: req.userId
    });
    if (!deleted) {
      return res.status(404).json({ message: "Annotation introuvable" });
    }
    res.json(deleted);
  } catch (err) {
    handleError(res, err);
  }
};

exports.updateAnnotation = async (req, res) => {
  const { roomId, annotationId } = req.params;
  const { content, timecodeSec } = req.body;
  try {
    const updated = await annotationService.update({
      roomId,
      annotationId,
      userId: req.userId,
      content,
      timecodeSec
    });
    res.json(updated);
  } catch (err) {
    handleError(res, err, 400);
  }
};
