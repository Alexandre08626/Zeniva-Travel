"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

const GOLD = "#E6B85A";

const t = {
  en: {
    badge: "CREATOR PROGRAM",
    headline1: "Share.",
    headline2: "Earn.",
    headline3: "Travel.",
    sub: "Turn your influence into income — and unforgettable trips. No travel expertise needed. Just share your personalized links with your community, and Lina AI handles the rest.",
    howTitle: "How it works",
    step1t: "Sign up in 30 seconds",
    step1d: "Create your free influencer account. No fees, no commitment, no strings attached.",
    step2t: "Get your personalized links",
    step2d: "Receive multiple unique tracking links for flights, hotels, packages — share what fits your audience.",
    step3t: "Share with your community",
    step3d: "Post on Instagram, TikTok, YouTube, Twitter, your blog — anywhere your audience lives. We provide ready-to-share content.",
    step4t: "Earn on every booking",
    step4d: "Your followers book through your link, Lina AI closes the sale, and you earn commission automatically.",
    commTitle: "Commission structure",
    commStart: "Start at 3%",
    commStartDesc: "Commission on every booking made through your links — from day one, automatically tracked.",
    commGrow: "Grow up to 5%",
    commGrowDesc: "Your rate increases based on your performance and how long you stay active with us. The more you invest, the more you earn.",
    commHow: "How do you level up?",
    commHow1: "Number of bookings generated",
    commHow2: "Revenue brought to the platform",
    commHow3: "Consistency & time invested in the partnership",
    commHow4: "Quality of leads (conversion rate)",
    premTitle: "Reach 150 clients — Become Premium",
    premBadge: "PREMIUM INFLUENCER",
    premDesc: "Once your CRM hits 150 confirmed clients, you unlock Premium status and gain access to exclusive perks that change the game:",
    prem1: "Flights at agency cost",
    prem1d: "Book any flight at the wholesale price we pay — the same rate travel agencies get.",
    prem2: "Hotels at agency cost",
    prem2d: "Access negotiated hotel rates normally reserved for licensed travel agencies.",
    prem3: "Transfers at agency cost",
    prem3d: "Airport transfers, private cars, shuttles — all at our internal cost.",
    prem4: "You travel like an insider",
    prem4d: "Experience luxury travel at a fraction of the retail price. Your influence literally pays for your lifestyle.",
    whyTitle: "Why influencers love Zeniva",
    why1: "Ready-to-share videos & content",
    why1d: "We create professional marketing content you can post instantly. No editing needed.",
    why2: "Multiple personalized links",
    why2d: "Get unique tracking links for different platforms, campaigns, or audiences — track what works best.",
    why3: "Real-time dashboard",
    why3d: "See your clicks, bookings, commissions, and CRM growth live. Full transparency, always.",
    why4: "Built-in CRM",
    why4d: "Every lead is tracked automatically. Watch your community grow toward that 150-client Premium milestone.",
    why5: "Lina AI closes the sale",
    why5d: "Our AI travel concierge handles all client questions, proposals, and bookings. You share, she sells.",
    why6: "No travel expertise needed",
    why6d: "You don't need to be a travel influencer. Fashion, fitness, lifestyle, tech — if you have a community, this is for you.",
    futureTitle: "The future of influence",
    futureDesc: "Forget one-time brand deals with flat fees. Zeniva gives you a real business: recurring commissions, a growing CRM, and a path to Premium perks that let you travel the world at cost. This isn't a sponsorship — it's a partnership.",
    ctaTitle: "Ready to start earning?",
    ctaDesc: "Join hundreds of creators who are already building their travel business with Zeniva. Free to join, zero risk, unlimited potential.",
    ctaBtn: "Create my influencer account",
    ctaLogin: "Already have an account? Sign in",
    footer: "Zeniva Travel — AI-Powered Luxury Travel — Delaware, USA",
    faq: "Frequently asked questions",
    faq1q: "Do I need to be a travel influencer?",
    faq1a: "Not at all! Whether you're in fashion, fitness, tech, gaming, lifestyle, or any niche — if you have a community that trusts you, you can earn with Zeniva. Travel sells across all audiences.",
    faq2q: "How much can I realistically earn?",
    faq2a: "It depends on your audience size and engagement. With an average booking value of $2,000+ and commissions from 3% to 5%, even a few bookings per month can generate serious income. Top creators earn thousands monthly.",
    faq3q: "When do I get paid?",
    faq3a: "Commissions are tracked in real time on your dashboard. Payouts are processed after the trip is completed, ensuring a smooth experience for everyone.",
    faq4q: "What does Premium status actually give me?",
    faq4a: "At 150 confirmed clients in your CRM, you unlock agency-cost pricing on all flights, hotels, and transfers. This means you travel at wholesale prices — the same rates travel agencies pay. It's a game-changer for creators who love to travel.",
    faq5q: "Is there any cost to join?",
    faq5a: "Zero. It's completely free to join and there are no monthly fees. You only earn — you never pay.",
  },
  fr: {
    badge: "PROGRAMME CREATEUR",
    headline1: "Partage.",
    headline2: "Gagne.",
    headline3: "Voyage.",
    sub: "Transforme ton influence en revenus — et en voyages inoubliables. Aucune expertise voyage requise. Partage simplement tes liens personnalises avec ta communaute, et Lina AI s'occupe du reste.",
    howTitle: "Comment ca marche",
    step1t: "Inscris-toi en 30 secondes",
    step1d: "Cree ton compte influenceur gratuitement. Aucun frais, aucun engagement, aucune obligation.",
    step2t: "Recois tes liens personnalises",
    step2d: "Obtiens plusieurs liens de tracking uniques pour les vols, hotels, forfaits — partage ce qui correspond a ton audience.",
    step3t: "Partage avec ta communaute",
    step3d: "Poste sur Instagram, TikTok, YouTube, Twitter, ton blog — partout ou ta communaute est presente. On te fournit du contenu pret a partager.",
    step4t: "Gagne sur chaque reservation",
    step4d: "Tes abonnes reservent via ton lien, Lina AI conclut la vente, et tu gagnes ta commission automatiquement.",
    commTitle: "Structure de commission",
    commStart: "Demarre a 3%",
    commStartDesc: "Commission sur chaque reservation faite via tes liens — des le premier jour, automatiquement trackee.",
    commGrow: "Evolue jusqu'a 5%",
    commGrowDesc: "Ton taux augmente selon ta performance et ta duree d'activite avec nous. Plus tu t'investis, plus tu gagnes.",
    commHow: "Comment monter en niveau ?",
    commHow1: "Nombre de reservations generees",
    commHow2: "Revenus apportes a la plateforme",
    commHow3: "Regularite & temps investi dans le partenariat",
    commHow4: "Qualite des leads (taux de conversion)",
    premTitle: "Atteins 150 clients — Deviens Premium",
    premBadge: "INFLUENCEUR PREMIUM",
    premDesc: "Quand ton CRM atteint 150 clients confirmes, tu debloques le statut Premium et accedes a des avantages exclusifs qui changent tout :",
    prem1: "Vols au prix agence",
    prem1d: "Reserve n'importe quel vol au prix de gros que nous payons — le meme tarif que les agences de voyage.",
    prem2: "Hotels au prix agence",
    prem2d: "Accede aux tarifs hotels negocies normalement reserves aux agences de voyage licenciees.",
    prem3: "Transferts au prix agence",
    prem3d: "Transferts aeroport, voitures privees, navettes — tout a notre prix interne.",
    prem4: "Tu voyages comme un initie",
    prem4d: "Vis le voyage de luxe a une fraction du prix public. Ton influence finance litteralement ton style de vie.",
    whyTitle: "Pourquoi les influenceurs adorent Zeniva",
    why1: "Videos & contenu prets a partager",
    why1d: "On cree du contenu marketing pro que tu peux poster instantanement. Aucun montage necessaire.",
    why2: "Plusieurs liens personnalises",
    why2d: "Obtiens des liens de tracking uniques pour differentes plateformes, campagnes ou audiences — vois ce qui fonctionne le mieux.",
    why3: "Dashboard en temps reel",
    why3d: "Vois tes clics, reservations, commissions et croissance CRM en direct. Transparence totale, toujours.",
    why4: "CRM integre",
    why4d: "Chaque lead est tracke automatiquement. Regarde ta communaute grandir vers le cap des 150 clients Premium.",
    why5: "Lina AI conclut la vente",
    why5d: "Notre concierge IA voyage gere toutes les questions clients, propositions et reservations. Tu partages, elle vend.",
    why6: "Aucune expertise voyage requise",
    why6d: "Tu n'as pas besoin d'etre influenceur voyage. Mode, fitness, lifestyle, tech — si tu as une communaute, c'est fait pour toi.",
    futureTitle: "L'avenir de l'influence",
    futureDesc: "Oublie les deals ponctuels avec des forfaits fixes. Zeniva te donne un vrai business : des commissions recurrentes, un CRM en croissance, et un chemin vers le statut Premium qui te permet de voyager dans le monde entier au prix coutant. Ce n'est pas un sponsoring — c'est un partenariat.",
    ctaTitle: "Pret(e) a commencer a gagner ?",
    ctaDesc: "Rejoins des centaines de createurs qui construisent deja leur business voyage avec Zeniva. Gratuit, zero risque, potentiel illimite.",
    ctaBtn: "Creer mon compte influenceur",
    ctaLogin: "Deja un compte ? Se connecter",
    footer: "Zeniva Travel — Voyage de Luxe Propulse par l'IA — Delaware, USA",
    faq: "Questions frequentes",
    faq1q: "Dois-je etre un influenceur voyage ?",
    faq1a: "Pas du tout ! Que tu sois dans la mode, le fitness, la tech, le gaming, le lifestyle ou n'importe quelle niche — si tu as une communaute qui te fait confiance, tu peux gagner avec Zeniva. Le voyage se vend aupres de toutes les audiences.",
    faq2q: "Combien puis-je gagner concretement ?",
    faq2a: "Ca depend de la taille de ton audience et de l'engagement. Avec une valeur moyenne de reservation de 2 000$+ et des commissions de 3% a 5%, meme quelques reservations par mois peuvent generer des revenus serieux. Les meilleurs createurs gagnent des milliers par mois.",
    faq3q: "Quand est-ce que je suis paye(e) ?",
    faq3a: "Les commissions sont trackees en temps reel sur ton dashboard. Les paiements sont traites apres la fin du voyage, garantissant une experience fluide pour tous.",
    faq4q: "Que donne concretement le statut Premium ?",
    faq4a: "A 150 clients confirmes dans ton CRM, tu debloques les prix agence sur tous les vols, hotels et transferts. Ca veut dire que tu voyages aux prix de gros — les memes tarifs que les agences de voyage paient. C'est un game-changer pour les createurs qui aiment voyager.",
    faq5q: "Est-ce qu'il y a un cout pour rejoindre ?",
    faq5a: "Zero. C'est completement gratuit et il n'y a aucun frais mensuel. Tu ne fais que gagner — tu ne paies jamais.",
  },
};

type Lang = "en" | "fr";

export default function JoinInfluencerPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [lang, setLang] = useState<Lang>("en");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("zeniva_locale");
      if (saved === "fr") setLang("fr");
    }
  }, []);

  useEffect(() => {
    if (user) {
      const roles = user.roles || (user.role ? [user.role] : []);
      if (roles.includes("influencer")) {
        router.replace("/agent/influencer");
      }
    }
  }, [user, router]);

  const c = t[lang];

  const toggleLang = () => {
    const next = lang === "en" ? "fr" : "en";
    setLang(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("zeniva_locale", next);
    }
  };

  const faqs = [
    { q: c.faq1q, a: c.faq1a },
    { q: c.faq2q, a: c.faq2a },
    { q: c.faq3q, a: c.faq3a },
    { q: c.faq4q, a: c.faq4a },
    { q: c.faq5q, a: c.faq5a },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020810 0%, #0B1B4D 50%, #0F1E5A 100%)", position: "relative", overflow: "hidden" }}>
      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,108,245,0.2) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,184,90,0.08) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none", transform: "translate(-50%, -50%)" }} />

      {/* Language toggle — top right */}
      <button
        onClick={toggleLang}
        style={{ position: "fixed", top: 20, right: 20, zIndex: 100, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 16px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
      >
        <span style={{ fontSize: 18 }}>{lang === "en" ? "🇫🇷" : "🇬🇧"}</span>
        {lang === "en" ? "FR" : "EN"}
      </button>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 20px 40px", position: "relative", zIndex: 1 }}>

        {/* ──── HERO ──── */}
        <section style={{ textAlign: "center", marginBottom: 80 }}>
          <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${GOLD}`, marginBottom: 16 }} />
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
            Zeniva <span style={{ color: GOLD }}>Travel</span>
          </div>
          <div style={{ display: "inline-block", marginBottom: 24, background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.4)", borderRadius: 100, padding: "6px 20px" }}>
            <span style={{ color: "#ec4899", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em" }}>{c.badge}</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px, 8vw, 56px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, margin: "0 0 8px" }}>
            {c.headline1} {c.headline2} <span style={{ color: GOLD }}>{c.headline3}</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", margin: "20px auto 36px", maxWidth: 560, lineHeight: 1.6 }}>
            {c.sub}
          </p>
          <a
            href="/signup?space=influencer"
            style={{ display: "inline-block", padding: "18px 48px", background: "linear-gradient(135deg, #ec4899, #a855f7)", borderRadius: 16, color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: "none", boxShadow: "0 8px 32px rgba(236,72,153,0.35)", transition: "transform 0.2s" }}
          >
            {c.ctaBtn} →
          </a>
        </section>

        {/* ──── HOW IT WORKS ──── */}
        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", textAlign: "center", marginBottom: 40 }}>
            {c.howTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { n: "01", t: c.step1t, d: c.step1d, icon: "✍️" },
              { n: "02", t: c.step2t, d: c.step2d, icon: "🔗" },
              { n: "03", t: c.step3t, d: c.step3d, icon: "📱" },
              { n: "04", t: c.step4t, d: c.step4d, icon: "💰" },
            ].map((s) => (
              <div key={s.n} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, letterSpacing: "0.1em", marginBottom: 8 }}>STEP {s.n}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{s.t}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ──── COMMISSION STRUCTURE ──── */}
        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", textAlign: "center", marginBottom: 40 }}>
            {c.commTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
            <div style={{ background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.1))", border: "1px solid rgba(236,72,153,0.3)", borderRadius: 20, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: "#ec4899", marginBottom: 8 }}>3%</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{c.commStart}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{c.commStartDesc}</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(230,184,90,0.15), rgba(230,184,90,0.05))", border: `1px solid rgba(230,184,90,0.3)`, borderRadius: 20, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: GOLD, marginBottom: 8 }}>5%</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{c.commGrow}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{c.commGrowDesc}</div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{c.commHow}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {[c.commHow1, c.commHow2, c.commHow3, c.commHow4].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──── PREMIUM STATUS ──── */}
        <section style={{ marginBottom: 80 }}>
          <div style={{ background: "linear-gradient(135deg, rgba(230,184,90,0.12), rgba(230,184,90,0.03))", border: `1px solid rgba(230,184,90,0.25)`, borderRadius: 24, padding: "40px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,184,90,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ display: "inline-block", background: "rgba(230,184,90,0.2)", border: `1px solid ${GOLD}`, borderRadius: 100, padding: "6px 20px", marginBottom: 16 }}>
                <span style={{ color: GOLD, fontSize: 12, fontWeight: 800, letterSpacing: "0.1em" }}>{c.premBadge}</span>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 12 }}>{c.premTitle}</h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>{c.premDesc}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { icon: "✈️", t: c.prem1, d: c.prem1d },
                { icon: "🏨", t: c.prem2, d: c.prem2d },
                { icon: "🚗", t: c.prem3, d: c.prem3d },
                { icon: "👑", t: c.prem4, d: c.prem4d },
              ].map((p) => (
                <div key={p.t} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: GOLD, marginBottom: 6 }}>{p.t}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{p.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ──── WHY ZENIVA ──── */}
        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", textAlign: "center", marginBottom: 40 }}>
            {c.whyTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { icon: "🎬", t: c.why1, d: c.why1d },
              { icon: "🔗", t: c.why2, d: c.why2d },
              { icon: "📊", t: c.why3, d: c.why3d },
              { icon: "🎯", t: c.why4, d: c.why4d },
              { icon: "🤖", t: c.why5, d: c.why5d },
              { icon: "🌍", t: c.why6, d: c.why6d },
            ].map((f) => (
              <div key={f.t} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{f.t}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ──── FUTURE OF INFLUENCE ──── */}
        <section style={{ marginBottom: 80, textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 16 }}>{c.futureTitle}</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 580, margin: "0 auto", lineHeight: 1.7 }}>{c.futureDesc}</p>
        </section>

        {/* ──── FAQ ──── */}
        <section style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", textAlign: "center", marginBottom: 40 }}>
            {c.faq}
          </h2>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: "100%", padding: "18px 20px", background: "none", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  {faq.q}
                  <span style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", transform: faqOpen === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
                </button>
                {faqOpen === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ──── FINAL CTA ──── */}
        <section style={{ textAlign: "center", marginBottom: 60 }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 12 }}>{c.ctaTitle}</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6 }}>{c.ctaDesc}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 440, margin: "0 auto" }}>
            <a
              href="/signup?space=influencer"
              style={{ display: "block", padding: "18px", background: "linear-gradient(135deg, #ec4899, #a855f7)", borderRadius: 16, color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: "none", textAlign: "center", boxShadow: "0 8px 32px rgba(236,72,153,0.35)" }}
            >
              {c.ctaBtn} →
            </a>
            <a
              href="/login?space=influencer"
              style={{ display: "block", padding: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center" }}
            >
              {c.ctaLogin} →
            </a>
          </div>
        </section>

        <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.25)", paddingBottom: 20 }}>
          {c.footer}
        </div>
      </div>
    </div>
  );
}
