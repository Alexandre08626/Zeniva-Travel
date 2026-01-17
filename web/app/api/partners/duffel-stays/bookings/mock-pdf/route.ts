export async function GET(req: Request) {
  const url = new URL(req.url);
  const docId = url.searchParams.get("docId") || "unknown";
  const filename = `confirmation-${docId}.pdf`;

  // Small test PDF (base64) used as a placeholder for downloads.
  const pdfBase64 =
    "JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9MZW5ndGggNTc+PgpzdHJlYW0KQlQgICAgVGVzdCBQREYgY29udGVudAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDY3MyAwMDAwMCBuIAowMDAwMDAwMTg2IDAwMDAwIG4gCjAwMDAwMDAyNTkgMDAwMDAgbiAKMDAwMDAwMDM4MyAwMDAwMCBuIAp0cmFpbGVyCjw8L1Jvb3QgMSAwIFIvU2l6ZSA1Pj4Kc3RhcnR4cmVmCjQ0MQolJUVPRgo=";

  const buffer = Buffer.from(pdfBase64, "base64");

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
