// Test script for PDF generation
const testData = {
  dossierId: "TRIP-104",
  clientName: "Dupuis / Cancun",
  destination: "Cancun",
  travelDates: "2026-02-12 - 2026-02-19",
  pax: 2,
  budget: "$6,500",
  itinerary: [
    "✈️ Vol direct Montréal-Cancun avec Air Canada",
    "🏨 Hôtel boutique 5* avec balcon vue mer",
    "🚗 Transfert privé aéroport-hôtel",
    "🍽️ Dîner romantique au coucher du soleil"
  ],
  totalPrice: "$4,850 CAD",
  createdAt: "2026-01-12T00:00:00.000Z",
  status: "draft"
};

console.log('Test data prepared:', JSON.stringify(testData, null, 2));