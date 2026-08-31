let initialized: Promise<void> | undefined;

export async function persistReceipt(receipt: unknown) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL is not configured; x402 receipt was not persisted.");
    return;
  }
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({ connectionString, max: 2, ssl: connectionString.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined });
  initialized ??= pool.query(`CREATE TABLE IF NOT EXISTS x402_receipts (id TEXT PRIMARY KEY, resource TEXT NOT NULL, payer TEXT, amount TEXT, network TEXT, transaction_hash TEXT, receipt JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`).then(() => undefined);
  await initialized;
  const value = receipt as { id?: string; resource?: string; payer?: string; amount?: string; network?: string; transaction?: string };
  await pool.query(`INSERT INTO x402_receipts (id, resource, payer, amount, network, transaction_hash, receipt) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`, [value.id ?? crypto.randomUUID(), value.resource ?? "", value.payer ?? null, value.amount ?? null, value.network ?? null, value.transaction ?? null, receipt]);
  await pool.end();
}
