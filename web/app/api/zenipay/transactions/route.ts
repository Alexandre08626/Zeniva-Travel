import { NextResponse } from "next/server";
import { getMockTransactions } from "../../../../modules/zenipay/services/stats";

export async function GET() {
  return NextResponse.json({ transactions: getMockTransactions() });
}
