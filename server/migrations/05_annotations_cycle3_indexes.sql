-- Cycle 3: performance indexes for annotation-heavy rooms.
-- Safe to run multiple times.

CREATE INDEX IF NOT EXISTS idx_annotations_room_video_time_id
  ON annotations(room_id, video_url, timecode_sec, id);

CREATE INDEX IF NOT EXISTS idx_annotations_room_user_created
  ON annotations(room_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annotations_room_video_created
  ON annotations(room_id, video_url, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_annotations_room_video_id
  ON annotations(room_id, video_url, id);
