import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const docId = url.searchParams.get('docId') || 'unknown';

  // Redirect to a static placeholder PDF to ensure the download works reliably
  const redirectUrl = `/test-confirmation.pdf`;
  return NextResponse.redirect(redirectUrl);
}
