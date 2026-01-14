"use client";
import React, { useState } from "react";

export default function LinaFloatingButton() {
  const [showModal, setShowModal] = useState(false);

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
            <div style={{ padding: 20, borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Help Center</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer"
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: 20, height: 400, overflowY: "auto" }}>
              <p>Hello! Welcome to Zeniva Travel Help Center. How can I help you today?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left" }}>
                  Website issue
                </button>
                <button style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left" }}>
                  Booking issue
                </button>
                <button style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left" }}>
                  General question
                </button>
                <button style={{ padding: 10, background: "#f3f4f6", border: "none", borderRadius: 8, textAlign: "left" }}>
                  Request a human agent
                </button>
              </div>
              <div style={{ marginTop: 20 }}>
                <h3>Contact Information</h3>
                <p><strong>Zeniva Travel</strong></p>
                <p>123 Travel Street, Paradise City, PC 12345</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Email: info@zeniva.ca</p>
              </div>
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
