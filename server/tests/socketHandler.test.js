const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const socketPath = path.resolve(__dirname, "../socket.js");
const historyServicePath = path.resolve(__dirname, "../services/historyService.js");
const messageServicePath = path.resolve(__dirname, "../services/messageService.js");
const annotationModelPath = path.resolve(__dirname, "../models/annotationModel.js");

function injectModule(modulePath, exportsObject) {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports: exportsObject
  };
}

function loadSocketHandler({ historyService, messageService, annotationModel }) {
  delete require.cache[socketPath];
  injectModule(historyServicePath, historyService);
  injectModule(messageServicePath, messageService);
  injectModule(annotationModelPath, annotationModel);
  return require(socketPath);
}

class FakeIO {
  constructor() {
    this.connectionHandler = null;
    this.roomEmits = [];
    this.broadcasts = [];
    this.leftRooms = [];
  }

  on(event, handler) {
    if (event === "connection") {
      this.connectionHandler = handler;
    }
  }

  to(room) {
    return {
      emit: (event, payload) => {
        this.roomEmits.push({ room, event, payload });
      }
    };
  }

  in() {
    return {
      socketsLeave: (room) => {
        this.leftRooms.push(room);
      }
    };
  }

  connect(socket) {
    if (!this.connectionHandler) {
      throw new Error("No connection handler registered");
    }
    this.connectionHandler(socket);
  }
}

class FakeSocket {
  constructor(id, io) {
    this.id = id;
    this.io = io;
    this.rooms = new Set([id]);
    this.handlers = new Map();
    this.clientEmits = [];
  }

  on(event, handler) {
    this.handlers.set(event, handler);
  }

  emit(event, payload) {
    this.clientEmits.push({ event, payload });
  }

  join(room) {
    this.rooms.add(room);
  }

  leave(room) {
    this.rooms.delete(room);
  }

  to(room) {
    return {
      emit: (event, payload) => {
        this.io.broadcasts.push({ from: this.id, room, event, payload });
      }
    };
  }

  async trigger(event, payload) {
    const handler = this.handlers.get(event);
    if (!handler) {
      throw new Error(`No handler for event: ${event}`);
    }
    return handler(payload);
  }
}

test("chat_message is rate-limited when sent too quickly", async () => {
  const socketHandler = loadSocketHandler({
    historyService: { addHistoryEntry: async () => ({}) },
    messageService: { create: async () => ({}) },
    annotationModel: { listByRoomAndVideoFiltered: async () => ({ rows: [] }) }
  });

  const io = new FakeIO();
  socketHandler(io);

  const socket = new FakeSocket("s-1", io);
  io.connect(socket);

  await socket.trigger("join_room", "42");
  await socket.trigger("chat_message", {
    roomId: "42",
    userId: 3,
    username: "ali",
    message: "hello"
  });
  await socket.trigger("chat_message", {
    roomId: "42",
    userId: 3,
    username: "ali",
    message: "hello2"
  });

  const limited = socket.clientEmits.find((entry) => entry.event === "rate_limited");
  assert.ok(limited);
  assert.equal(limited.payload.event, "chat_message");
});

test("annotation_sync_request returns a snapshot to requester", async () => {
  const rows = [{ id: 1, room_id: 42, video_url: "video", content: "note" }];
  const socketHandler = loadSocketHandler({
    historyService: { addHistoryEntry: async () => ({}) },
    messageService: { create: async () => ({}) },
    annotationModel: {
      listByRoomAndVideoFiltered: async () => ({ rows })
    }
  });

  const io = new FakeIO();
  socketHandler(io);

  const socket = new FakeSocket("s-2", io);
  io.connect(socket);
  await socket.trigger("join_room", "42");

  await socket.trigger("annotation_sync_request", {
    roomId: "42",
    videoUrl: "video",
    limit: 100,
    offset: 0
  });

  const snapshot = socket.clientEmits.find((entry) => entry.event === "annotation_sync_snapshot");
  assert.ok(snapshot);
  assert.equal(snapshot.payload.roomId, "42");
  assert.equal(snapshot.payload.items.length, 1);
});

test("join_room with context triggers immediate annotation snapshot", async () => {
  const rows = [{ id: 9, room_id: 7, video_url: "v" }];
  const socketHandler = loadSocketHandler({
    historyService: { addHistoryEntry: async () => ({}) },
    messageService: { create: async () => ({}) },
    annotationModel: {
      listByRoomAndVideoFiltered: async () => ({ rows })
    }
  });

  const io = new FakeIO();
  socketHandler(io);

  const socket = new FakeSocket("s-3", io);
  io.connect(socket);

  await socket.trigger("join_room", { roomId: "7", videoUrl: "v", limit: 50 });
  await new Promise((resolve) => setImmediate(resolve));

  const snapshot = socket.clientEmits.find((entry) => entry.event === "annotation_sync_snapshot");
  assert.ok(snapshot);
  assert.equal(snapshot.payload.items[0].id, 9);
});
