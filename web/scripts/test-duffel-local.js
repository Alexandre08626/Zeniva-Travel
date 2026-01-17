(async () => {
  try {
    const url = 'http://127.0.0.1:3000/api/partners/duffel?origin=CDG&destination=JFK&date=2026-02-15';
    console.log('Requesting', url);
    const res = await fetch(url, { method: 'GET' });
    console.log('Status:', res.status);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('Response JSON keys:', Object.keys(json));
      console.log(JSON.stringify(json, null, 2).slice(0, 2000));
    } catch (e) {
      console.log('Non-JSON response (first 2000 chars):', text.slice(0, 2000));
    }
  } catch (err) {
    console.error('Error calling local Duffel endpoint:', err);
    process.exit(1);
  }
})();
