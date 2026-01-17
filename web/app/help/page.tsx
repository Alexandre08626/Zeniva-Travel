import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../src/design/tokens";

const COMPANY_INFO = {
  name: process.env.BUSINESS_NAME || process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel',
  address: process.env.BUSINESS_ADDRESS || process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '123 Travel Street, Paradise City, PC 12345',
  phone: process.env.SUPPORT_PHONE || process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+1 (555) 123-4567',
  email: process.env.SUPPORT_EMAIL || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'info@zeniva.ca'
};

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              ← Back to Zeniva
            </a>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              Help Center
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4" style={{ color: TITLE_TEXT }}>Contact Information</h3>
              <div className="space-y-2 text-sm" style={{ color: MUTED_TEXT }}>
                <p><strong>{COMPANY_INFO.name}</strong></p>
                <p>{COMPANY_INFO.address}</p>
                <p>Phone: {COMPANY_INFO.phone}</p>
                <p>Email: {COMPANY_INFO.email}</p>
              </div>
            </div>
          </section>

          <section className="col-span-12 lg:col-span-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-4" style={{ color: TITLE_TEXT }}>Support Options</h3>
              <ul className="space-y-2 text-sm" style={{ color: MUTED_TEXT }}>
                <li>• Website issues</li>
                <li>• Booking assistance</li>
                <li>• General inquiries</li>
                <li>• Human agent requests</li>
                <li>• Custom trip planning</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}