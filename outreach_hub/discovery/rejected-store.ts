// SQLite store for rejected discovery candidates.
//
// File: outreach_hub/discovery/rejected.db  — NEVER ra.db.
// One table, append-only. Used to learn what the discovery agent is
// rejecting and why, without polluting the main prospects DB.

import Database from "better-sqlite3";
import path from "path";
import type { Candidate, ClassificationResult } from "./types";

const REJECTED_DB_PATH = path.join(__dirname, "rejected.db");

let cachedDb: Database.Database | null = null;
function getDb(): Database.Database {
  if (cachedDb) return cachedDb;
  const db = new Database(REJECTED_DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS rejected_candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      company TEXT NOT NULL,
      website TEXT,
      location TEXT,
      source TEXT,
      reason TEXT NOT NULL,
      operating_model TEXT,
      confidence REAL,
      firm_size_estimate INTEGER,
      classification_json TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_rejected_ts ON rejected_candidates(ts);
  `);
  cachedDb = db;
  return db;
}

export function recordRejection(
  c: Candidate,
  classification: ClassificationResult | null,
  reason: string,
): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO rejected_candidates
      (ts, company, website, location, source, reason, operating_model, confidence, firm_size_estimate, classification_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    new Date().toISOString(),
    c.company,
    c.website ?? null,
    c.location ?? null,
    c.source,
    reason,
    classification?.operating_model ?? null,
    classification?.confidence ?? null,
    classification?.firm_size_estimate ?? null,
    classification ? JSON.stringify(classification) : null,
  );
}

export const REJECTED_DB_PATH_FOR_REPORT = REJECTED_DB_PATH;
