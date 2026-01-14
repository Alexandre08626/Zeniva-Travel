"use client";
import React, { useState } from "react";

type Message = {
  id: number;
  type: 'user' | 'bot';
  content: string;
};

const COMPANY_INFO = {
  name: "Zeniva Travel",
  address: "8 THE GREEN STE A, Dover, Delaware",
  headquarters: "780 Lynnhaven Parkway, Virginia Beach, 23452",
  phone: "757-940-7276",
  email: "info@zeniva.ca"
};

export default function LinaFloatingButton() {
  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content: "Hello! Welcome to Zeniva Travel Help Center. I'm here to assist you with any questions or issues. How can I help you today?"
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", reason: "" });
  const [currentChat, setCurrentChat] = useState<'support' | 'lina' | null>(null);

  const handleOptionClick = (option: string) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: option }]);
    
    if (option === "Request a human agent") {
      setShowForm(true);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "Please fill out the form below to request a human agent. We'll get back to you soon!"
      }]);
    } else if (option === "Chat with Lina AI") {
      setCurrentChat('lina');
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: "Switching to Lina AI, your travel planning assistant..."
      }]);
      // Simulate Lina response
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          type: 'bot',
          content: "Hi! I'm Lina, your AI travel concierge. How can I help you plan your perfect trip?"
        }]);
      }, 1000);
    } else {
      setCurrentChat('support');
      const responses: Record<string, string> = {
        "Website issue": "I'm sorry you're experiencing a website issue. Can you please describe the problem in detail?",
        "Booking issue": "For booking issues, please provide your booking reference number and describe the issue.",
        "General question": "Feel free to ask your general question!"
      };
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: responses[option] || "How can I assist you?"
      }]);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: message }]);
    
    // Simulate response
    setTimeout(() => {
      let response = "Thank you for your message. ";
      if (currentChat === 'lina') {
        response += "I'm Lina, processing your travel request...";
      } else {
        response += "A support agent will respond shortly.";
      }
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: response
      }]);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'bot',
      content: "Thank you! Your request has been submitted. We'll contact you at " + formData.email + " soon."
    }]);
    setShowForm(false);
    setFormData({ name: "", email: "", phone: "", reason: "" });
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: "Hello! Welcome to Zeniva Travel Help Center. I'm here to assist you with any questions or issues. How can I help you today?"
      }
    ]);
    setShowForm(false);
    setCurrentChat(null);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="help-float"
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          background: "#181f36",
          color: "#fff",
          border: "none",
          borderRadius: 999,
          boxShadow: "0 4px 24px rgba(24,31,54,0.18)",
          padding: "14px 28px 14px 18px",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: 1,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer"
        }}
        aria-label="Open Help Center"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 10 }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Help Center
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
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Help Center</h2>
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
                  <button onClick={() => handleOptionClick("Chat with Lina AI")} style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left", cursor: "pointer" }}>
                    Chat with Lina AI
                  </button>
                  <button onClick={() => handleOptionClick("Request a human agent")} style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left", cursor: "pointer" }}>
                    Request a human agent
                  </button>
                </div>
              )}

              {showForm && (
                <form onSubmit={handleFormSubmit} style={{ padding: 20, background: "#f9fafb", borderRadius: 8 }}>
                  <h3>Request Human Agent</h3>
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
              <h4>Contact Information</h4>
              <p><strong>{COMPANY_INFO.name}</strong></p>
              <p>Address: {COMPANY_INFO.address}</p>
              <p>Headquarters: {COMPANY_INFO.headquarters}</p>
              <p>Phone: {COMPANY_INFO.phone}</p>
              <p>Email: {COMPANY_INFO.email}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .help-float {
            bottom: 20px !important;
            right: 20px !important;
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
