import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let schemaReady = false;

const REQUIRED_BACKEND_ENV = ["NEXTAUTH_URL", "NEXTAUTH_SECRET"];

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!url) {
    const message = "Missing DATABASE_URL or POSTGRES_URL";
    console.error(message);
    throw new Error(message);
  }
  return url;
}

function shouldUseSsl(url: string) {
  return !url.includes("localhost") && !url.includes("127.0.0.1");
}

export function assertBackendEnv() {
  const missing = REQUIRED_BACKEND_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    const message = `Missing env: ${missing.join(", ")}`;
    console.error(message);
    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }
  }
}

export async function getPool() {
  if (!pool) {
    const url = getDatabaseUrl();
    pool = new Pool({
      connectionString: url,
      ssl: shouldUseSsl(url) ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

async function ensureSchema() {
  if (schemaReady) return;
  const pool = await getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL UNIQUE,
      role text,
      roles jsonb,
      divisions jsonb,
      status text,
      agent_level text,
      invite_code text,
      partner_id text,
      partner_company jsonb,
      traveler_profile jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS clients (
      id text PRIMARY KEY,
      name text NOT NULL,
      email text,
      owner_email text NOT NULL,
      phone text,
      origin text,
      assigned_agents jsonb,
      primary_division text,
      lead_source text,
      notes text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz
    );
  `);

  await pool.query("CREATE INDEX IF NOT EXISTS clients_email_idx ON clients (lower(email));");
  await pool.query("CREATE INDEX IF NOT EXISTS clients_phone_idx ON clients (phone);");

  schemaReady = true;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(text: string, params: any[] = []) {
  const pool = await getPool();
  await ensureSchema();
  return pool.query<T>(text, params);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}