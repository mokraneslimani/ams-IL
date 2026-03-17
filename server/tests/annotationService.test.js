const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

const servicePath = path.resolve(__dirname, "../services/annotationService.js");
const annotationModelPath = path.resolve(__dirname, "../models/annotationModel.js");
const roomServicePath = path.resolve(__dirname, "../services/roomService.js");

function injectModule(modulePath, exportsObject) {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports: exportsObject
  };
}

function loadService({ annotationModel, roomService }) {
  delete require.cache[servicePath];
  injectModule(annotationModelPath, annotationModel);
  injectModule(roomServicePath, roomService);
  return require(servicePath);
}

test("create() returns recent duplicate instead of creating twice", async () => {
  const duplicateRow = {
    id: 11,
    room_id: 3,
    user_id: 8,
    video_url: "https://youtube.com/watch?v=abc",
    timecode_sec: "12.300",
    content: "important"
  };

  let createCalled = false;
  const service = loadService({
    annotationModel: {
      findRecentDuplicate: async () => ({ rows: [duplicateRow] }),
      create: async () => {
        createCalled = true;
        return { rows: [] };
      },
      getById: async () => ({ rows: [] })
    },
    roomService: {
      getRoomByIdWithAccess: async () => ({ id: 3, owner_id: 1 })
    }
  });

  const created = await service.create({
    roomId: 3,
    userId: 8,
    videoUrl: "https://youtube.com/watch?v=abc",
    timecodeSec: 12.3,
    content: "important"
  });

  assert.equal(createCalled, false);
  assert.equal(created.id, 11);
});

test("delete() forbids deletion for non-owner and non-author", async () => {
  const service = loadService({
    annotationModel: {
      getById: async () => ({ rows: [{ id: 6, room_id: 2, user_id: 10 }] }),
      deleteByIdInRoom: async () => ({ rows: [] })
    },
    roomService: {
      getRoomByIdWithAccess: async () => ({ id: 2, owner_id: 1 })
    }
  });

  await assert.rejects(
    () => service.delete({ roomId: 2, annotationId: 6, userId: 9 }),
    (err) => {
      assert.equal(err.status, 403);
      return true;
    }
  );
});

test("update() allows author update and returns hydrated row", async () => {
  let updateCalled = false;
  const afterUpdate = {
    id: 15,
    room_id: 4,
    user_id: 12,
    content: "updated",
    timecode_sec: "55.000"
  };

  const service = loadService({
    annotationModel: {
      getById: async () => ({ rows: [afterUpdate] }),
      updateByIdInRoom: async () => {
        updateCalled = true;
        return { rows: [afterUpdate] };
      },
      deleteByIdInRoom: async () => ({ rows: [] }),
      findRecentDuplicate: async () => ({ rows: [] }),
      create: async () => ({ rows: [] })
    },
    roomService: {
      getRoomByIdWithAccess: async () => ({ id: 4, owner_id: 1 })
    }
  });

  const updated = await service.update({
    roomId: 4,
    annotationId: 15,
    userId: 12,
    content: "updated",
    timecodeSec: 55
  });

  assert.equal(updateCalled, true);
  assert.equal(updated.id, 15);
  assert.equal(updated.content, "updated");
});

test("listByRoomAndVideo() rejects invalid time range", async () => {
  const service = loadService({
    annotationModel: {
      listByRoomAndVideoFiltered: async () => ({ rows: [] })
    },
    roomService: {
      getRoomByIdWithAccess: async () => ({ id: 4, owner_id: 1 })
    }
  });

  await assert.rejects(
    () =>
      service.listByRoomAndVideo({
        roomId: 4,
        userId: 12,
        videoUrl: "https://youtube.com/watch?v=test",
        fromSec: 50,
        toSec: 10
      }),
    (err) => {
      assert.equal(err.status, 400);
      return true;
    }
  );
});
