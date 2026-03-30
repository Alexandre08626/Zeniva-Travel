"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface LinaWidgetProps {
  agencyId: string;
  agencyName: string;
  primaryColor: string;
  secondaryColor: string;
  greeting: string;
  preview?: boolean;
}

export default function LinaWidget({
  agencyId,
  agencyName,
  primaryColor,
  secondaryColor,
  greeting,
  preview = false,
}: LinaWidgetProps) {
  const [isOpen, setIsOpen] = useState(preview);
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", text: greeting, sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/lina", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-agency-id": agencyId,
        },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: data.reply || data.message || "Desole, une erreur est survenue.",
          sender: "bot",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Erreur de connexion. Veuillez reessayer.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const containerClass = preview
    ? "relative w-full max-w-sm border rounded-2xl overflow-hidden shadow-lg"
    : "fixed bottom-24 right-6 w-[380px] max-h-[520px] rounded-2xl shadow-2xl z-[999999]";

  return (
    <>
      {/* Toggle button - hidden in preview */}
      {!preview && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white text-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-[999999]"
          style={{ backgroundColor: primaryColor }}
        >
          ✈
        </button>
      )}

      {(isOpen || preview) && (
        <div className={containerClass} style={{ backgroundColor: "#fff" }}>
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            <span>Lina &mdash; {agencyName}</span>
            {!preview && (
              <button
                onClick={() => setIsOpen(false)}
                className="text-white text-xl leading-none hover:opacity-80"
              >
                &times;
              </button>
            )}
          </div>

          {/* Messages */}
          <div
            className="flex flex-col gap-2.5 p-4 overflow-y-auto"
            style={{
              backgroundColor: secondaryColor,
              minHeight: preview ? 220 : 260,
              maxHeight: preview ? 300 : 360,
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                  msg.sender === "bot"
                    ? "self-start bg-white border border-gray-200"
                    : "self-end text-white"
                }`}
                style={
                  msg.sender === "user"
                    ? { backgroundColor: primaryColor }
                    : undefined
                }
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="self-start flex gap-1 px-3.5 py-2.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-end gap-2 p-3 border-t border-gray-200">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ecrivez votre message..."
              className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-teal-600"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="text-white text-sm px-3.5 py-2 rounded-lg whitespace-nowrap disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              Envoyer
            </button>
          </div>

          {/* Badge */}
          <div className="text-center py-1.5 text-[11px] text-gray-400">
            <a
              href="https://zeniva.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:underline"
            >
              Propulse par Zeniva
            </a>
          </div>
        </div>
      )}
    </>
  );
}
