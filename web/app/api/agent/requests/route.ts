import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "agent-requests.json");

async function readRequests() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch (err: any) {
    if (err?.code === "ENOENT") return [];
    throw err;
  }
}

async function writeRequests(requests: any[]) {
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
    const required = ["yachtName", "desiredDate", "fullName", "phone", "email", "sourcePath"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length) {
      return NextResponse.json({ error: `Missing fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const channelIds = Array.isArray(body.channelIds) && body.channelIds.length
      ? Array.from(new Set(body.channelIds))
      : ["hq"];

    const newRequest = {
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
    };

    const requests = await readRequests();
    requests.push(newRequest);
    await writeRequests(requests);

    return NextResponse.json({ data: newRequest }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save request" }, { status: 500 });
  }
}
