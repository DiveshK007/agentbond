import Database from "better-sqlite3";
import { join } from "path";
import { homedir } from "os";
import { mkdirSync, existsSync } from "fs";

const DB_DIR =
  process.env.METADATA_STORE_DIR ??
  join(homedir(), ".config", "agentbond");

if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

const db: InstanceType<typeof Database> = new Database(join(DB_DIR, "agentbond.db"));

// WAL mode for concurrent reads + writes without blocking
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS job_descriptions (
    hash       TEXT    PRIMARY KEY,
    description TEXT   NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS job_results (
    hash       TEXT    PRIMARY KEY,
    result     TEXT    NOT NULL,
    job_index  INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

export default db;
