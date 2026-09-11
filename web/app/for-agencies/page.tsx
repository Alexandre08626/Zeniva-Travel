"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { installationPlans, formatCAD, agencyMonthlyTotal, AGENCY_MONTHLY_PRICE, ADDITIONAL_ADVISOR_MONTHLY_PRICE } from "@/src/lib/agency-pricing";

/* ─── Data ──────────────────────────────────────────────────────────── */

const aiAgents = [
  { name: "Lina", image: "/agents/lina.png", role: "AI Travel Concierge", desc: "Responds to visitors 24/7, creates itineraries, captures leads", tier: "Agency + Agents", gradient: "from-teal-500 to-cyan-500" },
  { name: "Sofia", image: "/agents/sofia.png", role: "Operations Agent", desc: "Booking follow-ups, confirmations, documents, reminders", tier: "Agency + Agents", gradient: "from-violet-500 to-purple-500" },
  { name: "Luna", image: "/agents/luna.png", role: "Client Relationship", desc: "Post-trip follow-ups, personalized suggestions, re-engagement", tier: "Agency + Agents", gradient: "from-pink-500 to-rose-500" },
  { name: "Rex", image: "/agents/rex.png", role: "Research & Intelligence", desc: "Destination trends, price comparisons, data feeds", tier: "Agency + Agents", gradient: "from-amber-500 to-orange-500" },
  { name: "Ben", image: "/agents/kai.png", role: "Finance Agent", desc: "Invoicing, commission tracking, payment reconciliation", tier: "Agency Only", gradient: "from-emerald-500 to-green-500" },
  { name: "Atlas", image: "/agents/leo.png", role: "Analytics Agent", desc: "Performance dashboards, conversion tracking, revenue forecasting", tier: "Agency Only", gradient: "from-blue-500 to-indigo-500" },
  { name: "Mia", image: "/agents/mia.png", role: "Marketing Agent", desc: "Email campaigns, social content, promotional materials", tier: "Agency Only", gradient: "from-fuchsia-500 to-pink-500" },
  { name: "Jade", image: "/agents/jade.png", role: "Document Agent", desc: "Contract generation, insurance tracking, travel document prep", tier: "Agency Only", gradient: "from-sky-500 to-blue-500" },
];

const toolkitItems = [
  "Personal AI assistant", "Full booking management", "Travel CRM",
  "Proposal generator with payment links", "Lead capture", "Commission tracking",
  "Document management", "Messaging system", "Calendar & pipeline", "Push notifications",
];

const ownershipCards = [
  { title: "Your suppliers stay yours", desc: "Lina only recommends the suppliers you choose. Your relationships, your commissions." },
  { title: "Your brand stays yours", desc: "The widget matches your colors, your logo, your voice. Clients see you, not us." },
  { title: "Your margins stay yours", desc: "Set your own markups and margins. We never touch your pricing strategy." },
  { title: "Your agents stay yours", desc: "Your human agents stay in control. AI assists them, never replaces them." },
];

const howItWorks = [
  { step: "1", title: "Choisissez votre installation", desc: "Trois forfaits selon vos besoins. Les connexions métier sont validées avant la soumission." },
  { step: "2", title: "Nous configurons votre agence", desc: "Personnalisation, configuration des fonctions convenues et formation de votre équipe." },
  { step: "3", title: "Un abonnement clair", desc: "599 $ CA par mois pour l’agence, un conseiller inclus. Chaque conseiller supplémentaire : 49 $ CA par mois." },
];

/* ─── Onboarding Modal ──────────────────────────────────────────────── */

const SPECIALTIES = [
  "Sun / Beach Packages", "Europe", "Cruises", "Group Travel", "Corporate / Business",
  "Adventure / Eco", "Luxury", "Honeymoons / Weddings", "Family", "Ski / Sports",
  "Domestic Canada", "Asia / Pacific", "Africa", "Latin America",
];

const CHALLENGES = [
  "Lead capture / conversion", "After-hours availability", "Administrative workload",
  "Client follow-up", "Marketing / Social media", "Invoicing / Payments",
  "Commission tracking", "Document management", "Competing with OTAs",
];

function CheckboxGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all ${selected.includes(opt) ? "border-teal-500 bg-teal-50 text-teal-700" : "border-gray-200 bg-gray-50 text-gray-600 hover:border-teal-300"}`}>
          <input type="checkbox" className="accent-teal-600 w-3.5 h-3.5" checked={selected.includes(opt)} onChange={() => onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])} />
          {opt}
        </label>
      ))}
    </div>
  );
}

const initialForm = {
  selectedPlan: "essential",
  legalName: "", tradeName: "", opcPermit: "", yearEstablished: "", address: "", website: "", locations: "",
  primaryName: "", primaryTitle: "", primaryEmail: "", primaryPhone: "",
  preferredComm: [] as string[],
  techName: "", techEmail: "",
  websitePlatform: [] as string[],
  billingName: "", billingEmail: "",
  totalAdvisors: "", advisorList: "",
  workStyle: [] as string[],
  suppliers: "",
  gds: [] as string[],
  bookingPlatform: [] as string[],
  specialties: [] as string[],
  exclusiveRates: "", monthlyBookings: "",
  logoOption: [] as string[],
  primaryColor: "", secondaryColor: "",
  brandTone: [] as string[],
  slogan: "", socialLinks: "",
  languages: [] as string[],
  defaultLanguage: "", welcomeMessage: "",
  weekdayHours: "", weekendHours: "",
  linaRestrictions: "", promotions: "",
  widgetPlacement: [] as string[],
  currentCRM: [] as string[],
  importClients: [] as string[],
  activeClients: "", accountingSystem: "",
  paymentMethods: [] as string[],
  appName: "",
  devAccounts: [] as string[],
  appIcon: [] as string[],
  mainReason: "",
  challenges: [] as string[],
  timeline: [] as string[],
  anythingElse: "",
};

type FormData = typeof initialForm;

function OnboardingModal({ open, onClose, defaultPlan }: { open: boolean; onClose: () => void; defaultPlan?: string }) {
  const [form, setForm] = useState<FormData>({ ...initialForm, selectedPlan: defaultPlan || "essential" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && defaultPlan) setForm((f) => ({ ...f, selectedPlan: defaultPlan }));
  }, [open, defaultPlan]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const set = (key: keyof FormData, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const setArr = (key: keyof FormData, val: string[]) => setForm((f) => ({ ...f, [key]: val }));

  const ic = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 bg-white";
  const ta = `${ic} min-h-[80px] resize-y`;
  const sectionCls = "bg-white rounded-2xl p-6 shadow-sm border border-gray-100";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  const handleSubmit = async () => {
    if (!form.legalName || !form.primaryName || !form.primaryEmail) {
      setError("Legal Business Name, Primary Contact Name and Email are required.");
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/leads-business/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "agency_onboarding",
          plan: form.selectedPlan,
          contact_name: form.primaryName,
          contact_email: form.primaryEmail,
          contact_phone: form.primaryPhone,
          company_name: form.legalName || form.tradeName,
          website: form.website,
          number_of_agents: parseInt(form.totalAdvisors) || 1,
          form_data: form,
        }),
      });
      if (res.ok) setSent(true);
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("Connection error. Please try again.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 max-w-md text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">&#10003;</div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">Application Submitted!</h3>
          <p className="mt-2 text-gray-600 text-sm">Our team will review your responses and begin configuring your platform. You will receive a confirmation email within 24 hours.</p>
          <button onClick={() => { setSent(false); setForm({ ...initialForm }); onClose(); }} className="mt-6 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-full h-full max-w-3xl mx-auto flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-violet-600 to-pink-600 px-6 py-6 text-white text-center shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-lg hover:bg-white/30">&times;</button>
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Zeniva Travel</p>
          <h2 className="text-2xl font-extrabold mt-1">Agency Onboarding Questionnaire</h2>
          <p className="text-sm text-white/80 mt-1 max-w-lg mx-auto">Complete this form so we can configure your platform perfectly.</p>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* Plan selection */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">$</div>
              <div><p className="font-bold text-gray-900">Forfait d’installation</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {installationPlans.map((p) => (
                <button key={p.key} type="button" onClick={() => set("selectedPlan", p.key)} className={`rounded-xl border-2 p-4 text-left transition-all ${form.selectedPlan === p.key ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className="font-bold text-sm text-gray-900">{p.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatCAD(p.price)} — paiement unique</p>
                </button>
              ))}
            </div>
          </div>

          <div lang="fr-CA" className={sectionCls}>
            <p className="font-bold text-gray-900">Votre abonnement : {formatCAD(agencyMonthlyTotal(Math.max(1, parseInt(form.totalAdvisors, 10) || 1)))} / mois</p>
            <p className="mt-2 text-sm text-gray-600">599 $ CA/mois pour l’agence, un conseiller inclus, puis 49 $ CA/mois par conseiller supplémentaire. Installation facturée une seule fois. Montants avant taxes.</p>
            <p className="mt-2 text-xs text-gray-500">Logiciels externes à la charge de l’agence. Volume d’IA et soutien définis au contrat. Le forfait Intégrée nécessite une validation technique; plusieurs connexions ou développements majeurs font l’objet d’une soumission particulière.</p>
          </div>

          {/* Section 1 - Agency Identity */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">1</div>
              <div><p className="font-bold text-gray-900">Agency Identity</p><p className="text-xs text-gray-400">Legal and business information</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className={labelCls}>Legal Business Name <span className="text-red-500">*</span></label><input className={ic} value={form.legalName} onChange={(e) => set("legalName", e.target.value)} placeholder="e.g. Voyages Terre et Monde Inc." /></div>
              <div><label className={labelCls}>Operating / Trade Name</label><input className={ic} value={form.tradeName} onChange={(e) => set("tradeName", e.target.value)} placeholder="If different from legal name" /></div>
              <div><label className={labelCls}>OPC Permit Number <span className="text-red-500">*</span></label><input className={ic} value={form.opcPermit} onChange={(e) => set("opcPermit", e.target.value)} placeholder="e.g. 702411" /></div>
              <div><label className={labelCls}>Year Established</label><input className={ic} value={form.yearEstablished} onChange={(e) => set("yearEstablished", e.target.value)} placeholder="e.g. 2005" /></div>
            </div>
            <div className="mt-4"><label className={labelCls}>Business Address <span className="text-red-500">*</span></label><input className={ic} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address including city, province, postal code" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div><label className={labelCls}>Website URL <span className="text-red-500">*</span></label><input className={ic} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://www.youragency.com" /></div>
              <div><label className={labelCls}>Number of Physical Locations</label><input className={ic} value={form.locations} onChange={(e) => set("locations", e.target.value)} placeholder="e.g. 3" /></div>
            </div>
          </div>

          {/* Section 2 - Key Contacts */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">2</div>
              <div><p className="font-bold text-gray-900">Key Contacts</p><p className="text-xs text-gray-400">Who should we work with during setup?</p></div>
            </div>
            {/* Primary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
              <p className="text-sm font-bold text-violet-600 mb-3">Primary Contact (Owner / Decision Maker)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Full Name <span className="text-red-500">*</span></label><input className={ic} value={form.primaryName} onChange={(e) => set("primaryName", e.target.value)} placeholder="First and last name" /></div>
                <div><label className={labelCls}>Title / Role <span className="text-red-500">*</span></label><input className={ic} value={form.primaryTitle} onChange={(e) => set("primaryTitle", e.target.value)} placeholder="e.g. Owner, President" /></div>
                <div><label className={labelCls}>Email <span className="text-red-500">*</span></label><input type="email" className={ic} value={form.primaryEmail} onChange={(e) => set("primaryEmail", e.target.value)} placeholder="name@agency.com" /></div>
                <div><label className={labelCls}>Phone <span className="text-red-500">*</span></label><input className={ic} value={form.primaryPhone} onChange={(e) => set("primaryPhone", e.target.value)} placeholder="+1 (418) 000-0000" /></div>
              </div>
              <div className="mt-3"><label className={labelCls}>Preferred Communication</label><CheckboxGroup options={["Email", "Phone", "WhatsApp", "Teams / Zoom", "Text / SMS"]} selected={form.preferredComm} onChange={(v) => setArr("preferredComm", v)} /></div>
            </div>
            {/* Technical */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
              <p className="text-sm font-bold text-violet-600 mb-3">Technical Contact (IT / Webmaster)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Full Name</label><input className={ic} value={form.techName} onChange={(e) => set("techName", e.target.value)} placeholder="Person who manages your website" /></div>
                <div><label className={labelCls}>Email</label><input type="email" className={ic} value={form.techEmail} onChange={(e) => set("techEmail", e.target.value)} placeholder="tech@agency.com" /></div>
              </div>
              <div className="mt-3"><label className={labelCls}>Website Platform</label><CheckboxGroup options={["WordPress", "Wix", "Squarespace", "Shopify", "Custom / Other", "I don't know"]} selected={form.websitePlatform} onChange={(v) => setArr("websitePlatform", v)} /></div>
            </div>
            {/* Billing */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm font-bold text-violet-600 mb-3">Billing Contact</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Full Name</label><input className={ic} value={form.billingName} onChange={(e) => set("billingName", e.target.value)} placeholder="If different from primary" /></div>
                <div><label className={labelCls}>Email</label><input type="email" className={ic} value={form.billingEmail} onChange={(e) => set("billingEmail", e.target.value)} placeholder="billing@agency.com" /></div>
              </div>
            </div>
          </div>

          {/* Section 3 - Team & Advisors */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">3</div>
              <div><p className="font-bold text-gray-900">Team & Advisors</p><p className="text-xs text-gray-400">Each advisor gets a personal dashboard with 4 AI agents</p></div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-800 mb-4">Un conseiller inclus dans les 599 $ CA/mois de l’agence. Chaque conseiller de voyage supplémentaire : 49 $ CA/mois. Aucun frais d’installation par conseiller.</div>
            <div><label className={labelCls}>Total Number of Advisors <span className="text-red-500">*</span></label><input className={ic} value={form.totalAdvisors} onChange={(e) => set("totalAdvisors", e.target.value)} placeholder="e.g. 8" /></div>
            <div className="mt-4"><label className={labelCls}>Advisor List <span className="text-red-500">*</span></label><textarea className={ta} value={form.advisorList} onChange={(e) => set("advisorList", e.target.value)} placeholder={"Advisor 1: Marie Tremblay \u2014 marie@agency.com\nAdvisor 2: Jean Dupont \u2014 jean@agency.com"} /></div>
            <div className="mt-4"><label className={labelCls}>Work Style</label><CheckboxGroup options={["In-office", "Remote / Home-based", "Hybrid"]} selected={form.workStyle} onChange={(v) => setArr("workStyle", v)} /></div>
          </div>

          {/* Section 4 - Suppliers & Products */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">4</div>
              <div><p className="font-bold text-gray-900">Suppliers & Products</p><p className="text-xs text-gray-400">Your suppliers stay yours</p></div>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-800 mb-4">We will NEVER contact your suppliers, modify your agreements, or access your supplier portals. This information is solely used to configure Lina.</div>
            <div><label className={labelCls}>Primary Tour Operators / Wholesalers <span className="text-red-500">*</span></label><textarea className={ta} value={form.suppliers} onChange={(e) => set("suppliers", e.target.value)} placeholder={"- Transat / Air Transat\n- Air Canada Vacations\n- Sunwing"} /></div>
            <div className="mt-4"><label className={labelCls}>GDS Systems</label><CheckboxGroup options={["Amadeus", "Sabre", "Travelport / Galileo", "None / Direct bookings only"]} selected={form.gds} onChange={(v) => setArr("gds", v)} /></div>
            <div className="mt-4"><label className={labelCls}>Booking Platform</label><CheckboxGroup options={["Sirev", "Travelport Smartpoint", "Amadeus Selling Platform", "Supplier websites directly", "Other"]} selected={form.bookingPlatform} onChange={(v) => setArr("bookingPlatform", v)} /></div>
            <div className="mt-4"><label className={labelCls}>Main Specialties <span className="text-red-500">*</span></label><CheckboxGroup options={SPECIALTIES} selected={form.specialties} onChange={(v) => setArr("specialties", v)} /></div>
            <div className="mt-4"><label className={labelCls}>Exclusive rates or contracts?</label><textarea className={ta} value={form.exclusiveRates} onChange={(e) => set("exclusiveRates", e.target.value)} placeholder="If yes, list the suppliers and arrangements" /></div>
            <div className="mt-4"><label className={labelCls}>Average Bookings Per Month</label><input className={ic} value={form.monthlyBookings} onChange={(e) => set("monthlyBookings", e.target.value)} placeholder="e.g. 50-80 bookings/month" /></div>
          </div>

          {/* Section 5 - Branding & Design */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">5</div>
              <div><p className="font-bold text-gray-900">Branding & Design</p><p className="text-xs text-gray-400">Clients see YOUR name, not ours</p></div>
            </div>
            <div><label className={labelCls}>Logo</label><CheckboxGroup options={["I will email my logo to info@zeniva.ca", "Available on my website"]} selected={form.logoOption} onChange={(v) => setArr("logoOption", v)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div><label className={labelCls}>Primary Brand Color <span className="text-red-500">*</span></label><input className={ic} value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} placeholder="e.g. #1A3B5C or 'dark blue'" /></div>
              <div><label className={labelCls}>Secondary Brand Color</label><input className={ic} value={form.secondaryColor} onChange={(e) => set("secondaryColor", e.target.value)} placeholder="e.g. #E8A41C or 'gold'" /></div>
            </div>
            <div className="mt-4"><label className={labelCls}>Brand Tone of Voice</label><CheckboxGroup options={["Professional / Formal", "Friendly / Warm", "Luxurious / Refined", "Fun / Casual", "Adventurous / Bold"]} selected={form.brandTone} onChange={(v) => setArr("brandTone", v)} /></div>
            <div className="mt-4"><label className={labelCls}>Agency Slogan / Tagline</label><input className={ic} value={form.slogan} onChange={(e) => set("slogan", e.target.value)} placeholder="e.g. 'Your journey begins with us'" /></div>
            <div className="mt-4"><label className={labelCls}>Social Media Links</label><textarea className={ta} value={form.socialLinks} onChange={(e) => set("socialLinks", e.target.value)} placeholder={"Facebook: https://facebook.com/youragency\nInstagram: https://instagram.com/youragency"} /></div>
          </div>

          {/* Section 6 - Lina AI Configuration */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">6</div>
              <div><p className="font-bold text-gray-900">Lina AI Configuration</p><p className="text-xs text-gray-400">Customize your AI concierge</p></div>
            </div>
            <div><label className={labelCls}>Languages Lina Should Speak <span className="text-red-500">*</span></label><CheckboxGroup options={["French", "English", "Spanish", "Other"]} selected={form.languages} onChange={(v) => setArr("languages", v)} /></div>
            <div className="mt-4"><label className={labelCls}>Default Language</label><input className={ic} value={form.defaultLanguage} onChange={(e) => set("defaultLanguage", e.target.value)} placeholder="e.g. French" /></div>
            <div className="mt-4"><label className={labelCls}>Welcome Message</label><textarea className={ta} value={form.welcomeMessage} onChange={(e) => set("welcomeMessage", e.target.value)} placeholder="What should Lina say when someone visits your site?" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div><label className={labelCls}>Business Hours (Weekdays)</label><input className={ic} value={form.weekdayHours} onChange={(e) => set("weekdayHours", e.target.value)} placeholder="e.g. 9:00 AM - 5:00 PM EST" /></div>
              <div><label className={labelCls}>Business Hours (Weekends)</label><input className={ic} value={form.weekendHours} onChange={(e) => set("weekendHours", e.target.value)} placeholder="e.g. Closed" /></div>
            </div>
            <div className="mt-4"><label className={labelCls}>What should Lina NOT do?</label><textarea className={ta} value={form.linaRestrictions} onChange={(e) => set("linaRestrictions", e.target.value)} placeholder={"- Never quote prices\n- Never recommend competitors\n- Don't discuss insurance"} /></div>
            <div className="mt-4"><label className={labelCls}>Current Promotions</label><textarea className={ta} value={form.promotions} onChange={(e) => set("promotions", e.target.value)} placeholder="Lina can proactively suggest these to visitors" /></div>
            <div className="mt-4"><label className={labelCls}>Widget Placement <span className="text-red-500">*</span></label><CheckboxGroup options={["All pages", "Homepage only", "Specific pages"]} selected={form.widgetPlacement} onChange={(v) => setArr("widgetPlacement", v)} /></div>
          </div>

          {/* Section 7 - Current Tools & Data */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">7</div>
              <div><p className="font-bold text-gray-900">Current Tools & Data Migration</p><p className="text-xs text-gray-400">What you are currently using</p></div>
            </div>
            <div><label className={labelCls}>Current CRM</label><CheckboxGroup options={["Clientbase / Trams", "Salesforce", "HubSpot", "Excel / Spreadsheets", "Paper / Manual", "Other", "None"]} selected={form.currentCRM} onChange={(v) => setArr("currentCRM", v)} /></div>
            <div className="mt-4"><label className={labelCls}>Import Client Database?</label><CheckboxGroup options={["Yes \u2014 I'll send a CSV/Excel file", "Yes \u2014 but I need help exporting", "No \u2014 starting fresh"]} selected={form.importClients} onChange={(v) => setArr("importClients", v)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div><label className={labelCls}>Approximate Active Clients</label><input className={ic} value={form.activeClients} onChange={(e) => set("activeClients", e.target.value)} placeholder="e.g. ~500" /></div>
              <div><label className={labelCls}>Invoicing / Accounting System</label><input className={ic} value={form.accountingSystem} onChange={(e) => set("accountingSystem", e.target.value)} placeholder="e.g. QuickBooks, Wave" /></div>
            </div>
            <div className="mt-4"><label className={labelCls}>Accept Credit Card Payments?</label><CheckboxGroup options={["Yes \u2014 terminal", "Yes \u2014 online", "No \u2014 cash/cheque/e-transfer only"]} selected={form.paymentMethods} onChange={(v) => setArr("paymentMethods", v)} /></div>
          </div>

          {/* Goals */}
          <div className={sectionCls}>
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">8</div>
              <div><p className="font-bold text-gray-900">Goals & Expectations</p><p className="text-xs text-gray-400">What success looks like for you</p></div>
            </div>
            <div><label className={labelCls}>{"What is your #1 reason for partnering with Zeniva?"} <span className="text-red-500">*</span></label><textarea className={ta} value={form.mainReason} onChange={(e) => set("mainReason", e.target.value)} placeholder="e.g. 'We want to capture leads 24/7 because we lose clients after hours'" /></div>
            <div className="mt-4"><label className={labelCls}>Biggest Challenges Today</label><CheckboxGroup options={CHALLENGES} selected={form.challenges} onChange={(v) => setArr("challenges", v)} /></div>
            <div className="mt-4"><label className={labelCls}>When would you like to be operational?</label><CheckboxGroup options={["ASAP (within 1 week)", "Within 2-3 weeks", "Within 1 month", "No rush \u2014 do it right"]} selected={form.timeline} onChange={(v) => setArr("timeline", v)} /></div>
            <div className="mt-4"><label className={labelCls}>Anything else we should know?</label><textarea className={ta} value={form.anythingElse} onChange={(e) => set("anythingElse", e.target.value)} placeholder="Special requirements, concerns, questions..." /></div>
          </div>

          {/* Submit */}
          <div className="bg-gradient-to-r from-teal-600 to-violet-600 rounded-2xl p-6 text-center text-white">
            <h3 className="text-xl font-extrabold">Ready to Launch</h3>
            <p className="text-sm text-white/80 mt-1">Our team will confirm the scope, technical feasibility and delivery schedule before work begins.</p>
            {error && <p className="mt-3 text-sm font-semibold text-red-200 bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}
            <button onClick={handleSubmit} disabled={sending} className="mt-4 inline-block px-10 py-3 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-50">
              {sending ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function ForAgenciesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState("essential");

  const openModal = (plan: string) => {
    setModalPlan(plan);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <OnboardingModal open={modalOpen} onClose={() => setModalOpen(false)} defaultPlan={modalPlan} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-violet-600 to-pink-600 px-4 py-24 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Transform Your Travel Agency with AI</h1>
          <p className="mt-6 text-lg text-white/80 sm:text-xl">8 AI agents that work 24/7</p>
          <button onClick={() => openModal("essential")} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-teal-700 shadow-lg hover:bg-teal-50 transition-colors">Get Started</button>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "8", label: "AI Agents" },
              { value: "4", label: "Per Advisor" },
              { value: "24/7", label: "Always On" },
              { value: "0%", label: "Commission" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-4">
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="mt-1 text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your AI Team */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">Your AI Team</h2>
          <p className="mt-4 text-center text-lg text-gray-500">8 specialized agents, each with a unique skill set</p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aiAgents.map((agent) => (
              <div key={agent.name} className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all">
                <div className={`bg-gradient-to-br ${agent.gradient} pt-4 flex items-end justify-center overflow-hidden h-48`}>
                  <Image src={agent.image} alt={agent.name} width={180} height={180} className="object-contain object-bottom" />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                  <p className="mt-1 text-sm font-medium text-teal-600">{agent.role}</p>
                  <p className="mt-2 text-sm text-gray-500">{agent.desc}</p>
                  <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${agent.tier === "Agency + Agents" ? "bg-teal-50 text-teal-700" : "bg-violet-50 text-violet-700"}`}>{agent.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Agent Toolkit */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">Complete Agent Toolkit</h2>
          <p className="mt-4 text-center text-lg text-gray-500">Everything your advisors need in one platform</p>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {toolkitItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ownership */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">{"We Don\u0027t Touch Your Business"}</h2>
          <p className="mt-4 text-center text-lg text-gray-500">Your agency stays yours. Period.</p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ownershipCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-violet-500 text-xl font-bold text-white">{item.step}</div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" lang="fr-CA" className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">Des forfaits clairs pour votre agence</h2>
          <p className="mt-4 text-center text-lg text-gray-500">Une installation, un abonnement pour l’agence et un prix par conseiller supplémentaire.</p>
          <p className="mt-2 text-center text-sm text-gray-500">Tous les montants sont en dollars canadiens, avant taxes.</p>
          <h3 className="mt-12 text-2xl font-bold text-gray-900">1. Votre installation — paiement unique</h3>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {installationPlans.map((plan) => (
              <div key={plan.key} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h4 className="text-xl font-bold text-gray-900">{plan.label}</h4>
                <p className="mt-4 text-4xl font-extrabold text-teal-700">{formatCAD(plan.price)}</p>
                <p className="mt-1 text-sm text-gray-500">Paiement unique</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => <li key={feature} className="flex gap-2 text-sm text-gray-700"><span aria-hidden="true" className="font-bold text-teal-600">✓</span>{feature}</li>)}
                </ul>
                {plan.key === "integrated" && <p className="mt-5 text-xs leading-relaxed text-gray-600">Sous réserve de validation technique. Une connexion à un logiciel métier, dans le périmètre convenu. Plusieurs logiciels ou développements majeurs : soumission particulière.</p>}
                <button onClick={() => openModal(plan.key)} className="mt-6 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800">Choisir {plan.label}</button>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-teal-700 to-violet-700 p-6 text-white sm:p-8">
            <h3 className="text-2xl font-bold">2. Votre abonnement mensuel</h3>
            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              <div><p className="text-sm text-white/80">Pour l’agence — un conseiller inclus</p><p className="mt-2 text-4xl font-extrabold">{formatCAD(AGENCY_MONTHLY_PRICE)}<span className="text-base font-medium"> / mois</span></p><p className="mt-3 text-sm text-white/90">Site Web, Lina, hébergement, maintenance et soutien.</p></div>
              <div><p className="text-sm text-white/80">Par conseiller de voyage supplémentaire</p><p className="mt-2 text-4xl font-extrabold">{formatCAD(ADDITIONAL_ADVISOR_MONTHLY_PRICE)}<span className="text-base font-medium"> / mois</span></p><p className="mt-3 text-sm text-white/90">Un accès supplémentaire pour un conseiller humain de votre équipe.</p></div>
            </div>
          </div>
          <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <caption className="px-5 py-4 text-left font-bold text-gray-900">Exemples de mensualités pour votre agence</caption>
              <thead className="bg-gray-50 text-gray-700"><tr><th scope="col" className="px-5 py-3">Nombre total de conseillers</th><th scope="col" className="px-5 py-3">Total mensuel</th></tr></thead>
              <tbody>{[1, 3, 5, 10].map((count) => <tr key={count} className="border-t border-gray-100"><th scope="row" className="px-5 py-3 font-medium text-gray-700">{count}</th><td className="px-5 py-3 font-bold text-teal-700">{formatCAD(agencyMonthlyTotal(count))} / mois</td></tr>)}</tbody>
            </table>
          </div>
          <p className="mt-6 rounded-xl bg-teal-50 p-5 text-sm font-semibold text-teal-900">Exemple : cinq conseillers avec l’installation Professionnelle — {formatCAD(3500)} une fois, puis {formatCAD(agencyMonthlyTotal(5))} par mois.</p>
          <p className="mt-5 text-sm leading-relaxed text-gray-600">Les abonnements et frais des logiciels externes restent à la charge de l’agence. Le volume d’utilisation de l’IA et le soutien inclus sont précisés au contrat. Les fonctionnalités livrées correspondent au forfait et au périmètre convenus.</p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-teal-600 via-violet-600 to-pink-600 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Ready to give your agency 8 AI employees?</h2>
          <p className="mt-4 text-lg text-white/80">Join the agencies already using Zeniva to capture more leads, build better itineraries, and close more deals.</p>
          <button onClick={() => openModal("essential")} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-teal-700 shadow-lg hover:bg-teal-50 transition-colors">Get Started</button>
        </div>
      </section>
    </div>
  );
}
