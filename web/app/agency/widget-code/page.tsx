"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import LinaWidget from "../../../components/widget/LinaWidget";

const cmsInstructions: { name: string; steps: string[] }[] = [
  {
    name: "WordPress",
    steps: [
      "Go to Appearance > Theme Editor or use a plugin like Insert Headers and Footers.",
      "Paste the script snippet just before the closing </body> tag.",
      "Save changes and clear any caching plugins.",
    ],
  },
  {
    name: "Wix",
    steps: [
      "Go to Settings > Custom Code in your Wix dashboard.",
      "Click '+ Add Custom Code' and paste the script snippet.",
      "Set placement to 'Body - End' and apply to 'All pages'.",
    ],
  },
  {
    name: "Squarespace",
    steps: [
      "Go to Settings > Advanced > Code Injection.",
      "Paste the script snippet in the 'Footer' field.",
      "Click Save.",
    ],
  },
  {
    name: "Shopify",
    steps: [
      "Go to Online Store > Themes > Edit Code.",
      "Open the 'theme.liquid' file.",
      "Paste the script snippet just before the closing </body> tag and save.",
    ],
  },
];

export default function WidgetCodePage() {
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [secondaryColor, setSecondaryColor] = useState("#7c3aed");
  const [copied, setCopied] = useState(false);
  const [openCMS, setOpenCMS] = useState<string | null>(null);

  const snippet = `<script src="https://cdn.zentravel.ai/widget.js"
  data-agency-id="YOUR_AGENCY_ID"
  data-primary-color="${primaryColor}"
  data-secondary-color="${secondaryColor}"
  async>
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Widget Code</h1>
        <p className="mt-1 text-gray-500">Embed the Lina AI widget on your website</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Code & Settings */}
        <div className="space-y-6">
          {/* Script Snippet */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Embed Script</h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="p-6">
              <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">
                <code>{snippet}</code>
              </pre>
            </div>
          </div>

          {/* Color Customization */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Color Customization</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CMS Instructions */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">CMS Installation Instructions</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {cmsInstructions.map((cms) => (
                <div key={cms.name}>
                  <button
                    onClick={() => setOpenCMS(openCMS === cms.name ? null : cms.name)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">{cms.name}</span>
                    {openCMS === cms.name ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {openCMS === cms.name && (
                    <div className="px-6 pb-4">
                      <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
                        {cms.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Live Preview</h2>
          <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
            <LinaWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
