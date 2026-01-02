-- Add playlist items table
CREATE TABLE IF NOT EXISTS playlist_items (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title TEXT,
    video_url TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add archive flag to notifications
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
