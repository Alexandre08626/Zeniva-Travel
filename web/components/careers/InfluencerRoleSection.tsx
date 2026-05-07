import Link from "next/link";

const GRADIENT_START = "#0B1B4D";
const GRADIENT_END = "#0F6CF5";
const GOLD = "#E6B85A";

export interface InfluencerRoleDict {
  badge: string;
  heroTitle: string;
  heroSub: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  highlightsTitle: string;
  highlights: { icon: string; title: string; desc: string }[];
  commissionTitle: string;
  commissionStartLabel: string;
  commissionStartValue: string;
  commissionStartDesc: string;
  commissionGrowLabel: string;
  commissionGrowValue: string;
  commissionGrowDesc: string;
  premiumBadge: string;
  premiumTitle: string;
  premiumDesc: string;
  premiumPerks: string[];
  premiumLearnMore: string;
  finalCta: string;
  /** Override the apply CTA destination — defaults to "#apply". */
  applyHref?: string;
  /** Override the "see full program" link — defaults to "/join/influencer". */
  fullProgramHref?: string;
}

export interface InfluencerRoleSectionProps {
  dict: InfluencerRoleDict;
  hideHero?: boolean;
}

export default function InfluencerRoleSection({ dict, hideHero }: InfluencerRoleSectionProps) {
  const applyHref = dict.applyHref || "#apply";
  const fullProgramHref = dict.fullProgramHref || "/join/influencer";
  return (
    <>
      {hideHero ? null : (
        <section className="relative overflow-hidden bg-slate-900">
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: `linear-gradient(135deg, ${GRADIENT_END} 0%, ${GOLD} 120%)` }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white mb-6">
                <span>✨</span> {dict.badge}
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">{dict.heroTitle}</h2>
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">{dict.heroSub}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={applyHref}
                  className="inline-block rounded-2xl px-8 py-4 text-lg font-black shadow-2xl transition hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${GOLD}, #C9941F)`, color: GRADIENT_START }}
                >
                  {dict.heroPrimaryCta} →
                </Link>
                <Link
                  href={fullProgramHref}
                  className="inline-block rounded-2xl border-2 border-white/30 bg-white/5 px-8 py-4 text-lg font-bold text-white shadow-xl transition hover:bg-white/10"
                >
                  {dict.heroSecondaryCta}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{dict.highlightsTitle}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dict.highlights.map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h4 className="text-xl font-black text-slate-900 mb-3">{item.title}</h4>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <h3 className="text-3xl sm:text-4xl font-black text-slate-900">{dict.commissionTitle}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 text-center shadow-md">
              <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">{dict.commissionStartLabel}</div>
              <div className="text-5xl font-black text-slate-900 mb-3">{dict.commissionStartValue}</div>
              <p className="text-slate-600">{dict.commissionStartDesc}</p>
            </div>
            <div
              className="rounded-3xl border-2 bg-white p-8 text-center shadow-md"
              style={{ borderColor: GOLD }}
            >
              <div className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-2">{dict.commissionGrowLabel}</div>
              <div className="text-5xl font-black text-slate-900 mb-3">{dict.commissionGrowValue}</div>
              <p className="text-slate-600">{dict.commissionGrowDesc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div
          className="rounded-3xl border-2 p-8 sm:p-12 text-center shadow-xl"
          style={{ borderColor: GOLD, background: "linear-gradient(135deg, #FEF7E0 0%, #FFE9C2 100%)" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white border border-amber-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 mb-5">
            👑 {dict.premiumBadge}
          </div>
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{dict.premiumTitle}</h3>
          <p className="text-lg text-slate-700 mb-8 max-w-2xl mx-auto">{dict.premiumDesc}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left mb-8">
            {dict.premiumPerks.map((perk) => (
              <li key={perk} className="flex items-start gap-3 rounded-xl bg-white/70 px-4 py-3">
                <span className="text-amber-600 text-xl">✓</span>
                <span className="text-slate-800">{perk}</span>
              </li>
            ))}
          </ul>
          <Link
            href={fullProgramHref}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-900 bg-white px-6 py-3 text-base font-bold text-slate-900 transition hover:bg-slate-900 hover:text-white"
          >
            {dict.premiumLearnMore} <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="text-center">
          <Link
            href={applyHref}
            className="inline-block rounded-2xl px-8 py-4 text-lg font-black shadow-xl transition hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${GOLD}, #C9941F)`, color: GRADIENT_START }}
          >
            {dict.finalCta} →
          </Link>
        </div>
      </section>
    </>
  );
}
