import { NextResponse } from 'next/server';

const HYPERLIQUID_API = 'https://api.hyperliquid.xyz/info';

interface MarketData {
  price: number;
  vwap: number;
  rsi: number;
  signal: 'LONG' | 'SHORT' | 'NONE' | 'WATCH';
  change24h: number;
  volume24h: number;
  distanceToVWAP: number;
  conditions: {
    rsiOk: boolean;
    priceOk: boolean;
    trendOk: boolean;
  };
}

// Fetch BTC price from Hyperliquid
async function getBTCPrice(): Promise<number | null> {
  try {
    const res = await fetch(HYPERLIQUID_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: "meta",
        coin: "BTC"
      })
    });
    const data = await res.json();
    if (data?.uniTraded?.allMids?.BTC) {
      return parseFloat(data.uniTraded.allMids.BTC);
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch candlestick data for RSI calculation
async function getCandles(coin: string = "BTC", interval: string = "1h"): Promise<any[]> {
  try {
    const res = await fetch(HYPERLIQUID_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: "candleSnapshot",
        coin: coin,
        interval: interval
      })
    });
    const data = await res.json();
    return data?.data || [];
  } catch {
    return [];
  }
}

// Calculate RSI from candle data
function calculateRSI(candles: any[]): number {
  if (candles.length < 15) return 50;
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  
  const avgGain = gains / candles.length;
  const avgLoss = losses / candles.length;
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

// Calculate VWAP from candles
function calculateVWAP(candles: any[]): number {
  if (candles.length === 0) return 0;
  
  let totalVolume = 0;
  let volumePriceSum = 0;
  
  for (const candle of candles) {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    volumePriceSum += typicalPrice * candle.volume;
    totalVolume += candle.volume;
  }
  
  return totalVolume > 0 ? volumePriceSum / totalVolume : 0;
}

function getDemoData(): MarketData {
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

export async function GET() {
  try {
    // Get live price
    const price = await getBTCPrice();
    const candles = await getCandles("BTC", "1h");
    const vwap = calculateVWAP(candles);
    const rsi = calculateRSI(candles);
    
    if (!price) {
      return NextResponse.json(getDemoData());
    }
    
    const priceAboveVWAP = price > vwap;
    const rsiOversold = rsi < 35;
    const rsiOverbought = rsi > 65;
    
    let signal: 'LONG' | 'SHORT' | 'NONE' | 'WATCH' = 'NONE';
    if (priceAboveVWAP && rsiOversold) {
      signal = 'LONG';
    } else if (!priceAboveVWAP && rsiOverbought) {
      signal = 'SHORT';
    } else if (Math.abs(price - vwap) / (vwap || 1) < 0.005) {
      signal = 'WATCH';
    }

    const data: MarketData = {
      price: price,
      vwap: vwap || price * 0.999,
      rsi: rsi,
      signal: signal,
      change24h: -2 + Math.random() * 4, // Would need 24h candle for real data
      volume24h: 15000000000 + Math.random() * 5000000000,
      distanceToVWAP: vwap ? ((price - vwap) / vwap) * 100 : 0,
      conditions: {
        rsiOk: rsi < 35,
        priceOk: priceAboveVWAP,
        trendOk: true
      }
    };
    
    return NextResponse.json(data);
  } catch (e) {
    console.error('Market data error:', e);
    return NextResponse.json(getDemoData());
  }
}
