"use client";
import { useState, useEffect } from "react";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../src/design/tokens";

type Message = {
  id: number;
  type: 'user' | 'bot';
  content: string;
  options?: { label: string; value: string }[];
};

const COMPANY_INFO = {
  name: "Zeniva Travel",
  address: "123 Travel Street, Paradise City, PC 12345",
  phone: "+1 (555) 123-4567",
  email: "info@zeniva.ca"
};

export default function HelpPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", reason: "" });

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: 1,
        type: "bot",
        content: "Hello! Welcome to Zeniva Travel Help Center. I'm here to assist you with any questions or issues. How can I help you today?",
        options: [
          { label: "Website issue", value: "website" },
          { label: "Booking issue", value: "booking" },
          { label: "General question", value: "general" },
          { label: "Request a human agent", value: "human" },
          { label: "Custom trip planning", value: "custom" }
        ]
      }
    ]);
  }, []);

  const handleOptionClick = (value: string) => {
    setMessages(prev => [...prev, { id: Date.now(), type: "user", content: value }]);
    
    if (value === "human" || value === "custom") {
      setShowForm(true);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: "bot",
        content: "Please fill out the form below to request a human agent. We'll get back to you soon!"
      }]);
    } else {
      // Handle other options
      const responses: Record<string, string> = {
        website: "I'm sorry you're experiencing a website issue. Can you please describe the problem?",
        booking: "For booking issues, please provide your booking reference number and describe the issue.",
        general: "Feel free to ask your general question!"
      };
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: "bot",
        content: responses[value]
      }]);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: "user", content: input }]);
    setInput("");
    // Simple echo for now
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: "bot",
        content: "Thank you for your message. A support agent will respond shortly."
      }]);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would send the form data to the backend or email
    console.log("Form submitted:", formData);
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: "bot",
      content: "Thank you! Your request has been submitted. We'll contact you at " + formData.email + " soon."
    }]);
    setShowForm(false);
    setFormData({ name: "", email: "", phone: "", reason: "" });
  };

  return (
    <main className="min-h-screen bg-gray-50">
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
          <section className="col-span-12 lg:col-span-3">
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

          <section className="col-span-12 lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-sm min-h-[400px]">
              <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p>{msg.content}</p>
                      {msg.options && (
                        <div className="mt-2 space-y-1">
                          {msg.options.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => handleOptionClick(opt.value)}
                              className="block w-full text-left p-2 bg-white text-blue-600 rounded border hover:bg-blue-50"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {showForm && (
                <form onSubmit={handleFormSubmit} className="space-y-3 p-4 bg-gray-50 rounded">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    placeholder="Reason for request"
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    required
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                  <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Submit Request
                  </button>
                </form>
              )}

              {!showForm && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded"
                  />
                  <button onClick={handleSend} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Send
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="col-span-12 lg:col-span-3">
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