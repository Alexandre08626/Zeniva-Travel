"use client";

// Formulaire de demande en français. Il envoie au même point d'entrée que /forms/travel
// (/api/forms/submit, formulaire « travel-agent ») : la demande arrive dans le CRM Zeniva
// Travel (info@zeniva.ca) avec tous les champs dans les notes.
import { useState } from "react";

type Props = {
  /** Type de voyage présélectionné (ex. « Voyage de groupe »). */
  typeVoyage?: string;
  /** Destination suggérée dans le champ. */
  destinationParDefaut?: string;
  /** Page d'origine, ajoutée aux notes pour savoir d'où vient la demande. */
  source: string;
  titre?: string;
};

const TYPES = [
  "Forfait soleil tout inclus",
  "Croisière",
  "Voyage de groupe",
  "Voyage d'entreprise / incitatif",
  "Mariage à destination",
  "Voyage sur mesure",
  "Location de yacht",
];

export default function DemandeVoyageForm({ typeVoyage, destinationParDefaut = "", source, titre }: Props) {
  const [statut, setStatut] = useState<"idle" | "envoi" | "ok" | "erreur">("idle");
  const [erreur, setErreur] = useState("");
  const [lienCompte, setLienCompte] = useState<string | null>(null);

  async function envoyer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) || "").trim();
    if (!v("name") || (!v("email") && !v("phone"))) {
      setStatut("erreur");
      setErreur("Indiquez votre nom et un courriel ou un téléphone.");
      return;
    }
    setStatut("envoi");
    setErreur("");
    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: "travel-agent",
          name: v("name"),
          email: v("email"),
          phone: v("phone"),
          destination: v("destination") || "À déterminer",
          tripType: v("tripType"),
          departureCity: v("departureCity"),
          departureDate: v("departureDate"),
          pax: v("pax"),
          budget: v("budget"),
          notes: v("message"),
          langue: "fr",
          sourcePage: source,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Envoi impossible");
      if (data?.setupUrl) setLienCompte(String(data.setupUrl));
      setStatut("ok");
      try {
        (window as any).gtag?.("event", "generate_lead", { form: "demande-fr", page: source });
        (window as any).fbq?.("track", "Lead");
      } catch {}
    } catch (err: any) {
      setStatut("erreur");
      setErreur(
        "L'envoi n'a pas fonctionné. Écrivez-nous à info@zeniva.ca ou appelez le 581-748-7017."
      );
    }
  }

  if (statut === "ok") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8" role="status">
        <p className="text-xl font-black text-emerald-900">Merci, votre demande est bien reçue.</p>
        <p className="mt-3 text-emerald-900/80 leading-relaxed">
          Nous préparons une proposition selon vos dates, votre budget et le nombre de voyageurs, puis nous
          vous la transmettons par courriel ou par téléphone. Vous pouvez aussi la peaufiner tout de suite
          avec Lina, notre concierge virtuelle.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="/chat" className="rounded-full bg-[#0B1B4D] px-5 py-3 text-sm font-bold text-white">
            Continuer avec Lina
          </a>
          {lienCompte && (
            <a href={lienCompte} className="rounded-full border border-emerald-300 px-5 py-3 text-sm font-bold text-emerald-900">
              Créer mon accès client
            </a>
          )}
        </div>
      </div>
    );
  }

  const champ =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100";
  const etiquette = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <form onSubmit={envoyer} className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm" noValidate>
      <p className="text-xl font-black text-slate-900">{titre || "Demandez votre proposition"}</p>
      <p className="mt-1 text-sm text-slate-500">Gratuit et sans engagement. Réponse en français.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dv-name" className={etiquette}>Nom complet *</label>
          <input id="dv-name" name="name" autoComplete="name" required className={champ} />
        </div>
        <div>
          <label htmlFor="dv-phone" className={etiquette}>Téléphone</label>
          <input id="dv-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className={champ} placeholder="418 555-0123" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dv-email" className={etiquette}>Courriel *</label>
          <input id="dv-email" name="email" type="email" autoComplete="email" className={champ} />
        </div>
        <div>
          <label htmlFor="dv-type" className={etiquette}>Type de voyage</label>
          <select id="dv-type" name="tripType" defaultValue={typeVoyage || TYPES[0]} className={champ}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="dv-dest" className={etiquette}>Destination</label>
          <input id="dv-dest" name="destination" defaultValue={destinationParDefaut} className={champ} placeholder="Cancún, Punta Cana, croisière Caraïbes…" />
        </div>
        <div>
          <label htmlFor="dv-from" className={etiquette}>Départ de</label>
          <select id="dv-from" name="departureCity" defaultValue="Québec (YQB)" className={champ}>
            <option>Québec (YQB)</option>
            <option>Montréal (YUL)</option>
            <option>Ottawa (YOW)</option>
            <option>Autre ville</option>
          </select>
        </div>
        <div>
          <label htmlFor="dv-date" className={etiquette}>Date ou mois de départ</label>
          <input id="dv-date" name="departureDate" className={champ} placeholder="ex. : semaine du 15 février" />
        </div>
        <div>
          <label htmlFor="dv-pax" className={etiquette}>Nombre de voyageurs</label>
          <input id="dv-pax" name="pax" inputMode="numeric" className={champ} placeholder="ex. : 2 adultes, 2 enfants" />
        </div>
        <div>
          <label htmlFor="dv-budget" className={etiquette}>Budget approximatif</label>
          <input id="dv-budget" name="budget" className={champ} placeholder="ex. : 2 500 $ par personne" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="dv-msg" className={etiquette}>Précisions</label>
          <textarea id="dv-msg" name="message" rows={3} className={champ} placeholder="Âge des enfants, type de chambre, occasion spéciale, groupe…" />
        </div>
      </div>

      {statut === "erreur" && <p className="mt-4 text-sm font-semibold text-red-600">{erreur}</p>}

      <button
        type="submit"
        disabled={statut === "envoi"}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#0F6CF5] to-[#0B1B4D] px-6 py-4 text-base font-black text-white disabled:opacity-60"
      >
        {statut === "envoi" ? "Envoi en cours…" : "Recevoir ma proposition"}
      </button>
      <p className="mt-3 text-xs text-slate-500">
        Vos coordonnées servent seulement à répondre à votre demande.{" "}
        <a href="/privacy-policy" className="underline">Politique de confidentialité</a>
      </p>
    </form>
  );
}
