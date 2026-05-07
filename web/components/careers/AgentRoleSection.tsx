import Link from "next/link";

const GRADIENT_START = "#0B1B4D";
const GRADIENT_END = "#0F6CF5";
const GOLD_GRADIENT = "linear-gradient(135deg, #E6B85A, #C9941F)";

export interface AgentRoleDict {
  badge: string;
  heroTitle: string;
  heroSub: string;
  heroCta: string;
  heroPricingNote: string;
  benefitsTitle: string;
  benefitsSub: string;
  benefits: { icon: string; title: string; desc: string }[];
  pricingTitle: string;
  pricingSub: string;
  setupOnce: string;
  setupTitle: string;
  setupItems: string[];
  monthlyRequired: string;
  monthlyTitle: string;
  monthlyItems: string[];
  referralTitle: string;
  referralSub: string;
  referrals: { tier: string; title: string; desc: string }[];
  howTitle: string;
  howSub: string;
  steps: { step: string; title: string; desc: string }[];
  exampleTitle: string;
  exampleSub: string;
  exampleBookingValue: string;
  exampleSupplierCost: string;
  exampleNetProfit: string;
  exampleCommission: string;
  exampleNumbers: { booking: string; cost: string; net: string; commission: string };
  exampleHint: string;
  finalTitle: string;
  finalSub: string;
  finalCta: string;
  finalContact: string;
  finalContactEmail: string;
  /** Optional override for the apply CTA destination (e.g. "#apply" on /carrieres). Defaults to /signup. */
  applyHref?: string;
}

export interface AgentRoleSectionProps {
  dict: AgentRoleDict;
  /** When true, omit the hero (already shown by the parent page). */
  hideHero?: boolean;
  /** When true, omit the final CTA (parent page handles it). */
  hideFinalCta?: boolean;
}

export default function AgentRoleSection({ dict, hideHero, hideFinalCta }: AgentRoleSectionProps) {
  const applyHref = dict.applyHref || "/signup";
  return (
    <>
      {hideHero ? null : (
        <section
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)` }}
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=60')] bg-cover bg-center opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white mb-6">
                <span>💼</span> {dict.badge}
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">{dict.heroTitle}</h1>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">{dict.heroSub}</p>
              <Link
                href={applyHref}
                className="inline-block rounded-2xl px-8 py-4 text-lg font-black shadow-2xl transition hover:scale-105"
                style={{ background: GOLD_GRADIENT, color: GRADIENT_START }}
              >
                {dict.heroCta} →
              </Link>
              <p className="text-white/60 text-sm mt-4">{dict.heroPricingNote}</p>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{dict.benefitsTitle}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{dict.benefitsSub}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dict.benefits.map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{dict.pricingTitle}</h2>
            <p className="text-lg text-slate-600">{dict.pricingSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-sm font-bold text-blue-700 mb-4">
                  {dict.setupOnce}
                </div>
                <div className="text-5xl font-black text-slate-900 mb-2">$299</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{dict.setupTitle}</div>
              </div>
              <ul className="space-y-3 mb-6">
                {dict.setupItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div
              className="rounded-3xl border-2 bg-white p-8 shadow-lg relative overflow-hidden"
              style={{ borderColor: GRADIENT_END }}
            >
              <div
                className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: GRADIENT_END }}
              >
                {dict.monthlyRequired}
              </div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-sm font-bold text-blue-700 mb-4">
                  {dict.monthlyTitle}
                </div>
                <div className="text-5xl font-black text-slate-900 mb-2">$97</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{dict.monthlyTitle}</div>
              </div>
              <ul className="space-y-3 mb-6">
                {dict.monthlyItems.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="rounded-3xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">{dict.referralTitle}</h2>
            <p className="text-lg text-slate-700">{dict.referralSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dict.referrals.map((r) => (
              <div key={r.tier} className="bg-white rounded-2xl p-6 shadow-md text-center">
                <div className="text-4xl mb-3">{r.tier}</div>
                <div className="text-xl font-black text-slate-900 mb-2">{r.title}</div>
                <div className="text-slate-600" dangerouslySetInnerHTML={{ __html: r.desc }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{dict.howTitle}</h2>
            <p className="text-lg text-slate-600">{dict.howSub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dict.steps.map((s) => (
              <div key={s.step} className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-black text-white mb-4"
                  style={{ background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})` }}
                >
                  {s.step}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{dict.exampleTitle}</h2>
            <p className="text-lg text-slate-600">{dict.exampleSub}</p>
          </div>
          <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-600">{dict.exampleBookingValue}</span>
                <span className="text-xl font-bold text-slate-900">{dict.exampleNumbers.booking}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-600">{dict.exampleSupplierCost}</span>
                <span className="text-xl font-bold text-red-600">-{dict.exampleNumbers.cost}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-600 font-semibold">{dict.exampleNetProfit}</span>
                <span className="text-2xl font-black text-slate-900">{dict.exampleNumbers.net}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-900">{dict.exampleCommission}</span>
                <span className="text-3xl font-black" style={{ color: GRADIENT_END }}>
                  {dict.exampleNumbers.commission}
                </span>
              </div>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">
              <p className="text-sm text-blue-900" dangerouslySetInnerHTML={{ __html: dict.exampleHint }} />
            </div>
          </div>
        </div>
      </section>

      {hideFinalCta ? null : (
        <section
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)` }}
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=60')] bg-cover bg-center opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">{dict.finalTitle}</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{dict.finalSub}</p>
              <Link
                href={applyHref}
                className="inline-block rounded-2xl px-8 py-4 text-xl font-black shadow-2xl transition hover:scale-105"
                style={{ background: GOLD_GRADIENT, color: GRADIENT_START }}
              >
                {dict.finalCta}
              </Link>
              <p className="text-white/70 text-sm mt-6">
                {dict.finalContact}{" "}
                <a href={`mailto:${dict.finalContactEmail}`} className="underline text-white">
                  {dict.finalContactEmail}
                </a>
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
