export const dynamic = "force-dynamic";
import React from "react";
import type { Metadata } from "next";
import "../../(legal)/legal.css";
import LegalHeader from "../../../src/components/legal/LegalHeader";
import LegalFooter from "../../../src/components/legal/LegalFooter";
import OrganizationSchema from "../../../src/components/legal/OrganizationSchema";
import PrivacyPolicySchema from "../../../src/components/legal/PrivacyPolicySchema";
import LegalContactBlock from "../../../src/components/legal/LegalContactBlock";
import {
  LEGAL_EFFECTIVE_DATE,
  LEGAL_LAST_UPDATED,
  LEGAL_POLICY_VERSION,
  LEGAL_OPERATOR,
} from "../../../src/components/legal/legal-constants";

export const metadata: Metadata = {
  title: "Politique de confidentialité – Partenaires",
  description:
    "Politique de confidentialité du mode Partenaire de Zeniva : protection des données des fournisseurs et conformité Canada/États-Unis.",
  alternates: {
    canonical: "https://www.zenivatravel.com/fr/privacy-partners",
    languages: {
      "en-CA": "https://www.zenivatravel.com/privacy-partners",
      "fr-CA": "https://www.zenivatravel.com/fr/privacy-partners",
    },
  },
};

export default function PrivacyPartnersFrPage() {
  return (
    <div className="legal-page" lang="fr">
      <LegalHeader />
      <main className="legal-shell">
        <div className="legal-container">
          <OrganizationSchema />
          <PrivacyPolicySchema title="Politique de confidentialité – Mode Partenaire" path="/fr/privacy-partners" />
          <div>
            <span className="legal-badge">Politique</span>
            <h1 className="legal-title">Politique de confidentialité – Mode Partenaire</h1>
            <p className="legal-subtitle">
              Cette politique s&apos;applique aux utilisateurs du mode Partenaire, notamment les hôtes,
              fournisseurs et prestataires de services actifs sur Zeniva.
            </p>
            <div className="legal-meta">
              <span>Date d&apos;entrée en vigueur : {LEGAL_EFFECTIVE_DATE}</span>
              <span>Dernière mise à jour : {LEGAL_LAST_UPDATED}</span>
              <span>Version : {LEGAL_POLICY_VERSION}</span>
            </div>
            <p className="legal-subtitle">
              <a href="/privacy-partners" hrefLang="en">English version</a>
            </p>
          </div>

          <div className="legal-toc">
            <strong>Table des matières</strong>
            <ul>
              <li><a href="#introduction">Introduction</a></li>
              <li><a href="#information-collected">Renseignements recueillis</a></li>
              <li><a href="#booking-shared">Renseignements de réservation partagés</a></li>
              <li><a href="#use">Utilisation des renseignements des partenaires</a></li>
              <li><a href="#ai">IA et algorithmes de la place de marché</a></li>
              <li><a href="#payments">Paiements et traitement financier</a></li>
              <li><a href="#sharing">Partage des données</a></li>
              <li><a href="#obligations">Obligations des partenaires</a></li>
              <li><a href="#retention">Conservation des données</a></li>
              <li><a href="#transfers">Transferts internationaux</a></li>
              <li><a href="#ccpa">Droits à la vie privée aux États-Unis (CCPA)</a></li>
              <li><a href="#pipeda">Droits à la vie privée au Canada (LPRPDE)</a></li>
              <li><a href="#contact">Coordonnées</a></li>
            </ul>
          </div>

          <section id="introduction" className="legal-section">
            <h2>Introduction</h2>
            <p>
              Zeniva est une plateforme d&apos;agence de voyages propulsée par l&apos;IA et exploitée par {LEGAL_OPERATOR}.
              Le mode Partenaire s&apos;adresse aux entrepreneurs indépendants comme les hôtes de propriétés,
              les fournisseurs de yachts, les voyagistes et les fournisseurs de services de luxe.
            </p>
          </section>

          <section id="information-collected" className="legal-section">
            <h2>Renseignements recueillis</h2>
            <h3>Données d&apos;entreprise</h3>
            <ul>
              <li>Raison sociale, nom commercial, adresse d&apos;affaires et coordonnées.</li>
              <li>Numéro d&apos;entreprise ou de taxes, coordonnées bancaires, documents d&apos;immatriculation et attestations d&apos;assurance.</li>
            </ul>
            <h3>Données techniques</h3>
            <ul>
              <li>Utilisation de la plateforme, statistiques des annonces et historique des communications.</li>
            </ul>
          </section>

          <section id="booking-shared" className="legal-section">
            <h2>Renseignements de réservation partagés avec les partenaires</h2>
            <p>
              Pour exécuter les réservations, les partenaires reçoivent des données limitées sur les voyageurs,
              comme le nom du voyageur, les dates de réservation, des coordonnées limitées et les demandes
              particulières. L&apos;accès est accordé selon le principe du besoin de savoir.
            </p>
          </section>

          <section id="use" className="legal-section">
            <h2>Utilisation des renseignements des partenaires</h2>
            <ul>
              <li>Gestion des annonces, des disponibilités et de la prestation des services.</li>
              <li>Versements et rapprochement financier.</li>
              <li>Détection de la fraude, conformité et sécurité de la plateforme.</li>
              <li>Classement et contrôle de la qualité de la place de marché.</li>
            </ul>
          </section>

          <section id="ai" className="legal-section">
            <h2>IA et algorithmes de la place de marché</h2>
            <p>
              Zeniva utilise des systèmes d&apos;IA pour le classement des annonces, des suggestions
              d&apos;optimisation des prix, la détection des risques et la prévision de la demande. Aucune
              priorité de classement n&apos;est garantie.
            </p>
          </section>

          <section id="payments" className="legal-section">
            <h2>Paiements et traitement financier</h2>
            <p>
              Nous faisons appel à des processeurs de paiement sécurisés et chiffrons les coordonnées
              bancaires lorsque cela est approprié. Zeniva ne conserve pas les numéros complets de cartes de
              paiement. Les calendriers de versement sont définis dans les ententes de partenariat.
            </p>
          </section>

          <section id="sharing" className="legal-section">
            <h2>Partage des données</h2>
            <p>Nous pouvons partager les renseignements des partenaires avec :</p>
            <ul>
              <li>des fournisseurs de paiement et des institutions financières;</li>
              <li>des partenaires d&apos;assurance et des vérificateurs de conformité;</li>
              <li>les autorités, lorsque la loi l&apos;exige;</li>
              <li>des fournisseurs d&apos;infrastructure infonuagique et de services opérationnels.</li>
            </ul>
            <p>Nous ne revendons pas les données personnelles des partenaires.</p>
          </section>

          <section id="obligations" className="legal-section">
            <h2>Obligations des partenaires</h2>
            <ul>
              <li>Utiliser les données des voyageurs uniquement pour fournir le service.</li>
              <li>Ne pas faire de marketing auprès des voyageurs sans leur consentement.</li>
              <li>Ne pas conserver les données plus longtemps que nécessaire.</li>
              <li>Sécuriser leurs systèmes et leurs identifiants.</li>
              <li>Respecter le RGPD, la CCPA, la LPRPDE et la Loi 25 du Québec, selon le cas.</li>
            </ul>
          </section>

          <section id="retention" className="legal-section">
            <h2>Conservation des données</h2>
            <p>Nous conservons les dossiers des partenaires pendant sept ans pour des raisons de conformité financière.</p>
          </section>

          <section id="transfers" className="legal-section">
            <h2>Transferts internationaux</h2>
            <p>
              Les données peuvent être traitées au Canada, aux États-Unis ou dans d&apos;autres territoires,
              avec des mesures de protection appropriées.
            </p>
          </section>

          <section id="ccpa" className="legal-section">
            <h2>Droits à la vie privée aux États-Unis (CCPA)</h2>
            <ul>
              <li>Droit de savoir quelles données personnelles sont recueillies et communiquées.</li>
              <li>Droit de faire supprimer et corriger ses données personnelles.</li>
              <li>Droit à la non-discrimination lors de l&apos;exercice de ces droits.</li>
              <li>Nous ne vendons pas de données personnelles.</li>
            </ul>
          </section>

          <section id="pipeda" className="legal-section">
            <h2>Droits à la vie privée au Canada (LPRPDE)</h2>
            <ul>
              <li>Accès à vos renseignements personnels.</li>
              <li>Correction des données inexactes ou incomplètes.</li>
              <li>Retrait du consentement, le cas échéant.</li>
            </ul>
          </section>

          <section id="contact" className="legal-section">
            <h2>Coordonnées</h2>
            <p>Responsable de la protection des renseignements personnels : Alexandre Blais</p>
            <LegalContactBlock />
          </section>
        </div>
      </main>
      <LegalFooter lang="fr" />
    </div>
  );
}
