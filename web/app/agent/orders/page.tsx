"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../../src/lib/authStore";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../../src/design/tokens";

type Order = {
  id: string;
  client: string;
  product: string;
  details: string;
  salePrice: string;
  cost: string;
  margin: string;
  status: "Draft" | "Submitted" | "Approved" | "Invoiced" | "Paid";
  notes: string;
  createdAt: string;
  agent: string;
};

const mockOrders: Order[] = [
  { id: "ORD-001", client: "Dupuis Family", product: "Trip Package", details: "Cancun 7 nights, flights, hotel", salePrice: "$6200", cost: "$4800", margin: "$1400", status: "Paid", notes: "Priority client", createdAt: "2026-01-05", agent: "Alice" },
  { id: "ORD-002", client: "HQ Yacht", product: "Yacht Charter", details: "43ft Leopard, 1 week Miami", salePrice: "$18000", cost: "$15000", margin: "$3000", status: "Invoiced", notes: "Corporate event", createdAt: "2026-01-03", agent: "Marco" },
];

export default function OrdersPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [filter, setFilter] = useState("all");

  const filteredOrders = orders.filter(o => filter === "all" || o.status.toLowerCase() === filter);

  const onCreateOrder = () => {
    // TODO: navigate to create order form
    alert("Create Order - integrate with proposals");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-5 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Orders</p>
            <h1 className="text-3xl font-black text-slate-900">Purchase Orders</h1>
            <p className="text-sm text-slate-600">Manage orders submitted to HQ for invoicing and payment tracking.</p>
          </div>
          <button
            onClick={onCreateOrder}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Create Order
          </button>
        </div>

        <div className="flex gap-2">
          {["all", "draft", "submitted", "approved", "invoiced", "paid"].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded px-3 py-1 text-xs font-semibold ${filter === status ? "bg-blue-100 text-blue-800" : "bg-white text-slate-600"}`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredOrders.map(order => (
            <div key={order.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900">{order.client} - {order.product}</div>
                  <div className="text-sm text-slate-600">{order.details}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    Sale: {order.salePrice} | Cost: {order.cost} | Margin: {order.margin} | Agent: {order.agent} | {order.createdAt}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{order.notes}</div>
                </div>
                <div className={`rounded px-2 py-1 text-xs font-bold ${order.status === "Paid" ? "bg-green-100 text-green-800" : order.status === "Invoiced" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>
                  {order.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
