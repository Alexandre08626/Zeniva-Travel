import { NextResponse } from "next/server";
import { getMockStats, getMockTransactions } from "../../../../modules/zenipay/services/stats";

export async function GET() {
  return NextResponse.json({
    stats: getMockStats(),
    recentTransactions: getMockTransactions().slice(0, 5),
  });
}
