"use client";

import { useState } from "react";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [form, setForm] = useState({
    agencyName: "",
    website: "",
    contactEmail: "",
    phone: "",
    primaryColor: "#0f766e",
    secondaryColor: "#7c3aed",
    suppliers: "",
    greeting: "Hello! I'm Lina, your AI travel assistant. How can I help you plan your next trip?",
  });
  const [saved, setSaved] = useState(false);

  const update = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    setSaved(false);
  };

  const handleSave = () => {
    // In production, POST to /api/agency/settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-500">Configure your agency profile and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
          {/* Agency Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name</label>
            <input
              type="text"
              value={form.agencyName}
              onChange={(e) => update("agencyName", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Your Travel Agency"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="https://youragency.com"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="contact@youragency.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => update("secondaryColor", e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => update("secondaryColor", e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Suppliers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suppliers</label>
            <textarea
              value={form.suppliers}
              onChange={(e) => update("suppliers", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="List your preferred suppliers, one per line (e.g., Transat, Air Canada Vacations, G Adventures...)"
            />
          </div>

          {/* Lina Greeting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lina Greeting</label>
            <textarea
              value={form.greeting}
              onChange={(e) => update("greeting", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              placeholder="Enter the greeting message Lina will use when a visitor opens the widget..."
            />
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">Settings saved successfully!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
