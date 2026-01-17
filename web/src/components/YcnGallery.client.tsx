"use client";
import { useState } from "react";

export default function YcnGallery({ initialGallery = [], slug }: { initialGallery: string[]; slug: string }) {
  const [gallery, setGallery] = useState<string[]>(initialGallery || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerImages = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/partners/ycn/fetch-images?slug=${encodeURIComponent(slug)}`);
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || res.statusText || 'Failed');
      const imgs: string[] = json.images || [];
      if (imgs.length === 0) {
        setError('Aucune image trouvée sur la page partenaire.');
      } else {
        setGallery((g) => Array.from(new Set([...g, ...imgs])));
      }
    } catch (e: any) {
      setError(e?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Gallery</h3>
      {gallery.length === 0 && (
        <div className="text-sm text-slate-600 mb-3">No images available from partner.</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
        {gallery.map((img, i) => (
          <a key={i} href={img} target="_blank" rel="noreferrer" className="h-24 overflow-hidden rounded-lg block bg-slate-100">
            <img src={img} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={fetchPartnerImages} disabled={loading} className="px-3 py-2 rounded-full bg-black text-white text-sm font-semibold">
          {loading ? 'Requesting…' : 'Request photos from partner'}
        </button>
        {error && <div className="text-sm text-amber-700">{error}</div>}
      </div>
    </div>
  );
}
