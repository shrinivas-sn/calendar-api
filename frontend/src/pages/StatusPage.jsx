import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, Server, Layers, ShieldAlert, Cpu } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function StatusPage() {
  const [baseUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:3000');
  const [pingData, setPingData] = useState({ loading: true, latency: null, error: null });

  useEffect(() => {
    const ping = async () => {
      const startTime = performance.now();
      try {
        const pingUrl = `${baseUrl}/v1/holidays?country=IN&year=2026&region=central`;
        const res = await fetch(pingUrl);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const duration = Math.round(performance.now() - startTime);
        setPingData({ loading: false, latency: duration, error: null });
      } catch (err) {
        setPingData({ loading: false, latency: null, error: err.message });
      }
    };

    ping();
  }, [baseUrl]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-100 mb-3">
          Service <span className="text-saffron-gradient">Status</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Real-time diagnostics and performance monitoring for the Calendar API nodes.
        </p>
      </div>

      {/* Main Status Panel */}
      <div className="bg-[#0e0e15]/40 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-saffron-500/10 flex items-center justify-center text-saffron-500">
            <Activity size={24} className="animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-200 text-lg">System Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">Checked dynamically on load</p>
          </div>
        </div>

        <StatusBadge baseUrl={baseUrl} />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Latency card */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Latency</span>
            <Clock size={16} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-200">
              {pingData.loading ? '...' : pingData.error ? '—' : `${pingData.latency}ms`}
            </span>
            {!pingData.loading && !pingData.error && <span className="text-xs text-emerald-400 font-semibold">Fast</span>}
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Time elapsed for roundtrip fetch from regional node database.
          </p>
        </div>

        {/* Caching card */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CDN Caching</span>
            <Layers size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-200">Active</span>
            <span className="text-xs text-slate-400 font-semibold">(Cloudflare)</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Edge nodes caching JSON calendars globally to ensure instant responses.
          </p>
        </div>

        {/* Uptime card */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uptime Target</span>
            <ShieldCheck size={16} className="text-saffron-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-200">99.9%</span>
            <span className="text-xs text-emerald-400 font-semibold">Guaranteed</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Continuous operational testing monitors server health and availability.
          </p>
        </div>
      </div>

      {/* Nodes and Systems Info */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 sm:p-8">
        <h3 className="font-display font-bold text-base text-slate-200 mb-6 flex items-center gap-2">
          <Server size={16} className="text-saffron-500" />
          <span>Operational Details</span>
        </h3>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-slate-400 font-medium">API Version</span>
            <span className="font-mono text-slate-300">v1.0.0</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-slate-400 font-medium">Hosting Provider</span>
            <span className="text-slate-300">Railway (Node.js runtime)</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-slate-400 font-medium">Deployment Target</span>
            <span className="text-slate-300">calendar-api-production-a697.up.railway.app</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-slate-400 font-medium">Rate Limiting Threshold</span>
            <span className="text-slate-300">100 requests per 15 mins per IP</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400 font-medium">Data Storage Protocol</span>
            <span className="text-slate-300">Static JSON flat-files (Zero database lockups)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
