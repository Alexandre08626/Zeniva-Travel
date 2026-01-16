(async function(){
  try {
    const key = process.env.DUFFEL_API_KEY;
    if (!key) throw new Error('DUFFEL_API_KEY missing');

    const body = {
      data: {
        passengers: [{ type: 'adult' }],
        slices: [{ origin: 'CDG', destination: 'JFK', departure_date: '2026-02-15' }]
      }
    };

    console.log('Using DUFFEL_API_KEY prefix:', key.slice(0, 11));

    const res = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Duffel-Version': process.env.DUFFEL_VERSION || 'v2'
      },
      body: JSON.stringify(body)
    });

    console.log('Response status:', res.status);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('JSON keys:', Object.keys(json));
      console.log('Preview:', JSON.stringify(json).slice(0, 800));
    } catch (e) {
      console.log('Non-JSON response (first 800 chars):', text.slice(0, 800));
    }

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
