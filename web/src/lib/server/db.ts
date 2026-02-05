import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let schemaReady = false;

const REQUIRED_BACKEND_ENV = ["NEXTAUTH_URL", "NEXTAUTH_SECRET"];

function looksLikePlaceholder(value: string) {
  const lowered = value.toLowerCase();
  return (
    value.includes("<") ||
    value.includes(">") ||
    lowered.includes("user:password") ||
    lowered.includes("host") ||
    lowered.includes("project-ref")
  );
}

function getDatabaseUrl() {
  const candidates = [
    { name: "DATABASE_URL", value: process.env.DATABASE_URL },
    { name: "POSTGRES_URL", value: process.env.POSTGRES_URL },
    { name: "POSTGRES_URL_NON_POOLING", value: process.env.POSTGRES_URL_NON_POOLING },
    { name: "POSTGRES_PRISMA_URL", value: process.env.POSTGRES_PRISMA_URL },
    { name: "POSTGRES_URL_NO_SSL", value: process.env.POSTGRES_URL_NO_SSL },
  ];

  for (const candidate of candidates) {
    const raw = (candidate.value || "").trim();
    if (!raw || looksLikePlaceholder(raw)) continue;
    const hasScheme = /^postgres(ql)?:\/\//i.test(raw);
    const normalized = hasScheme ? raw : `postgresql://${raw}`;
    try {
      // Validate early to avoid runtime "Invalid URL" in pg
      const parsed = new URL(normalized);
      console.info(`DB URL source: ${candidate.name}, host: ${parsed.host}`);
      return normalized;
    } catch {
      continue;
    }
  }

  const message = "Missing or invalid DATABASE_URL/POSTGRES_URL";
  console.error(message);
  throw new Error(message);
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
      password_hash text,
      partner_id text,
      partner_company jsonb,
      traveler_profile jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz
    );
  `);

  await pool.query("ALTER TABLE accounts ADD COLUMN IF NOT EXISTS password_hash text;");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS agent_requests (
      id text PRIMARY KEY,
      name text,
      email text NOT NULL,
      role text,
      status text NOT NULL,
      code text,
      note text,
      requested_at timestamptz DEFAULT now(),
      reviewed_at timestamptz,
      reviewed_by text,
      completed_at timestamptz
    );
  `);

  await pool.query("CREATE INDEX IF NOT EXISTS agent_requests_email_idx ON agent_requests (lower(email));");
  await pool.query("CREATE INDEX IF NOT EXISTS agent_requests_status_idx ON agent_requests (status);");

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