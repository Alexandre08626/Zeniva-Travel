import { NextRequest, NextResponse } from 'next/server';
import { askOpenAI } from '../../../src/lib/askOpenAI';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    const response = await askOpenAI('Bonjour, peux-tu me dire si tu fonctionnes?', apiKey);
    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}