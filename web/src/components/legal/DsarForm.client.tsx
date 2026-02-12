"use client";

import React, { useMemo, useState } from "react";
import { LEGAL_EMAIL } from "./legal-constants";

type RequestType = "access" | "delete" | "correct" | "portability";

type FormState = {
  name: string;
  email: string;
  requestType: RequestType;
  message: string;
};

const sanitizeText = (value: string) =>
  value.replace(/[<>]/g, "").replace(/[\r\n\t]+/g, " ").trim();

export default function DsarForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    requestType: "access",
    message: "",
  });
  const [status, setStatus] = useState<string>("");

  const mailtoLink = useMemo(() => {
    const subject = `Data request - ${form.requestType}`;
    const body = `Name: ${sanitizeText(form.name)}\nEmail: ${sanitizeText(
      form.email
    )}\nRequest type: ${form.requestType}\nMessage: ${sanitizeText(form.message)}`;
    return `mailto:${LEGAL_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  }, [form.email, form.message, form.name, form.requestType]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");

    const payload = {
      name: sanitizeText(form.name),
      email: sanitizeText(form.email),
      requestType: form.requestType,
      message: sanitizeText(form.message),
      source: "web",
    };

    try {
      const response = await fetch("/api/dsar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("Thanks. Your request was submitted. We will respond within 30 days.");
    } catch {
      setStatus(
        "We could not submit the form automatically. Please use the email link below."
      );
    }
  };

  return (
    <div className="legal-form-wrapper">
      <form className="legal-form" onSubmit={handleSubmit}>
        <label className="legal-field">
          Full name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="legal-input"
            autoComplete="name"
          />
        </label>
        <label className="legal-field">
          Email address
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="legal-input"
            autoComplete="email"
          />
        </label>
        <label className="legal-field">
          Request type
          <select
            name="requestType"
            value={form.requestType}
            onChange={handleChange}
            className="legal-input"
          >
            <option value="access">Access</option>
            <option value="delete">Delete</option>
            <option value="correct">Correct</option>
            <option value="portability">Portability</option>
          </select>
        </label>
        <label className="legal-field legal-field-full">
          Message
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            className="legal-input"
            placeholder="Add details to help us locate your information."
          />
        </label>
        <div className="legal-form-actions">
          <button type="submit" className="legal-button primary">
            Submit request
          </button>
          <a className="legal-button tertiary" href={mailtoLink}>
            Email instead
          </a>
        </div>
      </form>
      {status && (
        <p className="legal-status" aria-live="polite">
          {status}
        </p>
      )}
      <div className="legal-fallback">
        <strong>Email fallback:</strong> <a href={mailtoLink}>{LEGAL_EMAIL}</a>
      </div>
    </div>
  );
}
