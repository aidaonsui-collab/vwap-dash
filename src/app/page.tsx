'use client';

import { useEffect, useState } from 'react';

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

export default function Home() {
  const [data, setData] = useState<MarketData>({
    price: 0,
    vwap: 0,
    rsi: 50,
    signal: 'NONE',
    change24h: 0,
    volume24h: 0,
    distanceToVWAP: 0,
    conditions: { rsiOk: false, priceOk: false, trendOk: false }
  });
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const addr = tokenAddress || 'demo';
      const res = await fetch(`/api/market?token=${addr}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      // Use demo data
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [tokenAddress]);

  const signalColors: Record<string, string> = {
    LONG: 'text-green-400',
    SHORT: 'text-red-400',
    WATCH: 'text-yellow-400',
    NONE: 'text-gray-400'
  };

  const distancePct = data.vwap > 0 ? ((data.price - data.vwap) / data.vwap) * 100 : 0;

  return (
    <main className="min-h-screen bg-[#0d1117] text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#58a6ff] mb-2">📊 VWAP Dashboard</h1>
          <p className="text-[#8b949e]">BTC/USD · Hyperliquid Perps</p>
        </div>

        {/* Signal Banner */}
        <div className={`text-center py-6 rounded-xl mb-6 border ${
          data.signal === 'LONG' ? 'bg-green-900/30 border-green-500/50' :
          data.signal === 'SHORT' ? 'bg-red-900/30 border-red-500/50' :
          data.signal === 'WATCH' ? 'bg-yellow-900/30 border-yellow-500/50' :
          'bg-[#161b22] border-[#30363d]'
        }`}>
          <div className={`text-5xl font-bold ${signalColors[data.signal]}`}>
            {data.signal}
          </div>
          <div className="text-[#8b949e] mt-2">
            {data.signal === 'LONG' ? '↑ RSI oversold, price above VWAP' :
             data.signal === 'SHORT' ? '↓ RSI overbought, price below VWAP' :
             data.signal === 'WATCH' ? '⚠️ Near VWAP crossover' :
             '— No signal'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
            <div className="text-[#8b949e] text-xs uppercase mb-1">Price</div>
            <div className="text-2xl font-bold text-white">
              ${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
            <div className="text-[#8b949e] text-xs uppercase mb-1">VWAP</div>
            <div className="text-2xl font-bold text-[#58a6ff]">
              ${data.vwap.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
            <div className="text-[#8b949e] text-xs uppercase mb-1">RSI</div>
            <div className={`text-2xl font-bold ${
              data.rsi < 35 ? 'text-green-400' : data.rsi > 65 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {data.rsi.toFixed(1)}
            </div>
            <div className="h-1 bg-[#30363d] rounded mt-2">
              <div 
                className={`h-1 rounded ${
                  data.rsi < 35 ? 'bg-green-400' : data.rsi > 65 ? 'bg-red-400' : 'bg-yellow-400'
                }`}
                style={{ width: `${Math.min(100, data.rsi)}%` }}
              />
            </div>
          </div>
          <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
            <div className="text-[#8b949e] text-xs uppercase mb-1">24h Change</div>
            <div className={`text-2xl font-bold ${data.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {data.change24h >= 0 ? '+' : ''}{data.change24h.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* VWAP Distance */}
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#8b949e] text-sm">Distance to VWAP</span>
            <span className={`font-bold ${distancePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {distancePct >= 0 ? '+' : ''}{distancePct.toFixed(3)}%
            </span>
          </div>
          <div className="h-3 bg-[#30363d] rounded-full relative">
            <div 
              className={`absolute top-0 left-1/2 h-3 w-1 bg-white rounded-full transform -translate-x-1/2`}
              style={{}}
            />
            <div 
              className={`h-3 rounded-full ${distancePct >= 0 ? 'bg-green-500/50' : 'bg-red-500/50'}`}
              style={{ width: `${Math.min(50 + distancePct * 5, 100)}%`, marginLeft: distancePct < 0 ? 'auto' : `${50 - Math.abs(Math.min(distancePct, 0) * 5)}%`, marginRight: distancePct >= 0 ? 'auto' : 0 }}
            />
          </div>
          <div className="flex justify-between text-xs text-[#8b949e] mt-1">
            <span>-20%</span>
            <span>VWAP</span>
            <span>+20%</span>
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d] mb-6">
          <h3 className="text-[#8b949e] text-xs uppercase mb-3">Long Conditions</h3>
          <div className="space-y-2">
            <ConditionRow 
              label="RSI < 35 (oversold)" 
              met={data.conditions.rsiOk} 
            />
            <ConditionRow 
              label="Price > VWAP" 
              met={data.conditions.priceOk} 
            />
            <ConditionRow 
              label="RSI trending up" 
              met={data.conditions.trendOk} 
            />
          </div>
          
          <h3 className="text-[#8b949e] text-xs uppercase mb-3 mt-4">Short Conditions</h3>
          <div className="space-y-2">
            <ConditionRow 
              label="RSI > 65 (overbought)" 
              met={data.rsi > 65} 
            />
            <ConditionRow 
              label="Price < VWAP" 
              met={data.price < data.vwap} 
            />
            <ConditionRow 
              label="RSI trending down" 
              met={false} 
            />
          </div>
        </div>

        {/* Setup */}
        <div className="bg-[#161b22] rounded-xl p-4 border border-[#30363d]">
          <h3 className="text-[#8b949e] text-xs uppercase mb-3">⚙️ Configuration</h3>
          <input
            type="text"
            placeholder="Token contract address (e.g., 0x... for BTC)"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
          />
          <p className="text-[#8b949e] text-xs mt-2">
            Leave empty for demo mode. Connect your Hyperliquid account for live data.
          </p>
        </div>

        <div className="text-center text-[#8b949e] text-xs mt-6">
          Powered by Aftermath Finance · RSI Strategy
        </div>
      </div>
    </main>
  );
}

function ConditionRow({ label, met }: { label: string; met: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        met ? 'bg-green-500' : 'bg-[#30363d]'
      }`}>
        {met && <span className="text-xs">✓</span>}
      </div>
      <span className={met ? 'text-white' : 'text-[#8b949e]'}>{label}</span>
    </div>
  );
}
