"use client";
import React, { useState } from "react";

type Message = {
  id: number;
  type: 'user' | 'bot';
  content: string;
};

const COMPANY_INFO = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel',
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || '780 Lynnhaven Parkway, Virginia Beach, 23452',
  headquarters: process.env.NEXT_PUBLIC_BUSINESS_HEADQUARTERS || '8 The Green, Dover, Delaware',
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '757-940-7276',
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'info@zenivatravel.com'
};

export default function HelpCenterButton() {
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: `Hello! Welcome to ${COMPANY_INFO.name} Customer Support. I'm here to help you with any questions, issues, or assistance you need. How can I help you today?`
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", reason: "" });
  const [currentChat, setCurrentChat] = useState<'support' | 'lina' | null>(null);

  const handleOptionClick = (option: string) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: option }]);
    
    if (option === "Request a human agent" || option === "Request custom trip planning with a human agent") {
      setShowForm(true);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "Please fill out the form below to request assistance from our human support team. We'll get back to you soon!"
      }]);
    } else {
      setCurrentChat('support');
      const responses: Record<string, string> = {
        "Website issue": "I'm sorry you're experiencing a website issue. Can you please describe the problem in detail so we can assist you better?",
        "Booking issue": "For booking issues, please provide your booking reference number and describe the issue you're experiencing.",
        "General question": "Feel free to ask your general question! I'm here to help."
      };
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: responses[option] || "How can I assist you?"
      }]);

      // Create ticket for agent
      const ticketNumber = "HC-" + Date.now();
      const ticketData = {
        ticket: ticketNumber,
        title: "Help Center - " + option,
        messages: [
          { role: 'user', text: option, ts: new Date().toLocaleTimeString() },
          { role: 'bot', text: responses[option], ts: new Date().toLocaleTimeString() }
        ],
        status: 'open',
        created: new Date().toISOString()
      };

      const existingTickets = JSON.parse(localStorage.getItem('helpTickets') || '[]');
      existingTickets.push(ticketData);
      localStorage.setItem('helpTickets', JSON.stringify(existingTickets));

      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        type: 'bot',
        content: `Your support ticket has been created: ${ticketNumber}. A human agent will respond to you shortly.`
      }]);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: message }]);
    
    // Simulate support response
    setTimeout(() => {
      const response = "Thank you for your message. A human support agent will respond to you shortly. If you need immediate assistance, please call us at " + COMPANY_INFO.phone + ".";
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: response
      }]);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a special human agent request ticket
    const ticketNumber = "HUMAN-" + Date.now();
    const ticketData = {
      ticket: ticketNumber,
      title: "Human Agent Request - " + formData.name,
      messages: [
        { role: 'user', text: `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nReason: ${formData.reason}`, ts: new Date().toLocaleTimeString() },
        { role: 'system', text: 'Human agent request submitted. This will be routed to info@zenivatravel.com for immediate attention.', ts: new Date().toLocaleTimeString() }
      ],
      status: 'open',
      priority: 'high',
      contactInfo: formData,
      created: new Date().toISOString()
    };

    const existingTickets = JSON.parse(localStorage.getItem('helpTickets') || '[]');
    existingTickets.push(ticketData);
    localStorage.setItem('helpTickets', JSON.stringify(existingTickets));

    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      content: `Thank you ${formData.name}! Your request has been submitted and will be routed to our human support team at ${COMPANY_INFO.email}. We'll contact you at ${formData.email} within 24 hours. Your reference number is: ${ticketNumber}`
    }]);
    setShowForm(false);
    setFormData({ name: "", email: "", phone: "", reason: "" });
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Hello! Welcome to Zeniva Travel Customer Support. I'm here to help you with any questions, issues, or assistance you need. How can I help you today?"
      }
    ]);
    setShowForm(false);
    setCurrentChat(null);
  };

  return (
    <>
      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = "/chat/agent?channel=agent-alexandre&source=/documents";
          }
        }}
        className="help-float hidden sm:flex"
        style={{
          position: "fixed",
          bottom: 96,
          right: 24,
          zIndex: 1000,
          background: "#f8fafc",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          borderRadius: 999,
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)",
          padding: "12px 22px",
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: 0.3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 10px 24px rgba(15, 23, 42, 0.16)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 18px rgba(15, 23, 42, 0.12)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "translateY(1px)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        aria-label={`Help via ${COMPANY_INFO.name} chat`}
      >
        Help
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 12,
              width: "90%",
              maxWidth: 800,
              maxHeight: "80vh",
              overflow: "hidden",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: 20, borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{COMPANY_INFO.name} Support</h2>
              <div>
                <button onClick={resetChat} style={{ marginRight: 10, padding: "5px 10px", background: "#f3f4f6", border: "none", borderRadius: 4, cursor: "pointer" }}>
                  New Chat
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 24,
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div style={{ padding: 20, height: 400, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              {/* Company Info - Always Visible */}
              <div style={{ background: "#f0f9ff", border: "1px solid #e0f2fe", borderRadius: 8, padding: 15, marginBottom: 20 }}>
                <h4 style={{ margin: 0, marginBottom: 8, fontSize: 16, fontWeight: 600, color: "#1e40af" }}>Contact Zeniva Travel</h4>
                <div style={{ fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                  <p style={{ margin: 0, marginBottom: 4 }}><strong>Address:</strong> {COMPANY_INFO.address}</p>
                  <p style={{ margin: 0, marginBottom: 4 }}><strong>Headquarters:</strong> {COMPANY_INFO.headquarters}</p>
                  <p style={{ margin: 0, marginBottom: 4 }}><strong>Phone:</strong> {COMPANY_INFO.phone}</p>
                  <p style={{ margin: 0 }}><strong>Email:</strong> {COMPANY_INFO.email}</p>
                </div>
              </div>

              <div style={{ flex: 1, marginBottom: 20 }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ marginBottom: 10, textAlign: msg.type === 'user' ? 'right' : 'left' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: 10,
                      borderRadius: 8,
                      background: msg.type === 'user' ? '#3b82f6' : '#f3f4f6',
                      color: msg.type === 'user' ? 'white' : 'black',
                      maxWidth: '70%'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              {!showForm && messages.length === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button onClick={() => handleOptionClick("Website issue")} style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left", cursor: "pointer" }}>
                    Website issue
                  </button>
                  <button onClick={() => handleOptionClick("Booking issue")} style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left", cursor: "pointer" }}>
                    Booking issue
                  </button>
                  <button onClick={() => handleOptionClick("General question")} style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left", cursor: "pointer" }}>
                    General question
                  </button>
                  <button onClick={() => handleOptionClick("Request custom trip planning with a human agent")} style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left", cursor: "pointer" }}>
                    Request custom trip planning with a human agent
                  </button>
                  <button onClick={() => handleOptionClick("Request a human agent")} style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left", cursor: "pointer" }}>
                    Request a human agent
                  </button>
                </div>
              )}

              {showForm && (
                <form onSubmit={handleFormSubmit} style={{ padding: 20, background: "#f9fafb", borderRadius: 8 }}>
                  <h3>Request Human Support</h3>
                  <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 15 }}>Our human support team will contact you within 24 hours</p>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    style={{ width: "100%", padding: 8, marginBottom: 10, border: "1px solid #d1d5db", borderRadius: 4 }}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                    style={{ width: "100%", padding: 8, marginBottom: 10, border: "1px solid #d1d5db", borderRadius: 4 }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone (optional)"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    style={{ width: "100%", padding: 8, marginBottom: 10, border: "1px solid #d1d5db", borderRadius: 4 }}
                  />
                  <textarea
                    placeholder="Reason for request"
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    required
                    style={{ width: "100%", padding: 8, marginBottom: 10, border: "1px solid #d1d5db", borderRadius: 4, minHeight: 60 }}
                  />
                  <button type="submit" style={{ padding: 10, background: "#3b82f6", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
                    Submit Request
                  </button>
                </form>
              )}

              {!showForm && messages.length > 1 && (
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage((e.target as HTMLInputElement).value)}
                    style={{ flex: 1, padding: 10, border: "1px solid #d1d5db", borderRadius: 4 }}
                  />
                  <button onClick={() => handleSendMessage((document.querySelector('input[type="text"]') as HTMLInputElement)?.value || '')} style={{ padding: 10, background: "#3b82f6", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
                    Send
                  </button>
                </div>
              )}
            </div>
            <div style={{ padding: 20, borderTop: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#6b7280", textAlign: "center" }}>
                Need immediate help? Call us at <strong>{COMPANY_INFO.phone}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .help-float {
            bottom: 72px !important;
            right: 16px !important;
            padding: 12px 20px 12px 16px !important;
            font-size: 16px !important;
          }
          .help-float svg {
            width: 24px !important;
            height: 24px !important;
            margin-right: 8px !important;
          }
        }
      `}</style>
    </>
  );
}
