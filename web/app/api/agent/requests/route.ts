import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "agent-requests.json");

type AgentRequest = {
  id: string;
  createdAt: string;
  channelIds?: string[];
  message?: string;
  yachtName?: string;
  desiredDate?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  sourcePath?: string;
  propertyName?: string;
};

async function readRequests(): Promise<AgentRequest[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

async function writeRequests(requests: AgentRequest[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(requests, null, 2), "utf-8");
}

export async function GET() {
  try {
    const requests = await readRequests();
    return NextResponse.json({ data: requests });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to read requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const hasChatPayload = Boolean(body?.message && body?.sourcePath);
    const required = ["yachtName", "desiredDate", "fullName", "phone", "email", "sourcePath"];
    const missing = required.filter((k) => !body?.[k]);
    if (!hasChatPayload && missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const rawChannelIds = Array.isArray(body.channelIds) ? body.channelIds : [];
    const channelIds: string[] = rawChannelIds.length
      ? Array.from(
          new Set(
            rawChannelIds.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0)
          )
        )
      : ["hq"];

    const newRequest: AgentRequest = {
      id: body.id || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      createdAt: body.createdAt || new Date().toISOString(),
      channelIds,
      message: body.message || "New yacht request",
      yachtName: body.yachtName,
      desiredDate: body.desiredDate,
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      sourcePath: body.sourcePath,
      propertyName: body.propertyName,
    };

    const requests = await readRequests();
    requests.push(newRequest);
    await writeRequests(requests);

    return NextResponse.json({ data: newRequest }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save request" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    if (!channelId) {
      return NextResponse.json({ error: "Missing channelId" }, { status: 400 });
    }

    const requests = await readRequests();
    const filtered = requests.filter(
      (req) => !Array.isArray(req.channelIds) || !req.channelIds.includes(channelId)
    );
    await writeRequests(filtered);

    return NextResponse.json({ data: { removed: requests.length - filtered.length } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete requests" }, { status: 500 });
  }
}
