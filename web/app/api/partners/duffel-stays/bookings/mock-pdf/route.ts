import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const docId = url.searchParams.get('docId') || 'unknown';

  const filename = `confirmation-${docId}.pdf`;
  const body = Buffer.from(`%PDF-FAKE\nThis is a placeholder PDF for docId: ${docId}\n`, 'utf-8');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(body.length),
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
