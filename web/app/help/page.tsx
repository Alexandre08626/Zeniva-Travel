"use client";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../src/design/tokens";

const faqs = [
  {
    question: "How do I book a trip?",
    answer: "You can book a trip by using our search tools or contacting our agents. We offer flights, hotels, transfers, and custom packages."
  },
  {
    question: "What destinations do you cover?",
    answer: "We cover destinations worldwide, with special expertise in Caribbean, Europe, and luxury travel experiences."
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach us at info@zeniva.ca or call +1 (555) 123-4567. Our support team is available 24/7."
  },
  {
    question: "Do you offer custom trip planning?",
    answer: "Yes! Our expert agents can create personalized itineraries based on your preferences and budget."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, bank transfers, and offer flexible payment plans for larger bookings."
  },
  {
    question: "Can I modify or cancel my booking?",
    answer: "Booking modifications and cancellations are subject to our terms and conditions. Please contact us for assistance."
  }
];

export default function HelpPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <a href="/" className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              ← Back to Zeniva
            </a>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              Help Center
            </div>
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: TITLE_TEXT }}>
            How can we help you?
          </h1>
          <p className="text-lg" style={{ color: MUTED_TEXT }}>
            Find answers to common questions or get in touch with our support team.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-6" style={{ color: TITLE_TEXT }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold mb-3" style={{ color: TITLE_TEXT }}>
                      {faq.question}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: MUTED_TEXT }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-4" style={{ color: TITLE_TEXT }}>
                Contact Support
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: TITLE_TEXT }}>Email</p>
                  <p className="text-sm" style={{ color: MUTED_TEXT }}>info@zeniva.ca</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: TITLE_TEXT }}>Phone</p>
                  <p className="text-sm" style={{ color: MUTED_TEXT }}>+1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: TITLE_TEXT }}>Address</p>
                  <p className="text-sm" style={{ color: MUTED_TEXT }}>
                    123 Travel Street<br />
                    Paradise City, PC 12345
                  </p>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold mb-4" style={{ color: TITLE_TEXT }}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <a
                  href="/agent"
                  className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow-md transition"
                  style={{ backgroundColor: PREMIUM_BLUE }}
                >
                  Agent Portal
                </a>
                <a
                  href="/chat"
                  className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold border shadow-sm hover:shadow-md transition"
                  style={{ color: TITLE_TEXT, borderColor: PREMIUM_BLUE }}
                >
                  Chat with Lina
                </a>
                <a
                  href="/call"
                  className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold border shadow-sm hover:shadow-md transition"
                  style={{ color: TITLE_TEXT, borderColor: ACCENT_GOLD }}
                >
                  Call Support
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}