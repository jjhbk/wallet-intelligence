import { existsSync, readFileSync } from "node:fs";
import pg from "pg";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Add it to .env.local before running db:migrate.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: process.env.DATABASE_URL.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
});

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS x402_receipts (
      id TEXT PRIMARY KEY,
      resource TEXT NOT NULL,
      payer TEXT,
      amount TEXT,
      network TEXT,
      transaction_hash TEXT,
      receipt JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS x402_receipts_created_at_idx ON x402_receipts (created_at DESC);
    CREATE INDEX IF NOT EXISTS x402_receipts_payer_idx ON x402_receipts (payer);
  `);
  console.log("Database migration complete: x402_receipts is ready.");
} finally {
  await pool.end();
}
