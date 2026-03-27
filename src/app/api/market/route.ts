import { NextResponse } from 'next/server';

// Demo data - replace with real Hyperliquid API calls
function getDemoData() {
  const basePrice = 95000 + Math.random() * 10000;
  const vwap = basePrice * (0.98 + Math.random() * 0.04);
  const rsi = 30 + Math.random() * 40;
  
  const priceAboveVWAP = basePrice > vwap;
  const rsiOversold = rsi < 35;
  const rsiOverbought = rsi > 65;
  
  let signal: 'LONG' | 'SHORT' | 'NONE' | 'WATCH' = 'NONE';
  if (priceAboveVWAP && rsiOversold) {
    signal = 'LONG';
  } else if (!priceAboveVWAP && rsiOverbought) {
    signal = 'SHORT';
  } else if (Math.abs(basePrice - vwap) / vwap < 0.005) {
    signal = 'WATCH';
  }

  return {
    price: basePrice,
    vwap: vwap,
    rsi: rsi,
    signal: signal,
    change24h: -2 + Math.random() * 4,
    volume24h: 15000000000 + Math.random() * 5000000000,
    distanceToVWAP: ((basePrice - vwap) / vwap) * 100,
    conditions: {
      rsiOk: rsi < 35,
      priceOk: basePrice > vwap,
      trendOk: Math.random() > 0.5
    }
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  
  // In production, call Hyperliquid API here:
  // const marketData = await fetchHyperliquidData(token);
  
  // For now, return demo data
  return NextResponse.json(getDemoData());
}
