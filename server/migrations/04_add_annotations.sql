CREATE TABLE IF NOT EXISTS annotations (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    timecode_sec NUMERIC(10,3) NOT NULL CHECK (timecode_sec >= 0),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annotations_room_video_time
    ON annotations(room_id, video_url, timecode_sec);

CREATE INDEX IF NOT EXISTS idx_annotations_room_created
    ON annotations(room_id, created_at);
