'use client';

import { useState, useEffect } from 'react';

// Track conversions
function trackEvent(event: string, data?: Record<string, string>) {
  // Google Ads conversion
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, data);
  }
  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event === 'lead_capture' ? 'Lead' : 'PageView', data);
  }
}

const destinations = [
  { name: 'Cancun', emoji: '🇲🇽', tag: 'All-Inclusive from $899', img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&h=300&fit=crop' },
  { name: 'Punta Cana', emoji: '🇩🇴', tag: 'Beachfront from $799', img: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=400&h=300&fit=crop' },
  { name: 'Jamaica', emoji: '🇯🇲', tag: 'All-Inclusive from $949', img: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&h=300&fit=crop' },
  { name: 'Hawaii', emoji: '🌺', tag: 'Packages from $1,199', img: 'https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=400&h=300&fit=crop' },
  { name: 'Maldives', emoji: '🏝️', tag: 'Luxury from $2,499', img: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&h=300&fit=crop' },
  { name: 'Europe', emoji: '🇪🇺', tag: 'Multi-city from $1,399', img: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=300&fit=crop' },
  { name: 'Greece', emoji: '🇬🇷', tag: 'Island hopping from $1,099', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400&h=300&fit=crop' },
  { name: 'Cabo San Lucas', emoji: '🌊', tag: 'Resort deals from $699', img: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&h=300&fit=crop' },
];

export default function DealsPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedDest, setSelectedDest] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/lead-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          name, 
          destination: selectedDest,
          source: 'deals_page' 
        }),
      });
      const data = await res.json();
      if (data.success || data.existing) {
        setSubmitted(true);
        trackEvent('lead_capture', { destination: selectedDest, source: 'deals_page' });
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', margin: 0 }}>
          ✈️ Exclusive Travel Deals
        </h1>
        <p style={{ fontSize: '1.3rem', color: '#94a3b8', marginTop: '12px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Personalized vacation packages at unbeatable prices. Powered by AI, curated for you.
        </p>
      </div>

      {/* Destinations Grid */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
        {destinations.map((dest) => (
          <div 
            key={dest.name}
            onClick={() => setSelectedDest(dest.name)}
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: selectedDest === dest.name ? '3px solid #3b82f6' : '3px solid transparent',
              transition: 'all 0.2s',
              background: '#1e293b',
            }}
          >
            <img src={dest.img} alt={dest.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                {dest.emoji} {dest.name}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#3b82f6', fontWeight: 600, marginTop: '4px' }}>
                {dest.tag}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lead Capture Form */}
      <div style={{ maxWidth: '500px', margin: '50px auto', padding: '0 20px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          backdropFilter: 'blur(10px)',
          borderRadius: '20px', 
          padding: '32px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {!submitted ? (
            <>
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>
                🔥 Get Your Personalized Deal
              </h2>
              <p style={{ color: '#94a3b8', textAlign: 'center', margin: '0 0 24px', fontSize: '0.95rem' }}>
                Enter your email and our AI concierge will send you exclusive offers tailored to your dream destination.
              </p>
              
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                    color: 'white', fontSize: '1rem', marginBottom: '12px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <input
                  type="email"
                  placeholder="Your email *"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 16px', borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)',
                    color: 'white', fontSize: '1rem', marginBottom: '12px', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {selectedDest && (
                  <div style={{ color: '#3b82f6', marginBottom: '12px', fontSize: '0.95rem' }}>
                    ✈️ Selected destination: <strong>{selectedDest}</strong>
                  </div>
                )}
                {error && (
                  <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.9rem' }}>{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '12px',
                    background: loading ? '#64748b' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white', fontSize: '1.1rem', fontWeight: 700,
                    border: 'none', cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {loading ? 'Sending...' : '🚀 Get My Exclusive Deals'}
                </button>
              </form>
              
              <p style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', marginTop: '16px' }}>
                No spam, ever. Unsubscribe anytime.
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 12px' }}>
                You&apos;re In!
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '1rem', margin: '0 0 24px' }}>
                Check your inbox — our AI concierge Lina is crafting your personalized {selectedDest || 'travel'} deals right now.
              </p>
              <a
                href="/chat"
                style={{
                  display: 'inline-block', padding: '14px 28px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white', fontSize: '1rem', fontWeight: 600, textDecoration: 'none',
                }}
              >
                💬 Chat with Lina Now
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Trust Signals */}
      <div style={{ textAlign: 'center', padding: '40px 20px 60px', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ color: '#64748b' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>🤖</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>AI-Powered Concierge</div>
          </div>
          <div style={{ color: '#64748b' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>💰</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Best Price Guarantee</div>
          </div>
          <div style={{ color: '#64748b' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>🔒</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Secure Booking</div>
          </div>
          <div style={{ color: '#64748b' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>🌍</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Worldwide Coverage</div>
          </div>
        </div>
        <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '30px' }}>
          Zeniva · Delaware, USA · zenivatravel.com
        </p>
      </div>
    </div>
  );
}
