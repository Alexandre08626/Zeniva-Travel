import { NextRequest } from "next/server";

const FILES: Record<string, string> = {
  "tiktokT6qzksZRDhq8epwtEK902HQOgOKb0ffn.txt": "tiktok-developers-site-verification=T6qzksZRDhq8epwtEK902HQOgOKb0ffn",
  "tiktoky9rJttREqSiVX7eEdqRtUX1QH98JhMd5.txt": "tiktok-developers-site-verification=y9rJttREqSiVX7eEdqRtUX1QH98JhMd5",
};

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get("file") || "";
  const content = FILES[file];
  if (!content) return new Response("Not found", { status: 404 });
  return new Response(content, { headers: { "Content-Type": "text/plain" } });
}
