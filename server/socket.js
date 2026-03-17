const historyService = require("./services/historyService");
const messageService = require("./services/messageService");

const MAX_CHAT_MESSAGE_LENGTH = 1000;
const MAX_PLAYLIST_ITEMS = 200;

const normalizeRoomId = (value) => {
  const roomId = typeof value === "object" && value !== null ? value.roomId : value;
  const normalized = String(roomId ?? "").trim();
  return normalized || null;
};

const toPositiveIntegerOrNull = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const toSafeNumberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toSafeText = (value, maxLen = 255) => {
  const safe = String(value ?? "").trim();
  if (!safe) return "";
  return safe.length > maxLen ? safe.slice(0, maxLen) : safe;
};

module.exports = function socketHandler(io) {
  const roomsData = Object.create(null);

  const getOrCreateRoomState = (roomId) => {
    if (!roomsData[roomId]) {
      roomsData[roomId] = {
        host: null,
        users: new Set()
      };
    }
    return roomsData[roomId];
  };

  const emitRoomState = (roomId) => {
    const room = roomsData[roomId];
    if (!room) return;
    io.to(roomId).emit("participants_update", Array.from(room.users));
    io.to(roomId).emit("host_update", room.host);
  };

  const removeSocketFromRoom = (roomId, socketId) => {
    const room = roomsData[roomId];
    if (!room) return;

    room.users.delete(socketId);
    if (room.host === socketId) {
      room.host = room.users.values().next().value || null;
    }

    if (room.users.size === 0) {
      delete roomsData[roomId];
      return;
    }

    emitRoomState(roomId);
  };

  const canUseRoom = (socket, roomId) => {
    if (!roomId) return false;
    return socket.rooms.has(roomId);
  };

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_room", (rawRoomId) => {
      const roomId = normalizeRoomId(rawRoomId);
      if (!roomId) return;

      socket.join(roomId);
      const room = getOrCreateRoomState(roomId);
      room.users.add(socket.id);

      if (!room.host || !room.users.has(room.host)) {
        room.host = socket.id;
      }

      emitRoomState(roomId);
    });

    socket.on("leave_room", (rawRoomId) => {
      const roomId = normalizeRoomId(rawRoomId);
      if (!roomId) return;

      socket.leave(roomId);
      removeSocketFromRoom(roomId, socket.id);
    });

    socket.on("close_room", (rawRoomId) => {
      const roomId = normalizeRoomId(rawRoomId);
      if (!roomId || !roomsData[roomId]) return;

      const room = roomsData[roomId];
      if (room.host !== socket.id) {
        socket.emit("room_close_denied", {
          roomId,
          message: "Only the room host can close the room."
        });
        return;
      }

      io.to(roomId).emit("room_closed", {
        roomId,
        message: "La room a ete fermee par l'hote."
      });
      io.in(roomId).socketsLeave(roomId);
      delete roomsData[roomId];
    });

    socket.on("video_play", (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      const currentTime = toSafeNumberOrNull(data.currentTime);
      const payload = {
        ...data,
        roomId
      };
      if (currentTime !== null) {
        payload.currentTime = Math.max(0, currentTime);
      }

      socket.to(roomId).emit("video_play", payload);
    });

    socket.on("video_pause", (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      const currentTime = toSafeNumberOrNull(data.currentTime);
      const payload = {
        ...data,
        roomId
      };
      if (currentTime !== null) {
        payload.currentTime = Math.max(0, currentTime);
      }

      socket.to(roomId).emit("video_pause", payload);
    });

    socket.on("video_seek", (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      const currentTime = toSafeNumberOrNull(data.currentTime);
      if (currentTime === null) return;

      socket.to(roomId).emit("video_seek", {
        ...data,
        roomId,
        currentTime: Math.max(0, currentTime)
      });
    });

    socket.on("change_video", async (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      const videoUrl = toSafeText(data.videoUrl, 2048);
      if (!videoUrl) return;

      const payload = {
        ...data,
        roomId,
        videoUrl,
        title: toSafeText(data.title, 255),
        category: toSafeText(data.category, 80),
        videoId: toSafeText(data.videoId, 80),
        thumbnail: toSafeText(data.thumbnail, 2048)
      };

      socket.to(roomId).emit("change_video", payload);

      try {
        const fallbackThumb = payload.videoId
          ? `https://img.youtube.com/vi/${payload.videoId}/hqdefault.jpg`
          : null;

        await historyService.addHistoryEntry(
          {
            roomId,
            videoUrl,
            title: payload.title || null,
            thumbnail: payload.thumbnail || fallbackThumb
          },
          payload.videoId || null
        );
      } catch (err) {
        console.error("change_video history persistence error:", err.message);
      }
    });

    socket.on("video_sync_request", (rawRoomId) => {
      const roomId = normalizeRoomId(rawRoomId);
      if (!canUseRoom(socket, roomId)) return;
      socket.to(roomId).emit("video_sync_request");
    });

    socket.on("video_sync_response", (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      const currentTime = toSafeNumberOrNull(data.currentTime);
      socket.to(roomId).emit("video_sync_response", {
        ...data,
        roomId,
        currentTime: currentTime === null ? 0 : Math.max(0, currentTime),
        isPlaying: Boolean(data.isPlaying),
        videoUrl: toSafeText(data.videoUrl, 2048)
      });
    });

    socket.on("chat_message", async (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      const content = toSafeText(data.message || data.content, MAX_CHAT_MESSAGE_LENGTH);
      if (!content) return;

      const payload = {
        ...data,
        roomId,
        username: toSafeText(data.username, 80),
        message: content,
        content
      };
      io.to(roomId).emit("chat_message", payload);

      try {
        const roomIdNum = toPositiveIntegerOrNull(roomId);
        const userId = toPositiveIntegerOrNull(data.userId || data.user_id);
        if (roomIdNum && userId) {
          await messageService.create(roomIdNum, userId, content);
        }
      } catch (err) {
        console.error("chat_message persistence error:", err.message);
      }
    });

    socket.on("playlist_update", (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      socket.to(roomId).emit("playlist_update", {
        roomId,
        items: Array.isArray(data.items) ? data.items.slice(0, MAX_PLAYLIST_ITEMS) : []
      });
    });

    socket.on("annotation_created", (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      const annotationId = toPositiveIntegerOrNull(data.id);
      if (!annotationId) return;

      socket.to(roomId).emit("annotation_created", {
        ...data,
        id: annotationId,
        roomId
      });
    });

    socket.on("annotation_deleted", (data) => {
      if (!data || typeof data !== "object") return;
      const roomId = normalizeRoomId(data.roomId);
      if (!canUseRoom(socket, roomId)) return;

      const annotationId = toPositiveIntegerOrNull(data.annotationId);
      if (!annotationId) return;

      socket.to(roomId).emit("annotation_deleted", {
        roomId,
        annotationId
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      for (const roomId of Object.keys(roomsData)) {
        removeSocketFromRoom(roomId, socket.id);
      }
    });
  });
};
