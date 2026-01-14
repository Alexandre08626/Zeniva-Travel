"use client";
import React from "react";

export default function LinaFloatingButton() {
  const handleClick = () => {
    window.location.href = "/help";
  };
  return (
    <button
      onClick={handleClick}
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
  );
}

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
