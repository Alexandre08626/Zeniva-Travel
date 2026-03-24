"use client";
import { useState } from "react";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("info@zeniva.ca");
  const [type, setType] = useState<"email" | "sms">("email");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendTestEmail = async () => {
    setSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, message: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-24 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">📧 Email Test Center</h1>
          <p className="text-slate-500">Send test emails from Lina to verify templates</p>
        </div>

        {/* Test Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Email Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("email")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  type === "email"
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-3xl mb-2">📬</div>
                <div className="font-semibold text-slate-900 text-sm">Sofia - Email</div>
                <div className="text-xs text-slate-500 mt-1">Welcome email with 15% offer</div>
              </button>
              <button
                onClick={() => setType("sms")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  type === "sms"
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="text-3xl mb-2">📱</div>
                <div className="font-semibold text-slate-900 text-sm">Luna - SMS</div>
                <div className="text-xs text-slate-500 mt-1">SMS campaign preview email</div>
              </button>
            </div>
          </div>

          <button
            onClick={sendTestEmail}
            disabled={sending || !email}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {sending ? "Sending..." : "Send Test Email"}
          </button>

          {/* Result */}
          {result && (
            <div
              className={`p-4 rounded-xl border-2 ${
                result.success
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <div className="text-red-600 text-xl flex-shrink-0">❌</div>
                )}
                <div>
                  <div
                    className={`font-semibold text-sm mb-1 ${
                      result.success ? "text-emerald-900" : "text-red-900"
                    }`}
                  >
                    {result.success ? "Success!" : "Error"}
                  </div>
                  <div
                    className={`text-sm ${
                      result.success ? "text-emerald-700" : "text-red-700"
                    }`}
                  >
                    {result.message}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">📧 What's Included:</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span><strong>From:</strong> Lina - Zeniva Travel AI</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span><strong>Subject:</strong> Welcome email with exclusive 15% discount</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span><strong>Content:</strong> Personalized HTML email with branding</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span><strong>CTA:</strong> "Create Account & Save 15%" button</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">✓</span>
              <span><strong>Benefits:</strong> List of Zeniva features + AI assistance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
