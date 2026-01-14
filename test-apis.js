async function testAPIs() {
  console.log('Testing Duffel Stays API...');
  try {
    const duffelResponse = await fetch('http://localhost:3000/api/partners/duffel-stays?destination=Paris&checkIn=2026-02-01&checkOut=2026-02-03&guests=2&rooms=1');
    const duffelData = await duffelResponse.json();
    console.log('Duffel Stays Response:', JSON.stringify(duffelData, null, 2));
  } catch (error) {
    console.error('Duffel Stays Error:', error.message);
  }

  console.log('\nTesting Amadeus API...');
  try {
    const amadeusResponse = await fetch('http://localhost:3000/api/partners/amadeus?cityCode=PAR&checkIn=2026-02-01&checkOut=2026-02-03&adults=2&radius=5');
    const amadeusData = await amadeusResponse.json();
    console.log('Amadeus Response:', JSON.stringify(amadeusData, null, 2));
  } catch (error) {
    console.error('Amadeus Error:', error.message);
  }
}

testAPIs();