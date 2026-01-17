(async () => {
  const fs = require('fs');
  const path = require('path');
  try {
    // Load .env.local if present
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8');
      raw.split(/\r?\n/).forEach((line) => {
        const m = line.match(/^\s*([^#=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim();
      });
    }

    const key = process.env.DUFFEL_API_KEY;
    if (!key) throw new Error('DUFFEL_API_KEY not found in .env.local');

    const body = {
      passengers: [{ type: 'adult' }],
      slices: [{ origin: 'CDG', destination: 'JFK', departure_date: '2026-02-15' }]
    };

    const res = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Duffel-Version': process.env.DUFFEL_VERSION || 'v2'
      },
      body: JSON.stringify({ data: body })
    });

    console.log('Duffel status:', res.status);
    const json = await res.json();
    const offers = json?.data?.offers || [];
    console.log(`Found ${offers.length} offers (showing up to 5):`);
    offers.slice(0,5).forEach((o, i) => {
      console.log(`--- Offer ${i+1} ---`);
      console.log('Total:', o.total_currency, o.intended_total_amount || o.total_amount || o.intended_total_amount);
      console.log('Base:', o.base_currency, o.base_amount);
      console.log('Tax:', o.tax_currency, o.tax_amount);
      console.log('Airline IDs:', (o.airlines || []).slice(0,5).join(', '));
      console.log('Live mode:', o.live_mode);
    });

  } catch (err) {
    console.error('Error fetching offers:', err);
    process.exit(1);
  }
})();
