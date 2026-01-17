import BookingConfirmation from "../../../../src/components/stays/BookingConfirmation";

async function getLastBooking(searchParams?: { docId?: string }) {
  try {
    const base = process.env.BASE_URL || "http://localhost:3000";
    const qs = searchParams?.docId ? `?docId=${encodeURIComponent(searchParams.docId)}` : '';
    const res = await fetch(`${base}/api/test/duffel-stays/last-booking${qs}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.booking || null;
  } catch (e) {
    return null;
  }
}

export default async function Page({ searchParams }:{ searchParams?: { docId?: string } }) {
  const booking = await getLastBooking(searchParams);
  const businessInfo = {
    name: process.env.BUSINESS_NAME || process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel',
    address: process.env.BUSINESS_ADDRESS || process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'Montreal, QC',
    support_email: process.env.SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'contact@zeniva.ca',
    support_phone: process.env.SUPPORT_PHONE || process.env.NEXT_PUBLIC_SUPPORT_PHONE || '',
    terms_url: process.env.TERMS_URL || process.env.NEXT_PUBLIC_TERMS_URL || '#',
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <BookingConfirmation booking={booking} businessInfo={businessInfo} />
      </div>
    </main>
  );
}
