import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { Session, ChatMessage } from '../types/index.js';

// Pastikan direktori data ada
if (!fs.existsSync(config.dataDir)) {
  fs.mkdirSync(config.dataDir, { recursive: true });
}

const DB_PATH = path.join(config.dataDir, 'qwertybot.db');
export const db = new Database(DB_PATH);

// Konfigurasi performa tinggi & integritas relasi
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Inisialisasi skema tabel SQLite
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    owner_id TEXT,
    session_code TEXT UNIQUE,
    title TEXT,
    created_at INTEGER,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT,
    attachments TEXT,
    timestamp INTEGER,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS quotas (
    id TEXT PRIMARY KEY,
    identifier_type TEXT NOT NULL,
    is_logged_in INTEGER DEFAULT 0,
    used_count INTEGER DEFAULT 0,
    max_quota INTEGER NOT NULL,
    period_start INTEGER NOT NULL,
    reset_at INTEGER NOT NULL,
    exhausted_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_owner ON sessions(owner_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_code ON sessions(session_code);
  CREATE INDEX IF NOT EXISTS idx_sessions_updated ON sessions(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
  CREATE INDEX IF NOT EXISTS idx_quotas_reset ON quotas(reset_at);
`);

// Migrasi data otomatis dari sessions.json jika ada sesi lama
const migrateFromLegacyJson = () => {
  try {
    const legacyJsonPath = path.join(config.dataDir, 'sessions.json');
    const countRow = db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number };
    if (countRow.count === 0 && fs.existsSync(legacyJsonPath)) {
      console.log('[SQLite DB] Memigrasikan data sesi lama dari sessions.json...');
      const raw = fs.readFileSync(legacyJsonPath, 'utf-8');
      const list: Session[] = JSON.parse(raw);

      const insertSession = db.prepare(`
        INSERT INTO sessions (id, owner_id, session_code, title, created_at, updated_at)
        VALUES (@id, @owner_id, @session_code, @title, @created_at, @updated_at)
      `);

      const insertMessage = db.prepare(`
        INSERT INTO messages (id, session_id, role, content, attachments, timestamp)
        VALUES (@id, @session_id, @role, @content, @attachments, @timestamp)
      `);

      const transaction = db.transaction((sessions: Session[]) => {
        for (const s of sessions) {
          insertSession.run({
            id: s.id,
            owner_id: s.ownerId || null,
            session_code: s.sessionCode,
            title: s.title,
            created_at: s.createdAt,
            updated_at: s.updatedAt
          });

          for (const m of s.messages || []) {
            insertMessage.run({
              id: m.id,
              session_id: s.id,
              role: m.role,
              content: m.content || '',
              attachments: m.attachments ? JSON.stringify(m.attachments) : null,
              timestamp: m.timestamp
            });
          }
        }
      });

      transaction(list);
      console.log(`[SQLite DB] Berhasil memigrasikan ${list.length} sesi ke SQLite!`);
    }
  } catch (err) {
    console.error('[SQLite DB] Gagal migrasi sessions.json:', err);
  }
};

migrateFromLegacyJson();
