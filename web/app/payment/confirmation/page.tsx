"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ConfirmationContent() {
  const params = useSearchParams();
  const orderId = params.get("order_id") || params.get("orderId") || "";
  const transactionId = params.get("transactionId") || orderId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1B4D] to-[#0F6CF5] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-10 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#0B1B4D] mb-2">Payment Confirmed! ✈️</h1>
        <p className="text-gray-500 mb-6">
          Your booking is confirmed. Lina will send your travel documents to your email shortly.
        </p>

        {transactionId && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Order Reference</p>
            <p className="font-mono text-sm font-bold text-[#0B1B4D] break-all">{transactionId}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/chat"
            className="block w-full bg-[#0F6CF5] hover:bg-[#0B5FD8] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            💬 Chat with Lina
          </Link>
          <Link
            href="/"
            className="block w-full bg-slate-100 hover:bg-slate-200 text-[#0B1B4D] font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Questions? Email us at{" "}
          <a href="mailto:info@zeniva.ca" className="text-[#0F6CF5]">info@zeniva.ca</a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1B4D] flex items-center justify-center"><div className="text-white text-xl">Loading...</div></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
